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

interface KnowledgeCard {
  id: string
  title: string
  content: string
  tags: string[]
}

const knowledgeCards: KnowledgeCard[] = []

export async function registerAiService(fastify: FastifyInstance) {

  // POST /api/ai/chat - AI对话
  fastify.post('/api/ai/chat', async (request, reply) => {
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
      // 构建系统提示词
      let systemPrompt = '你是一个有用的AI助手。'
      
      // 注入知识库内容
      if (knowledgeIds?.length) {
        const selectedCards = knowledgeCards.filter(c => knowledgeIds.includes(c.id))
        if (selectedCards.length > 0) {
          systemPrompt += '\n\n## 知识库参考信息\n\n'
          for (const card of selectedCards) {
            systemPrompt += `### ${card.title}\n${card.content}\n\n`
          }
          systemPrompt += '请基于以上知识库信息回答用户问题。如果知识库中没有相关信息，请基于你的知识回答。'
        }
      }

      // 构建请求消息
      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
      ]

      // 调用OpenAI兼容API
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

  // POST /api/ai/chat/stream - AI流式对话
  fastify.post('/api/ai/chat/stream', async (request, reply) => {
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
        const selectedCards = knowledgeCards.filter(c => knowledgeIds.includes(c.id))
        if (selectedCards.length > 0) {
          systemPrompt += '\n\n## 知识库参考信息\n\n'
          for (const card of selectedCards) {
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

      // 流式响应
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

  // ---- 知识库（用户卡片）接口 ----

  // GET /api/ai/knowledge - 获取知识库卡片列表
  fastify.get('/api/ai/knowledge', async (request, reply) => {
    return reply.send({ code: 200, data: knowledgeCards, message: 'ok' })
  })

  // POST /api/ai/knowledge - 创建知识库卡片
  fastify.post('/api/ai/knowledge', async (request, reply) => {
    const { title, content, tags } = request.body as {
      title: string
      content: string
      tags?: string[]
    }

    if (!title || !content) {
      return reply.code(400).send({ code: 400, data: null, message: '标题和内容不能为空' })
    }

    const card: KnowledgeCard = {
      id: `card_${Date.now()}`,
      title,
      content,
      tags: tags || [],
    }

    knowledgeCards.push(card)
    return reply.send({ code: 200, data: card, message: 'ok' })
  })

  // PUT /api/ai/knowledge/:id - 更新知识库卡片
  fastify.put('/api/ai/knowledge/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, content, tags } = request.body as {
      title?: string
      content?: string
      tags?: string[]
    }

    const idx = knowledgeCards.findIndex(c => c.id === id)
    if (idx === -1) {
      return reply.code(404).send({ code: 404, data: null, message: '卡片不存在' })
    }

    if (title) knowledgeCards[idx].title = title
    if (content) knowledgeCards[idx].content = content
    if (tags) knowledgeCards[idx].tags = tags

    return reply.send({ code: 200, data: knowledgeCards[idx], message: 'ok' })
  })

  // DELETE /api/ai/knowledge/:id - 删除知识库卡片
  fastify.delete('/api/ai/knowledge/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const idx = knowledgeCards.findIndex(c => c.id === id)
    if (idx === -1) {
      return reply.code(404).send({ code: 404, data: null, message: '卡片不存在' })
    }

    const deleted = knowledgeCards.splice(idx, 1)[0]
    return reply.send({ code: 200, data: deleted, message: 'ok' })
  })

  // ---- 对话历史接口 ----

  // GET /api/ai/conversations - 获取对话列表
  fastify.get('/api/ai/conversations', async (request, reply) => {
    const conversations = await fastify.prisma.aiConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })
    return reply.send({ code: 200, data: conversations, message: 'ok' })
  })

  // GET /api/ai/conversations/:id - 获取对话详情
  fastify.get('/api/ai/conversations/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const conv = await fastify.prisma.aiConversation.findUnique({ where: { id } })
    if (!conv) {
      return reply.code(404).send({ code: 404, data: null, message: '对话不存在' })
    }
    return reply.send({ code: 200, data: conv, message: 'ok' })
  })

  // POST /api/ai/conversations - 创建/保存对话
  fastify.post('/api/ai/conversations', async (request, reply) => {
    const { title, model, messages, config, knowledge } = request.body as {
      title: string
      model: string
      messages: any[]
      config?: any
      knowledge?: string[]
    }

    const conv = await fastify.prisma.aiConversation.create({
      data: {
        title: title || '新对话',
        model: model || 'unknown',
        messages: JSON.stringify(messages),
        config: JSON.stringify(config || {}),
        knowledge: JSON.stringify(knowledge || []),
      },
    })
    return reply.send({ code: 200, data: conv, message: 'ok' })
  })

  // PUT /api/ai/conversations/:id - 更新对话
  fastify.put('/api/ai/conversations/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, model, messages, config, knowledge } = request.body as {
      title?: string
      model?: string
      messages?: any[]
      config?: any
      knowledge?: string[]
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

  // DELETE /api/ai/conversations/:id - 删除对话
  fastify.delete('/api/ai/conversations/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.aiConversation.delete({ where: { id } })
    return reply.send({ code: 200, data: null, message: 'ok' })
  })
}
