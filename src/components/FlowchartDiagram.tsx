import React from 'react';
import { FlashcardItem, QuizQuestion } from '../data/gameData';

interface FlowchartDiagramProps {
  type: FlashcardItem['symbolKey'] | NonNullable<QuizQuestion['flowchartType']>;
  compact?: boolean;
}

export const FlowchartDiagram: React.FC<FlowchartDiagramProps> = ({ type, compact = false }) => {
  const heightClass = compact ? 'h-40' : 'h-60';

  if (type === 'terminator') {
    return (
      <svg viewBox="0 0 260 180" className={`w-full ${heightClass}`} role="img" aria-label="Simbol Terminator Flowchart">
        <rect x="55" y="22" width="150" height="48" rx="24" fill="#00F5D4" stroke="#FFFFFF" strokeWidth="3" />
        <text x="130" y="52" textAnchor="middle" fill="#1B1464" fontSize="18" fontWeight="800">
          MULAI
        </text>
        <line x1="130" y1="70" x2="130" y2="104" stroke="#FEE440" strokeWidth="3" strokeDasharray="5 4" />
        <polygon points="123,98 137,98 130,108" fill="#FEE440" />
        <rect x="55" y="112" width="150" height="48" rx="24" fill="#FEE440" stroke="#FFFFFF" strokeWidth="3" />
        <text x="130" y="142" textAnchor="middle" fill="#1B1464" fontSize="18" fontWeight="800">
          SELESAI
        </text>
      </svg>
    );
  }

  if (type === 'process' || type === 'rect_area') {
    return (
      <svg viewBox="0 0 260 180" className={`w-full ${heightClass}`} role="img" aria-label="Simbol Proses Flowchart">
        <rect x="75" y="14" width="110" height="32" rx="16" fill="#2D1B69" stroke="#00F5D4" strokeWidth="2.5" />
        <text x="130" y="35" textAnchor="middle" fill="#00F5D4" fontSize="13" fontWeight="700">
          Mulai
        </text>
        <line x1="130" y1="46" x2="130" y2="68" stroke="#FFFFFF" strokeWidth="2.5" />
        <polygon points="124,64 136,64 130,72" fill="#FFFFFF" />
        <rect x="35" y="74" width="190" height="52" rx="6" fill="#00F5D4" stroke="#FFFFFF" strokeWidth="3" />
        <text x="130" y="98" textAnchor="middle" fill="#1B1464" fontSize="15" fontWeight="800">
          PROSES
        </text>
        <text x="130" y="116" textAnchor="middle" fill="#1B1464" fontSize="13" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          luas = p * l
        </text>
        <line x1="130" y1="126" x2="130" y2="152" stroke="#FFFFFF" strokeWidth="2.5" />
        <polygon points="124,148 136,148 130,158" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === 'decision' || type === 'decision_x' || type === 'kktp_if') {
    const label = type === 'kktp_if' ? 'nilai >= 75?' : type === 'decision_x' ? 'x > 5 ?' : 'Kondisi?';
    const yesLabel = type === 'kktp_if' ? 'Tuntas' : type === 'decision_x' ? 'KANAN' : 'Aksi Ya';
    const noLabel = type === 'kktp_if' ? 'Ulang' : type === 'decision_x' ? 'KIRI' : 'Aksi Tidak';
    return (
      <svg viewBox="0 0 280 190" className={`w-full ${heightClass}`} role="img" aria-label="Simbol Keputusan Belah Ketupat">
        <line x1="140" y1="8" x2="140" y2="26" stroke="#FFFFFF" strokeWidth="2.5" />
        <polygon points="134,22 146,22 140,30" fill="#FFFFFF" />
        {/* Diamond */}
        <polygon points="140,32 214,76 140,120 66,76" fill="#FEE440" stroke="#FFFFFF" strokeWidth="3" />
        <text x="140" y="81" textAnchor="middle" fill="#1B1464" fontSize="15" fontWeight="800" fontFamily="JetBrains Mono, monospace">
          {label}
        </text>
        {/* True branch (right) */}
        <line x1="214" y1="76" x2="246" y2="76" stroke="#00F5D4" strokeWidth="3" />
        <line x1="246" y1="76" x2="246" y2="134" stroke="#00F5D4" strokeWidth="3" />
        <polygon points="240,130 252,130 246,138" fill="#00F5D4" />
        <text x="232" y="66" textAnchor="middle" fill="#00F5D4" fontSize="12" fontWeight="700">
          True
        </text>
        <rect x="206" y="140" width="70" height="34" rx="6" fill="#00F5D4" />
        <text x="241" y="162" textAnchor="middle" fill="#1B1464" fontSize="12" fontWeight="800">
          {yesLabel}
        </text>
        {/* False branch (left) */}
        <line x1="66" y1="76" x2="34" y2="76" stroke="#FF4D6D" strokeWidth="3" />
        <line x1="34" y1="76" x2="34" y2="134" stroke="#FF4D6D" strokeWidth="3" />
        <polygon points="28,130 40,130 34,138" fill="#FF4D6D" />
        <text x="48" y="66" textAnchor="middle" fill="#FF8FA3" fontSize="12" fontWeight="700">
          False
        </text>
        <rect x="4" y="140" width="70" height="34" rx="6" fill="#2D1B69" stroke="#FF4D6D" strokeWidth="2" />
        <text x="39" y="162" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
          {noLabel}
        </text>
      </svg>
    );
  }

  if (type === 'sequencing' || type === 'sequence_swap') {
    const steps =
      type === 'sequence_swap'
        ? ['1. temp = A', '2. A = B', '3. B = temp']
        : ['1. Maju()', '2. Belok Kiri()', '3. Maju()'];
    return (
      <svg viewBox="0 0 260 190" className={`w-full ${heightClass}`} role="img" aria-label="Diagram Alur Runtunan">
        {steps.map((text, idx) => {
          const y = 16 + idx * 58;
          return (
            <g key={text}>
              <rect x="45" y={y} width="170" height="38" rx="8" fill={idx === 1 ? '#FEE440' : '#00F5D4'} stroke="#FFFFFF" strokeWidth="2.5" />
              <text x="130" y={y + 24} textAnchor="middle" fill="#1B1464" fontSize="14" fontWeight="800" fontFamily="JetBrains Mono, monospace">
                {text}
              </text>
              {idx < 2 && (
                <>
                  <line x1="130" y1={y + 38} x2="130" y2={y + 52} stroke="#FFFFFF" strokeWidth="2.5" />
                  <polygon points={`124,${y + 49} 136,${y + 49} 130,${y + 57}`} fill="#FFFFFF" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === 'selection') {
    return (
      <svg viewBox="0 0 260 190" className={`w-full ${heightClass}`} role="img" aria-label="Diagram Percabangan If-Else">
        <polygon points="130,14 198,52 130,90 62,52" fill="#FEE440" stroke="#FFFFFF" strokeWidth="2.5" />
        <text x="130" y="57" textAnchor="middle" fill="#1B1464" fontSize="13" fontWeight="800">
          Depan Terhalang?
        </text>
        <line x1="198" y1="52" x2="225" y2="52" stroke="#00F5D4" strokeWidth="2.5" />
        <line x1="225" y1="52" x2="225" y2="108" stroke="#00F5D4" strokeWidth="2.5" />
        <text x="214" y="42" textAnchor="middle" fill="#00F5D4" fontSize="12" fontWeight="700">Ya</text>
        <rect x="172" y="110" width="84" height="34" rx="6" fill="#00F5D4" />
        <text x="214" y="131" textAnchor="middle" fill="#1B1464" fontSize="12" fontWeight="800">Belok Kanan</text>

        <line x1="62" y1="52" x2="35" y2="52" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="35" y1="52" x2="35" y2="108" stroke="#FFFFFF" strokeWidth="2.5" />
        <text x="46" y="42" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="700">Tidak</text>
        <rect x="6" y="110" width="84" height="34" rx="6" fill="#2D1B69" stroke="#FFFFFF" strokeWidth="2" />
        <text x="48" y="131" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">Tetap Maju</text>
      </svg>
    );
  }

  // looping / loop_for / loop_while / nested_logic
  return (
    <svg viewBox="0 0 280 190" className={`w-full ${heightClass}`} role="img" aria-label="Diagram Alur Perulangan">
      <polygon points="140,18 214,56 140,94 66,56" fill="#FEE440" stroke="#FFFFFF" strokeWidth="2.5" />
      <text x="140" y="61" textAnchor="middle" fill="#1B1464" fontSize="13" fontWeight="800" fontFamily="JetBrains Mono, monospace">
        {type === 'loop_while' ? 'Syarat True?' : 'Ulang <= N?'}
      </text>
      {/* Ya -> Process -> Loop back */}
      <line x1="140" y1="94" x2="140" y2="116" stroke="#00F5D4" strokeWidth="3" />
      <polygon points="134,112 146,112 140,120" fill="#00F5D4" />
      <text x="155" y="109" fill="#00F5D4" fontSize="12" fontWeight="700">Ya</text>
      <rect x="78" y="122" width="124" height="38" rx="8" fill="#00F5D4" stroke="#FFFFFF" strokeWidth="2" />
      <text x="140" y="146" textAnchor="middle" fill="#1B1464" fontSize="13" fontWeight="800" fontFamily="JetBrains Mono, monospace">
        {type === 'nested_logic' ? 'Cek If & Aksi' : 'Jalankan Aksi'}
      </text>
      {/* Loop back arrow */}
      <path d="M 78 141 L 34 141 L 34 56 L 60 56" fill="none" stroke="#00F5D4" strokeWidth="3" />
      <polygon points="56,50 56,62 66,56" fill="#00F5D4" />
      {/* Exit arrow */}
      <line x1="214" y1="56" x2="255" y2="56" stroke="#FF8FA3" strokeWidth="3" />
      <text x="234" y="46" textAnchor="middle" fill="#FF8FA3" fontSize="11" fontWeight="700">Tidak</text>
      <rect x="218" y="88" width="56" height="30" rx="14" fill="#2D1B69" stroke="#FF8FA3" strokeWidth="2" />
      <line x1="255" y1="56" x2="255" y2="88" stroke="#FF8FA3" strokeWidth="3" />
      <text x="246" y="107" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700">Keluar</text>
    </svg>
  );
};
