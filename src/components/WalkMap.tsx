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
  isHockneySummer?: boolean;
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
  isHockneySummer = false,
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

  const hoverCardStyle: React.CSSProperties = {
    ...(isHockneySummer
      ? {
          borderColor: '#0057D9',
          backgroundColor: '#FFF8A6',
          color: '#0057D9',
          boxShadow: '5px 5px 0 rgba(243, 56, 200, 0.32)'
        }
      : {}),
    ...(isSanctuary && hoveredPalette
      ? {
          borderColor: `color-mix(in srgb, ${hoveredPalette.accent} 15%, transparent)`,
          backgroundColor: hoveredPalette.soft
        }
      : {})
  };

  return (
    <section
      className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-3 shadow-sm shadow-emerald-950/5 ${
        isHockneySummer ? 'hockney-summer-map-card' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-map-card' : ''
      }`}
    >
      <div className={`relative overflow-x-auto ${isHockneySummer ? 'hockney-summer-map-viewport' : ''}`}>
        <svg
          viewBox="0 0 820 360"
          className={`block h-[230px] w-full rounded-lg border border-[#E4E8D7] bg-[#F8F7EF] sm:h-[290px] lg:h-[340px] ${
            isHockneySummer ? 'hockney-summer-map-surface' : isHockney ? 'hockney-map-surface' : isSanctuary ? 'sanctuary-map-surface' : ''
          }`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="quietRiver" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor={isHockneySummer ? '#16A9D8' : isHockney ? '#48C7E9' : '#DCEFE9'} />
              <stop offset="52%" stopColor={isHockneySummer ? '#16A9D8' : isHockney ? '#75E2CE' : '#CDE8E1'} />
              <stop offset="100%" stopColor={isHockneySummer ? '#0057D9' : isHockney ? '#1D9ECB' : '#B9DFD8'} />
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

          {isHockneySummer && (
            <g className="hockney-summer-map-blocks" aria-hidden="true">
              <path
                d="M -26 8 C 32 -18 88 12 146 -4 C 206 -20 276 2 318 42 C 276 70 274 106 226 126 C 160 154 58 148 -20 118 C -38 78 -44 34 -26 8 Z"
                fill="#14B85A"
              />
              <path
                d="M 504 -22 C 564 22 632 -28 710 4 C 782 34 830 44 852 96 C 812 132 734 134 668 106 C 626 88 600 56 548 44 C 518 36 498 8 504 -22 Z"
                fill="#F338C8"
              />
              <path
                d="M 568 236 C 620 196 694 204 748 174 C 800 146 846 178 856 234 V 386 H 612 C 596 352 550 314 552 274 C 554 258 558 246 568 236 Z"
                fill="#16A9D8"
              />
              <path
                d="M 270 20 C 334 -12 434 4 506 34 C 572 62 622 88 690 82 C 666 116 606 136 536 126 C 476 118 424 86 360 98 C 296 110 238 100 214 72 C 220 46 242 30 270 20 Z"
                fill="#7AC943"
              />
              <path
                d="M 10 252 C 76 218 144 262 202 276 C 252 288 292 340 354 314 C 332 354 256 374 178 362 C 104 352 28 338 -24 292 Z"
                fill="#FFB000"
              />
              <path
                d="M 360 316 C 418 280 502 286 560 300 C 620 314 670 338 742 302 C 724 342 650 366 560 366 C 488 366 422 338 350 354 Z"
                fill="#8ACB3F"
              />
              <path
                d="M 182 334 C 216 304 274 296 334 318 C 322 346 278 364 218 368 C 190 368 170 356 182 334 Z"
                fill="#B98DEB"
              />
              <path
                d="M 374 142 C 428 104 504 118 566 132 C 622 144 670 132 718 112 C 690 154 620 176 540 170 C 468 164 418 168 356 190 C 344 172 350 156 374 142 Z"
                fill="#CDEB59"
              />
              <g className="hockney-summer-map-trees">
                <path d="M 84 294 C 76 274 86 252 96 235 C 108 254 116 276 106 294 Z" fill="#007A5E" />
                <path d="M 106 292 C 100 274 108 252 118 236 C 130 256 136 276 128 292 Z" fill="#0B8B65" />
                <path d="M 696 246 C 688 222 700 198 714 184 C 730 206 738 230 728 246 Z" fill="#007A5E" />
                <path d="M 724 256 C 716 230 728 204 744 188 C 762 212 770 238 760 256 Z" fill="#006B57" />
                <path d="M 742 264 C 736 240 748 218 762 202 C 778 224 786 246 776 264 Z" fill="#0B8B65" />
              </g>
              <g className="hockney-summer-map-dashes">
                <path d="M 324 18 l 6 6 M 342 24 l 5 7 M 362 18 l 7 5 M 382 30 l 5 7 M 404 20 l 7 5 M 424 32 l 5 7" />
                <path d="M 104 326 l 18 -5 M 132 334 l 20 -6 M 162 342 l 20 -5 M 198 350 l 18 -5" />
                <path d="M 492 334 l 22 -5 M 526 342 l 22 -6 M 560 348 l 24 -5" />
              </g>
            </g>
          )}

          <path
            d="M 430 60 C 520 20 650 35 790 70"
            fill="none"
            stroke={isHockneySummer ? '#14B85A' : isHockney ? '#B7F0D9' : '#DDE8D3'}
            strokeLinecap="round"
            strokeWidth={isHockneySummer ? '74' : isHockney ? '64' : '58'}
            opacity={isHockneySummer ? '0.82' : isHockney ? '0.62' : '0.55'}
            filter={isHockney || isHockneySummer ? 'url(#hockneyWaterNoise)' : undefined}
          />

          <path
            d="M 80 15 C 65 150 115 255 270 260 C 410 264 520 252 650 215 C 725 194 770 170 830 150"
            fill="none"
            stroke="url(#quietRiver)"
            strokeLinecap="round"
            strokeWidth={isHockneySummer ? '52' : isHockney ? '40' : '34'}
            opacity={isHockneySummer ? '0.98' : isHockney ? '0.92' : '1'}
            filter={isHockney || isHockneySummer ? 'url(#hockneyWaterNoise)' : undefined}
          />
          <path
            d="M 85 140 C 155 230 230 300 340 300 C 430 300 485 252 540 220 C 595 188 620 180 660 175 C 710 168 725 145 760 130"
            fill="none"
            stroke={isHockneySummer ? '#0057D9' : isHockney ? '#208E8D' : isSanctuary ? '#9A9B87' : '#8FA884'}
            strokeDasharray={isHockneySummer ? '1 13' : isHockney ? '8 10' : '6 8'}
            strokeLinecap="round"
            strokeWidth={isHockneySummer ? '6' : '2'}
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
                {isHockneySummer && (
                  <rect
                    x={pos.x - (active || hovered ? 25 : 21)}
                    y={pos.y - (active || hovered ? 25 : 21)}
                    width={active || hovered ? 50 : 42}
                    height={active || hovered ? 50 : 42}
                    rx="12"
                    fill={active ? '#F338C8' : hovered ? '#FFB199' : 'rgba(255, 226, 232, 0.94)'}
                    stroke={active ? '#4E8B5B' : '#F338C8'}
                    strokeWidth={active || hovered ? '2.5' : '2'}
                    className="hockney-summer-map-marker transition-all"
                  />
                )}
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
                  r={isHockneySummer ? (active || hovered ? 15 : 12) : isSanctuary ? (active || hovered ? 24 : 19) : active || hovered ? 21 : 17}
                  fill={
                    isHockneySummer
                      ? active
                        ? '#F338C8'
                        : hovered
                          ? '#FF5A2D'
                          : '#FF8A6A'
                      : isHockney
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
                    isHockneySummer
                      ? '#4E8B5B'
                      : isHockney
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
                  strokeWidth={isHockneySummer ? '2' : isSanctuary ? '3.5' : '2.5'}
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
                      : isHockneySummer
                        ? 'fill-[#235F46]'
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
                  style={isHockneySummer ? { fill: '#0057D9' } : isSanctuary ? { fill: palette.text } : { fill: '#4D6B50' }}
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
            style={hoverCardStyle}
          >
            <div
              className="mb-1 flex items-center gap-2 font-medium text-[#243C32]"
              style={isHockneySummer ? { color: '#0057D9' } : undefined}
            >
              <MapPin
                className="h-4 w-4 text-[#5F7D58]"
                style={
                  isSanctuary && hoveredPalette
                    ? { color: hoveredPalette.accent }
                    : isHockneySummer
                      ? { color: '#F338C8' }
                      : undefined
                }
              />
              {hoveredBase.title}
            </div>
            <p
              className="line-clamp-2 text-xs leading-5 text-[#66745E]"
              style={isHockneySummer ? { color: '#0057D9' } : undefined}
            >
              {shortText(hoveredBase.location, 24)}
            </p>
            {hoveredLatestLog && (
              <p
                className="mt-1.5 line-clamp-2 text-xs leading-5 text-stone-700"
                style={isHockneySummer ? { color: '#0057D9' } : undefined}
              >
                <span
                  className="font-mono text-[#5F7D58]"
                  style={isHockneySummer ? { color: '#14B85A' } : undefined}
                >
                  {formatDate(hoveredLatestLog.date)}
                </span>
                ：{shortText(hoveredLatestLog.content)}
              </p>
            )}
            <span
              className="mt-2 inline-flex items-center gap-1 text-xs text-[#5F7D58]"
              style={isHockneySummer ? { color: '#FF5A2D' } : undefined}
            >
              点击查看 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
