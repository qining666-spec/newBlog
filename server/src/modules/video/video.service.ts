import type { FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import staticPlugin from '@fastify/static'
import { spawn } from 'child_process'

export async function registerVideoService(fastify: FastifyInstance) {
  const uploadDir = resolve(process.env.UPLOAD_DIR || './uploads')
  const videoDir = join(uploadDir, 'videos')
  if (!existsSync(videoDir)) mkdirSync(videoDir, { recursive: true })
  
  // 注册静态文件服务
  await fastify.register(staticPlugin, {
    root: uploadDir,
    prefix: '/uploads/',
    decorateReply: false
  })

  // 下载状态存储
  const downloadProgress = new Map<string, { progress: number; status: string; title?: string }>()
  // GET /api/videos
  fastify.get('/api/videos', async (request, reply) => {
    const userId = 'anonymous' // 登录功能已禁用
    const { page = '1', pageSize = '20', favorite } = request.query as any
    const skip = (Number(page) - 1) * Number(pageSize)
    const where: any = { userId }
    if (favorite === 'true') where.isFavorite = true

    const [items, total] = await Promise.all([
      fastify.prisma.videoItem.findMany({ where, skip, take: Number(pageSize), orderBy: { lastWatchedAt: 'desc' } }),
      fastify.prisma.videoItem.count({ where }),
    ])

    return reply.send({ code: 200, data: { items, total }, message: 'ok' })
  })

  // GET /api/videos/:id
  fastify.get('/api/videos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const video = await fastify.prisma.videoItem.findUnique({ where: { id } })
    if (!video) return reply.code(404).send({ code: 404, data: null, message: '视频不存在' })
    return reply.send({ code: 200, data: video, message: 'ok' })
  })

  // POST /api/videos
  fastify.post('/api/videos', async (request, reply) => {
    const userId = 'anonymous' // 登录功能已禁用
    const { url, title } = request.body as { url: string; title?: string }

    // 识别平台
    let platform = 'other'
    if (url.includes('bilibili.com') || url.includes('b23.tv')) platform = 'bilibili'
    else if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube'

    const video = await fastify.prisma.videoItem.create({
      data: { title: title || url, url, platform, userId },
    })

    return reply.send({ code: 200, data: video, message: 'ok' })
  })

  // POST /api/videos/upload - 上传本地视频
  fastify.post('/api/videos/upload', async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.code(400).send({ code: 400, data: null, message: '未收到文件' })
    
    const filename = `${Date.now()}-${data.filename}`
    const filepath = join(videoDir, filename)
    
    const writeStream = createWriteStream(filepath)
    await data.file.pipe(writeStream)
    
    const video = await fastify.prisma.videoItem.create({
      data: {
        title: data.filename || '本地视频',
        url: `/uploads/videos/${filename}`,
        platform: 'local',
        userId: 'anonymous'
      }
    })
    
    return reply.send({ code: 200, data: video, message: 'ok' })
  })

  // POST /api/videos/download-bilibili - 下载B站视频
  fastify.post('/api/videos/download-bilibili', async (request, reply) => {
    const { url, title, quality } = request.body as { url: string; title?: string; quality?: string }
    
    if (!url || (!url.includes('bilibili.com') && !url.includes('b23.tv'))) {
      return reply.code(400).send({ code: 400, data: null, message: '请提供有效的B站视频URL' })
    }

    const downloadId = `dl_${Date.now()}`
    downloadProgress.set(downloadId, { progress: 0, status: 'starting' })

    // 异步执行下载
    const downloadProcess = async () => {
      try {
        downloadProgress.set(downloadId, { progress: 0, status: 'downloading' })
        
        // 使用you-get下载（支持画质选择）
        const selectedQuality = quality || 'dash-flv480-HEVC'
        const pythonProcess = spawn('you-get', [
          '-o', videoDir,
          `--format=${selectedQuality}`,
          url
        ])

        let outputTitle = title || ''
        
        pythonProcess.stdout.on('data', (data) => {
          const output = data.toString()
          fastify.log.info(`[B站下载] ${output}`)
          
          // 解析下载进度
          const progressMatch = output.match(/(\d+\.?\d*)%\s*\((\d+\.?\d*)\s*\/\s*(\d+\.?\d*)\s*MB\)/)
          if (progressMatch) {
            const progress = parseFloat(progressMatch[1])
            downloadProgress.set(downloadId, { progress, status: 'downloading', title: outputTitle })
          }
          
          // 解析标题
          const titleMatch = output.match(/Downloading\s+(.+?)\s*\.\.\./)
          if (titleMatch && !outputTitle) {
            outputTitle = titleMatch[1].trim()
          }
        })

        pythonProcess.stderr.on('data', (data) => {
          const output = data.toString()
          fastify.log.error(`[B站下载] ${output}`)
          // you-get在stderr也输出进度信息
          const progressMatch = output.match(/(\d+\.?\d*)%/)
          if (progressMatch) {
            const progress = parseFloat(progressMatch[1])
            downloadProgress.set(downloadId, { progress, status: 'downloading', title: outputTitle })
          }
        })

        await new Promise((resolve, reject) => {
          pythonProcess.on('close', (code) => {
            if (code === 0) resolve(true)
            else reject(new Error(`下载进程退出码: ${code}`))
          })
        })

        // 查找下载的视频文件
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待文件写入完成
        
        const files = readdirSync(videoDir)
        
        // 检查是否有分段视频 (如 video[00].mp4, video[01].mp4)
        const segmentPattern = /(.+)\[(\d+)\]\.mp4$/
        const segmentFiles = files.filter(f => segmentPattern.test(f))
        
        if (segmentFiles.length > 1) {
          // 需要合并分段视频
          const baseName = segmentFiles[0].replace(segmentPattern, '$1')
          const concatFile = join(videoDir, 'concat.txt')
          const concatContent = segmentFiles
            .sort()
            .map(f => `file '${f}'`)
            .join('\n')
          
          const { writeFileSync, unlinkSync } = await import('fs')
          writeFileSync(concatFile, concatContent)
          
          // 使用ffmpeg合并
          const ffmpegPath = 'D:\\IDE_software\\anaconda\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe'
          const outputFile = join(videoDir, `${baseName}.mp4`)
          
          await new Promise<void>((resolve, reject) => {
            const mergeProcess = spawn(ffmpegPath, [
              '-f', 'concat',
              '-safe', '0',
              '-i', concatFile,
              '-c', 'copy',
              '-y',
              outputFile
            ])
            mergeProcess.on('close', (code) => {
              if (code === 0) {
                // 删除分段文件
                segmentFiles.forEach(f => {
                  try { unlinkSync(join(videoDir, f)) } catch {}
                })
                try { unlinkSync(concatFile) } catch {}
                resolve()
              } else {
                reject(new Error('合并视频失败'))
              }
            })
          })
        }
        
        // 查找最终的视频文件
        const finalFiles = readdirSync(videoDir)
        const mp4File = finalFiles
          .filter(f => f.endsWith('.mp4') && !f.includes('['))
          .map(f => ({ name: f, time: statSync(join(videoDir, f)).mtime.getTime() }))
          .sort((a, b) => b.time - a.time)[0]

        if (mp4File) {
          const finalTitle = outputTitle || mp4File.name.replace(/\.mp4$/, '')
          const video = await fastify.prisma.videoItem.create({
            data: {
              title: finalTitle,
              url: `/uploads/videos/${mp4File.name}`,
              platform: 'bilibili',
              userId: 'anonymous'
            }
          })
          downloadProgress.set(downloadId, { progress: 100, status: 'completed', title: finalTitle })
          return video
        } else {
          throw new Error('未找到下载的视频文件')
        }
      } catch (error: any) {
        fastify.log.error(`下载B站视频失败: ${error.message}`)
        downloadProgress.set(downloadId, { progress: 0, status: 'failed', title: error.message })
        throw error
      }
    }

    downloadProcess().catch(() => {})

    return reply.send({ code: 200, data: { downloadId }, message: '开始下载' })
  })

  // GET /api/videos/download-progress/:id - 获取下载进度
  fastify.get('/api/videos/download-progress/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const progress = downloadProgress.get(id) || { progress: 0, status: 'not_found' }
    return reply.send({ code: 200, data: progress, message: 'ok' })
  })

  // DELETE /api/videos/:id
  fastify.delete('/api/videos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.videoItem.delete({ where: { id } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })

  // PATCH /api/videos/:id
  fastify.patch('/api/videos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { isFavorite?: boolean; title?: string }

    const video = await fastify.prisma.videoItem.update({
      where: { id },
      data: {
        ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
        ...(body.title && { title: body.title }),
        lastWatchedAt: new Date(),
      },
    })

    return reply.send({ code: 200, data: video, message: 'ok' })
  })
}
