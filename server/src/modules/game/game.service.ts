import type { FastifyInstance } from 'fastify'

export async function registerGameService(fastify: FastifyInstance) {
  // GET /api/games/nes - 获取NES游戏列表
  fastify.get('/api/games/nes', async (request, reply) => {
    const { page = '1', pageSize = '20', public: isPublic = 'true' } = request.query as any
    const skip = (Number(page) - 1) * Number(pageSize)
    const where = isPublic === 'true' ? { isPublic: true } : {}

    const [items, total] = await Promise.all([
      fastify.prisma.nesGame.findMany({ where, skip, take: Number(pageSize), orderBy: { createdAt: 'desc' } }),
      fastify.prisma.nesGame.count({ where }),
    ])

    return reply.send({ code: 200, data: { items, total }, message: 'ok' })
  })

  // POST /api/games/nes/upload - 上传NES ROM
  fastify.post('/api/games/nes/upload', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const data = await request.file()
    if (!data) {
      return reply.code(400).send({ code: 400, data: null, message: '未提供文件' })
    }

    const buffer = await data.toBuffer()
    if (buffer.length > 5 * 1024 * 1024) {
      return reply.code(400).send({ code: 400, data: null, message: 'ROM文件超过5MB限制' })
    }

    const title = (data.fields as any)?.title?.value || data.filename
    const description = (data.fields as any)?.description?.value || ''

    // 存储ROM文件
    const romPath = `roms/${Date.now()}_${data.filename}`
    // TODO: 实际存储到文件系统或MinIO

    const game = await fastify.prisma.nesGame.create({
      data: { title, romPath, description, uploadedBy: userId },
    })

    return reply.send({ code: 200, data: game, message: 'ok' })
  })

  // GET /api/games/nes/:id/rom - 下载ROM
  fastify.get('/api/games/nes/:id/rom', async (request, reply) => {
    const { id } = request.params as { id: string }
    const game = await fastify.prisma.nesGame.findUnique({ where: { id } })
    if (!game) {
      return reply.code(404).send({ code: 404, data: null, message: '游戏不存在' })
    }
    // TODO: 从文件系统或MinIO读取ROM文件并返回
    return reply.send({ code: 200, data: { romPath: game.romPath }, message: 'ok' })
  })

  // GET /api/games/nes/:id/saves
  fastify.get('/api/games/nes/:id/saves', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const { id } = request.params as { id: string }
    const saves = await fastify.prisma.nesSaveState.findMany({
      where: { gameId: id, userId },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ code: 200, data: saves, message: 'ok' })
  })

  // POST /api/games/nes/:id/saves
  fastify.post('/api/games/nes/:id/saves', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const { id } = request.params as { id: string }
    const { saveData, screenshot } = request.body as { saveData: string; screenshot?: string }
    const save = await fastify.prisma.nesSaveState.create({
      data: { gameId: id, userId, saveData, screenshot },
    })
    return reply.send({ code: 200, data: save, message: 'ok' })
  })

  // DELETE /api/games/nes/saves/:sid
  fastify.delete('/api/games/nes/saves/:sid', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sid } = request.params as { sid: string }
    await fastify.prisma.nesSaveState.delete({ where: { id: sid } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })

  // GET /api/games/gomoku/rooms
  fastify.get('/api/games/gomoku/rooms', async (request, reply) => {
    const rooms = await fastify.prisma.gomokuRoom.findMany({
      where: { status: { in: ['waiting', 'playing'] } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ code: 200, data: rooms, message: 'ok' })
  })

  // POST /api/games/gomoku/rooms
  fastify.post('/api/games/gomoku/rooms', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const { name, boardSize = 15 } = request.body as { name: string; boardSize?: number }
    const room = await fastify.prisma.gomokuRoom.create({
      data: { name, hostId: userId, boardSize },
    })
    return reply.send({ code: 200, data: room, message: 'ok' })
  })
}
