import Redis from 'ioredis'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const redisPlugin = fp(async (fastify: FastifyInstance) => {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
  })

  redis.on('connect', () => {
    fastify.log.info('Redis connected')
  })

  redis.on('error', (err) => {
    fastify.log.error('Redis error:', err)
  })

  fastify.decorate('redis', redis)

  fastify.addHook('onClose', async () => {
    redis.disconnect()
  })
})

export { redisPlugin }
