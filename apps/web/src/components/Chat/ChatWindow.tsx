import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import Composer from './Composer';
import { askAI } from '../../services/api';
import { TStory } from '../../data/stories';

export default function ChatWindow({
  story,
  hideHeader = false,
  disabled = false,
}: {
  story: TStory;
  hideHeader?: boolean;
  disabled?: boolean;
}) {
  // 让 TypeScript 认为 hideHeader 被使用了（实际在 JSX 中未使用，但保留以兼容父组件）
  void hideHeader;

  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string; isClue?: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noCount, setNoCount] = useState(0);          // 连续“不是”计数
  const isRequestingClue = useRef(false);             // 防止重复请求线索

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 让 TypeScript 认为 noCount 被使用了（实际在 setNoCount 回调中读取）
  useEffect(() => {
    noCount;
  }, [noCount]);

  const handleSend = async (userQuestion: string) => {
    if (!userQuestion.trim() || isLoading || disabled) return;

    const userMessage = { role: 'user' as const, content: userQuestion };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setIsLoading(true);

    try {
      const answer = await askAI(userQuestion, story, newMessages);
      const assistantMessage = { role: 'assistant' as const, content: answer };
      setMessages(prev => [...prev, assistantMessage]);

      // 更新连续“不是”计数
      if (answer === '不是') {
        setNoCount(prev => {
          const newCount = prev + 1;
          // 达到 3 次且未在请求线索中，则触发
          if (newCount === 3 && !isRequestingClue.current) {
            isRequestingClue.current = true;
            // 异步请求线索，不阻塞用户继续提问
            requestClue(story, [...newMessages, assistantMessage]);
          }
          return newCount;
        });
      } else {
        // 回答不是“不是”，重置计数
        setNoCount(0);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ 出现了一点问题，请稍后再试',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 请求线索
  const requestClue = async (
    story: TStory,
    currentHistory: { role: 'user' | 'assistant'; content: string }[]
  ) => {
    try {
      const clue = await askAI('', story, currentHistory, { mode: 'clue' });
      // 将线索作为 AI 消息加入，并标记 isClue
      setMessages(prev => [...prev, { role: 'assistant', content: clue, isClue: true }]);
    } catch (error) {
      console.error('获取线索失败', error);
    } finally {
      isRequestingClue.current = false;
      // 触发后重置计数，避免重复触发
      setNoCount(0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto py-6 px-0">
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm bg-white/5 border border-white/10 rounded-2xl px-6 py-5 backdrop-blur-md">
              🧠 你可以通过不断提问，推理出事件真相
            </div>
          )}

          {messages.map((msg, idx) => (
            <Message key={idx} role={msg.role} content={msg.content} isClue={msg.isClue} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-300 text-sm flex items-center gap-2">
                AI 思考中
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-300" />
                </span>
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="sticky bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-xl pt-4 pb-3">
        <Composer onSend={handleSend} disabled={isLoading || disabled} />
      </div>
    </div>
  );
}