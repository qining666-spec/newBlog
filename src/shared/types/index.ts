// ============ 伪装系统类型 ============
// 所有模块统一使用VSCode编辑器伪装
export type DisguiseTemplateType = 'vscode'

export type ModuleType = 'novel' | 'game' | 'video' | 'blog' | 'chat'

export interface ModuleDisguiseConfig {
  enabled: boolean
  template: DisguiseTemplateType
  customTitle: string
  customFavicon: string
  transitionDuration: number
}

export interface TriggerConfig {
  shortcutKey: string
  autoDisguiseOnBlur: boolean
  blurDelay: number
}

export interface DisguiseState {
  isDisguised: boolean
  activeTemplate: DisguiseTemplateType
  moduleConfigs: Record<ModuleType, ModuleDisguiseConfig>
  triggerConfig: TriggerConfig
}

// ============ 用户认证类型 ============
export interface User {
  id: string
  email: string
  nickname: string
  avatar?: string
  role: 'user' | 'admin'
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  disguiseConfig: TriggerConfig
  novelReadingSettings: {
    fontSize: number
    lineHeight: number
    theme: 'default' | 'sepia' | 'green' | 'dark'
  }
  keyMapping: KeyMapping
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// ============ 小说阅读类型 ============
export interface Novel {
  id: string
  title: string
  author: string
  source: 'crawl' | 'upload'
  sourceUrl?: string
  coverImage?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  novelId: string
  chapterNumber: number
  title: string
  content: string
  wordCount: number
  createdAt: string
}

export interface ReadingProgress {
  id: string
  userId: string
  novelId: string
  currentChapterId: string
  currentScrollPosition: number
  lastReadAt: string
}

export interface Bookmark {
  id: string
  userId: string
  novelId: string
  chapterId: string
  position: number
  note?: string
  createdAt: string
}

// ============ 游戏类型 ============
export interface NesGame {
  id: string
  title: string
  romPath: string
  coverImage?: string
  description?: string
  uploadedBy: string
  isPublic: boolean
  createdAt: string
}

export interface NesSaveState {
  id: string
  gameId: string
  userId: string
  saveData: string
  screenshot?: string
  createdAt: string
}

export interface KeyMapping {
  up: string
  down: string
  left: string
  right: string
  a: string
  b: string
  start: string
  select: string
}

export interface GomokuRoom {
  id: string
  name: string
  hostId: string
  guestId?: string
  status: 'waiting' | 'playing' | 'finished'
  boardSize: 15 | 19
  winner?: 1 | 2
  createdAt: string
  updatedAt: string
}

export interface GomokuMove {
  roomId: string
  playerId: string
  x: number
  y: number
  timestamp: string
}

export interface GomokuGameState {
  board: (0 | 1 | 2)[][]
  currentPlayer: 1 | 2
  moveHistory: GomokuMove[]
  winner?: 1 | 2
}

// ============ 视频类型 ============
export interface VideoItem {
  id: string
  title: string
  url: string
  platform: 'bilibili' | 'youtube' | 'other'
  thumbnail?: string
  userId: string
  isFavorite: boolean
  lastWatchedAt?: string
  createdAt: string
  updatedAt: string
}

// ============ 博客类型 ============
export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  userId: string
  categoryId?: string
  tags: string[]
  isPublished: boolean
  isPrivate: boolean
  viewCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  userId: string
  createdAt: string
}

export interface BlogSearchParams {
  keyword?: string
  categoryId?: string
  tag?: string
  isPublished?: boolean
  page: number
  pageSize: number
}

// ============ 聊天类型 ============
export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  type: 'text' | 'emoji' | 'image'
  content: string
  createdAt: string
}

export interface ChatRoom {
  id: string
  name: string
  type: 'public' | 'private'
  members: string[]
  lastMessage?: ChatMessage
  createdAt: string
}

export interface OnlineUser {
  userId: string
  nickname: string
  avatar?: string
  lastActiveAt: string
}

// ============ API 响应类型 ============
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

export interface PaginatedData<T> {
  items: T[]
  total: number
}

export interface ApiError {
  code: number
  message: string
  data: null
}

// ============ Socket.IO 事件类型 ============
export interface ClientToServerEvents {
  'chat:join': (roomId: string) => void
  'chat:leave': (roomId: string) => void
  'chat:message': (data: { roomId: string; message: Omit<ChatMessage, 'id' | 'createdAt'> }) => void
  'chat:typing': (roomId: string) => void
  'game:gomoku:join': (roomId: string) => void
  'game:gomoku:move': (data: { roomId: string; x: number; y: number }) => void
  'game:gomoku:leave': (roomId: string) => void
}

export interface ServerToClientEvents {
  'chat:message': (message: ChatMessage) => void
  'chat:userJoined': (data: { roomId: string; user: OnlineUser }) => void
  'chat:userLeft': (data: { roomId: string; userId: string }) => void
  'chat:typing': (data: { roomId: string; userId: string }) => void
  'chat:onlineUsers': (users: OnlineUser[]) => void
  'game:gomoku:move': (data: { x: number; y: number; player: 1 | 2 }) => void
  'game:gomoku:gameOver': (data: { winner: 1 | 2 }) => void
  'game:gomoku:opponentLeft': (roomId: string) => void
  'novel:crawlComplete': (data: { novelId: string; success: boolean }) => void
}
