import type { FastifyInstance } from 'fastify'

export async function registerChatService(fastify: FastifyInstance) {
  // GET /api/chat/rooms
  fastify.get('/api/chat/rooms', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    // 返回公共聊天室
    const rooms = [{ id: 'public', name: '公共聊天室', type: 'public' }]
    return reply.send({ code: 200, data: rooms, message: 'ok' })
  })

  // GET /api/chat/rooms/:id/messages
  fastify.get('/api/chat/rooms/:id/messages', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { before, limit = '50' } = request.query as { before?: string; limit?: string }

    const where: any = { roomId: id }
    if (before) where.createdAt = { lt: new Date(before) }

    const messages = await fastify.prisma.chatMessage.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ code: 200, data: messages.reverse(), message: 'ok' })
  })

  // GET /api/chat/search
  fastify.get('/api/chat/search', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { keyword, roomId } = request.query as { keyword: string; roomId?: string }

    const where: any = { content: { contains: keyword } }
    if (roomId) where.roomId = roomId

    const messages = await fastify.prisma.chatMessage.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ code: 200, data: messages, message: 'ok' })
  })
}
