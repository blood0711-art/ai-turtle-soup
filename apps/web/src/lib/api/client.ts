/**
 * API 请求封装，对接后端 /api 接口
 * 环境变量 VITE_API_BASE 配置 base URL
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? '请求失败')
  return data
}
