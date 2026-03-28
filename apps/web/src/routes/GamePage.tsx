import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { stories } from '../data/stories';
import ChatWindow from '../components/Chat/ChatWindow';

type GameStatus = 'playing' | 'ended';

const GamePage: React.FC = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const navigate = useNavigate();
  const story = stories.find(s => s.id === puzzleId);

  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');

  useEffect(() => {
    if (!story) navigate('/');
  }, [story, navigate]);

  const handleReveal = () => {
    if (gameStatus === 'ended') return;
    setGameStatus('ended');
    navigate(`/reveal/${story?.id}`);
  };

  const handleQuit = () => {
    setGameStatus('ended');
    navigate('/');
  };

  if (!story) return null;

  // 难度映射
  const difficultyMap = {
    easy: { text: '简单', className: 'border-emerald-500/50 text-emerald-400' },
    medium: { text: '普通', className: 'border-amber-500/50 text-amber-400' },
    hard: { text: '困难', className: 'border-rose-500/50 text-rose-400' },
  };
  const difficulty = difficultyMap[story.difficulty];

  return (
    <div className="relative h-screen flex flex-col text-white overflow-hidden">
      {/* 背景装饰层 */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg-stars.jpg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,200,80,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 opacity-10 mix-blend-soft-light bg-[url('/images/noise.png')]" />
      </div>

      {/* 中间半透容器 */}
      <div className="absolute inset-0 z-[1] flex justify-center">
        <div className="w-full max-w-5xl bg-black/30 backdrop-blur-xl border-x border-white/10" />
      </div>

      {/* 主内容层 - flex 占满全高 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 头部：不缩放，自适应高度 */}
        <header className="shrink-0 px-6 pt-6 pb-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
            >
              <ArrowLeft size={16} />
              返回大厅
            </button>

            {/* 标题与难度标签同行 */}
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                {story.title}
              </h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border backdrop-blur-sm ${difficulty.className}`}>
                {difficulty.text}
              </span>
            </div>

            <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-amber-400/20 backdrop-blur-md shadow-[0_0_40px_rgba(251,191,36,0.08)]">
              <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-normal break-words">
                {story.surface}
              </p>
            </div>
          </div>
        </header>

        {/* 聊天区域：flex-1 占满剩余高度，内部滚动 */}
        <main className="flex-1 w-full max-w-5xl mx-auto overflow-hidden flex flex-col">
          <ChatWindow
            story={story}
            hideHeader
            disabled={gameStatus === 'ended'}
          />
        </main>

        {/* 底部按钮：固定于底部 */}
        <footer className="
          shrink-0
          px-6 pt-3 pb-4
          bg-gradient-to-t from-black/80 via-black/50 to-transparent
          backdrop-blur-xl
        ">
          <div className="max-w-5xl mx-auto flex gap-4">
            <button
              onClick={handleReveal}
              disabled={gameStatus === 'ended'}
              className="
                flex-1 py-3 rounded-xl
                bg-gradient-to-r from-amber-400 to-yellow-500
                text-black font-semibold
                shadow-[0_0_20px_rgba(251,191,36,0.4)]
                hover:scale-105 transition
                disabled:opacity-50
              "
            >
              <KeyRound size={16} className="inline mr-2" />
              查看汤底
            </button>

            <button
              onClick={handleQuit}
              className="
                flex-1 py-3 rounded-xl
                bg-white/5 hover:bg-white/10
                border border-white/10
                text-slate-300
                transition
              "
            >
              结束游戏
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default GamePage;