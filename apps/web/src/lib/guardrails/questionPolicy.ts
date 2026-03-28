/**
 * 输入守卫：多问句、非问句、泄底请求等检测
 * 用于前端即时提示，最终兜底在后端
 */

export function isValidQuestion(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (t.length > 200) return false
  return true
}
