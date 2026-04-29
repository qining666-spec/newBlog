import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { Server as SocketIOServer } from 'socket.io'
import { registerRoutes } from './routes/index.js'
import { prismaPlugin } from '../infrastructure/database/prisma-plugin.js'
import { redisPlugin } from '../infrastructure/redis/redis-plugin.js'
import { jwtPlugin } from '../shared/middleware/jwt.js'

const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '0.0.0.0'

async function start() {
  const fastify = Fastify({ logger: true })

  // 注册插件
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  await fastify.register(prismaPlugin)
  await fastify.register(redisPlugin)
  await fastify.register(jwtPlugin)
  await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })

  // 注册路由
  registerRoutes(fastify)

  // 先注册io装饰器（占位），listen后再赋值
  fastify.decorate('io', null as any)

  // 启动HTTP服务器
  await fastify.listen({ port: PORT, host: HOST })

  // 初始化Socket.IO（在listen之后，因为需要httpServer）
  const httpServer = fastify.server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  // Socket.IO认证中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }
    try {
      const decoded = fastify.jwt.verify(token)
      socket.data.user = decoded
      next()
    } catch {
      next(new Error('Authentication error'))
    }
  })

  // 在线用户管理
  const onlineUsers = new Map<string, { userId: string; nickname: string; socketId: string }>()

  io.on('connection', (socket) => {
    const user = socket.data.user as { id: string; email?: string }
    fastify.log.info(`Socket connected: ${socket.id}, user: ${user?.id}`)

    // 加入聊天室
    socket.on('chat:join', async (roomId: string) => {
      socket.join(roomId)
      
      // 获取用户信息
      const userInfo = await fastify.prisma.user.findUnique({ 
        where: { id: user.id },
        select: { id: true, nickname: true }
      })
      
      // 添加到在线用户
      onlineUsers.set(socket.id, { 
        userId: user.id, 
        nickname: userInfo?.nickname || '匿名用户',
        socketId: socket.id 
      })
      
      // 广播在线用户列表
      const users = Array.from(onlineUsers.values())
      io.to(roomId).emit('chat:onlineUsers', users)
      
      fastify.log.info(`User ${user.id} joined room ${roomId}`)
    })

    // 离开聊天室
    socket.on('chat:leave', (roomId: string) => {
      socket.leave(roomId)
      onlineUsers.delete(socket.id)
      
      // 广播更新后的在线用户列表
      const users = Array.from(onlineUsers.values())
      io.to(roomId).emit('chat:onlineUsers', users)
    })

    // 接收并广播消息
    socket.on('chat:message', async (data: { roomId: string; message: any }) => {
      const { roomId, message } = data
      
      // 保存消息到数据库
      const savedMsg = await fastify.prisma.chatMessage.create({
        data: {
          roomId,
          senderId: message.senderId,
          senderName: message.senderName,
          type: message.type || 'text',
          content: message.content,
        }
      })
      
      // 广播消息
      io.to(roomId).emit('chat:message', {
        id: savedMsg.id,
        roomId: savedMsg.roomId,
        senderId: savedMsg.senderId,
        senderName: savedMsg.senderName,
        type: savedMsg.type,
        content: savedMsg.content,
        createdAt: savedMsg.createdAt,
      })
    })

    socket.on('disconnect', () => {
      fastify.log.info(`Socket disconnected: ${socket.id}`)
      onlineUsers.delete(socket.id)
      
      // 广播更新后的在线用户列表到所有房间
      const users = Array.from(onlineUsers.values())
      io.emit('chat:onlineUsers', users)
    })
  })

  // 赋值io实例
  fastify.io = io

  fastify.log.info(`Server running on http://${HOST}:${PORT}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
