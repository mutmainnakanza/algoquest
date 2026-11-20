import React, { useEffect, useRef } from 'react';
import { Direction, StageConfig } from '../data/gameData';

export interface RobotVisualState {
  x: number;
  y: number;
  dir: Direction;
  crashed: boolean;
  celebrating: boolean;
  visited: Array<{ x: number; y: number }>;
}

interface MazeCanvasProps {
  stage: StageConfig;
  robot: RobotVisualState;
  unlockedGateIds: string[];
  pulseTrigger: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const MazeCanvas: React.FC<MazeCanvasProps> = ({
  stage,
  robot,
  unlockedGateIds,
  pulseTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animStateRef = useRef({
    renderX: robot.x,
    renderY: robot.y,
    targetX: robot.x,
    targetY: robot.y,
    dir: robot.dir,
    crashed: robot.crashed,
    celebrating: robot.celebrating,
    visited: robot.visited,
    unlockedGateIds,
    stage,
  });

  useEffect(() => {
    animStateRef.current = {
      ...animStateRef.current,
      targetX: robot.x,
      targetY: robot.y,
      dir: robot.dir,
      crashed: robot.crashed,
      celebrating: robot.celebrating,
      visited: robot.visited,
      unlockedGateIds,
      stage,
    };
  }, [robot, unlockedGateIds, stage]);

  useEffect(() => {
    animStateRef.current.renderX = robot.x;
    animStateRef.current.renderY = robot.y;
    particlesRef.current = [];
  }, [stage.id]);

  useEffect(() => {
    if (pulseTrigger === 0) return;
    const colors = ['#00F5D4', '#FEE440', '#FFFFFF'];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.2;
      const speed = 1.4 + Math.random() * 2.8;
      particlesRef.current.push({
        x: robot.x + 0.5,
        y: robot.y + 0.5,
        vx: Math.cos(angle) * speed * 0.03,
        vy: Math.sin(angle) * speed * 0.03,
        life: 0,
        maxLife: 34,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 4,
      });
    }
  }, [pulseTrigger, robot.x, robot.y]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let tick = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      const width = Math.max(280, Math.floor(rect.width));
      const height = Math.max(260, Math.floor(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    const draw = () => {
      tick += 1;
      const state = animStateRef.current;
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;

      // Smooth robot movement interpolation
      state.renderX += (state.targetX - state.renderX) * 0.25;
      state.renderY += (state.targetY - state.renderY) * 0.25;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear background
      ctx.fillStyle = '#120D47';
      ctx.fillRect(0, 0, cw, ch);

      const pad = 16;
      const cellSize = Math.floor(
        Math.min((cw - pad * 2) / state.stage.cols, (ch - pad * 2) / state.stage.rows)
      );
      const gridW = cellSize * state.stage.cols;
      const gridH = cellSize * state.stage.rows;
      const offsetX = Math.floor((cw - gridW) / 2);
      const offsetY = Math.floor((ch - gridH) / 2);

      // Outer grid frame glow
      ctx.fillStyle = '#1B1464';
      ctx.fillRect(offsetX - 4, offsetY - 4, gridW + 8, gridH + 8);
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX - 4, offsetY - 4, gridW + 8, gridH + 8);

      const wallSet = new Set(state.stage.walls.map(([wx, wy]) => `${wx},${wy}`));

      // Draw Grid Cells
      for (let gy = 0; gy < state.stage.rows; gy++) {
        for (let gx = 0; gx < state.stage.cols; gx++) {
          const px = offsetX + gx * cellSize;
          const py = offsetY + gy * cellSize;
          const isWall = wallSet.has(`${gx},${gy}`);

          if (isWall) {
            // Circuit Wall block
            ctx.fillStyle = '#2D1B69';
            ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
            ctx.fillStyle = '#3E278E';
            ctx.fillRect(px + 5, py + 5, cellSize - 10, 6);
            ctx.strokeStyle = '#170E42';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);

            // Pixel circuit rivets
            ctx.fillStyle = 'rgba(0, 245, 212, 0.22)';
            ctx.fillRect(px + 7, py + cellSize - 10, 4, 4);
            ctx.fillRect(px + cellSize - 11, py + cellSize - 10, 4, 4);
          } else {
            // Walkable floor tile
            ctx.fillStyle = (gx + gy) % 2 === 0 ? '#18115B' : '#1E1569';
            ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            ctx.strokeStyle = 'rgba(0, 245, 212, 0.12)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          }
        }
      }

      // Draw Visited Breadcrumbs
      state.visited.forEach((v) => {
        const cx = offsetX + (v.x + 0.5) * cellSize;
        const cy = offsetY + (v.y + 0.5) * cellSize;
        ctx.fillStyle = 'rgba(0, 245, 212, 0.35)';
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(3, cellSize * 0.09), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Finish Portal
      const finX = offsetX + state.stage.finish.x * cellSize;
      const finY = offsetY + state.stage.finish.y * cellSize;
      const finCx = finX + cellSize / 2;
      const finCy = finY + cellSize / 2;
      const pulse = 0.5 + 0.5 * Math.sin(tick * 0.08);

      ctx.fillStyle = `rgba(254, 228, 64, ${0.18 + pulse * 0.16})`;
      ctx.fillRect(finX + 4, finY + 4, cellSize - 8, cellSize - 8);
      ctx.strokeStyle = '#FEE440';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(finX + 5, finY + 5, cellSize - 10, cellSize - 10);

      // Finish Flag / Star Icon
      ctx.fillStyle = '#FEE440';
      ctx.font = `800 ${Math.max(10, Math.floor(cellSize * 0.2))}px "Chakra Petch", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FINISH', finCx, finCy + cellSize * 0.25);

      // Draw checkered flag glyph
      const flagW = cellSize * 0.34;
      const flagH = cellSize * 0.24;
      const fx = finCx - flagW / 2;
      const fy = finCy - cellSize * 0.26;
      ctx.fillStyle = '#FEE440';
      ctx.fillRect(fx, fy, 3, flagH + 8);
      ctx.fillStyle = '#00F5D4';
      ctx.fillRect(fx + 3, fy, flagW * 0.5, flagH * 0.5);
      ctx.fillStyle = '#FEE440';
      ctx.fillRect(fx + 3 + flagW * 0.5, fy, flagW * 0.5, flagH * 0.5);
      ctx.fillStyle = '#FEE440';
      ctx.fillRect(fx + 3, fy + flagH * 0.5, flagW * 0.5, flagH * 0.5);
      ctx.fillStyle = '#00F5D4';
      ctx.fillRect(fx + 3 + flagW * 0.5, fy + flagH * 0.5, flagW * 0.5, flagH * 0.5);

      // Draw Logic Gates
      state.stage.gates.forEach((gate) => {
        const isUnlocked = state.unlockedGateIds.includes(gate.id);
        const gx = offsetX + gate.x * cellSize;
        const gy = offsetY + gate.y * cellSize;
        const gcx = gx + cellSize / 2;
        const gcy = gy + cellSize / 2;

        if (isUnlocked) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.fillRect(gx + 5, gy + 5, cellSize - 10, cellSize - 10);
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(gx + 5, gy + 5, cellSize - 10, cellSize - 10);
          ctx.setLineDash([]);
          ctx.fillStyle = '#10B981';
          ctx.font = `700 ${Math.max(10, Math.floor(cellSize * 0.24))}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillText('OK', gcx, gcy);
        } else {
          // Locked Cyber Gate
          ctx.fillStyle = 'rgba(0, 245, 212, 0.16)';
          ctx.fillRect(gx + 4, gy + 4, cellSize - 8, cellSize - 8);
          ctx.strokeStyle = '#00F5D4';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(gx + 4, gy + 4, cellSize - 8, cellSize - 8);

          // Padlock icon
          const lw = cellSize * 0.34;
          const lh = cellSize * 0.28;
          ctx.strokeStyle = '#FEE440';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(gcx, gcy - lh * 0.25, lw * 0.3, Math.PI, 0);
          ctx.stroke();

          ctx.fillStyle = '#FEE440';
          ctx.fillRect(gcx - lw / 2, gcy - lh * 0.25, lw, lh);

          ctx.fillStyle = '#1B1464';
          ctx.font = `800 ${Math.max(9, Math.floor(cellSize * 0.2))}px "JetBrains Mono", monospace`;
          ctx.fillText('?', gcx, gcy + lh * 0.24);
        }
      });

      // Draw Robot
      const shakeX = state.crashed ? Math.sin(tick * 0.9) * 5 : 0;
      const jumpY = state.celebrating ? -Math.abs(Math.sin(tick * 0.18)) * 8 : Math.sin(tick * 0.08) * 1.5;
      const rcx = offsetX + (state.renderX + 0.5) * cellSize + shakeX;
      const rcy = offsetY + (state.renderY + 0.5) * cellSize + jumpY;
      const rSize = cellSize * 0.68;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(rcx, offsetY + (state.renderY + 0.84) * cellSize, rSize * 0.36, rSize * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Robot body rounded square
      const rx = rcx - rSize / 2;
      const ry = rcy - rSize / 2;
      ctx.fillStyle = state.crashed ? '#FF4D6D' : '#3B278C';
      ctx.strokeStyle = state.crashed ? '#FFE5EC' : '#00F5D4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rSize, rSize, 10);
      ctx.fill();
      ctx.stroke();

      // Visor screen
      ctx.fillStyle = '#0E0A38';
      ctx.beginPath();
      ctx.roundRect(rx + rSize * 0.14, ry + rSize * 0.2, rSize * 0.72, rSize * 0.44, 6);
      ctx.fill();

      // Eyes
      ctx.fillStyle = state.crashed ? '#FEE440' : '#00F5D4';
      const eyeW = Math.max(4, rSize * 0.14);
      const eyeH = Math.max(5, rSize * 0.18);
      ctx.fillRect(rcx - rSize * 0.22, ry + rSize * 0.33, eyeW, eyeH);
      ctx.fillRect(rcx + rSize * 0.08, ry + rSize * 0.33, eyeW, eyeH);

      // Direction Beacon Arrow showing where robot faces
      const dirAngle =
        state.dir === 'N' ? -Math.PI / 2 : state.dir === 'E' ? 0 : state.dir === 'S' ? Math.PI / 2 : Math.PI;
      const arrowDist = rSize * 0.56;
      const ax = rcx + Math.cos(dirAngle) * arrowDist;
      const ay = rcy + Math.sin(dirAngle) * arrowDist;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(dirAngle);
      ctx.fillStyle = '#FEE440';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-5, -6);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Update & Draw Particles
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(
          offsetX + p.x * cellSize - p.size / 2,
          offsetY + p.y * cellSize - p.size / 2,
          p.size,
          p.size
        );
      });
      ctx.globalAlpha = 1;

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[290px] sm:min-h-[360px] lg:min-h-[430px] rounded-xl overflow-hidden bg-[#120D47] border border-[#00F5D4]/30 flex items-center justify-center">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
