import React from 'react';

interface RobotMascotProps {
  className?: string;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({ className = 'w-56 h-56' }) => {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      role="img"
      aria-label="Ilustrasi Robot Cyborg AlgoQuest"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B278C" />
          <stop offset="100%" stopColor="#20155A" />
        </linearGradient>
        <linearGradient id="visorGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0E0A38" />
          <stop offset="100%" stopColor="#1B1464" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="110" cy="204" rx="52" ry="9" fill="#0B072D" opacity="0.65" />

      {/* Antenna */}
      <rect x="106" y="18" width="8" height="22" rx="3" fill="#00F5D4" />
      <circle cx="110" cy="14" r="9" fill="#FEE440" stroke="#1B1464" strokeWidth="3" />
      <circle cx="108" cy="12" r="2.5" fill="#FFFFFF" />

      {/* Ears / Side Sensors */}
      <rect x="34" y="64" width="16" height="36" rx="6" fill="#FEE440" stroke="#120D47" strokeWidth="4" />
      <rect x="170" y="64" width="16" height="36" rx="6" fill="#FEE440" stroke="#120D47" strokeWidth="4" />

      {/* Head */}
      <rect
        x="48"
        y="38"
        width="124"
        height="84"
        rx="20"
        fill="url(#bodyGrad)"
        stroke="#00F5D4"
        strokeWidth="4"
      />

      {/* Visor */}
      <rect
        x="62"
        y="54"
        width="96"
        height="48"
        rx="12"
        fill="url(#visorGrad)"
        stroke="#4B3B9E"
        strokeWidth="2.5"
      />

      {/* Pixel Eyes */}
      <rect x="78" y="68" width="18" height="20" rx="4" fill="#00F5D4" />
      <rect x="124" y="68" width="18" height="20" rx="4" fill="#00F5D4" />
      <rect x="82" y="71" width="6" height="6" rx="1" fill="#FFFFFF" />
      <rect x="128" y="71" width="6" height="6" rx="1" fill="#FFFFFF" />

      {/* Smile */}
      <path
        d="M 96 93 Q 110 100 124 93"
        fill="none"
        stroke="#FEE440"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Neck */}
      <rect x="92" y="122" width="36" height="10" rx="3" fill="#00F5D4" />

      {/* Left Arm */}
      <rect x="32" y="138" width="22" height="44" rx="10" fill="#2D1B69" stroke="#00F5D4" strokeWidth="3.5" />
      <circle cx="43" cy="184" r="9" fill="#FEE440" stroke="#120D47" strokeWidth="3" />

      {/* Right Arm */}
      <rect x="166" y="138" width="22" height="44" rx="10" fill="#2D1B69" stroke="#00F5D4" strokeWidth="3.5" />
      <circle cx="177" cy="184" r="9" fill="#FEE440" stroke="#120D47" strokeWidth="3" />

      {/* Torso */}
      <rect
        x="56"
        y="130"
        width="108"
        height="64"
        rx="16"
        fill="url(#bodyGrad)"
        stroke="#00F5D4"
        strokeWidth="4"
      />

      {/* Chest Core Panel */}
      <rect x="74" y="144" width="72" height="36" rx="8" fill="#120D47" stroke="#FEE440" strokeWidth="2.5" />
      <text
        x="110"
        y="167"
        textAnchor="middle"
        fill="#00F5D4"
        fontSize="16"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
      >
        {'{ }'}
      </text>
    </svg>
  );
};
