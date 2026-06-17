/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { Base } from '../types';

interface WalkMapProps {
  bases: Base[];
  selectedBaseId: string | null;
  onSelectBase: (id: string) => void;
  latestLogPerBase: Record<string, string | null>;
}

export default function WalkMap({
  bases,
  selectedBaseId,
  onSelectBase,
  latestLogPerBase
}: WalkMapProps) {
  const [hoveredBaseId, setHoveredBaseId] = useState<string | null>(null);

  const fixedPositions: Record<string, { x: number; y: number }> = {
    'base-1': { x: 540, y: 220 },
    'base-2': { x: 660, y: 175 },
    'base-3': { x: 760, y: 130 },
    'base-4': { x: 340, y: 300 },
    'base-5': { x: 85, y: 140 }
  };

  const getPosition = (id: string, index: number) => {
    if (fixedPositions[id]) return fixedPositions[id];

    const angle = (index / Math.max(bases.length, 1)) * Math.PI * 2;
    return {
      x: 400 + Math.cos(angle) * 260,
      y: 200 + Math.sin(angle) * 120
    };
  };

  const hoveredBase = hoveredBaseId
    ? bases.find((base) => base.id === hoveredBaseId)
    : null;

  return (
    <section className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-3 shadow-sm shadow-emerald-950/5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-[#243C32]">
            <Compass className="h-4 w-4 text-[#5F7D58]" />
            散步路线
          </h2>
          <p className="mt-1 text-xs text-[#6B7E65]">一个粗略的位置关系图。</p>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          viewBox="0 0 820 360"
          className="h-[220px] min-w-[640px] rounded-lg border border-[#E4E8D7] bg-[#F8F7EF]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="quietRiver" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#DCEFE9" />
              <stop offset="100%" stopColor="#B9DFD8" />
            </linearGradient>
          </defs>

          <path
            d="M 430 60 C 520 20 650 35 790 70"
            fill="none"
            stroke="#DDE8D3"
            strokeLinecap="round"
            strokeWidth="58"
            opacity="0.55"
          />

          <path
            d="M 80 15 C 65 150 115 255 270 260 C 410 264 520 252 650 215 C 725 194 770 170 830 150"
            fill="none"
            stroke="url(#quietRiver)"
            strokeLinecap="round"
            strokeWidth="34"
          />
          <path
            d="M 85 140 C 155 230 230 300 340 300 C 430 300 485 252 540 220 C 595 188 620 180 660 175 C 710 168 725 145 760 130"
            fill="none"
            stroke="#8FA884"
            strokeDasharray="6 8"
            strokeLinecap="round"
            strokeWidth="2"
          />

          <text x="95" y="65" className="fill-[#6F8A73] text-[11px]">
            河流
          </text>
          <text x="255" y="330" className="fill-[#6F8A73] text-[11px]">
            常走路线
          </text>

          {bases.map((base, index) => {
            const pos = getPosition(base.id, index);
            const active = selectedBaseId === base.id;
            const hovered = hoveredBaseId === base.id;
            const name = base.title.split(' · ')[1] || base.title.split(' 路 ')[1] || base.title;

            return (
              <g
                key={base.id}
                className="cursor-pointer"
                onClick={() => onSelectBase(base.id)}
                onMouseEnter={() => setHoveredBaseId(base.id)}
                onMouseLeave={() => setHoveredBaseId(null)}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={active || hovered ? 17 : 14}
                  fill={active ? '#2F5D4A' : '#FFFDF7'}
                  stroke={active ? '#2F5D4A' : '#7FA06E'}
                  strokeWidth="2"
                  className="transition-all"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className={`pointer-events-none text-[11px] font-semibold ${
                    active ? 'fill-[#FFFDF4]' : 'fill-[#3F5F43]'
                  }`}
                >
                  {index + 1}
                </text>
                <text
                  x={pos.x}
                  y={pos.y - 24}
                  textAnchor="middle"
                  className="pointer-events-none fill-[#4D6B50] text-[11px]"
                >
                  {name}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredBase && (
          <div className="mt-3 rounded-lg border border-[#DDE5D6] bg-[#F4F7ED] p-3 text-sm text-stone-700 md:absolute md:bottom-3 md:left-3 md:mt-0 md:max-w-sm md:bg-[#FFFDF7]/95">
            <div className="mb-1 flex items-center gap-2 font-medium text-[#243C32]">
              <MapPin className="h-4 w-4 text-[#5F7D58]" />
              {hoveredBase.title}
            </div>
            <p className="line-clamp-2 text-xs leading-5 text-[#66745E]">
              {latestLogPerBase[hoveredBase.id] || hoveredBase.location}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#5F7D58]">
              点开查看 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
