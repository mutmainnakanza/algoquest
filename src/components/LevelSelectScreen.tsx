import React from 'react';
import { ArrowLeft, Play, Star, CheckCircle2, Trophy } from 'lucide-react';
import { LEVELS, STAGES } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';

export interface StageProgress {
  completed: boolean;
  bestScore: number;
  stars: number;
}

export type ProgressMap = Record<string, StageProgress>;

interface LevelSelectScreenProps {
  progress: ProgressMap;
  totalSessionScore: number;
  onSelectStage: (stageId: string) => void;
  onBackMenu: () => void;
  onOpenVictory: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  progress,
  totalSessionScore,
  onSelectStage,
  onBackMenu,
  onOpenVictory,
}) => {
  const completedCount = STAGES.filter((s) => progress[s.id]?.completed).length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#00F5D4]">
            Peta Petualangan · 3 Level · 15 Tantangan Algoritma
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
            Pilih Arena &amp; Stage
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-[#2D1B69] border border-[#00F5D4]/30 rounded-xl px-4 py-2.5 text-base font-semibold">
            <span className="text-slate-300">Tuntas: </span>
            <span className="font-mono text-[#00F5D4] font-bold tabular-nums">
              {completedCount}/{STAGES.length} Stage
            </span>
            <span className="text-white/30 mx-2">·</span>
            <span className="text-slate-300">Skor Sesi: </span>
            <span className="font-mono text-[#FEE440] font-bold tabular-nums">
              {totalSessionScore}
            </span>
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenVictory();
              }}
              className="flex items-center gap-2 bg-[#FEE440] hover:bg-[#ffea66] text-[#1B1464] font-bold text-base px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
            >
              <Trophy className="w-5 h-5" />
              <span>Rekap &amp; Sertifikat</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Level Adventure Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {LEVELS.map((level) => {
          const levelStages = STAGES.filter((s) => s.levelId === level.id);
          const levelScore = levelStages.reduce(
            (sum, st) => sum + (progress[st.id]?.bestScore || 0),
            0
          );
          const levelCompleted = levelStages.filter((st) => progress[st.id]?.completed).length;
          const levelStarsSum = levelStages.reduce(
            (sum, st) => sum + (progress[st.id]?.stars || 0),
            0
          );
          const avgStars =
            levelCompleted === 0 ? 0 : Math.min(3, Math.round(levelStarsSum / levelStages.length));

          const firstIncomplete =
            levelStages.find((st) => !progress[st.id]?.completed) || levelStages[0];

          return (
            <section
              key={level.id}
              className="bg-[#2D1B69] border border-[#00F5D4]/30 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-[#00F5D4]">
                    {level.subtitle}
                  </span>
                  <div className="flex items-center gap-1" aria-label={`Bintang: ${avgStars} dari 3`}>
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-5 h-5 ${
                          starIdx <= avgStars
                            ? 'text-[#FEE440] fill-[#FEE440]'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    {level.name}
                  </h2>
                  <p className="text-sm font-semibold text-[#FEE440] mt-0.5">
                    {level.concept}
                  </p>
                  <p className="text-base text-slate-200 mt-2 leading-relaxed">
                    {level.description}
                  </p>
                </div>

                {/* Stage Selector Grid (5 stages per level) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Pilih Stage ({levelCompleted}/5 selesai)</span>
                    <span className="font-mono font-bold text-[#FEE440] tabular-nums">
                      Skor: {levelScore}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {levelStages.map((st) => {
                      const stProg = progress[st.id];
                      const done = Boolean(stProg?.completed);
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            onSelectStage(st.id);
                          }}
                          title={`Stage ${st.stageNumber}: ${st.title}`}
                          className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                            done
                              ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4]/30'
                              : 'bg-[#1B1464] border-white/20 text-white hover:border-[#FEE440] hover:text-[#FEE440]'
                          }`}
                        >
                          <span className="font-mono text-base tabular-nums">{st.stageNumber}</span>
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 mt-0.5" />
                          ) : (
                            <span className="text-[11px] text-slate-400 mt-0.5">Main</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectStage(firstIncomplete.id);
                }}
                className="code-block-btn w-full flex items-center justify-center gap-2 bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-5 py-3.5 rounded-xl border-b-4 border-[#00a891] cursor-pointer whitespace-nowrap"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  {levelCompleted > 0 && levelCompleted < 5
                    ? `Lanjut Stage ${firstIncomplete.stageNumber}`
                    : `Mainkan Level ${level.id}`}
                </span>
              </button>
            </section>
          );
        })}
      </div>

      <div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBackMenu();
          }}
          className="code-block-btn inline-flex items-center gap-2.5 bg-[#2D1B69] hover:bg-[#3a2485] text-white font-bold text-lg px-6 py-3.5 rounded-xl border border-white/25 cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
      </div>
    </div>
  );
};
