import { useParams, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { stories } from '../data/stories';

function RevealPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const story = stories.find(s => s.id === sessionId);

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="text-center animate-in fade-in duration-500">
          <p className="text-red-400 text-lg mb-4">故事不存在或已删除</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            返回大厅
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 背景光晕脉冲特效 */}
      <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl animate-pulse" />

      {/* 主卡片：整体渐现 + 缩放入场 */}
      <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-sm border border-amber-700/30 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 animate-in fade-in zoom-in-95">
        {/* 头部：故事标题 + 难度标签 */}
        <div className="p-6 border-b border-white/10 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              <h1 className="text-2xl font-black tracking-tighter text-white">{story.title}</h1>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/10">
              {story.difficulty === 'easy' && '简单'}
              {story.difficulty === 'medium' && '普通'}
              {story.difficulty === 'hard' && '困难'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
            <KeyRound size={14} />
            <span>真相揭晓</span>
          </div>
        </div>

        {/* 汤面简述 */}
        <div className="px-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 italic text-sm">
            <span className="text-amber-400 font-bold not-italic">谜面：</span>
            {story.surface}
          </div>
        </div>

        {/* 汤底正文：带滑动出现效果 */}
        <div className="p-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <h2 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-400 rounded-full"></span>
            真相
          </h2>
          <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
            <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
              {story.bottom}
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row gap-4 animate-in fade-in duration-700 delay-300">
          <button
            onClick={() => navigate(`/game/${story.id}`)}
            className="flex-1 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 font-medium transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            再玩一次
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-all flex items-center justify-center gap-2 group"
          >
            <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            返回大厅
          </button>
        </div>
      </div>
    </div>
  );
}

export default RevealPage;