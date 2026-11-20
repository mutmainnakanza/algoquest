import React, { useState } from 'react';
import { Award, Download, Home, Printer, RotateCcw, Star, Trophy } from 'lucide-react';
import { LEVELS, STAGES } from '../data/gameData';
import { ProgressMap } from './LevelSelectScreen';
import { soundEngine } from '../audio/soundEngine';

interface VictoryScreenProps {
  progress: ProgressMap;
  totalSessionScore: number;
  onPlayAgain: () => void;
  onFinishToMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  progress,
  totalSessionScore,
  onPlayAgain,
  onFinishToMenu,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('X PPLG 1');

  const completedStages = STAGES.filter((s) => progress[s.id]?.completed).length;
  const cumulativeBestScore = STAGES.reduce(
    (sum, s) => sum + (progress[s.id]?.bestScore || 0),
    0
  );
  const displayScore = Math.max(totalSessionScore, cumulativeBestScore);

  const earnedStars =
    displayScore >= 2400 || (completedStages >= 5 && displayScore >= 1200)
      ? 3
      : displayScore >= 900 || completedStages >= 3
        ? 2
        : 1;

  const isKktpPassed = completedStages >= 5 || displayScore >= 1000;

  const feedbackMessage =
    earnedStars === 3
      ? 'Luar biasa! Logika algoritma Anda sangat kuat dan efisien. Anda siap melangkah ke pemrograman tingkat lanjut di Jurusan PPLG!'
      : earnedStars === 2
        ? 'Kerja bagus! Anda memahami alur dasar algoritma dengan baik. Terus latih efisiensi blok Repeat dan ketelitian membaca kondisi percabangan.'
        : 'Awal yang baik! Terus berlatih menyusun runtunan, membaca flowchart, dan gunakan pesan debugging untuk mengasah logika pemrograman Anda.';

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDownloadPng = () => {
    soundEngine.playClick();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#1B1464';
    ctx.fillRect(0, 0, 1200, 850);

    // Outer & inner frames
    ctx.strokeStyle = '#00F5D4';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = '#FEE440';
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, 1104, 754);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00F5D4';
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SMKN 4 KOTA PALOPO · KONSENTRASI KEAHLIAN PPLG', 600, 115);

    ctx.fillStyle = '#FEE440';
    ctx.font = 'bold 54px "Chakra Petch", sans-serif';
    ctx.fillText('SERTIFIKAT CAPAIAN ALGOQUEST', 600, 185);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Diberikan kepada peserta didik sebagai bukti capaian logika algoritma:', 600, 245);

    // Student Name
    const nameText = studentName.trim() || 'Peserta Didik PPLG';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(nameText, 600, 330);

    ctx.strokeStyle = '#00F5D4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(260, 355);
    ctx.lineTo(940, 355);
    ctx.stroke();

    ctx.fillStyle = '#FEE440';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Kelas: ${studentClass.trim() || 'X PPLG'}`, 600, 405);

    // Score Box
    ctx.fillStyle = '#2D1B69';
    ctx.fillRect(190, 445, 820, 145);
    ctx.strokeStyle = '#00F5D4';
    ctx.lineWidth = 3;
    ctx.strokeRect(190, 445, 820, 145);

    ctx.fillStyle = '#00F5D4';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('REKAP CAPAIAN', 600, 485);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.fillText(
      `Total Skor: ${displayScore}  |  Stage: ${completedStages}/15  |  Predikat: ${earnedStars} Bintang`,
      600,
      545
    );

    // Status KKTP
    ctx.fillStyle = isKktpPassed ? '#00F5D4' : '#FEE440';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      isKktpPassed
        ? 'STATUS: TUNTAS KKTP DASAR-DASAR PPLG'
        : 'STATUS: SEDANG BERKEMBANG — TERUS BERLATIH',
      600,
      640
    );

    // Footer Signature
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Palopo, ${todayFormatted}`, 600, 700);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Mutmainna, S.Kom', 600, 750);
    ctx.fillStyle = '#00F5D4';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Guru Pengampu Dasar-Dasar Keahlian PPLG · SMKN 4 Kota Palopo', 600, 780);

    const link = document.createElement('a');
    link.download = `Sertifikat_AlgoQuest_${nameText.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    soundEngine.playClick();
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* Victory Summary Header */}
      <div className="no-print bg-[#2D1B69] border border-[#FEE440]/50 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="p-5 rounded-2xl bg-[#1B1464] border-2 border-[#FEE440] shrink-0">
            <Trophy className="w-14 h-14 text-[#FEE440]" />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-sm font-bold text-[#00F5D4]">
              Rekapitulasi Hasil Petualangan
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Selamat Menyelesaikan Tantangan!
            </h1>
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
              {feedbackMessage}
            </p>
          </div>
        </div>

        <div className="bg-[#1B1464] border border-[#00F5D4]/40 rounded-2xl px-6 py-5 text-center shrink-0 min-w-[220px]">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[1, 2, 3].map((idx) => (
              <Star
                key={idx}
                className={`w-8 h-8 ${
                  idx <= earnedStars ? 'text-[#FEE440] fill-[#FEE440]' : 'text-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-300">Total Skor</p>
          <p className="font-mono text-4xl font-bold text-[#FEE440] tabular-nums">
            {displayScore}
          </p>
          <p className="text-sm font-semibold text-[#00F5D4] mt-1">
            {completedStages} / {STAGES.length} Stage Tuntas
          </p>
        </div>
      </div>

      {/* Level Breakdown */}
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4">
        {LEVELS.map((lvl) => {
          const lvlStages = STAGES.filter((s) => s.levelId === lvl.id);
          const lvlDone = lvlStages.filter((s) => progress[s.id]?.completed).length;
          const lvlScore = lvlStages.reduce(
            (sum, s) => sum + (progress[s.id]?.bestScore || 0),
            0
          );
          return (
            <div
              key={lvl.id}
              className="bg-[#2D1B69] border border-white/15 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-white">{lvl.name}</h2>
                <p className="text-sm text-slate-300">
                  {lvlDone}/5 Stage Selesai
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Skor Level</p>
                <p className="font-mono text-2xl font-bold text-[#00F5D4] tabular-nums">
                  {lvlScore}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Certificate Builder & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs */}
        <div className="no-print lg:col-span-4 bg-[#2D1B69] border border-[#00F5D4]/30 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#FEE440]" />
            <h2 className="font-display text-2xl font-bold text-white">
              Sertifikat Digital KKTP
            </h2>
          </div>
          <p className="text-base text-slate-200 leading-relaxed">
            Ketikkan nama lengkap dan kelas Anda untuk mencetak atau mengunduh bukti capaian belajar.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="student-name" className="block text-sm font-bold text-[#00F5D4] mb-1.5">
                Nama Lengkap Siswa
              </label>
              <input
                id="student-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Ahmad Fadli"
                className="w-full bg-[#1B1464] border border-white/25 focus:border-[#00F5D4] rounded-xl px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="student-class" className="block text-sm font-bold text-[#00F5D4] mb-1.5">
                Kelas / Konsentrasi
              </label>
              <input
                id="student-class"
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Contoh: X PPLG 1"
                className="w-full bg-[#1B1464] border border-white/25 focus:border-[#00F5D4] rounded-xl px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="code-block-btn w-full flex items-center justify-center gap-2.5 bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-5 py-3.5 rounded-xl border-b-4 border-[#00a891] cursor-pointer whitespace-nowrap"
            >
              <Download className="w-5 h-5" />
              <span>Unduh Sertifikat (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="code-block-btn w-full flex items-center justify-center gap-2.5 bg-[#FEE440] hover:bg-[#ffea66] text-[#1B1464] font-bold text-lg px-5 py-3.5 rounded-xl border-b-4 border-[#bfa600] cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-5 h-5" />
              <span>Cetak Rekap / Sertifikat</span>
            </button>
          </div>
        </div>

        {/* Live Certificate Card */}
        <div className="lg:col-span-8 print-only-cert bg-[#120D47] border-4 border-[#00F5D4] rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-2xl">
          <div className="border-2 border-[#FEE440]/60 rounded-xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-bold text-[#00F5D4] tracking-wide">
                SMKN 4 KOTA PALOPO · KONSENTRASI KEAHLIAN PPLG
              </p>
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-[#FEE440]">
                LENCANA KELULUSAN ALGOQUEST
              </h3>
            </div>

            <p className="text-base text-slate-300">
              Diberikan sebagai bukti ketercapaian tujuan pembelajaran Dasar-Dasar Keahlian PPLG kepada:
            </p>

            <div className="py-2 border-b-2 border-[#00F5D4]/60 max-w-lg mx-auto">
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {studentName.trim() || 'Nama Peserta Didik'}
              </p>
            </div>

            <p className="text-lg font-bold text-[#FEE440]">
              Kelas: {studentClass.trim() || 'X PPLG'}
            </p>

            <div className="grid grid-cols-3 gap-3 bg-[#1B1464] border border-white/15 rounded-xl p-4 max-w-xl mx-auto">
              <div>
                <p className="text-xs text-slate-300">Total Skor</p>
                <p className="font-mono text-2xl font-bold text-[#FEE440] tabular-nums">
                  {displayScore}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-300">Stage Tuntas</p>
                <p className="font-mono text-2xl font-bold text-[#00F5D4] tabular-nums">
                  {completedStages}/15
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-300">Predikat</p>
                <p className="font-mono text-2xl font-bold text-white tabular-nums">
                  {earnedStars} Bintang
                </p>
              </div>
            </div>

            <p className="font-bold text-base text-[#00F5D4]">
              {isKktpPassed
                ? 'Status Capaian: TUNTAS KKTP LOGIKA ALGORITMA'
                : 'Status Capaian: DALAM PENGEMBANGAN'}
            </p>

            <div className="pt-4 text-sm text-slate-300 space-y-1">
              <p>Palopo, {todayFormatted}</p>
              <p className="font-bold text-white text-base pt-2">Mutmainna, S.Kom</p>
              <p className="text-xs text-[#00F5D4]">
                Pengembang &amp; Guru PPLG SMKN 4 Kota Palopo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onPlayAgain();
          }}
          className="code-block-btn flex items-center justify-center gap-2.5 bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-7 py-4 rounded-xl border-b-4 border-[#00a891] cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Main Lagi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onFinishToMenu();
          }}
          className="code-block-btn flex items-center justify-center gap-2.5 bg-[#2D1B69] hover:bg-[#3a2485] text-white font-bold text-lg px-7 py-4 rounded-xl border border-white/25 cursor-pointer whitespace-nowrap"
        >
          <Home className="w-5 h-5 text-[#FEE440]" />
          <span>Selesai</span>
        </button>
      </div>
    </div>
  );
};
