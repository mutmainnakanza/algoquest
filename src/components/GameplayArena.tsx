import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bug,
  CheckCircle2,
  CornerUpLeft,
  CornerUpRight,
  GitBranch,
  Heart,
  HelpCircle,
  Pause,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  StepForward,
  Trash2,
  ArrowRight,
  Map as MapIcon,
  GripVertical,
} from 'lucide-react';
import {
  Direction,
  LogicGate,
  ProgramBlock,
  SimpleAction,
  StageConfig,
} from '../data/gameData';
import { MazeCanvas, RobotVisualState } from './MazeCanvas';
import { FlowchartDiagram } from './FlowchartDiagram';
import { soundEngine } from '../audio/soundEngine';

interface GameplayArenaProps {
  stage: StageConfig;
  totalSessionScore: number;
  onAddScore: (delta: number) => void;
  onStageComplete: (stageScore: number, livesLeft: number) => void;
  onBackToLevels: () => void;
  hasNextStage: boolean;
  onNextStage: () => void;
}

const DIR_LABELS: Record<Direction, string> = {
  N: 'Utara (Atas)',
  E: 'Timur (Kanan)',
  S: 'Selatan (Bawah)',
  W: 'Barat (Kiri)',
};

const ACTION_LABELS: Record<SimpleAction, string> = {
  MOVE: 'Maju()',
  LEFT: 'Belok Kiri()',
  RIGHT: 'Belok Kanan()',
};

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function rotateLeft(dir: Direction): Direction {
  const order: Direction[] = ['N', 'W', 'S', 'E'];
  return order[(order.indexOf(dir) + 1) % 4];
}

function rotateRight(dir: Direction): Direction {
  const order: Direction[] = ['N', 'E', 'S', 'W'];
  return order[(order.indexOf(dir) + 1) % 4];
}

function stepForward(x: number, y: number, dir: Direction): { x: number; y: number } {
  if (dir === 'N') return { x, y: y - 1 };
  if (dir === 'E') return { x: x + 1, y };
  if (dir === 'S') return { x, y: y + 1 };
  return { x: x - 1, y };
}

function hasBlockType(blocks: ProgramBlock[], type: 'IF_BLOCKED' | 'REPEAT'): boolean {
  for (const b of blocks) {
    if (b.type === type) return true;
    if (b.type === 'REPEAT' && hasBlockType(b.children, type)) return true;
  }
  return false;
}

function countTotalBlocks(blocks: ProgramBlock[]): number {
  let count = 0;
  for (const b of blocks) {
    count += 1;
    if (b.type === 'REPEAT') {
      count += countTotalBlocks(b.children);
    }
  }
  return count;
}

export const GameplayArena: React.FC<GameplayArenaProps> = ({
  stage,
  totalSessionScore,
  onAddScore,
  onStageComplete,
  onBackToLevels,
  hasNextStage,
  onNextStage,
}) => {
  const [blocks, setBlocks] = useState<ProgramBlock[]>([]);
  const [activeRepeatTargetId, setActiveRepeatTargetId] = useState<string | null>(null);
  const [lives, setLives] = useState<number>(3);
  const [stageScore, setStageScore] = useState<number>(0);
  const [unlockedGateIds, setUnlockedGateIds] = useState<string[]>([]);
  const [robot, setRobot] = useState<RobotVisualState>({
    x: stage.start.x,
    y: stage.start.y,
    dir: stage.start.dir,
    crashed: false,
    celebrating: false,
    visited: [{ x: stage.start.x, y: stage.start.y }],
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string>('Susun blok algoritma lalu tekan Jalankan.');
  const [debugMessage, setDebugMessage] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<LogicGate | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [stageWon, setStageWon] = useState<{ earnedScore: number; stars: number } | null>(null);
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const runTokenRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const pauseWaitersRef = useRef<Array<() => void>>([]);
  const quizResolverRef = useRef<((passed: boolean) => void) | null>(null);

  const wallSet = useMemo(
    () => new Set(stage.walls.map(([wx, wy]) => `${wx},${wy}`)),
    [stage.walls]
  );

  const resetRobotAndRunState = useCallback(
    (clearBlocks: boolean) => {
      runTokenRef.current += 1;
      isPausedRef.current = false;
      pauseWaitersRef.current.forEach((r) => r());
      pauseWaitersRef.current = [];
      if (quizResolverRef.current) {
        quizResolverRef.current(false);
        quizResolverRef.current = null;
      }
      setIsRunning(false);
      setIsPaused(false);
      setActiveBlockId(null);
      setActiveQuiz(null);
      setQuizFeedback(null);
      setDebugMessage(null);
      setStageWon(null);
      setUnlockedGateIds([]);
      setRobot({
        x: stage.start.x,
        y: stage.start.y,
        dir: stage.start.dir,
        crashed: false,
        celebrating: false,
        visited: [{ x: stage.start.x, y: stage.start.y }],
      });
      setStatusNote('Susun blok algoritma lalu tekan Jalankan.');
      if (clearBlocks) {
        setBlocks([]);
        setActiveRepeatTargetId(null);
        setLives(3);
        setStageScore(0);
      }
    },
    [stage.start.x, stage.start.y, stage.start.dir]
  );

  useEffect(() => {
    resetRobotAndRunState(true);
  }, [stage.id, resetRobotAndRunState]);

  useEffect(() => {
    return () => {
      runTokenRef.current += 1;
    };
  }, []);

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const waitIfPaused = async (token: number): Promise<boolean> => {
    while (isPausedRef.current) {
      if (token !== runTokenRef.current) return false;
      await new Promise<void>((resolve) => {
        pauseWaitersRef.current.push(resolve);
      });
    }
    return token === runTokenRef.current;
  };

  const handleTogglePause = () => {
    if (!isRunning) return;
    soundEngine.playClick();
    const next = !isPaused;
    isPausedRef.current = next;
    setIsPaused(next);
    if (!next) {
      pauseWaitersRef.current.forEach((r) => r());
      pauseWaitersRef.current = [];
    }
  };

  const addBlock = (type: 'MOVE' | 'LEFT' | 'RIGHT' | 'IF_BLOCKED' | 'REPEAT') => {
    if (isRunning || stageWon) return;
    soundEngine.playClick();
    setDebugMessage(null);

    const newBlock: ProgramBlock =
      type === 'MOVE'
        ? { id: makeId(), type: 'MOVE' }
        : type === 'LEFT'
          ? { id: makeId(), type: 'LEFT' }
          : type === 'RIGHT'
            ? { id: makeId(), type: 'RIGHT' }
            : type === 'IF_BLOCKED'
              ? { id: makeId(), type: 'IF_BLOCKED', action: 'RIGHT' }
              : { id: makeId(), type: 'REPEAT', count: 3, children: [] };

    if (type !== 'REPEAT' && activeRepeatTargetId) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === activeRepeatTargetId && b.type === 'REPEAT'
            ? { ...b, children: [...b.children, newBlock] }
            : b
        )
      );
      return;
    }

    setBlocks((prev) => [...prev, newBlock]);
    if (newBlock.type === 'REPEAT') {
      setActiveRepeatTargetId(newBlock.id);
    }
  };

  const removeRootBlock = (id: string) => {
    if (isRunning) return;
    soundEngine.playClick();
    if (activeRepeatTargetId === id) setActiveRepeatTargetId(null);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveRootBlock = (index: number, delta: -1 | 1) => {
    if (isRunning) return;
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    soundEngine.playClick();
    setBlocks((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const handleDragStart = (index: number) => {
    if (isRunning) return;
    setDragIndex(index);
  };

  const handleDropOnIndex = (dropIndex: number) => {
    if (isRunning || dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    soundEngine.playClick();
    setBlocks((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIndex, 1);
      copy.splice(dropIndex, 0, moved);
      return copy;
    });
    setDragIndex(null);
  };

  const updateIfAction = (blockId: string, action: SimpleAction, parentRepeatId?: string) => {
    if (isRunning) return;
    soundEngine.playClick();
    setBlocks((prev) =>
      prev.map((b) => {
        if (!parentRepeatId && b.id === blockId && b.type === 'IF_BLOCKED') {
          return { ...b, action };
        }
        if (parentRepeatId && b.id === parentRepeatId && b.type === 'REPEAT') {
          return {
            ...b,
            children: b.children.map((ch) =>
              ch.id === blockId && ch.type === 'IF_BLOCKED' ? { ...ch, action } : ch
            ),
          };
        }
        return b;
      })
    );
  };

  const updateRepeatCount = (repeatId: string, delta: number) => {
    if (isRunning) return;
    soundEngine.playClick();
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === repeatId && b.type === 'REPEAT') {
          const nextCount = Math.max(2, Math.min(15, b.count + delta));
          return { ...b, count: nextCount };
        }
        return b;
      })
    );
  };

  const removeChildBlock = (repeatId: string, childId: string) => {
    if (isRunning) return;
    soundEngine.playClick();
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === repeatId && b.type === 'REPEAT'
          ? { ...b, children: b.children.filter((ch) => ch.id !== childId) }
          : b
      )
    );
  };

  const handleQuizAnswer = (selectedIdx: number) => {
    if (!activeQuiz || quizFeedback) return;
    const isCorrect = selectedIdx === activeQuiz.quiz.correctIndex;
    if (isCorrect) {
      soundEngine.playCorrect();
      setQuizFeedback({
        correct: true,
        text: `Benar (+100 poin)! ${activeQuiz.quiz.explanation}`,
      });
      setTimeout(() => {
        setActiveQuiz(null);
        setQuizFeedback(null);
        if (quizResolverRef.current) {
          const res = quizResolverRef.current;
          quizResolverRef.current = null;
          res(true);
        }
      }, 1100);
    } else {
      soundEngine.playWrong();
      setQuizFeedback({
        correct: false,
        text: `Kurang tepat! ${activeQuiz.quiz.explanation}`,
      });
      setTimeout(() => {
        setActiveQuiz(null);
        setQuizFeedback(null);
        if (quizResolverRef.current) {
          const res = quizResolverRef.current;
          quizResolverRef.current = null;
          res(false);
        }
      }, 1600);
    }
  };

  const runSimulation = async () => {
    if (isRunning || lives <= 0) return;

    if (blocks.length === 0) {
      soundEngine.playWrong();
      setDebugMessage(
        'Area algoritma masih kosong. Tambahkan minimal satu blok perintah sebelum menekan Jalankan.'
      );
      return;
    }

    if (stage.requireIfBlock && !hasBlockType(blocks, 'IF_BLOCKED')) {
      soundEngine.playWrong();
      setDebugMessage(
        'Tantangan Level Percabangan ini membutuhkan minimal 1 blok If (Depan Terhalang) agar robot menggunakan sensornya.'
      );
      return;
    }

    if (stage.requireRepeatBlock && !hasBlockType(blocks, 'REPEAT')) {
      soundEngine.playWrong();
      setDebugMessage(
        'Tantangan Level Perulangan ini membutuhkan blok Repeat (N kali) untuk meringkas pola langkah yang berulang.'
      );
      return;
    }

    soundEngine.playClick();
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    isPausedRef.current = false;

    setIsRunning(true);
    setIsPaused(false);
    setDebugMessage(null);
    setStageWon(null);

    let simX = stage.start.x;
    let simY = stage.start.y;
    let simDir: Direction = stage.start.dir;
    const simVisited = [{ x: simX, y: simY }];
    const simUnlocked = new Set<string>();
    let currentGateBonus = 0;

    setUnlockedGateIds([]);
    setRobot({
      x: simX,
      y: simY,
      dir: simDir,
      crashed: false,
      celebrating: false,
      visited: [...simVisited],
    });

    const isCellBlocked = (tx: number, ty: number) =>
      tx < 0 || ty < 0 || tx >= stage.cols || ty >= stage.rows || wallSet.has(`${tx},${ty}`);

    const triggerFail = (reason: string) => {
      soundEngine.playWrong();
      setRobot({
        x: simX,
        y: simY,
        dir: simDir,
        crashed: true,
        celebrating: false,
        visited: [...simVisited],
      });
      setLives((prev) => Math.max(0, prev - 1));
      setDebugMessage(reason);
      setStatusNote('Eksekusi dihentikan. Perbaiki susunan blok lalu coba lagi.');
    };

    const runSimpleAction = async (
      action: SimpleAction,
      stepLabel: string
    ): Promise<'CONTINUE' | 'WIN' | 'FAILED' | 'ABORT'> => {
      if (action === 'LEFT') {
        simDir = rotateLeft(simDir);
        soundEngine.playTurn();
        setRobot({
          x: simX,
          y: simY,
          dir: simDir,
          crashed: false,
          celebrating: false,
          visited: [...simVisited],
        });
        setStatusNote(`${stepLabel}: Robot berbelok ke kiri (hadap ${DIR_LABELS[simDir]}).`);
        return 'CONTINUE';
      }

      if (action === 'RIGHT') {
        simDir = rotateRight(simDir);
        soundEngine.playTurn();
        setRobot({
          x: simX,
          y: simY,
          dir: simDir,
          crashed: false,
          celebrating: false,
          visited: [...simVisited],
        });
        setStatusNote(`${stepLabel}: Robot berbelok ke kanan (hadap ${DIR_LABELS[simDir]}).`);
        return 'CONTINUE';
      }

      // MOVE
      const next = stepForward(simX, simY, simDir);
      if (next.x < 0 || next.y < 0 || next.x >= stage.cols || next.y >= stage.rows) {
        triggerFail(
          `Debug ${stepLabel} (Maju): Robot menghadap ${DIR_LABELS[simDir]} dan keluar dari batas arena di (${next.x}, ${next.y}). Tambahkan perintah belok sebelum melangkah!`
        );
        return 'FAILED';
      }

      if (wallSet.has(`${next.x},${next.y}`)) {
        triggerFail(
          `Debug ${stepLabel} (Maju): Robot menghadap ${DIR_LABELS[simDir]} dan menabrak tembok sirkuit di koordinat (${next.x}, ${next.y}). Ubah arah belokan atau periksa jumlah langkah!`
        );
        return 'FAILED';
      }

      simX = next.x;
      simY = next.y;
      simVisited.push({ x: simX, y: simY });
      soundEngine.playStep();
      setRobot({
        x: simX,
        y: simY,
        dir: simDir,
        crashed: false,
        celebrating: false,
        visited: [...simVisited],
      });
      setStatusNote(`${stepLabel}: Robot melangkah ke posisi (${simX}, ${simY}).`);

      // Check Logic Gate
      const gate = stage.gates.find((g) => g.x === simX && g.y === simY && !simUnlocked.has(g.id));
      if (gate) {
        soundEngine.playGatePrompt();
        setStatusNote(`${stepLabel}: Robot menyentuh Gerbang Logika! Jawab kuis untuk membukanya.`);
        setActiveQuiz(gate);

        const passed = await new Promise<boolean>((resolve) => {
          quizResolverRef.current = resolve;
        });

        if (token !== runTokenRef.current) return 'ABORT';

        if (!passed) {
          triggerFail(
            `Debug Gerbang Logika (${gate.quiz.topic}): Jawaban kuis belum tepat. ${gate.quiz.explanation}`
          );
          return 'FAILED';
        }

        simUnlocked.add(gate.id);
        setUnlockedGateIds(Array.from(simUnlocked));
        currentGateBonus += 100;
        setStageScore((prev) => prev + 100);
        onAddScore(100);
        setPulseTrigger((p) => p + 1);
        await sleep(360);
        if (token !== runTokenRef.current) return 'ABORT';
      }

      // Check Finish
      if (simX === stage.finish.x && simY === stage.finish.y) {
        if (simUnlocked.size < stage.gates.length) {
          triggerFail(
            'Debug Misi: Robot mencapai Finish, tetapi masih ada Gerbang Logika yang belum dilewati. Pastikan jalur melewati semua gerbang!'
          );
          return 'FAILED';
        }
        return 'WIN';
      }

      return 'CONTINUE';
    };

    const executeList = async (
      list: ProgramBlock[],
      repeatInfo?: string
    ): Promise<'CONTINUE' | 'WIN' | 'FAILED' | 'ABORT'> => {
      for (let i = 0; i < list.length; i++) {
        if (token !== runTokenRef.current) return 'ABORT';
        const okPause = await waitIfPaused(token);
        if (!okPause) return 'ABORT';

        const block = list[i];
        setActiveBlockId(block.id);
        const labelPrefix = repeatInfo
          ? `${repeatInfo} · Blok #${i + 1}`
          : `Baris #${i + 1}`;

        await sleep(390);
        if (token !== runTokenRef.current) return 'ABORT';
        const okAfterSleep = await waitIfPaused(token);
        if (!okAfterSleep) return 'ABORT';

        if (block.type === 'MOVE' || block.type === 'LEFT' || block.type === 'RIGHT') {
          const res = await runSimpleAction(block.type, labelPrefix);
          if (res !== 'CONTINUE') return res;
        } else if (block.type === 'IF_BLOCKED') {
          const ahead = stepForward(simX, simY, simDir);
          const blocked = isCellBlocked(ahead.x, ahead.y);
          setStatusNote(
            `${labelPrefix}: Cek If(Depan Terhalang) -> ${blocked ? `True, jalankan ${ACTION_LABELS[block.action]}` : 'False, lewati aksi'}.`
          );
          if (blocked) {
            await sleep(220);
            if (token !== runTokenRef.current) return 'ABORT';
            const res = await runSimpleAction(block.action, `${labelPrefix} [If]`);
            if (res !== 'CONTINUE') return res;
          }
        } else if (block.type === 'REPEAT') {
          if (block.children.length === 0) {
            soundEngine.playWrong();
            setDebugMessage(
              `Debug Baris #${i + 1} (Repeat): Blok Repeat masih kosong. Tambahkan minimal 1 perintah di dalam Repeat.`
            );
            return 'ABORT';
          }
          for (let iter = 1; iter <= block.count; iter++) {
            const res = await executeList(
              block.children,
              `Repeat (${iter}/${block.count})`
            );
            if (res !== 'CONTINUE') return res;
          }
        }
      }
      return 'CONTINUE';
    };

    const result = await executeList(blocks);
    if (token !== runTokenRef.current) return;

    setActiveBlockId(null);
    setIsRunning(false);

    if (result === 'WIN') {
      soundEngine.playVictory();
      setPulseTrigger((p) => p + 1);
      setRobot({
        x: simX,
        y: simY,
        dir: simDir,
        crashed: false,
        celebrating: true,
        visited: [...simVisited],
      });

      const usedCount = countTotalBlocks(blocks);
      const efficiencyBonus = usedCount <= stage.optimalBlockCount + 1 ? 50 : 20;
      const lifeBonus = lives * 25;
      const completionScore = 100 + currentGateBonus + efficiencyBonus + lifeBonus;
      const stars = lives === 3 ? 3 : lives === 2 ? 2 : 1;

      onAddScore(100 + efficiencyBonus + lifeBonus);
      setStageScore(completionScore);
      setStageWon({ earnedScore: completionScore, stars });
      setStatusNote('Misi Berhasil! Robot mencapai portal Finish.');
      onStageComplete(completionScore, lives);
    } else if (result === 'CONTINUE') {
      triggerFail(
        `Debug Alur Program: Semua blok selesai dijalankan, namun robot berhenti di (${simX}, ${simY}) dan belum mencapai Finish (${stage.finish.x}, ${stage.finish.y}). Tambahkan langkah atau cek jumlah perulangan!`
      );
    }
  };

  const handleResetLives = () => {
    soundEngine.playClick();
    setLives(3);
    resetRobotAndRunState(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
      {/* Top HUD Panel */}
      <div className="bg-[#2D1B69] border border-[#00F5D4]/35 rounded-2xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBackToLevels();
            }}
            className="inline-flex items-center gap-2 bg-[#1B1464] hover:bg-[#271e87] text-white font-bold text-base px-3.5 py-2 rounded-xl border border-white/20 cursor-pointer whitespace-nowrap"
          >
            <MapIcon className="w-4 h-4 text-[#00F5D4]" />
            <span>Peta Level</span>
          </button>

          <div>
            <p className="font-mono text-xs sm:text-sm font-bold text-[#00F5D4]">
              Level {stage.levelId} · Stage {stage.stageNumber}/5
            </p>
            <h1 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
              {stage.title}
            </h1>
          </div>
        </div>

        {/* Lives + Score */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2" aria-label={`Nyawa tersisa: ${lives} dari 3`}>
            <span className="text-sm font-semibold text-slate-300 hidden sm:inline">Nyawa:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((idx) => (
                <Heart
                  key={idx}
                  className={`w-6 h-6 transition-transform ${
                    idx <= lives
                      ? 'text-[#FF4D6D] fill-[#FF4D6D]'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-sm font-bold text-white tabular-nums">
              {lives}/3
            </span>
          </div>

          <div className="bg-[#1B1464] border border-[#FEE440]/40 rounded-xl px-4 py-1.5 flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">Skor:</span>
            <span className="font-mono text-lg font-bold text-[#FEE440] tabular-nums">
              {totalSessionScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Center / Left: 2D Maze Canvas + Objective + Debug Console */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#2D1B69] border border-[#00F5D4]/25 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-base font-semibold text-white">{stage.objective}</p>
              <span className="font-mono text-xs text-[#FEE440] whitespace-nowrap shrink-0">
                Gerbang Terbuka: {unlockedGateIds.length}/{stage.gates.length}
              </span>
            </div>

            <MazeCanvas
              stage={stage}
              robot={robot}
              unlockedGateIds={unlockedGateIds}
              pulseTrigger={pulseTrigger}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm bg-[#1B1464] border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-[#00F5D4] font-medium">{statusNote}</span>
              <span className="text-slate-300 text-xs sm:text-sm">
                Tips: {stage.hint}
              </span>
            </div>
          </div>

          {/* Educational Debug Feedback Panel */}
          {debugMessage && (
            <div
              role="alert"
              className="bg-[#45122B] border-2 border-[#FF4D6D] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg"
            >
              <Bug className="w-6 h-6 text-[#FF8FA3] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-display text-lg font-bold text-[#FFE5EC]">
                  Pesan Debugging Logika
                </p>
                <p className="text-base text-white leading-relaxed">{debugMessage}</p>
              </div>
            </div>
          )}

          {/* Out of Lives Recovery */}
          {lives === 0 && !stageWon && (
            <div className="bg-[#2D1B69] border-2 border-[#FEE440] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#FEE440]">
                  Nyawa Habis pada Stage Ini
                </h2>
                <p className="text-base text-slate-200">
                  Jangan menyerah! Pelajari pesan debug lalu isi ulang 3 nyawa untuk mencoba lagi.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetLives}
                className="bg-[#FEE440] hover:bg-[#ffea66] text-[#1B1464] font-bold text-lg px-5 py-3 rounded-xl cursor-pointer whitespace-nowrap"
              >
                Isi Ulang 3 Nyawa
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Algorithm Block Builder & Simulator Controls */}
        <div className="lg:col-span-5 bg-[#2D1B69] border border-[#00F5D4]/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xl">
          <div className="space-y-4">
            {/* Palette of Allowed Code Blocks */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-display text-xl font-bold text-white">
                  1. Pilih Blok Perintah
                </h2>
                {activeRepeatTargetId && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveRepeatTargetId(null);
                    }}
                    className="text-xs font-bold text-[#FEE440] underline cursor-pointer"
                  >
                    Keluar dari Mode Isi Repeat
                  </button>
                )}
              </div>

              {activeRepeatTargetId && (
                <p className="text-xs font-semibold text-[#00F5D4] mb-2">
                  Mode Aktif: Klik blok di bawah untuk dimasukkan ke dalam blok Repeat terpilih.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                {stage.allowedBlocks.includes('MOVE') && (
                  <button
                    type="button"
                    disabled={isRunning || Boolean(stageWon)}
                    onClick={() => addBlock('MOVE')}
                    className="code-block-btn flex items-center justify-center gap-2 bg-[#00F5D4] text-[#1B1464] font-mono font-bold text-base px-3 py-3 rounded-xl border-b-4 border-[#00a891] disabled:opacity-50 cursor-pointer"
                  >
                    <StepForward className="w-5 h-5 shrink-0" />
                    <span>Maju()</span>
                  </button>
                )}

                {stage.allowedBlocks.includes('LEFT') && (
                  <button
                    type="button"
                    disabled={isRunning || Boolean(stageWon)}
                    onClick={() => addBlock('LEFT')}
                    className="code-block-btn flex items-center justify-center gap-2 bg-[#3B278C] text-white font-mono font-bold text-base px-3 py-3 rounded-xl border border-[#00F5D4]/60 border-b-4 border-b-[#00F5D4] disabled:opacity-50 cursor-pointer"
                  >
                    <CornerUpLeft className="w-5 h-5 text-[#00F5D4] shrink-0" />
                    <span>Belok Kiri()</span>
                  </button>
                )}

                {stage.allowedBlocks.includes('RIGHT') && (
                  <button
                    type="button"
                    disabled={isRunning || Boolean(stageWon)}
                    onClick={() => addBlock('RIGHT')}
                    className="code-block-btn flex items-center justify-center gap-2 bg-[#3B278C] text-white font-mono font-bold text-base px-3 py-3 rounded-xl border border-[#00F5D4]/60 border-b-4 border-b-[#00F5D4] disabled:opacity-50 cursor-pointer"
                  >
                    <CornerUpRight className="w-5 h-5 text-[#00F5D4] shrink-0" />
                    <span>Belok Kanan()</span>
                  </button>
                )}

                {stage.allowedBlocks.includes('IF_BLOCKED') && (
                  <button
                    type="button"
                    disabled={isRunning || Boolean(stageWon)}
                    onClick={() => addBlock('IF_BLOCKED')}
                    className="code-block-btn flex items-center justify-center gap-2 bg-[#FEE440] text-[#1B1464] font-mono font-bold text-sm sm:text-base px-3 py-3 rounded-xl border-b-4 border-[#bfa600] disabled:opacity-50 cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <GitBranch className="w-5 h-5 shrink-0" />
                    <span>If (Terhalang)</span>
                  </button>
                )}

                {stage.allowedBlocks.includes('REPEAT') && (
                  <button
                    type="button"
                    disabled={isRunning || Boolean(stageWon) || Boolean(activeRepeatTargetId)}
                    onClick={() => addBlock('REPEAT')}
                    className="code-block-btn col-span-2 flex items-center justify-center gap-2 bg-[#5E35B1] hover:bg-[#6a3ec4] text-white font-mono font-bold text-base px-3 py-3 rounded-xl border border-[#FEE440] border-b-4 border-b-[#FEE440] disabled:opacity-50 cursor-pointer"
                  >
                    <Repeat className="w-5 h-5 text-[#FEE440] shrink-0" />
                    <span>+ Blok Repeat (N kali)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Workspace Sequence */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-display text-xl font-bold text-white">
                  2. Susunan Algoritma ({blocks.length})
                </h2>
                {blocks.length > 0 && !isRunning && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setBlocks([]);
                      setActiveRepeatTargetId(null);
                    }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF8FA3] hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Bersihkan</span>
                  </button>
                )}
              </div>

              <div className="bg-[#120D47] border border-white/15 rounded-xl p-3 min-h-[220px] max-h-[340px] overflow-y-auto space-y-2">
                {blocks.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400 px-4">
                    <Plus className="w-8 h-8 text-[#00F5D4]/60 mb-2" />
                    <p className="text-base">
                      Belum ada blok perintah. Klik blok di atas untuk mulai menyusun algoritma robot.
                    </p>
                  </div>
                ) : (
                  blocks.map((block, index) => {
                    const isActive = activeBlockId === block.id;
                    const isTargetRepeat = activeRepeatTargetId === block.id;

                    return (
                      <div
                        key={block.id}
                        draggable={!isRunning}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnIndex(index)}
                        className={`rounded-xl p-2.5 border transition-all ${
                          isActive
                            ? 'bg-[#FEE440]/20 border-2 border-[#FEE440] shadow-[0_0_16px_rgba(254,228,64,0.35)]'
                            : isTargetRepeat
                              ? 'bg-[#2D1B69] border-2 border-[#00F5D4]'
                              : 'bg-[#1B1464] border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab hidden sm:block" />
                            <span className="font-mono text-xs text-slate-400 tabular-nums w-5">
                              {index + 1}.
                            </span>

                            {block.type === 'MOVE' && (
                              <span className="font-mono font-bold text-[#00F5D4] text-base">
                                Maju()
                              </span>
                            )}
                            {block.type === 'LEFT' && (
                              <span className="font-mono font-bold text-white text-base">
                                Belok Kiri()
                              </span>
                            )}
                            {block.type === 'RIGHT' && (
                              <span className="font-mono font-bold text-white text-base">
                                Belok Kanan()
                              </span>
                            )}

                            {block.type === 'IF_BLOCKED' && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono font-bold text-[#FEE440] text-sm">
                                  If (Terhalang):
                                </span>
                                <select
                                  aria-label="Pilih aksi jika depan terhalang"
                                  disabled={isRunning}
                                  value={block.action}
                                  onChange={(e) =>
                                    updateIfAction(block.id, e.target.value as SimpleAction)
                                  }
                                  className="bg-[#120D47] text-white font-mono text-sm font-bold px-2 py-1 rounded-lg border border-[#FEE440]/50 cursor-pointer"
                                >
                                  <option value="RIGHT">Belok Kanan()</option>
                                  <option value="LEFT">Belok Kiri()</option>
                                  <option value="MOVE">Maju()</option>
                                </select>
                              </div>
                            )}

                            {block.type === 'REPEAT' && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-[#FEE440] text-sm sm:text-base">
                                  Repeat
                                </span>
                                <div className="inline-flex items-center bg-[#120D47] border border-[#00F5D4]/50 rounded-lg">
                                  <button
                                    type="button"
                                    disabled={isRunning}
                                    onClick={() => updateRepeatCount(block.id, -1)}
                                    className="px-2 py-0.5 text-white font-bold hover:text-[#00F5D4] cursor-pointer"
                                    aria-label="Kurangi jumlah ulang"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-sm font-bold text-[#00F5D4] px-2 tabular-nums">
                                    {block.count}x
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isRunning}
                                    onClick={() => updateRepeatCount(block.id, 1)}
                                    className="px-2 py-0.5 text-white font-bold hover:text-[#00F5D4] cursor-pointer"
                                    aria-label="Tambah jumlah ulang"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Reorder & Remove */}
                          {!isRunning && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveRootBlock(index, -1)}
                                disabled={index === 0}
                                aria-label="Pindah ke atas"
                                className="p-1.5 rounded-lg bg-[#2D1B69] text-slate-200 hover:text-[#00F5D4] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveRootBlock(index, 1)}
                                disabled={index === blocks.length - 1}
                                aria-label="Pindah ke bawah"
                                className="p-1.5 rounded-lg bg-[#2D1B69] text-slate-200 hover:text-[#00F5D4] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRootBlock(block.id)}
                                aria-label="Hapus blok"
                                className="p-1.5 rounded-lg bg-[#2D1B69] text-[#FF8FA3] hover:bg-[#FF4D6D] hover:text-white cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Nested Repeat Children */}
                        {block.type === 'REPEAT' && (
                          <div className="mt-2 ml-4 pl-3 border-l-2 border-[#00F5D4]/50 space-y-1.5">
                            {block.children.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">
                                Belum ada blok di dalam Repeat.
                              </p>
                            ) : (
                              block.children.map((ch, cIdx) => {
                                const childActive = activeBlockId === ch.id;
                                return (
                                  <div
                                    key={ch.id}
                                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border ${
                                      childActive
                                        ? 'bg-[#FEE440]/25 border-[#FEE440]'
                                        : 'bg-[#120D47] border-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-mono text-xs text-slate-400">
                                        {cIdx + 1}.
                                      </span>
                                      {ch.type === 'IF_BLOCKED' ? (
                                        <div className="flex flex-wrap items-center gap-1">
                                          <span className="font-mono text-xs font-bold text-[#FEE440]">
                                            If(Terhalang):
                                          </span>
                                          <select
                                            disabled={isRunning}
                                            value={ch.action}
                                            onChange={(e) =>
                                              updateIfAction(
                                                ch.id,
                                                e.target.value as SimpleAction,
                                                block.id
                                              )
                                            }
                                            className="bg-[#1B1464] text-white font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-[#FEE440]/50"
                                          >
                                            <option value="RIGHT">Belok Kanan()</option>
                                            <option value="LEFT">Belok Kiri()</option>
                                            <option value="MOVE">Maju()</option>
                                          </select>
                                        </div>
                                      ) : (
                                        <span className="font-mono text-sm font-bold text-[#00F5D4]">
                                          {ch.type === 'MOVE'
                                            ? 'Maju()'
                                            : ch.type === 'LEFT'
                                              ? 'Belok Kiri()'
                                              : 'Belok Kanan()'}
                                        </span>
                                      )}
                                    </div>
                                    {!isRunning && (
                                      <button
                                        type="button"
                                        onClick={() => removeChildBlock(block.id, ch.id)}
                                        aria-label="Hapus blok dalam Repeat"
                                        className="text-[#FF8FA3] hover:text-white p-1 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })
                            )}

                            {!isRunning && (
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  setActiveRepeatTargetId(
                                    isTargetRepeat ? null : block.id
                                  );
                                }}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                                  isTargetRepeat
                                    ? 'bg-[#00F5D4] text-[#1B1464]'
                                    : 'bg-[#2D1B69] text-[#00F5D4] hover:bg-[#3b2587]'
                                }`}
                              >
                                {isTargetRepeat
                                  ? 'Sedang Mengisi Repeat Ini (Selesai)'
                                  : '+ Tambah Blok ke Repeat Ini'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Run, Reset Level, Pause */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/15">
            <button
              type="button"
              disabled={isRunning || lives === 0 || Boolean(stageWon)}
              onClick={runSimulation}
              className="code-block-btn sm:col-span-3 flex items-center justify-center gap-2.5 bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-5 py-3.5 rounded-xl border-b-4 border-[#00a891] disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isRunning ? 'Robot Sedang Berjalan...' : 'Jalankan (Run)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                resetRobotAndRunState(true);
              }}
              className="code-block-btn sm:col-span-2 flex items-center justify-center gap-2 bg-[#1B1464] hover:bg-[#271e87] text-white font-bold text-base px-4 py-3 rounded-xl border border-white/25 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 text-[#FEE440]" />
              <span>Reset Level</span>
            </button>

            <button
              type="button"
              disabled={!isRunning}
              onClick={handleTogglePause}
              className="code-block-btn flex items-center justify-center gap-2 bg-[#FEE440] hover:bg-[#ffea66] text-[#1B1464] font-bold text-base px-4 py-3 rounded-xl disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <Pause className="w-4 h-4" />
              <span>{isPaused ? 'Lanjut' : 'Pause'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logic Gate Quiz Pop-Up Modal */}
      {activeQuiz && (
        <div
          className="fixed inset-0 z-50 bg-[#0B072D]/85 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-modal-title"
        >
          <div className="w-full max-w-2xl bg-[#2D1B69] border-2 border-[#00F5D4] rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-6 h-6 text-[#FEE440]" />
                <h2 id="quiz-modal-title" className="font-display text-2xl font-bold text-[#FEE440]">
                  Gerbang Logika Terkunci
                </h2>
              </div>
              <span className="font-mono text-sm font-bold text-[#00F5D4]">
                {activeQuiz.quiz.topic}
              </span>
            </div>

            <p className="text-lg font-semibold text-white leading-relaxed">
              {activeQuiz.quiz.prompt}
            </p>

            {activeQuiz.quiz.flowchartType && (
              <div className="bg-[#120D47] border border-[#00F5D4]/25 rounded-xl p-3">
                <FlowchartDiagram type={activeQuiz.quiz.flowchartType} compact />
              </div>
            )}

            {activeQuiz.quiz.codeOrFlow && (
              <pre className="bg-[#120D47] border border-[#FEE440]/30 rounded-xl p-4 font-mono text-base text-[#00F5D4] overflow-x-auto leading-relaxed">
                {activeQuiz.quiz.codeOrFlow}
              </pre>
            )}

            <div className="space-y-3">
              {activeQuiz.quiz.options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(quizFeedback)}
                  onClick={() => handleQuizAnswer(idx)}
                  className="w-full text-left bg-[#1B1464] hover:bg-[#3a2485] border-2 border-white/20 hover:border-[#00F5D4] text-white font-semibold text-lg px-5 py-4 rounded-xl transition-colors cursor-pointer disabled:opacity-70"
                >
                  {opt}
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div
                className={`rounded-xl p-4 border-2 font-medium text-base ${
                  quizFeedback.correct
                    ? 'bg-[#093A2B] border-[#10B981] text-[#D1FAE5]'
                    : 'bg-[#45122B] border-[#FF4D6D] text-[#FFE5EC]'
                }`}
              >
                {quizFeedback.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage Victory Modal */}
      {stageWon && (
        <div
          className="fixed inset-0 z-50 bg-[#0B072D]/85 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stage-won-title"
        >
          <div className="w-full max-w-lg bg-[#2D1B69] border-2 border-[#FEE440] rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="inline-flex p-4 rounded-full bg-[#1B1464] border border-[#FEE440]">
              <CheckCircle2 className="w-12 h-12 text-[#00F5D4]" />
            </div>

            <div>
              <p className="font-mono text-sm font-bold text-[#00F5D4]">
                Level {stage.levelId} · Stage {stage.stageNumber}/5 Tuntas
              </p>
              <h2 id="stage-won-title" className="font-display text-3xl font-bold text-white mt-1">
                {stage.title} Berhasil!
              </h2>
            </div>

            <div className="bg-[#1B1464] border border-white/15 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-300">Skor Stage</p>
                <p className="font-mono text-2xl font-bold text-[#FEE440] tabular-nums">
                  +{stageWon.earnedScore}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-300">Bintang Capaian</p>
                <p className="font-mono text-2xl font-bold text-[#00F5D4] tabular-nums">
                  {stageWon.stars} / 3
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onBackToLevels();
                }}
                className="flex-1 bg-[#1B1464] hover:bg-[#271e87] text-white font-bold text-lg px-5 py-3.5 rounded-xl border border-white/25 cursor-pointer"
              >
                Peta Level
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onNextStage();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-5 py-3.5 rounded-xl border-b-4 border-[#00a891] cursor-pointer"
              >
                <span>{hasNextStage ? 'Stage Berikutnya' : 'Lihat Rekap & Sertifikat'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !activeQuiz && (
        <div
          className="fixed inset-0 z-40 bg-[#0B072D]/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#2D1B69] border-2 border-[#00F5D4] rounded-2xl p-6 text-center space-y-5">
            <h2 className="font-display text-3xl font-bold text-[#FEE440]">Permainan Dijeda</h2>
            <p className="text-base text-slate-200">
              Simulasi robot berhenti sementara. Pilih tindakan untuk melanjutkan.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleTogglePause}
                className="bg-[#00F5D4] text-[#1B1464] font-bold text-lg py-3 rounded-xl cursor-pointer"
              >
                Lanjutkan Simulasi
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  resetRobotAndRunState(false);
                }}
                className="bg-[#1B1464] text-white font-bold text-lg py-3 rounded-xl border border-white/25 cursor-pointer"
              >
                Ulangi Posisi Robot
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onBackToLevels();
                }}
                className="bg-[#1B1464] text-[#FF8FA3] font-bold text-lg py-3 rounded-xl border border-[#FF4D6D]/50 cursor-pointer"
              >
                Kembali ke Peta Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
