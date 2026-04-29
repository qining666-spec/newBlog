import jwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const jwtPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    sign: {
      expiresIn: '15m',
    },
  })

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ code: 401, message: 'Unauthorized', data: null })
    }
  })
})

export { jwtPlugin }

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any
  }
}
