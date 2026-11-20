import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { STAGES } from './data/gameData';
import { soundEngine } from './audio/soundEngine';
import { SplashScreen } from './components/SplashScreen';
import { RefresherScreen } from './components/RefresherScreen';
import { LevelSelectScreen, ProgressMap } from './components/LevelSelectScreen';
import { GameplayArena } from './components/GameplayArena';
import { VictoryScreen } from './components/VictoryScreen';

type Screen = 'SPLASH' | 'MATERI' | 'LEVELS' | 'ARENA' | 'VICTORY';

const STORAGE_KEY = 'algoquest_smkn4_palopo_progress_v1';

export default function App() {
  const [screen, setScreen] = useState<Screen>('SPLASH');
  const [activeStageId, setActiveStageId] = useState<string>(STAGES[0].id);
  const [totalSessionScore, setTotalSessionScore] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ProgressMap) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const activeStageIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.id === activeStageId)
  );
  const activeStage = STAGES[activeStageIndex];
  const hasNextStage = activeStageIndex < STAGES.length - 1;

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setMuted(nextMuted);
  };

  const handleStageComplete = (stageScore: number, livesLeft: number) => {
    const stars = livesLeft === 3 ? 3 : livesLeft === 2 ? 2 : 1;
    setProgress((prev) => {
      const current = prev[activeStage.id];
      return {
        ...prev,
        [activeStage.id]: {
          completed: true,
          bestScore: Math.max(current?.bestScore || 0, stageScore),
          stars: Math.max(current?.stars || 0, stars),
        },
      };
    });
  };

  const handleNextStage = () => {
    if (hasNextStage) {
      const currentLevel = activeStage.levelId;
      const nextStage = STAGES[activeStageIndex + 1];
      // Show Victory screen when finishing a full level (stage 5) or jump directly?
      // If finishing stage 5 of level 1 or 2, let's also let them proceed seamlessly OR open Victory if final stage.
      // Even better: if completing the 15th stage (last stage), go straight to VictoryScreen; otherwise load next stage!
      if (activeStage.stageNumber === 5 && nextStage.levelId !== currentLevel) {
        setActiveStageId(nextStage.id);
        setScreen('VICTORY');
        return;
      }
      setActiveStageId(nextStage.id);
    } else {
      setScreen('VICTORY');
    }
  };

  const handlePlayAgain = () => {
    setTotalSessionScore(0);
    setScreen('LEVELS');
  };

  return (
    <div className="min-h-screen cyber-grid-bg flex flex-col text-white">
      {/* Clean Top Bar (3-zone contract) */}
      <header className="no-print border-b border-[#00F5D4]/20 bg-[#120D47]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setScreen('SPLASH');
            }}
            className="font-display text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            Algo<span className="text-[#00F5D4]">Quest</span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-base font-semibold text-slate-200">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen('SPLASH');
              }}
              className={`hover:text-[#00F5D4] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'SPLASH' ? 'text-[#00F5D4]' : ''
              }`}
            >
              Menu Utama
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen('MATERI');
              }}
              className={`hover:text-[#00F5D4] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'MATERI' ? 'text-[#00F5D4]' : ''
              }`}
            >
              Materi Kilat
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen('LEVELS');
              }}
              className={`hover:text-[#00F5D4] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'LEVELS' || screen === 'ARENA' ? 'text-[#00F5D4]' : ''
              }`}
            >
              Peta Level
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen('VICTORY');
              }}
              className={`hover:text-[#00F5D4] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'VICTORY' ? 'text-[#00F5D4]' : ''
              }`}
            >
              Rekap Hasil
            </button>
          </nav>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Aktifkan suara' : 'Bisukan suara'}
            className="inline-flex items-center gap-2 bg-[#2D1B69] hover:bg-[#3a2485] border border-[#00F5D4]/40 text-white font-semibold text-base px-4 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {muted ? (
              <>
                <VolumeX className="w-5 h-5 text-[#FF8FA3]" />
                <span>Suara Mati</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-[#00F5D4]" />
                <span>Suara Aktif</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Screen Switcher */}
      <main className="flex-1 flex flex-col">
        {screen === 'SPLASH' && (
          <SplashScreen
            onStart={() => setScreen('LEVELS')}
            onOpenMateri={() => setScreen('MATERI')}
          />
        )}

        {screen === 'MATERI' && (
          <RefresherScreen
            onBackMenu={() => setScreen('SPLASH')}
            onContinuePlay={() => setScreen('LEVELS')}
          />
        )}

        {screen === 'LEVELS' && (
          <LevelSelectScreen
            progress={progress}
            totalSessionScore={totalSessionScore}
            onSelectStage={(stageId) => {
              setActiveStageId(stageId);
              setScreen('ARENA');
            }}
            onBackMenu={() => setScreen('SPLASH')}
            onOpenVictory={() => setScreen('VICTORY')}
          />
        )}

        {screen === 'ARENA' && (
          <GameplayArena
            stage={activeStage}
            totalSessionScore={totalSessionScore}
            onAddScore={(delta) => setTotalSessionScore((prev) => prev + delta)}
            onStageComplete={handleStageComplete}
            onBackToLevels={() => setScreen('LEVELS')}
            hasNextStage={hasNextStage && activeStage.stageNumber < 5}
            onNextStage={handleNextStage}
          />
        )}

        {screen === 'VICTORY' && (
          <VictoryScreen
            progress={progress}
            totalSessionScore={totalSessionScore}
            onPlayAgain={handlePlayAgain}
            onFinishToMenu={() => setScreen('SPLASH')}
          />
        )}
      </main>
    </div>
  );
}
