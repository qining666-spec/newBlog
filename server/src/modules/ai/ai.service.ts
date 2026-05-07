import type { FastifyInstance } from 'fastify'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AiConfig {
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
  topP: number
}

function getUserId(request: any): string {
  return request.user?.id || 'anonymous'
}

export async function registerAiService(fastify: FastifyInstance) {

  fastify.post('/api/ai/chat', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { messages, config, knowledgeIds } = request.body as {
      messages: ChatMessage[]
      config: AiConfig
      knowledgeIds?: string[]
    }

    if (!config?.apiKey) {
      return reply.code(400).send({ code: 400, data: null, message: '请先设置API Key' })
    }

    if (!messages?.length) {
      return reply.code(400).send({ code: 400, data: null, message: '消息不能为空' })
    }

    try {
      let systemPrompt = '你是一个有用的AI助手。'
      
      if (knowledgeIds?.length) {
        const userId = getUserId(request)
        const cards = await fastify.prisma.aiKnowledge.findMany({
          where: { id: { in: knowledgeIds }, userId }
        })
        if (cards.length > 0) {
          systemPrompt += '\n\n## 知识库参考信息\n\n'
          for (const card of cards) {
            systemPrompt += `### ${card.title}\n${card.content}\n\n`
          }
          systemPrompt += '请基于以上知识库信息回答用户问题。如果知识库中没有相关信息，请基于你的知识回答。'
        }
      }

      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
      ]

      const baseUrl = config.baseUrl || 'https://api.deepseek.com'
      const apiUrl = `${baseUrl}/chat/completions`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: apiMessages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens || 2048,
          top_p: config.topP ?? 1,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      })

      if (!response.ok) {
        const errText = await response.text()
        fastify.log.error(`AI API错误: ${response.status} ${errText}`)
        return reply.code(response.status).send({
          code: response.status,
          data: null,
          message: `AI服务错误: ${response.status}`,
        })
      }

      const data = await response.json() as any
      const assistantMessage = data.choices?.[0]?.message?.content || '无回复'

      return reply.send({
        code: 200,
        data: {
          message: assistantMessage,
          usage: data.usage,
          model: data.model,
        },
        message: 'ok',
      })
    } catch (error: any) {
      fastify.log.error(`AI对话失败: ${error.message}`)
      return reply.code(500).send({
        code: 500,
        data: null,
        message: `对话失败: ${error.message || '未知错误'}`,
      })
    }
  })

  fastify.post('/api/ai/chat/stream', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { messages, config, knowledgeIds } = request.body as {
      messages: ChatMessage[]
      config: AiConfig
      knowledgeIds?: string[]
    }

    if (!config?.apiKey) {
      return reply.code(400).send({ code: 400, data: null, message: '请先设置API Key' })
    }

    try {
      let systemPrompt = '你是一个有用的AI助手。'
      
      if (knowledgeIds?.length) {
        const userId = getUserId(request)
        const cards = await fastify.prisma.aiKnowledge.findMany({
          where: { id: { in: knowledgeIds }, userId }
        })
        if (cards.length > 0) {
          systemPrompt += '\n\n## 知识库参考信息\n\n'
          for (const card of cards) {
            systemPrompt += `### ${card.title}\n${card.content}\n\n`
          }
          systemPrompt += '请基于以上知识库信息回答用户问题。如果知识库中没有相关信息，请基于你的知识回答。'
        }
      }

      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
      ]

      const baseUrl = config.baseUrl || 'https://api.deepseek.com'
      const apiUrl = `${baseUrl}/chat/completions`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'deepseek-v4-flash',
          messages: apiMessages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens || 2048,
          top_p: config.topP ?? 1,
          stream: true,
        }),
        signal: AbortSignal.timeout(120000),
      })

      if (!response.ok) {
        const errText = await response.text()
        return reply.code(response.status).send({
          code: response.status,
          data: null,
          message: `AI服务错误: ${response.status}`,
        })
      }

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      })

      const reader = response.body?.getReader()
      if (!reader) {
        reply.raw.end()
        return
      }

      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          reply.raw.write(chunk)
        }
      } finally {
        reader.releaseLock()
        reply.raw.end()
      }
    } catch (error: any) {
      fastify.log.error(`AI流式对话失败: ${error.message}`)
      if (!reply.raw.writableEnded) {
        reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
        reply.raw.end()
      }
    }
  })

  fastify.get('/api/ai/knowledge', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const cards = await fastify.prisma.aiKnowledge.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
    return reply.send({ 
      code: 200, 
      data: cards.map(c => ({
        ...c,
        tags: JSON.parse(c.tags)
      })), 
      message: 'ok' 
    })
  })

  fastify.post('/api/ai/knowledge', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { title, content, tags } = request.body as {
      title: string
      content: string
      tags?: string[]
    }

    if (!title || !content) {
      return reply.code(400).send({ code: 400, data: null, message: '标题和内容不能为空' })
    }

    const card = await fastify.prisma.aiKnowledge.create({
      data: {
        userId,
        title,
        content,
        tags: JSON.stringify(tags || []),
      },
    })
    return reply.send({ 
      code: 200, 
      data: { ...card, tags: JSON.parse(card.tags) }, 
      message: 'ok' 
    })
  })

  fastify.put('/api/ai/knowledge/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    const { title, content, tags } = request.body as {
      title?: string
      content?: string
      tags?: string[]
    }

    const existing = await fastify.prisma.aiKnowledge.findFirst({
      where: { id, userId }
    })
    if (!existing) {
      return reply.code(404).send({ code: 404, data: null, message: '卡片不存在' })
    }

    const data: any = {}
    if (title !== undefined) data.title = title
    if (content !== undefined) data.content = content
    if (tags !== undefined) data.tags = JSON.stringify(tags)

    const card = await fastify.prisma.aiKnowledge.update({
      where: { id },
      data,
    })
    return reply.send({ 
      code: 200, 
      data: { ...card, tags: JSON.parse(card.tags) }, 
      message: 'ok' 
    })
  })

  fastify.delete('/api/ai/knowledge/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    
    const existing = await fastify.prisma.aiKnowledge.findFirst({
      where: { id, userId }
    })
    if (!existing) {
      return reply.code(404).send({ code: 404, data: null, message: '卡片不存在' })
    }

    await fastify.prisma.aiKnowledge.delete({ where: { id } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })

  fastify.get('/api/ai/conversations', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const conversations = await fastify.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })
    return reply.send({ code: 200, data: conversations, message: 'ok' })
  })

  fastify.get('/api/ai/conversations/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    const conv = await fastify.prisma.aiConversation.findFirst({
      where: { id, userId }
    })
    if (!conv) {
      return reply.code(404).send({ code: 404, data: null, message: '对话不存在' })
    }
    return reply.send({ code: 200, data: conv, message: 'ok' })
  })

  fastify.post('/api/ai/conversations', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { title, model, messages, config, knowledge } = request.body as {
      title: string
      model: string
      messages: any[]
      config?: any
      knowledge?: string[]
    }

    const conv = await fastify.prisma.aiConversation.create({
      data: {
        userId,
        title: title || '新对话',
        model: model || 'unknown',
        messages: JSON.stringify(messages),
        config: JSON.stringify(config || {}),
        knowledge: JSON.stringify(knowledge || []),
      },
    })
    return reply.send({ code: 200, data: conv, message: 'ok' })
  })

  fastify.put('/api/ai/conversations/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    const { title, model, messages, config, knowledge } = request.body as {
      title?: string
      model?: string
      messages?: any[]
      config?: any
      knowledge?: string[]
    }

    const existing = await fastify.prisma.aiConversation.findFirst({
      where: { id, userId }
    })
    if (!existing) {
      return reply.code(404).send({ code: 404, data: null, message: '对话不存在' })
    }

    const data: any = {}
    if (title !== undefined) data.title = title
    if (model !== undefined) data.model = model
    if (messages !== undefined) data.messages = JSON.stringify(messages)
    if (config !== undefined) data.config = JSON.stringify(config)
    if (knowledge !== undefined) data.knowledge = JSON.stringify(knowledge)

    const conv = await fastify.prisma.aiConversation.update({
      where: { id },
      data,
    })
    return reply.send({ code: 200, data: conv, message: 'ok' })
  })

  fastify.delete('/api/ai/conversations/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }
    
    const existing = await fastify.prisma.aiConversation.findFirst({
      where: { id, userId }
    })
    if (!existing) {
      return reply.code(404).send({ code: 404, data: null, message: '对话不存在' })
    }

    await fastify.prisma.aiConversation.delete({ where: { id } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })
}
