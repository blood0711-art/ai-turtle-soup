/**
 * 前端领域模型：Puzzle、GameState、判定结果等
 */

export type TPuzzle = {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  surface: string
}
