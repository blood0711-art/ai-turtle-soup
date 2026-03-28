import React from 'react';
import { stories } from '../data/stories';
import GameCard from '../components/GameCard';

const LobbyPage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden px-6 py-20 text-white">

      {/* 🌌 背景（升级版） */}
      <div className="absolute inset-0 z-0">

        {/* 星空底图 */}
        <img
          src="/images/bg-stars.jpg"
          className="w-full h-full object-cover opacity-90"
        />

        {/* 暗角遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />

        {/* 多点金色光（增强空间感） */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,200,100,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,180,60,0.12),transparent_40%)]" />

        {/* 中心主光晕 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[900px] h-[900px] bg-amber-400/10 rounded-full blur-[180px]" />
        </div>

        {/* 顶部光 */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-300/10 blur-[140px]" />

        {/* 噪点纹理（关键提升质感） */}
        <div className="absolute inset-0 opacity-10 mix-blend-soft-light bg-[url('/images/noise.png')]" />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* 标题 */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]">
            AI 海龟汤
          </h1>

          <p className="mt-4 text-slate-400 tracking-[0.3em] text-sm">
            选择一个谜题，开始推理
          </p>

          <div className="mt-6 h-[1px] w-64 mx-auto bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </header>

        {/* 卡片 */}
        <main className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {stories.map(story => (
            <GameCard key={story.id} story={story} />
          ))}
        </main>

      </div>
    </div>
  );
};

export default LobbyPage;