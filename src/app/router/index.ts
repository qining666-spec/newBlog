import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@shared/components/AppLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/blog',
      },
      {
        path: 'novel',
        name: 'Novel',
        component: () => import('@modules/novel/components/NovelShelf.vue'),
        meta: { module: 'novel', title: '小说书架' },
      },
      {
        path: 'novel/:id',
        name: 'NovelReader',
        component: () => import('@modules/novel/components/NovelReader.vue'),
        meta: { module: 'novel', title: '阅读' },
      },
      {
        path: 'game',
        name: 'Game',
        component: () => import('@modules/game/components/GameHall.vue'),
        meta: { module: 'game', title: '游戏大厅' },
      },
      {
        path: 'game/nes/:id',
        name: 'NesGame',
        component: () => import('@modules/game/components/NesPlayer.vue'),
        meta: { module: 'game', title: 'FC游戏' },
      },
      {
        path: 'game/gomoku',
        name: 'Gomoku',
        component: () => import('@modules/game/components/GomokuGame.vue'),
        meta: { module: 'game', title: '五子棋' },
      },
      {
        path: 'video',
        name: 'Video',
        component: () => import('@modules/video/components/VideoList.vue'),
        meta: { module: 'video', title: '视频' },
      },
      {
        path: 'video/:id',
        name: 'VideoPlayer',
        component: () => import('@modules/video/components/VideoPlayer.vue'),
        meta: { module: 'video', title: '课程详情' },
      },
      {
        path: 'blog',
        name: 'Blog',
        component: () => import('@modules/blog/components/BlogList.vue'),
        meta: { module: 'blog', title: '博客' },
      },
      {
        path: 'blog/write',
        name: 'BlogWrite',
        component: () => import('@modules/blog/components/BlogEditor.vue'),
        meta: { module: 'blog', title: '写文章' },
      },
      {
        path: 'blog/:id',
        name: 'BlogDetail',
        component: () => import('@modules/blog/components/BlogDetail.vue'),
        meta: { module: 'blog', title: '文章详情' },
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@modules/chat/components/ChatRoom.vue'),
        meta: { module: 'chat', title: '聊天' },
      },
      {
        path: 'ai',
        name: 'AiChat',
        component: () => import('@modules/ai/components/AiChat.vue'),
        meta: { module: 'ai', title: 'AI对话' },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@modules/auth/components/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@modules/auth/components/RegisterPage.vue'),
    meta: { public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('accessToken')
  const isPublic = to.meta?.public

  if (!token && !isPublic) {
    next('/login')
  } else {
    next()
  }
})

export default router
