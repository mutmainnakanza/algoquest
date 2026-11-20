import React, { useState } from 'react';
import { Play, BookOpen, HelpCircle, Download, X, Code2, Cpu, ShieldCheck } from 'lucide-react';
import { RobotMascot } from './RobotMascot';
import { soundEngine } from '../audio/soundEngine';

interface SplashScreenProps {
  onStart: () => void;
  onOpenMateri: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onOpenMateri }) => {
  const [showGuide, setShowGuide] = useState(false);

  const handleOpenGuide = () => {
    soundEngine.playClick();
    setShowGuide(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center min-h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center bg-[#2D1B69]/90 border border-[#00F5D4]/30 rounded-2xl p-6 sm:p-10 shadow-2xl">
        {/* Left Column: Identity, Title & Code-Block CTAs */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base font-semibold text-[#00F5D4]">
            <span>SMKN 4 Kota Palopo</span>
            <span aria-hidden="true" className="text-white/40">·</span>
            <span>Konsentrasi Keahlian PPLG</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none">
              Algo<span className="text-[#00F5D4]">Quest</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-[#FEE440] text-balance leading-snug">
              Petualangan Logika Algoritma dan Pemrograman SMK
            </p>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
              Susun blok algoritma, buka gerbang logika, dan bimbing robot menaklukkan 15 tantangan
              runtunan, percabangan, serta perulangan pada mata pelajaran Dasar-Dasar Keahlian PPLG Kelas X.
            </p>
          </div>

          {/* 3 Main Code-Block Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onStart();
              }}
              className="code-block-btn flex items-center justify-center gap-2.5 bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-5 py-4 rounded-xl border-b-4 border-[#00a891] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FEE440]"
            >
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>Mulai</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenMateri();
              }}
              className="code-block-btn flex items-center justify-center gap-2.5 bg-[#FEE440] hover:bg-[#ffea66] text-[#1B1464] font-bold text-lg px-5 py-4 rounded-xl border-b-4 border-[#bfa600] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00F5D4]"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>Materi Kilat</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGuide}
              className="code-block-btn flex items-center justify-center gap-2.5 bg-[#1B1464] hover:bg-[#241b7d] text-white font-bold text-lg px-5 py-4 rounded-xl border border-[#00F5D4]/60 border-b-4 border-b-[#00F5D4] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FEE440]"
            >
              <HelpCircle className="w-5 h-5 text-[#00F5D4] shrink-0" />
              <span>Petunjuk</span>
            </button>
          </div>

          {/* Developer Attribution & Offline Single-HTML Download */}
          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-300">
            <div>
              <span>Pengembang: </span>
              <strong className="text-white font-semibold">Mutmainna, S.Kom</strong>
              <span className="text-white/40 mx-2">·</span>
              <span>Kelas X PPLG</span>
            </div>

            <a
              href="./AlgoQuest_SMKN4Palopo.html"
              download="AlgoQuest_SMKN4Palopo.html"
              onClick={() => soundEngine.playClick()}
              className="inline-flex items-center gap-2 text-[#00F5D4] hover:text-[#FEE440] font-semibold transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Unduh Versi 1-File HTML</span>
            </a>
          </div>
        </div>

        {/* Right Column: Cyber Robot Illustration */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#1B1464]/80 border border-[#00F5D4]/25 rounded-2xl p-6 sm:p-8">
          <div className="animate-float-slow">
            <RobotMascot className="w-48 h-48 sm:w-60 sm:h-60 drop-shadow-[0_14px_24px_rgba(0,245,212,0.2)]" />
          </div>
          <div className="mt-4 text-center space-y-1">
            <p className="font-mono text-sm font-bold text-[#00F5D4]">
              UNIT ALGO-BOT X10
            </p>
            <p className="text-sm text-slate-300">
              Siap mengeksekusi algoritma Anda langkah demi langkah
            </p>
          </div>
        </div>
      </div>

      {/* Petunjuk Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-[#0B072D]/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
        >
          <div className="w-full max-w-2xl bg-[#2D1B69] border-2 border-[#00F5D4] rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15">
              <h2 id="guide-modal-title" className="font-display text-2xl sm:text-3xl font-bold text-[#FEE440]">
                Petunjuk Bermain AlgoQuest
              </h2>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowGuide(false);
                }}
                aria-label="Tutup petunjuk"
                className="p-2 rounded-lg bg-[#1B1464] hover:bg-[#FF4D6D] text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5 py-5 text-base sm:text-lg text-slate-100 leading-relaxed">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#1B1464] text-[#00F5D4] shrink-0">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00F5D4]">1. Susun Blok Algoritma</h3>
                  <p className="text-slate-200 text-base">
                    Klik blok perintah (<code className="text-[#FEE440]">Maju()</code>,{' '}
                    <code className="text-[#FEE440]">Belok Kiri()</code>,{' '}
                    <code className="text-[#FEE440]">If</code>, atau{' '}
                    <code className="text-[#FEE440]">Repeat</code>) untuk menambahkannya ke area kerja.
                    Anda dapat menggeser urutan blok (drag & drop) atau memakai tombol panah naik/turun.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#1B1464] text-[#FEE440] shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#FEE440]">2. Buka Gerbang Logika & Debugging</h3>
                  <p className="text-slate-200 text-base">
                    Tekan <strong>Jalankan</strong> untuk melihat robot bergerak langkah demi langkah.
                    Saat menyentuh Gerbang Logika terkunci, jawab pertanyaan flowchart atau pseudocode
                    untuk membuka gerbang dan meraih <strong>+100 skor</strong>. Jika menabrak tembok
                    atau salah menjawab, nyawa berkurang 1 dan pesan debugging akan membantu Anda memperbaikinya.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#1B1464] text-[#00F5D4] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00F5D4]">3. Raih Bintang & Sertifikat KKTP</h3>
                  <p className="text-slate-200 text-base">
                    Selesaikan seluruh tantangan di Level 1, 2, dan 3 (total 15 tantangan progresif).
                    Setelah menuntaskan level, ketikkan nama dan kelas Anda untuk mengunduh atau mencetak
                    Sertifikat Kelulusan Digital.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowGuide(false);
                }}
                className="bg-[#00F5D4] hover:bg-[#33f8de] text-[#1B1464] font-bold text-lg px-6 py-3 rounded-xl cursor-pointer"
              >
                Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
