/**
 * 前后端共享 DTO 类型定义
 */

export type TStory = {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  surface?: string
  truth?: string
}

export type TMessage = {
  id: string
  role: 'player' | 'host' | 'system'
  content: string
  timestamp: number
}
