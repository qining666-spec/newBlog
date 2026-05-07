import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'

// TXT章节解析正则模式（按优先级排序）
const CHAPTER_PATTERNS = [
  /^第[零一二三四五六七八九十百千万\d]+章/,
  /^第[零一二三四五六七八九十百千万\d]+节/,
  /^Chapter\s+\d+/i,
  /^卷[零一二三四五六七八九十百千万\d]+/,
  /^-{3,}$/,  // 分隔线 ----
]

function parseTxtToChapters(content: string) {
  const lines = content.split(/\r?\n/)
  const chapters: Array<{ title: string; content: string; chapterNumber: number; wordCount: number }> = []
  let currentTitle = ''
  let currentLines: string[] = []
  let chapterNum = 0
  let lastWasSeparator = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    let matched = false

    for (const pattern of CHAPTER_PATTERNS) {
      if (pattern.test(trimmed)) {
        const isSeparator = /^-{3,}$/.test(trimmed)

        if (currentTitle || currentLines.length > 0) {
          const chapterContent = currentLines.join('\n').trim()
          if (chapterContent && chapterContent.length > 50) {
            chapterNum++
            chapters.push({
              title: currentTitle || `第${chapterNum}章`,
              content: chapterContent,
              chapterNumber: chapterNum,
              wordCount: chapterContent.length,
            })
          }
        }

        if (isSeparator) {
          currentTitle = ''
          lastWasSeparator = true
        } else {
          currentTitle = trimmed
          lastWasSeparator = false
        }
        currentLines = []
        matched = true
        break
      }
    }

    if (!matched) {
      if (lastWasSeparator && trimmed && trimmed.length < 50 && !currentTitle) {
        currentTitle = trimmed
        lastWasSeparator = false
      } else {
        currentLines.push(line)
      }
    }
  }

  const lastContent = currentLines.join('\n').trim()
  if (lastContent && lastContent.length > 50) {
    chapterNum++
    chapters.push({
      title: currentTitle || `第${chapterNum}章`,
      content: lastContent,
      chapterNumber: chapterNum,
      wordCount: lastContent.length,
    })
  }

  // 如果章节太少，尝试按段落分割
  if (chapters.length < 10 && content.length > 100000) {
    const paragraphChunks: string[] = []
    const paragraphs = content.split(/\n{2,}/)
    let chunk = ''
    let chunkSize = 0
    const targetSize = 3000  // 每章约3000字
    
    for (const p of paragraphs) {
      if (chunkSize + p.length > targetSize && chunk.length > 1000) {
        paragraphChunks.push(chunk.trim())
        chunk = ''
        chunkSize = 0
      }
      chunk += p + '\n\n'
      chunkSize += p.length
    }
    if (chunk.trim().length > 1000) {
      paragraphChunks.push(chunk.trim())
    }
    
    if (paragraphChunks.length > chapters.length) {
      return paragraphChunks.map((c, i) => ({
        title: `第${i + 1}章`,
        content: c,
        chapterNumber: i + 1,
        wordCount: c.length,
      }))
    }
  }

  return chapters
}

const DEFAULT_NOVEL_SITE = 'https://m.zanghalhuatxt.cc'

export async function registerNovelService(fastify: FastifyInstance) {
  // GET /api/novels/search - 搜索小说
  fastify.get('/api/novels/search', async (request, reply) => {
    const { keyword } = request.query as { keyword: string }
    
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    
    try {
      // 获取首页
      const res = await fetch(DEFAULT_NOVEL_SITE, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(15000),
      })
      
      if (!res.ok) {
        return reply.send({ code: 200, data: [], message: 'ok' })
      }
      
      const buffer = await res.arrayBuffer()
      // 检测编码
      let html = ''
      try {
        html = new TextDecoder('gbk').decode(buffer)
      } catch {
        html = new TextDecoder('utf-8').decode(buffer)
      }
      
      const $ = cheerio.load(html)
      const results: Array<{ title: string; author: string; url: string }> = []
      const seenTitles = new Set<string>()
      
      // 查找小说链接 (适配藏海花网站结构)
      $('a').each((_, el) => {
        const href = $(el).attr('href') || ''
        const text = $(el).text().trim()
        
        // 匹配小说链接格式如: /1_1956/ 或 /0_931/
        if (href.match(/^\/\d+_\d+\/$/) && text && text.length > 2 && text.length < 30 && !seenTitles.has(text)) {
          const kw = keyword?.trim().toLowerCase()
          if (!kw || text.toLowerCase().includes(kw)) {
            seenTitles.add(text)
            results.push({
              title: text,
              author: '未知',
              url: `${DEFAULT_NOVEL_SITE}${href}`,
            })
          }
        }
      })
      
      return reply.send({ code: 200, data: results.slice(0, 30), message: 'ok' })
    } catch (error: any) {
      fastify.log.error(`搜索小说失败: ${error.message}`)
      return reply.send({ code: 200, data: [], message: 'ok' })
    }
  })

  // GET /api/novels - 获取用户书架
  fastify.get('/api/novels', async (request, reply) => {
    const userId = 'anonymous' // 登录功能已禁用
    const { page = '1', pageSize = '20' } = request.query as { page?: string; pageSize?: string }
    const skip = (Number(page) - 1) * Number(pageSize)

    const [items, total] = await Promise.all([
      fastify.prisma.novel.findMany({
        where: { userId },
        skip,
        take: Number(pageSize),
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { chapters: true } } },
      }),
      fastify.prisma.novel.count({ where: { userId } }),
    ])

    return reply.send({ code: 200, data: { items, total }, message: 'ok' })
  })

  // POST /api/novels/upload - 上传TXT小说
  fastify.post('/api/novels/upload', async (request, reply) => {
    const userId = 'anonymous' // 登录功能已禁用
    const data = await request.file()
    if (!data) {
      return reply.code(400).send({ code: 400, data: null, message: '未提供文件' })
    }

    const buffer = await data.toBuffer()
    if (buffer.length > 100 * 1024 * 1024) {
      return reply.code(400).send({ code: 400, data: null, message: '文件大小超过100MB限制' })
    }

    // 检测编码：尝试UTF-8，失败则用GBK
    let content = ''
    const utf8Content = buffer.toString('utf-8')
    const hasReplacementChar = utf8Content.substring(0, 10000).includes('\uFFFD')
    const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(utf8Content.substring(0, 10000))

    if (!hasReplacementChar && !hasControlChars) {
      content = utf8Content
    } else {
      const gbkDecoder = new TextDecoder('gbk')
      content = gbkDecoder.decode(buffer)
    }

    const chapters = parseTxtToChapters(content)

    if (chapters.length === 0) {
      return reply.code(400).send({ code: 400, data: null, message: '未能解析出章节内容' })
    }

    const title = (data.fields as any)?.title?.value || data.filename.replace(/\.txt$/i, '')
    const author = (data.fields as any)?.author?.value || '未知'

    const novel = await fastify.prisma.novel.create({
      data: {
        title,
        author,
        source: 'upload',
        userId,
        chapters: {
          create: chapters.map((ch) => ({
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            content: ch.content,
            wordCount: ch.wordCount,
          })),
        },
      },
      include: { _count: { select: { chapters: true } } },
    })

    return reply.send({ code: 200, data: novel, message: 'ok' })
  })

  // POST /api/novels/crawl - 爬取小说
  fastify.post('/api/novels/crawl', async (request, reply) => {
    const userId = 'anonymous' // 登录功能已禁用
    const { url, title: inputTitle, maxChapters = 100 } = request.body as { url: string; title?: string; maxChapters?: number }
    if (!url) {
      return reply.code(400).send({ code: 400, data: null, message: '缺少URL' })
    }

    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

    // 带编码检测的fetch
    async function fetchPage(pageUrl: string): Promise<string> {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const contentType = res.headers.get('content-type') || ''
      const buf = await res.arrayBuffer()
      // 检测编码：gbk/gb2312/gb18030 用 gbk 解码，其他用 utf-8
      if (/gb2312|gbk|gb18030/i.test(contentType)) {
        return new TextDecoder('gbk').decode(buf)
      }
      // 尝试用utf-8解码，如果乱码则回退gbk
      const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buf)
      if (utf8Text.includes('�') || /charset=["']?gb/i.test(utf8Text)) {
        return new TextDecoder('gbk').decode(buf)
      }
      return utf8Text
    }

    // 将相对URL转为绝对URL
    function resolveUrl(href: string, baseUrl: string): string {
      if (href.startsWith('http')) return href
      if (href.startsWith('/')) {
        const base = new URL(baseUrl)
        return `${base.origin}${href}`
      }
      return baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1) + href
    }

    try {
      // 判断URL是目录页还是章节页
      const firstHtml = await fetchPage(url)
      const first$ = cheerio.load(firstHtml)

      // 提取小说标题和作者
      const title = inputTitle
        || first$('meta[property="og:novel:book_name"]').attr('content')
        || first$('h1').first().text().trim().split(/[_|－]/)[0].trim()
        || first$('title').text().trim().split(/[_|－]/)[0].trim()
        || '未知小说'
      const author = first$('meta[property="og:novel:author"]').attr('content')
        || first$('meta[name="author"]').attr('content')
        || first$('.book_box dd:contains("作者")').text().replace(/.*作者[：:]\s*/, '').trim()
        || '在线爬取'

      // 收集章节链接
      const chapterLinks: Array<{ title: string; url: string }> = []
      const seenUrls = new Set<string>()

      // 检查是否是章节页（有正文内容），如果是则找目录页
      const isChapterPage = first$('#chaptercontent').length > 0
        || first$('#content').length > 0
        || first$('#BookText').length > 0

      let catalogUrl = url
      if (isChapterPage) {
        // 从章节页找目录链接
        const catalogHref = first$('a[href*="mulu"], a#pb_mulu, a:contains("目录")').attr('href')
          || first$('.book_last a').first().attr('href')
        if (catalogHref) {
          catalogUrl = resolveUrl(catalogHref, url)
        }
      }

      // 爬取目录页（支持分页），同时提取元信息
      const maxCatalogPages = 50
      let nextCatalogPage: string | null = catalogUrl
      let catalogTitle = ''
      let catalogAuthor = ''

      for (let pageIdx = 0; pageIdx < maxCatalogPages && nextCatalogPage; pageIdx++) {
        const catalogHtml = await fetchPage(nextCatalogPage)
        const catalog$ = cheerio.load(catalogHtml)

        // 从目录页提取标题和作者（目录页信息更完整）
        if (pageIdx === 0) {
          catalogTitle = catalog$('meta[property="og:novel:book_name"]').attr('content')
            || catalog$('h1').first().text().trim().split(/[_|－]/)[0].trim()
            || ''
          catalogAuthor = catalog$('meta[property="og:novel:author"]').attr('content')
            || catalog$('.book_box dd:contains("作者")').text().replace(/.*作者[：:]\s*/, '').trim()
            || ''
        }

        // 提取章节链接
        catalog$('a').each((_, el) => {
          const href = catalog$(el).attr('href')
          const text = catalog$(el).text().trim()
          if (!href || !text || href.startsWith('javascript') || seenUrls.has(href)) return
          if (CHAPTER_PATTERNS.some(p => p.test(text))) {
            seenUrls.add(href)
            chapterLinks.push({ title: text, url: resolveUrl(href, nextCatalogPage!) })
          }
        })

        // 查找下一页目录
        const nextHref = catalog$('a:contains("下一页")').attr('href')
          || catalog$('.page_next a').attr('href')
        if (nextHref && !nextHref.startsWith('javascript')) {
          nextCatalogPage = resolveUrl(nextHref, nextCatalogPage)
        } else {
          nextCatalogPage = null
        }
      }

      if (chapterLinks.length === 0) {
        return reply.code(400).send({ code: 400, data: null, message: '未找到章节链接，请确认URL是小说目录页' })
      }

      // 按章节号排序（提取章节中的数字进行排序）
      chapterLinks.sort((a, b) => {
        const numA = parseInt(a.title.match(/第(\d+)/)?.[1] || '0')
        const numB = parseInt(b.title.match(/第(\d+)/)?.[1] || '0')
        if (numA && numB) return numA - numB
        return 0
      })

      // 用目录页的元信息覆盖（更准确）
      const finalTitle = inputTitle || catalogTitle || title
      const finalAuthor = catalogAuthor || author

      // 限制章节数
      const limit = Math.min(maxChapters, 500)
      const linksToCrawl = chapterLinks.slice(0, limit)

      // 逐章爬取内容
      const chapters: Array<{ title: string; content: string; chapterNumber: number; wordCount: number }> = []
      for (let i = 0; i < linksToCrawl.length; i++) {
        try {
          // 爬取章节第一页
          let chHtml = await fetchPage(linksToCrawl[i].url)
          let ch$ = cheerio.load(chHtml)

          // 提取正文内容
          const contentSelectors = ['#chaptercontent', '#content', '.content', '#BookText', '.read-content', '.chapter-content', 'article', '.text', '.Readarea']
          let content = ''
          for (const sel of contentSelectors) {
            const el = ch$(sel)
            if (el.length > 0 && el.text().trim().length > 20) {
              content = el.text().trim()
              break
            }
          }
          // fallback: 取最大文本块
          if (!content) {
            let maxLen = 0
            ch$('div, p, section').each((_, el) => {
              const text = ch$(el).text().trim()
              if (text.length > maxLen && text.length > 50) {
                content = text
                maxLen = text.length
              }
            })
          }

          // 处理章节分页（如 _2.html, _3.html）
          let pageNum = 2
          while (true) {
            const pageUrl = linksToCrawl[i].url.replace(/\.html$/, `_${pageNum}.html`)
            try {
              const pageHtml = await fetchPage(pageUrl)
              const page$ = cheerio.load(pageHtml)
              let pageContent = ''
              for (const sel of contentSelectors) {
                const el = page$(sel)
                if (el.length > 0 && el.text().trim().length > 20) {
                  pageContent = el.text().trim()
                  break
                }
              }
              if (!pageContent) break
              content += '\n' + pageContent
              pageNum++
              if (pageNum > 10) break // 最多10页
            } catch {
              break // 分页结束
            }
          }

          // 清理内容：去除多余空白和广告
          content = content
            .replace(/第\(\d+\/\d+\)页/g, '')
            .replace(/mchaptererror\(\)/g, '')
            .replace(/\s{3,}/g, '\n\n')
            .trim()

          if (content) {
            chapters.push({
              title: linksToCrawl[i].title,
              content,
              chapterNumber: i + 1,
              wordCount: content.length,
            })
          }
        } catch {
          // 单章爬取失败，跳过
        }
      }

      if (chapters.length === 0) {
        return reply.code(400).send({ code: 400, data: null, message: '未能爬取到任何章节内容' })
      }

      // 保存到数据库
      const novel = await fastify.prisma.novel.create({
        data: {
          title: finalTitle,
          author: finalAuthor,
          source: 'crawl',
          sourceUrl: url,
          userId: 'anonymous',
          chapters: {
            create: chapters,
          },
        },
        include: { _count: { select: { chapters: true } } },
      })

      return reply.send({ code: 200, data: novel, message: 'ok' })
    } catch (err: any) {
      return reply.code(500).send({ code: 500, data: null, message: `爬取失败: ${err.message || '未知错误'}` })
    }
  })

  // GET /api/novels/:id - 获取小说详情
  fastify.get('/api/novels/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const novel = await fastify.prisma.novel.findUnique({
      where: { id },
      include: { _count: { select: { chapters: true } } },
    })
    if (!novel) {
      return reply.code(404).send({ code: 404, data: null, message: '小说不存在' })
    }
    return reply.send({ code: 200, data: novel, message: 'ok' })
  })

  // DELETE /api/novels/:id
  fastify.delete('/api/novels/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.novel.delete({ where: { id } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })

  // PATCH /api/novels/:id - 更新小说（重命名、收藏等）
  fastify.patch('/api/novels/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { title?: string; author?: string; isFavorite?: boolean }
    const data: any = {}
    if (body.title !== undefined) data.title = body.title
    if (body.author !== undefined) data.author = body.author
    if (body.isFavorite !== undefined) data.isFavorite = body.isFavorite
    const novel = await fastify.prisma.novel.update({
      where: { id },
      data,
      include: { _count: { select: { chapters: true } } },
    })
    return reply.send({ code: 200, data: novel, message: 'ok' })
  })

  // GET /api/novels/:id/chapters - 获取章节列表
  fastify.get('/api/novels/:id/chapters', async (request, reply) => {
    const { id } = request.params as { id: string }
    const chapters = await fastify.prisma.chapter.findMany({
      where: { novelId: id },
      select: { id: true, chapterNumber: true, title: true, wordCount: true },
      orderBy: { chapterNumber: 'asc' },
    })
    return reply.send({ code: 200, data: chapters, message: 'ok' })
  })

  // GET /api/novels/:id/chapters/:num - 获取章节内容
  fastify.get('/api/novels/:id/chapters/:num', async (request, reply) => {
    const { id, num } = request.params as { id: string; num: string }
    const chapter = await fastify.prisma.chapter.findFirst({
      where: { novelId: id, chapterNumber: Number(num) },
    })
    if (!chapter) {
      return reply.code(404).send({ code: 404, data: null, message: '章节不存在' })
    }
    return reply.send({ code: 200, data: chapter, message: 'ok' })
  })

  // GET /api/novels/:id/progress
  fastify.get('/api/novels/:id/progress', async (request, reply) => {
    const userId = 'anonymous'
    const { id } = request.params as { id: string }
    const progress = await fastify.prisma.readingProgress.findUnique({
      where: { userId_novelId: { userId, novelId: id } },
    })
    return reply.send({ code: 200, data: progress, message: 'ok' })
  })

  // PUT /api/novels/:id/progress
  fastify.put('/api/novels/:id/progress', async (request, reply) => {
    const userId = 'anonymous'
    const { id } = request.params as { id: string }
    const { chapterId, scrollPosition } = request.body as { chapterId: string; scrollPosition: number }

    const progress = await fastify.prisma.readingProgress.upsert({
      where: { userId_novelId: { userId, novelId: id } },
      update: { currentChapterId: chapterId, currentScrollPosition: scrollPosition, lastReadAt: new Date() },
      create: { userId, novelId: id, currentChapterId: chapterId, currentScrollPosition: scrollPosition },
    })

    return reply.send({ code: 200, data: progress, message: 'ok' })
  })

  // GET /api/novels/:id/bookmarks
  fastify.get('/api/novels/:id/bookmarks', async (request, reply) => {
    const userId = 'anonymous'
    const { id } = request.params as { id: string }
    const bookmarks = await fastify.prisma.bookmark.findMany({
      where: { userId, novelId: id },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ code: 200, data: bookmarks, message: 'ok' })
  })

  // POST /api/novels/:id/bookmarks
  fastify.post('/api/novels/:id/bookmarks', async (request, reply) => {
    const userId = 'anonymous'
    const { id } = request.params as { id: string }
    const { chapterId, position, note } = request.body as { chapterId: string; position: number; note?: string }

    const bookmark = await fastify.prisma.bookmark.create({
      data: { userId, novelId: id, chapterId, position, note },
    })
    return reply.send({ code: 200, data: bookmark, message: 'ok' })
  })

  // DELETE /api/novels/:id/bookmarks/:bid
  fastify.delete('/api/novels/:id/bookmarks/:bid', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { bid } = request.params as { bid: string }
    await fastify.prisma.bookmark.delete({ where: { id: bid } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })
}
