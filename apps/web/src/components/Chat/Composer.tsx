import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function Composer({ onSend, disabled = false }: any) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;

    // ✅ 不动接口逻辑
    onSend(inputValue.trim());

    setInputValue('');

    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  /** ✅ 自动高度（纯UI增强，不影响逻辑） */
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  useEffect(() => {
    handleInput();
  }, [inputValue]);

  return (
    <div className="p-4 border-t border-white/10 bg-black/30 backdrop-blur-md">
      <div className="flex items-end gap-3">

        {/* 输入框 */}
        <div className="flex-1 relative">

          {/* 光晕 */}
          <div className="absolute inset-0 rounded-2xl bg-amber-400/0 focus-within:bg-amber-400/5 blur-xl transition" />

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="注意那些'本该如此'却'偏偏不是'的细节——真相藏在'为什么这样'而不是'是什么'里。开始提问吧"
            value={inputValue}
            disabled={disabled}
            onChange={(e) => setInputValue(e.target.value)}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="
              relative w-full
              resize-none
              overflow-hidden   /* ✅ 关键：去掉白色滚动条 */
              rounded-2xl px-4 py-3 pr-12
              bg-white/5 border border-white/10 
              text-sm text-white placeholder:text-white/40
              backdrop-blur-md
              focus:outline-none 
              focus:border-amber-400/40
              focus:ring-2 focus:ring-amber-400/20
              transition
            "
          />
        </div>

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          className="
            h-[44px] w-[44px] flex items-center justify-center rounded-xl
            bg-gradient-to-br from-amber-400 to-yellow-500
            hover:from-amber-300 hover:to-yellow-400
            text-black
            shadow-[0_0_15px_rgba(251,191,36,0.4)]
            transition
            disabled:opacity-40 disabled:shadow-none
          "
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}