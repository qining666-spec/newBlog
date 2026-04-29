import type { FastifyInstance } from 'fastify'

export async function registerBlogService(fastify: FastifyInstance) {
  // GET /api/blog/posts
  fastify.get('/api/blog/posts', async (request, reply) => {
    const { keyword, categoryId, tag, page = '1', pageSize = '20' } = request.query as any
    const skip = (Number(page) - 1) * Number(pageSize)
    const where: any = {}

    if (keyword) where.title = { contains: keyword }
    if (categoryId) where.categoryId = categoryId
    if (tag) where.tags = { contains: tag }

    // 非作者只能看到已发布的公开文章
    const userId = (request.user as any)?.id
    if (!userId) {
      where.isPublished = true
      where.isPrivate = false
    }

    const [items, total] = await Promise.all([
      fastify.prisma.blogPost.findMany({ where, skip, take: Number(pageSize), orderBy: { publishedAt: 'desc' }, include: { category: true } }),
      fastify.prisma.blogPost.count({ where }),
    ])

    return reply.send({ code: 200, data: { items, total }, message: 'ok' })
  })

  // POST /api/blog/posts
  fastify.post('/api/blog/posts', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const { title, content, categoryId, tags, isPrivate } = request.body as any

    const post = await fastify.prisma.blogPost.create({
      data: { title, content, userId, categoryId, tags: Array.isArray(tags) ? tags.join(',') : (tags || ''), isPrivate: isPrivate || false },
    })

    return reply.send({ code: 200, data: post, message: 'ok' })
  })

  // GET /api/blog/posts/:id
  fastify.get('/api/blog/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const post = await fastify.prisma.blogPost.findUnique({ where: { id }, include: { category: true } })
    if (!post) return reply.code(404).send({ code: 404, data: null, message: '文章不存在' })

    // 增加阅读量
    await fastify.prisma.blogPost.update({ where: { id }, data: { viewCount: { increment: 1 } } })

    return reply.send({ code: 200, data: post, message: 'ok' })
  })

  // PATCH /api/blog/posts/:id
  fastify.patch('/api/blog/posts/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as any
    if (body.tags && Array.isArray(body.tags)) {
      body.tags = body.tags.join(',')
    }
    const post = await fastify.prisma.blogPost.update({ where: { id }, data: body })
    return reply.send({ code: 200, data: post, message: 'ok' })
  })

  // DELETE /api/blog/posts/:id
  fastify.delete('/api/blog/posts/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.blogPost.delete({ where: { id } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })

  // POST /api/blog/posts/:id/publish
  fastify.post('/api/blog/posts/:id/publish', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const post = await fastify.prisma.blogPost.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    })
    return reply.send({ code: 200, data: post, message: 'ok' })
  })

  // GET /api/blog/categories
  fastify.get('/api/blog/categories', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const categories = await fastify.prisma.blogCategory.findMany({ where: { userId } })
    return reply.send({ code: 200, data: categories, message: 'ok' })
  })

  // POST /api/blog/categories
  fastify.post('/api/blog/categories', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id
    const { name, description } = request.body as { name: string; description?: string }
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const category = await fastify.prisma.blogCategory.create({ data: { name, slug, description, userId } })
    return reply.send({ code: 200, data: category, message: 'ok' })
  })

  // DELETE /api/blog/categories/:id
  fastify.delete('/api/blog/categories/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.blogCategory.delete({ where: { id } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })
}
