import type { FastifyInstance } from 'fastify'
import { registerAuthService } from '../../modules/auth/auth.service.js'
import { registerNovelService } from '../../modules/novel/novel.service.js'
import { registerGameService } from '../../modules/game/game.service.js'
import { registerVideoService } from '../../modules/video/video.service.js'
import { registerBlogService } from '../../modules/blog/blog.service.js'
import { registerChatService } from '../../modules/chat/chat.service.js'
import { registerAiService } from '../../modules/ai/ai.service.js'

export function registerRoutes(fastify: FastifyInstance) {
  fastify.register(registerAuthService)
  fastify.register(registerNovelService)
  fastify.register(registerGameService)
  fastify.register(registerVideoService)
  fastify.register(registerBlogService)
  fastify.register(registerChatService)
  fastify.register(registerAiService)
}
