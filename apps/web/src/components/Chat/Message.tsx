import { User, Bot } from 'lucide-react';

export type MessageRole = 'user' | 'assistant' | 'system' | 'player' | 'host';

export interface MessageProps {
  role: MessageRole;
  content: string;
  isClue?: boolean;
}

const ANSWER_STYLES: Record<string, string> = {
  是: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 drop-shadow-[0_0_3px_#10b981]',
  不是: 'bg-rose-500/20 border-rose-400/40 text-rose-300 drop-shadow-[0_0_3px_#f43f5e]',
  与此无关: 'bg-slate-500/20 border-slate-400/40 text-slate-300 drop-shadow-[0_0_2px_#94a3b8]',
};

function Message({ role, content, isClue = false }: MessageProps) {
  const isPlayer = role === 'user' || role === 'player';
  const isSystem = role === 'system';
  const isAssistant = role === 'assistant' || role === 'host';

  const getHostBubbleStyle = () => {
    if (!isAssistant) return '';

    if (content === '是') return ANSWER_STYLES['是'];
    if (content === '不是') return ANSWER_STYLES['不是'];
    if (content === '与此无关') return ANSWER_STYLES['与此无关'];

    if (content.includes('不') || content.includes('否')) return ANSWER_STYLES['不是'];
    if (content.includes('无关')) return ANSWER_STYLES['与此无关'];
    if (content.includes('是')) return ANSWER_STYLES['是'];

    return 'bg-white/10 border-white/20 text-slate-200';
  };

  const hostBubbleStyle = getHostBubbleStyle();

  return (
    <div
      className={`flex w-full ${
        isPlayer ? 'justify-end' : 'justify-start'
      } mb-6`}
    >
      {/* 玩家消息 */}
      {isPlayer && (
        <div className="flex items-end gap-3 max-w-[80%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500/20 border border-amber-400/40 text-amber-400">
            <User size={16} />
          </div>
          <div className="px-4 py-2 rounded-2xl rounded-br-none border border-amber-400/30 
            bg-gradient-to-br from-amber-500/10 to-yellow-400/10 
            text-amber-50 text-sm leading-relaxed backdrop-blur-md
            shadow-[0_0_8px_rgba(251,191,36,0.2)]">
            {content}
          </div>
        </div>
      )}

      {/* AI 消息 */}
      {isAssistant && (
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center 
            bg-amber-400/20 border border-amber-400/40 text-amber-300 
            shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-breathing">
            <Bot size={16} />
          </div>
          <div
            className={`px-4 py-3 rounded-2xl border backdrop-blur-md 
            shadow-[0_0_30px_rgba(251,191,36,0.05)]
            ${isClue 
              ? 'bg-amber-500/5 border-l-4 border-amber-400/60 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.1)]' 
              : hostBubbleStyle
            }`}
          >
            <div className="flex items-start gap-1">
              {isClue && <span className="text-amber-400 flex-shrink-0">💡</span>}
              <span className="text-sm leading-relaxed">{content}</span>
            </div>
          </div>
        </div>
      )}

      {/* 系统消息 */}
      {isSystem && (
        <div className="mx-auto text-center text-xs text-slate-500 border border-dashed border-white/10 px-3 py-1 rounded-lg">
          {content}
        </div>
      )}
    </div>
  );
}

export default Message;