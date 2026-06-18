/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WalkLog, Base } from '../types';
import { Calendar, CloudSun, Compass, Heart, Leaf } from 'lucide-react';

interface NatureStatsProps {
  logs: WalkLog[];
  bases: Base[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const FOOTSTEP_LEVELS = 10;

function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthLabel(month: number) {
  return `${month + 1}月`;
}

function activityClass(count: number) {
  if (count <= 0) return 'bg-[#EEF1EA] border-[#E1E7DC]';
  if (count === 1) return 'bg-[#CFE6C8] border-[#BBDAB3]';
  if (count === 2) return 'bg-[#92C68D] border-[#7FB775]';
  return 'bg-[#2F7A4F] border-[#2F6C49]';
}

// Generate random position within bounds with better distribution
function randomPosition(maxX: number, maxY: number, index: number) {
  const xSeed = (index * 7919 + 137) % 10000;
  const ySeed = (index * 6271 + 97) % 10000;
  const x = (xSeed / 10000) * maxX + 20;
  const y = (ySeed / 10000) * maxY + 20;
  return { x: Math.min(x, maxX + 20), y: Math.min(y, maxY + 20) };
}

// Generate random rotation between -10 and 10 degrees
function randomRotation(index: number) {
  const seed = index * 137;
  return ((seed % 21) - 10) * 0.5;
}

export default function NatureStats({ logs, bases }: NatureStatsProps) {
  const totalLogs = logs.length;

  const weatherCounts: Record<string, number> = {
    sunny: 0,
    cloudy: 0,
    rainy: 0,
    overcast: 0,
    windy: 0
  };

  logs.forEach((log) => {
    if (weatherCounts[log.weather] !== undefined) {
      weatherCounts[log.weather]++;
    } else {
      weatherCounts.cloudy++;
    }
  });

  const natureConcepts = [
    { label: '鸭子', terms: ['绿头鸭', '小鸭子', '鸭子', '鸭'] },
    { label: '松树', terms: ['落叶松', '樟子松', '松树', '松林', '松涛', '松枝', '松'] },
    { label: '鸢尾花', terms: ['紫色鸢尾花', '野鸢尾', '鸢尾花', '鸢尾'] },
    { label: '丁香花', terms: ['丁香花', '丁香'] },
    { label: '落叶松', terms: ['落叶松'] },
    { label: '河谷', terms: ['河谷'] },
    { label: '沙洲', terms: ['小沙洲', '沙洲'] },
    { label: '长椅', terms: ['松林长椅', '长椅'] },
    { label: '水文站', terms: ['水文站', '水文测报站'] },
    { label: '黑猫', terms: ['黑猫'] },
    { label: '毛毛虫', terms: ['悬丝毛毛虫', '绿色毛毛虫', '棕色毛毛虫', '毛毛虫'] },
    { label: '石头', terms: ['玉色石头', '白色石头', '小石头', '石子', '石头'] },
    { label: '云层', terms: ['三层云', '云分层', '烟缕云', '云层', '白云', '乌云'] },
    { label: '河水', terms: ['河水', '水流', '水面'] },
    { label: '钓鱼人', terms: ['钓鱼人'] },
    { label: '帐篷', terms: ['白色帐篷', '彩色帐篷', '帐篷'] },
    { label: '薄云', terms: ['薄云'] },
    { label: '霞光', terms: ['霞光', '晚霞', '云霞'] }
  ];

  const wordCounts: Record<string, number> = {};
  natureConcepts.forEach(({ label, terms }) => {
    let count = 0;
    logs.forEach(log => {
      let remainingContent = log.content;
      [...terms].sort((a, b) => b.length - a.length).forEach(term => {
        const regex = new RegExp(term, 'g');
        const matches = remainingContent.match(regex);
        if (!matches) return;

        count += matches.length;
        remainingContent = remainingContent.replace(regex, '');
      });
    });
    if (count > 0) {
      wordCounts[label] = count;
    }
  });

  const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
  const topWords = sortedWords.slice(0, 12);
  const maxWordCount = topWords[0]?.[1] ?? 1;

  const weatherLabels: Record<string, { label: string; color: string }> = {
    sunny: { label: '晴天', color: '#d97706' },
    cloudy: { label: '多云', color: '#4f8f68' },
    rainy: { label: '雨天', color: '#3f83a3' },
    overcast: { label: '阴天', color: '#78716c' },
    windy: { label: '有风', color: '#7c8f4d' }
  };

  const weatherDataArray = Object.entries(weatherCounts)
    .filter(([, count]) => count > 0)
    .map(([weather, count]) => ({
      key: weather,
      count,
      percent: totalLogs ? Math.round((count / totalLogs) * 100) : 0,
      ...weatherLabels[weather]
    }));

  let currentAngle = 0;
  const radius = 48;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * radius;

  const logsByDate = logs.reduce<Record<string, number>>((counts, log) => {
    counts[log.date] = (counts[log.date] || 0) + 1;
    return counts;
  }, {});

  const startDate = new Date(2026, 4, 1);
  const endDate = new Date(2026, 11, 31);
  const startOffset = startDate.getDay();
  const calendarStart = new Date(startDate.getTime() - startOffset * DAY_MS);

  const calendarDays = Array.from({ length: 371 }, (_, index) => {
    const date = new Date(calendarStart.getTime() + index * DAY_MS);
    const key = formatDateKey(date);
    const inRange = date >= startDate && date <= endDate;
    return {
      key,
      date,
      count: inRange ? logsByDate[key] ?? 0 : 0,
      inRange
    };
  });

  const monthMarkers = calendarDays
    .filter((day) => day.inRange && day.date.getDate() === 1)
    .map((day) => ({
      key: day.key,
      label: monthLabel(day.date.getMonth()),
      column: Math.floor(calendarDays.findIndex((item) => item.key === day.key) / 7) + 1
    }));

  // Calculate base statistics
  const logsPerBase = bases.map(base => ({
    ...base,
    count: logs.filter(log => log.baseId === base.id).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* 顶部：散步日历（全宽） */}
      <section className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <Calendar className="h-5 w-5 text-[#5F7D58]" />
            散步日历
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6B7E65]">
            记录那些走出家门、与河流、树林和天空相遇的日子。
          </p>
        </div>

        <div className="mr-4 overflow-hidden">
          <div className="mb-2 grid grid-cols-[40px_repeat(53,22px)] gap-1 text-xs text-[#7D8C74]">
            <span />
            {monthMarkers.map((marker) => (
              <span
                key={marker.key}
                className="whitespace-nowrap"
                style={{ gridColumn: `${marker.column + 1} / span 4` }}
              >
                {marker.label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-[40px_repeat(53,22px)] grid-rows-7 gap-1">
            <span className="row-start-2 text-xs text-[#7D8C74]">一</span>
            <span className="row-start-4 text-xs text-[#7D8C74]">三</span>
            <span className="row-start-6 text-xs text-[#7D8C74]">五</span>
            {calendarDays.map((day, index) => (
              <div
                key={day.key}
                title={`${day.key}: ${day.count} 篇日志`}
                className={`flex items-center justify-center ${day.inRange ? '' : 'opacity-0'}`}
                style={{
                  gridColumn: Math.floor(index / 7) + 2,
                  gridRow: (index % 7) + 1
                }}
              >
                <svg width="20" height="20" viewBox="0 0 14 14" className="overflow-visible">
                  <path
                    d="M7 1 L9 3 L8 3 L10 5 L9 5 L11 7 L3 7 L5 5 L4 5 L6 3 L5 3 Z M6 7 L6 10 L8 10 L8 7"
                    fill={day.count === 0 ? '#EEF1EA' : day.count === 1 ? '#CFE6C8' : day.count === 2 ? '#92C68D' : '#2F7A4F'}
                    stroke={day.count === 0 ? '#E1E7DC' : day.count === 1 ? '#BBDAB3' : day.count === 2 ? '#7FB775' : '#2F6C49'}
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#7D8C74]">
            <span>少</span>
            {[0, 1, 2, 3].map((level) => (
              <svg key={level} width="20" height="20" viewBox="0 0 14 14" className="overflow-visible">
                <path
                  d="M7 1 L9 3 L8 3 L10 5 L9 5 L11 7 L3 7 L5 5 L4 5 L6 3 L5 3 Z M6 7 L6 10 L8 10 L8 7"
                  fill={level === 0 ? '#EEF1EA' : level === 1 ? '#CFE6C8' : level === 2 ? '#92C68D' : '#2F7A4F'}
                  stroke={level === 0 ? '#E1E7DC' : level === 1 ? '#BBDAB3' : level === 2 ? '#7FB775' : '#2F6C49'}
                  strokeWidth="0.5"
                />
              </svg>
            ))}
            <span>多</span>
          </div>
        </div>
      </section>

      {/* 底部：双列布局 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 左侧列：散步日志纵览 */}
        <section className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className="rounded-md bg-[#EEF4E8] p-1 text-[#2F5D4A]">
              <Compass className="h-4 w-4" />
            </span>
            散步日志纵览
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#E5E1D6] bg-[#FAF9F1] p-3">
              <p className="font-mono text-[10px] text-[#7D8C74]">BASES</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#243C32]">
                {bases.length} 个
              </p>
              <p className="mt-1 text-xs text-[#6B7E65]">标记基地</p>
            </div>

            <div className="rounded-lg border border-[#E5E1D6] bg-[#FAF9F1] p-3">
              <p className="font-mono text-[10px] text-[#7D8C74]">JOURNALS</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#243C32]">
                {totalLogs} 篇
              </p>
              <p className="mt-1 text-xs text-[#6B7E65]">观察日志</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#DDE5D6] bg-[#F4F7ED] p-4">
            <p className="font-serif text-sm font-semibold text-[#2F5D4A]">
              常去基地
            </p>
            <div className="mt-3 space-y-2.5">
              {logsPerBase.slice(0, 3).filter(base => base.count > 0).map((base) => {
                const maxBaseCount = Math.max(...logsPerBase.map(b => b.count), 1);
                const activeFootsteps = Math.max(
                  1,
                  Math.ceil((base.count / maxBaseCount) * FOOTSTEP_LEVELS)
                );

                return (
                  <div
                    key={base.id}
                    className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(8.5rem,9.75rem)_minmax(12rem,1fr)_2.25rem] sm:items-center sm:gap-1.5"
                  >
                    <span className="min-w-0 truncate text-xs font-medium text-[#66745E]">
                      {base.title.replace(/^(\d)号基地 · /, '0$1号基地 · ')}
                    </span>
                    <div
                      className="flex min-w-0 items-center gap-2 text-[15px] leading-none sm:justify-between"
                      aria-label={`${base.title} 相对访问频次 ${activeFootsteps}/${FOOTSTEP_LEVELS}`}
                    >
                      {Array.from({ length: FOOTSTEP_LEVELS }, (_, index) => (
                        <span
                          key={index}
                          aria-hidden="true"
                          className={
                            index < activeFootsteps
                              ? 'text-[#2F6C49]'
                              : 'text-[#BFD1B8]/55'
                          }
                        >
                          {'👣\uFE0E'}
                        </span>
                      ))}
                    </div>
                    <span className="text-left text-xs font-medium text-[#4D6B50] sm:text-right">
                      {base.count}次
                    </span>
                  </div>
                );
              })}
              {logsPerBase.filter(base => base.count > 0).length === 0 && (
                <p className="text-xs text-[#66745E]">暂无记录。</p>
              )}
            </div>
          </div>
        </section>

        {/* 右侧列：自然意象 */}
        <section className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className="rounded-md bg-[#F4F0E3] p-1 text-[#7A693A]">
              <Leaf className="h-4 w-4" />
            </span>
            自然意象
          </h3>

          <div className="relative h-58 overflow-hidden rounded-lg border border-[#E5E1D6] bg-[#FAF9F1]">
            {topWords.length > 0 ? (
              <svg viewBox="0 0 320 180" className="w-full h-full">
                <defs>
                  <clipPath id="wordCloudClip">
                    <rect x="0" y="0" width="320" height="180" />
                  </clipPath>
                </defs>
                <g clipPath="url(#wordCloudClip)">
                  {topWords.map(([word, count], index) => {
                    const ratio = count / maxWordCount;
                    const fontSize = 14 + ratio * 16;
                    const colors = ['#2F5D4A', '#4D8390', '#7A693A', '#6B7E65', '#5B7055'];
                    const pos = randomPosition(260, 140, index);
                    const rotation = randomRotation(index);

                    return (
                      <text
                        key={word}
                        x={pos.x}
                        y={pos.y}
                        fontSize={fontSize}
                        fontFamily="serif"
                        fontWeight="600"
                        fill={colors[index % colors.length]}
                        opacity={0.65 + ratio * 0.35}
                        transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        title={`"${word}": 出现 ${count} 次`}
                        className="cursor-default"
                      >
                        {word}
                      </text>
                    );
                  })}
                </g>
              </svg>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#7D8C74]">
                等待第一次散步观测。
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
