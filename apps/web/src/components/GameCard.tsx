import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TStory } from '../data/stories';

const difficultyMap = {
  easy: '简单',
  medium: '普通',
  hard: '困难',
};

const GameCard: React.FC<{ story: TStory }> = ({ story }) => {
  const navigate = useNavigate();

  return (
    <div
      className="group relative h-[260px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 
      hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(251,191,36,0.25)] border border-amber-400/20"
      onClick={() => navigate(`/game/${story.id}`)}
    >
      {/* 图片 */}
      <img
        src={story.cover || '/images/fallback.jpg'}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.dataset.fallback) return;
          target.dataset.fallback = 'true';
          target.src = '/images/fallback.jpg';
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
      />

      {/* 渐变 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* 内容 */}
      <div className="relative h-full flex flex-col justify-between p-5">

        <span className="px-2 py-1 text-xs rounded bg-amber-400 text-black font-semibold w-fit">
          {difficultyMap[story.difficulty]}
        </span>

        <div>
          <h2 className="text-lg font-semibold text-white drop-shadow-lg">
            {story.title}
          </h2>

          <p className="text-sm text-slate-300 mt-1 line-clamp-2">
            {story.description}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            #{story.category}
          </p>
        </div>

        <div className="flex justify-end">
          <div className="text-sm px-4 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-semibold shadow-md hover:shadow-[0_0_15px_rgba(251,191,36,0.6)] transition">
            开始
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;