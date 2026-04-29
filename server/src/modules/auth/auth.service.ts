import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'

const SALT_ROUNDS = 12
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export async function registerAuthService(fastify: FastifyInstance) {
  // POST /api/auth/register
  fastify.post('/api/auth/register', async (request, reply) => {
    const { email, password, nickname } = request.body as { email: string; password: string; nickname: string }

    if (!email || !password || !nickname) {
      return reply.code(400).send({ code: 400, data: null, message: '缺少必填字段' })
    }

    const existing = await fastify.prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.code(409).send({ code: 409, data: null, message: '邮箱已注册' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await fastify.prisma.user.create({
      data: { email, nickname, passwordHash },
    })

    const accessToken = fastify.jwt.sign({ id: user.id, email: user.email }, { expiresIn: ACCESS_TOKEN_EXPIRY })
    const refreshToken = fastify.jwt.sign({ id: user.id, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_EXPIRY })

    // 存储refreshToken到Redis
    await fastify.redis.set(`refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 3600)

    return reply.send({
      code: 200,
      data: {
        user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, role: user.role },
        tokens: { accessToken, refreshToken },
      },
      message: 'ok',
    })
  })

  // POST /api/auth/login
  fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }

    const user = await fastify.prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return reply.code(401).send({ code: 401, data: null, message: '邮箱或密码错误' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return reply.code(401).send({ code: 401, data: null, message: '邮箱或密码错误' })
    }

    const accessToken = fastify.jwt.sign({ id: user.id, email: user.email }, { expiresIn: ACCESS_TOKEN_EXPIRY })
    const refreshToken = fastify.jwt.sign({ id: user.id, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_EXPIRY })

    await fastify.redis.set(`refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 3600)

    return reply.send({
      code: 200,
      data: {
        user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, role: user.role },
        tokens: { accessToken, refreshToken },
      },
      message: 'ok',
    })
  })

  // POST /api/auth/refresh
  fastify.post('/api/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }

    try {
      const decoded = fastify.jwt.verify(refreshToken) as { id: string; type: string }
      if (decoded.type !== 'refresh') {
        return reply.code(401).send({ code: 401, data: null, message: '无效的refreshToken' })
      }

      const stored = await fastify.redis.get(`refresh:${decoded.id}`)
      if (stored !== refreshToken) {
        return reply.code(401).send({ code: 401, data: null, message: 'refreshToken已失效' })
      }

      const user = await fastify.prisma.user.findUnique({ where: { id: decoded.id } })
      if (!user) {
        return reply.code(401).send({ code: 401, data: null, message: '用户不存在' })
      }

      const accessToken = fastify.jwt.sign({ id: user.id, email: user.email }, { expiresIn: ACCESS_TOKEN_EXPIRY })

      return reply.send({
        code: 200,
        data: { accessToken },
        message: 'ok',
      })
    } catch {
      return reply.code(401).send({ code: 401, data: null, message: 'refreshToken无效或已过期' })
    }
  })

  // GET /api/auth/me
  fastify.get('/api/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const user = await fastify.prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return reply.code(404).send({ code: 404, data: null, message: '用户不存在' })
    }

    return reply.send({
      code: 200,
      data: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, role: user.role, preferences: user.preferences },
      message: 'ok',
    })
  })

  // PATCH /api/auth/me
  fastify.patch('/api/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const body = request.body as { nickname?: string; avatar?: string; preferences?: any }

    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.nickname && { nickname: body.nickname }),
        ...(body.avatar && { avatar: body.avatar }),
        ...(body.preferences && { preferences: body.preferences }),
      },
    })

    return reply.send({
      code: 200,
      data: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, role: user.role, preferences: user.preferences },
      message: 'ok',
    })
  })
}
