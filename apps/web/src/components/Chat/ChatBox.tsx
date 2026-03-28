import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import Message from './Message'
import type { MessageRole } from './Message'

/** 单条消息结构 */
export interface ChatMessage {
  role: MessageRole
  content: string
}

interface ChatBoxProps {
  /** 消息列表 */
  messages: ChatMessage[]
  /** 发送回调，返回 true 表示发送成功可清空输入 */
  onSend: (text: string) => void | Promise<void>
  /** 是否禁用输入（如 AI 思考中） */
  disabled?: boolean
  /** 输入框占位符 */
  placeholder?: string
}

/**
 * 聊天界面组件
 * 上方消息列表，下方输入框+发送按钮，支持回车发送与自动滚动
 */
function ChatBox({
  messages,
  onSend,
  disabled = false,
  placeholder = '输入你的问题，按回车发送...',
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // 新消息时滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || disabled) return

    setInputValue('')
    await onSend(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg bg-white/5 backdrop-blur border border-white/10 overflow-hidden">
      {/* 消息列表 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]"
      >
        {messages.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            请提出是/否问题开始推理
          </p>
        ) : (
          messages.map((msg, i) => (
            <Message key={i} role={msg.role} content={msg.content} />
          ))
        )}
      </div>

      {/* 输入区 */}
      <div className="flex gap-2 p-3 border-t border-white/10 bg-white/5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-slate-100
            placeholder-slate-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-amber-500/30 text-amber-400
            hover:bg-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

export default ChatBox
