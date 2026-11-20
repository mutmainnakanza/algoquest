import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { FLASHCARDS } from '../data/gameData';
import { FlowchartDiagram } from './FlowchartDiagram';
import { soundEngine } from '../audio/soundEngine';

interface RefresherScreenProps {
  onBackMenu: () => void;
  onContinuePlay: () => void;
}

export const RefresherScreen: React.FC<RefresherScreenProps> = ({
  onBackMenu,
  onContinuePlay,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentCard = FLASHCARDS[activeIndex];

  const handleSelect = (idx: number) => {
    soundEngine.playClick();
    setActiveIndex(idx);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#00F5D4]">
            Materi Kilat · Dasar Pemrograman PPLG
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
            Simbol Flowchart &amp; Struktur Logika
          </h1>
        </div>
        <div className="font-mono text-base font-bold text-[#FEE440] tabular-nums">
          Kartu {activeIndex + 1} / {FLASHCARDS.length}
        </div>
      </div>

      {/* Interactive Tab Selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pilih topik materi">
        {FLASHCARDS.map((card, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelect(idx)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-base transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#00F5D4] text-[#1B1464] font-bold'
                  : 'bg-[#2D1B69] text-slate-200 hover:bg-[#3a2485] border border-white/15'
              }`}
            >
              {idx + 1}. {card.title.split(' (')[0]}
            </button>
          );
        })}
      </div>

      {/* 2-Column Interactive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#2D1B69] border border-[#00F5D4]/30 rounded-2xl p-6 sm:p-8 shadow-xl items-stretch">
        {/* Left Column: Flowchart SVG Visual */}
        <div className="lg:col-span-5 bg-[#120D47] border border-[#00F5D4]/25 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
          <span className="text-sm font-bold text-[#FEE440]">
            {currentCard.category}
          </span>
          <FlowchartDiagram type={currentCard.symbolKey} />
          <div className="w-full bg-[#1B1464] border border-white/10 rounded-lg p-3">
            <p className="text-xs font-semibold text-[#00F5D4] mb-1">Contoh Pseudocode</p>
            <pre className="font-mono text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
              {currentCard.exampleCode}
            </pre>
          </div>
        </div>

        {/* Right Column: Explanation & Takeaways */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#00F5D4]">
              {currentCard.title}
            </h2>
            <p className="text-lg text-white leading-relaxed font-medium">
              {currentCard.summary}
            </p>
            <div className="space-y-3 pt-2">
              {currentCard.details.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FEE440] shrink-0 mt-1" />
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Prev/Next Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/15 gap-4">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => handleSelect(activeIndex - 1)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1B1464] text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#271e87] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              disabled={activeIndex === FLASHCARDS.length - 1}
              onClick={() => handleSelect(activeIndex + 1)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1B1464] text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#271e87] cursor-pointer"
            >
              <span>Berikutnya</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBackMenu();
          }}
          className="code-block-btn flex items-center justify-center gap-2.5 bg-[#2D1B69] hover:bg-[#3a2485] text-white font-bold text-lg px-6 py-4 rounded-xl border border-white/25 cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Menu</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onContinuePlay();
          }}
          className="code-block-btn flex items-center justify-center gap-2.5 bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-7 py-4 rounded-xl border-b-4 border-[#00a891] cursor-pointer whitespace-nowrap"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Lanjut Bermain</span>
        </button>
      </div>
    </div>
  );
};
