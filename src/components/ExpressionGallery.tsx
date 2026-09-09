import React from 'react';
import { ExpressionId } from '../types';
import { EXPRESSIONS } from '../data/expressions';
import { soundEngine } from '../services/soundEffects';
import { Sparkles, Eye, Heart, Zap, Smile } from 'lucide-react';

interface ExpressionGalleryProps {
  currentExpressionId: ExpressionId;
  onSelectExpression: (id: ExpressionId) => void;
}

export const ExpressionGallery: React.FC<ExpressionGalleryProps> = ({
  currentExpressionId,
  onSelectExpression,
}) => {
  const categories = [
    { key: 'all', label: 'All 15 Expressions' },
    { key: 'happy', label: 'Joy & Love' },
    { key: 'playful', label: 'Playful & Smug' },
    { key: 'dramatic', label: 'Emotional & Dramatic' },
    { key: 'resting', label: 'Rest & Sleep' },
  ];

  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredExpressions = (Object.keys(EXPRESSIONS) as unknown as ExpressionId[]).filter((id) => {
    if (selectedCategory === 'all') return true;
    return EXPRESSIONS[id].moodCategory === selectedCategory;
  });

  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      {/* Windows XP Picture Viewer Header */}
      <div className="bg-[#ece9d8] text-black border-2 border-[#7f9db9] rounded-lg shadow-xl overflow-hidden font-sans">
        <div className="bg-gradient-to-r from-[#0058e6] to-[#3a93ff] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-pink-200" />
            <span>Windows Picture and Fax Viewer - [15_OLED_EXPRESSIONS.BMP]</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">15 ASSETS · SH1106 FRAMEBUFFER</span>
        </div>

        {/* Toolbar with XP Buttons */}
        <div className="bg-[#e4e0cd] px-3 py-1.5 border-b border-[#b5b09e] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`xp-btn px-3 py-1 text-xs font-semibold ${
                  selectedCategory === c.key ? '!border-[#e59700] !bg-[#ffd880] !font-bold' : ''
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-gray-700 font-mono">
            ZOOM: 100% · CLICK ITEM TO SEND TO OLED
          </div>
        </div>
      </div>

      {/* Grid of 15 Expression Cards in XP Picture Viewer Thumbnail Style */}
      <div className="bg-white p-4 rounded-lg border border-[#7f9db9] shadow-inner grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {filteredExpressions.map((id) => {
          const expr = EXPRESSIONS[id];
          const isSelected = currentExpressionId === id;

          return (
            <div
              key={id}
              onClick={() => {
                onSelectExpression(id);
                soundEngine.playTone(400 + id * 60, 0.05, 'sine');
              }}
              className={`p-2.5 rounded border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-[#316ac5] border-[#002f80] text-white shadow-md'
                  : 'bg-[#fafafa] border-[#d4d0c8] hover:bg-[#eef4fc] hover:border-[#316ac5] text-black'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-[#1a428a] text-white' : 'bg-[#ece9d8] text-gray-700'
                }`}>
                  IMG_{id.toString().padStart(2, '0')}.BMP
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full border border-gray-400"
                  style={{ backgroundColor: expr.color }}
                  title={`Category: ${expr.moodCategory}`}
                />
              </div>

              {/* Mini Eye Preview Area (CRT/OLED screen preview box) */}
              <div className="h-14 bg-black rounded border border-gray-500 flex items-center justify-center p-2 mb-2 group-hover:border-[#316ac5] transition-colors">
                <span className="text-xs font-mono font-bold tracking-wider" style={{ color: expr.color }}>
                  {expr.name.toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className={`text-xs font-bold font-sans flex items-center justify-between ${
                  isSelected ? 'text-white' : 'text-black'
                }`}>
                  <span className="truncate">{expr.name}</span>
                  {isSelected && <span className="text-[9px] bg-white text-[#316ac5] font-bold px-1 rounded font-mono">ACTIVE</span>}
                </h4>
                <p className={`text-[11px] font-sans leading-tight mt-0.5 line-clamp-2 ${
                  isSelected ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {expr.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Autonomous Emotion Engine Explanation in XP Info Box */}
      <div className="p-3.5 rounded bg-[#ece9d8] border border-[#7f9db9] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-sans text-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0055ea] text-white flex items-center justify-center font-bold font-serif text-base shrink-0">
            i
          </div>
          <div>
            <span className="font-bold block text-sm text-[#0036a6]">AUTONOMOUS PET MOOD DERIVATION</span>
            <span className="text-gray-700">
              Mood is not hardcoded—it decays naturally against real wall-clock time: Hungry (&lt;30%) → Sad · Tired (&lt;25%) → Sleepy · Neglected (&lt;20%) → Nervous · Loved (&gt;80%) → Heart Eyes.
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            onSelectExpression(2);
            soundEngine.playPetPurr();
          }}
          className="xp-btn px-4 py-1.5 font-bold text-black flex items-center gap-1.5 whitespace-nowrap"
        >
          <span className="text-red-600 font-bold">♥</span>
          <span>Test Love Mood</span>
        </button>
      </div>
    </div>
  );
};
