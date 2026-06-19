/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { Base, WalkLog } from '../types';

interface WalkMapProps {
  bases: Base[];
  selectedBaseId: string | null;
  onSelectBase: (id: string) => void;
  latestLogPerBase: Record<string, WalkLog | undefined>;
  isHockney?: boolean;
  isSanctuary?: boolean;
}

const SANCTUARY_COLORS: Record<string, { accent: string; soft: string; text: string }> = {
  'base-1': { accent: '#4BA3C3', soft: 'color-mix(in srgb, #4BA3C3 12%, white)', text: '#4BA3C3' },
  'base-2': { accent: '#4E8B5B', soft: 'color-mix(in srgb, #4E8B5B 12%, white)', text: '#4E8B5B' },
  'base-3': { accent: '#4B4E6D', soft: 'color-mix(in srgb, #4B4E6D 12%, white)', text: '#4B4E6D' },
  'base-4': { accent: '#D98C3A', soft: 'color-mix(in srgb, #D98C3A 12%, white)', text: '#D98C3A' },
  'base-5': { accent: '#7A5C8C', soft: 'color-mix(in srgb, #7A5C8C 12%, white)', text: '#7A5C8C' }
};

function sanctuaryColorForBase(baseId: string) {
  return SANCTUARY_COLORS[baseId] ?? { accent: '#7A7F68', soft: '#ECEBDD', text: '#5C624D' };
}

export default function WalkMap({
  bases,
  selectedBaseId,
  onSelectBase,
  latestLogPerBase,
  isHockney = false,
  isSanctuary = false
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
  const hoveredLatestLog = hoveredBase ? latestLogPerBase[hoveredBase.id] : undefined;
  const hoveredPalette = hoveredBase ? sanctuaryColorForBase(hoveredBase.id) : undefined;

  const formatDate = (date: string) => date.replace(/-/g, '.');

  const shortText = (text: string, maxLength = 42) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  return (
    <section
      className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-3 shadow-sm shadow-emerald-950/5 ${
        isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-map-card' : ''
      }`}
    >
      <div className="relative overflow-x-auto">
        <svg
          viewBox="0 0 820 360"
          className={`block h-[230px] w-full rounded-lg border border-[#E4E8D7] bg-[#F8F7EF] sm:h-[290px] lg:h-[340px] ${
            isHockney ? 'hockney-map-surface' : isSanctuary ? 'sanctuary-map-surface' : ''
          }`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="quietRiver" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor={isHockney ? '#48C7E9' : '#DCEFE9'} />
              <stop offset="52%" stopColor={isHockney ? '#75E2CE' : '#CDE8E1'} />
              <stop offset="100%" stopColor={isHockney ? '#1D9ECB' : '#B9DFD8'} />
            </linearGradient>
            <filter id="hockneyWaterNoise" x="-12%" y="-40%" width="124%" height="180%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.018 0.05"
                numOctaves="2"
                seed="7"
                result="noise"
              />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" />
            </filter>
            <filter id="hockneyMarkerGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#50B4FF" floodOpacity="0.42" />
            </filter>
          </defs>

          <path
            d="M 430 60 C 520 20 650 35 790 70"
            fill="none"
            stroke={isHockney ? '#B7F0D9' : '#DDE8D3'}
            strokeLinecap="round"
            strokeWidth={isHockney ? '64' : '58'}
            opacity={isHockney ? '0.62' : '0.55'}
            filter={isHockney ? 'url(#hockneyWaterNoise)' : undefined}
          />

          <path
            d="M 80 15 C 65 150 115 255 270 260 C 410 264 520 252 650 215 C 725 194 770 170 830 150"
            fill="none"
            stroke="url(#quietRiver)"
            strokeLinecap="round"
            strokeWidth={isHockney ? '40' : '34'}
            opacity={isHockney ? '0.92' : '1'}
            filter={isHockney ? 'url(#hockneyWaterNoise)' : undefined}
          />
          <path
            d="M 85 140 C 155 230 230 300 340 300 C 430 300 485 252 540 220 C 595 188 620 180 660 175 C 710 168 725 145 760 130"
            fill="none"
            stroke={isHockney ? '#208E8D' : isSanctuary ? '#9A9B87' : '#8FA884'}
            strokeDasharray={isHockney ? '8 10' : '6 8'}
            strokeLinecap="round"
            strokeWidth="2"
          />

          <text x="95" y="65" className="fill-[#6F8A73] text-sm">
            河流
          </text>
          <text x="255" y="330" className="fill-[#6F8A73] text-sm">
            常走路线
          </text>

          {bases.map((base, index) => {
            const pos = getPosition(base.id, index);
            const active = selectedBaseId === base.id;
            const hovered = hoveredBaseId === base.id;
            const name = base.title.split(' 路 ')[1] || base.title;
            const palette = sanctuaryColorForBase(base.id);

            return (
              <g
                key={base.id}
                className="cursor-pointer"
                onClick={() => onSelectBase(base.id)}
                onMouseEnter={() => setHoveredBaseId(base.id)}
                onMouseLeave={() => setHoveredBaseId(null)}
              >
                {isSanctuary && (active || hovered) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={active ? 38 : 32}
                    fill={`color-mix(in srgb, ${palette.accent} ${active ? 8 : 6}%, transparent)`}
                    className="pointer-events-none transition-all"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSanctuary ? (active || hovered ? 24 : 19) : active || hovered ? 21 : 17}
                  fill={
                    isHockney
                      ? active
                        ? '#1F9CC1'
                        : 'rgba(255,255,255,0.82)'
                      : isSanctuary
                        ? active
                          ? palette.accent
                          : hovered
                            ? `color-mix(in srgb, ${palette.accent} 18%, white)`
                            : palette.soft
                      : active
                        ? '#2F5D4A'
                        : '#FFFDF7'
                  }
                  stroke={
                    isHockney
                      ? active
                        ? '#0D7192'
                        : '#47B8D2'
                      : isSanctuary
                        ? hovered
                          ? `color-mix(in srgb, ${palette.accent} 88%, black)`
                          : palette.accent
                      : active
                        ? '#2F5D4A'
                        : '#7FA06E'
                  }
                  strokeWidth={isSanctuary ? '3.5' : '2.5'}
                  filter={isHockney ? 'url(#hockneyMarkerGlow)' : undefined}
                  className="transition-all"
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  className={`pointer-events-none text-sm font-semibold ${
                    active
                      ? 'fill-[#FFFDF4]'
                      : isSanctuary
                        ? 'fill-[#243C32]'
                        : 'fill-[#3F5F43]'
                  }`}
                >
                  {index + 1}
                </text>
                <text
                  x={pos.x}
                  y={pos.y - 28}
                  textAnchor="middle"
                  className="pointer-events-none text-sm font-medium"
                  style={isSanctuary ? { fill: palette.text } : { fill: '#4D6B50' }}
                >
                  {name}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredBase && (
          <div
            className={`map-hover-card pointer-events-none bottom-3 left-3 right-3 z-10 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7]/95 p-3 text-sm text-stone-700 shadow-sm shadow-emerald-950/10 md:right-auto md:max-w-sm ${
              isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card' : ''
            }`}
            style={
              isSanctuary && hoveredPalette
                ? {
                    borderColor: `color-mix(in srgb, ${hoveredPalette.accent} 15%, transparent)`,
                    backgroundColor: hoveredPalette.soft
                  }
                : undefined
            }
          >
            <div className="mb-1 flex items-center gap-2 font-medium text-[#243C32]">
              <MapPin
                className="h-4 w-4 text-[#5F7D58]"
                style={isSanctuary && hoveredPalette ? { color: hoveredPalette.accent } : undefined}
              />
              {hoveredBase.title}
            </div>
            <p className="line-clamp-2 text-xs leading-5 text-[#66745E]">
              {shortText(hoveredBase.location, 24)}
            </p>
            {hoveredLatestLog && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-stone-700">
                <span className="font-mono text-[#5F7D58]">
                  {formatDate(hoveredLatestLog.date)}
                </span>
                ：{shortText(hoveredLatestLog.content)}
              </p>
            )}
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#5F7D58]">
              点击查看 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
