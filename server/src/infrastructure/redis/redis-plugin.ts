import Redis from 'ioredis'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const redisPlugin = fp(async (fastify: FastifyInstance) => {
  let redis: Redis | null = null
  let isConnected = false

  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          fastify.log.warn('Redis connection failed, using memory fallback')
          return null
        }
        return Math.min(times * 100, 3000)
      }
    })

    redis.on('connect', () => {
      isConnected = true
      fastify.log.info('Redis connected')
    })

    redis.on('error', (err) => {
      if (isConnected) {
        fastify.log.error('Redis error:', err.message)
      }
    })
  } catch (err) {
    fastify.log.warn('Redis not available, using memory fallback')
  }

  // 内存降级存储
  const memoryStore = new Map<string, { value: string; expiry?: number }>()
  
  const store = {
    get: async (key: string): Promise<string | null> => {
      if (redis && isConnected) {
        return redis.get(key)
      }
      const item = memoryStore.get(key)
      if (!item) return null
      if (item.expiry && Date.now() > item.expiry) {
        memoryStore.delete(key)
        return null
      }
      return item.value
    },
    set: async (key: string, value: string, ...args: any[]): Promise<void> => {
      if (redis && isConnected) {
        if (args[0] === 'EX') {
          await redis.set(key, value, 'EX', args[1])
        } else {
          await redis.set(key, value)
        }
        return
      }
      let expiry: number | undefined
      if (args[0] === 'EX') {
        expiry = Date.now() + args[1] * 1000
      }
      memoryStore.set(key, { value, expiry })
    },
    del: async (key: string): Promise<void> => {
      if (redis && isConnected) {
        await redis.del(key)
        return
      }
      memoryStore.delete(key)
    }
  }

  fastify.decorate('redis', store)

  fastify.addHook('onClose', async () => {
    if (redis) redis.disconnect()
  })
})

export { redisPlugin }
