/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WalkLog, Base } from '../types';
import { Calendar, CloudSun, Footprints, Heart, Leaf, Route } from 'lucide-react';

interface NatureStatsProps {
  logs: WalkLog[];
  bases: Base[];
  isHockney?: boolean;
  isSanctuary?: boolean;
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

const IMPORTANT_WORD_POSITIONS = [
  { x: 88, y: 52 },
  { x: 232, y: 52 },
  { x: 76, y: 132 },
  { x: 232, y: 132 },
  { x: 160, y: 34 }
];

const SECONDARY_WORD_POSITIONS = [
  { x: 44, y: 88 },
  { x: 276, y: 88 },
  { x: 118, y: 154 },
  { x: 204, y: 154 },
  { x: 46, y: 30 },
  { x: 278, y: 150 }
];

const WORD_CLOUD_COLORS: Record<string, string> = {
  河水: '#2F7890',
  黑猫: '#2E332D',
  鸢尾花: '#75609B',
  水文站: '#AFAF9E',
  鸭子: '#627A42',
  松树: '#2F5D4A',
  丁香花: '#8A6FA3',
  落叶松: '#6F7F4B',
  河谷: '#4D8390',
  沙洲: '#8B7A56',
  长椅: '#766B4F',
  毛毛虫: '#5E7D45',
  石头: '#7E8B78',
  云层: '#6E8E8C',
  钓鱼人: '#5B7055',
  帐篷: '#8A7B5A',
  薄云: '#8EA39A',
  霞光: '#9A7052'
};

const WORD_CLOUD_FALLBACK_COLORS = ['#2F5D4A', '#4D8390', '#7A693A', '#6B7E65', '#5B7055'];
const HOCKNEY_WORD_CLOUD_COLORS: Record<string, string> = {
  河水: '#137FBE',
  黑猫: '#1F2E2C',
  鸢尾花: '#7356B8',
  水文站: '#F3FBF4',
  鸭子: '#4B8F61',
  松树: '#1F7B65',
  丁香花: '#9168C8',
  落叶松: '#6FA85D',
  河谷: '#189FC2',
  沙洲: '#6CB6A8',
  长椅: '#4B8F83',
  毛毛虫: '#49A75F',
  石头: '#77A6A6',
  云层: '#5EAED2',
  钓鱼人: '#287C79',
  帐篷: '#5DB3C4',
  薄云: '#6DBED7',
  霞光: '#3F9FB8'
};
const HOCKNEY_WORD_CLOUD_FALLBACK_COLORS = ['#137FBE', '#17A8B8', '#2AAE80', '#4AC4A4', '#587BC8'];
const SANCTUARY_WORD_CLOUD_COLORS: Record<string, string> = {
  河水: '#4BA3C3',
  黑猫: '#4B4E6D',
  鸢尾花: '#7A5C8C',
  水文站: '#8A8D7A',
  鸭子: '#4E8B5B',
  松树: '#4E8B5B',
  丁香花: '#7A5C8C',
  落叶松: '#4E8B5B',
  河谷: '#4BA3C3',
  沙洲: '#A57845',
  长椅: '#6A624C',
  毛毛虫: '#4E8B5B',
  石头: '#74766F',
  云层: '#7D8492',
  钓鱼人: '#4BA3C3',
  帐篷: '#D98C3A',
  薄云: '#9AA1A5',
  霞光: '#D98C3A'
};
const SANCTUARY_WORD_CLOUD_FALLBACK_COLORS = ['#4BA3C3', '#4E8B5B', '#4B4E6D', '#D98C3A', '#7A5C8C'];
const SANCTUARY_BASE_COLORS: Record<string, string> = {
  'base-1': '#4BA3C3',
  'base-2': '#4E8B5B',
  'base-3': '#4B4E6D',
  'base-4': '#D98C3A',
  'base-5': '#7A5C8C'
};

type WordCloudWord = {
  word: string;
  count: number;
  tier: 'core' | 'important' | 'secondary';
  x: number;
  y: number;
};

function randomRotation(index: number, maxDegrees = 5) {
  const seed = index * 137;
  const normalized = ((seed % 1000) / 1000) * 2 - 1;
  return normalized * maxDegrees;
}

export default function NatureStats({
  logs,
  bases,
  isHockney = false,
  isSanctuary = false
}: NatureStatsProps) {
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
  const wordWhitelist = new Set(natureConcepts.map(({ label }) => label));
  const eligibleWords = sortedWords.filter(
    ([word]) => word.length >= 2 && wordWhitelist.has(word)
  );
  const coreWord = wordCounts['河水']
    ? ([['河水', wordCounts['河水']]] as Array<[string, number]>)
    : [];
  const surroundingWords = eligibleWords.filter(([word]) => word !== '河水');
  const importantWords = surroundingWords.slice(0, 5);
  const secondaryWords = surroundingWords.slice(5, 11);
  const wordCloudWords: WordCloudWord[] = [
    ...coreWord.map(([word, count]) => ({
      word,
      count,
      tier: 'core' as const,
      x: 160,
      y: 92
    })),
    ...importantWords.map(([word, count], index) => ({
      word,
      count,
      tier: 'important' as const,
      ...IMPORTANT_WORD_POSITIONS[index]
    })),
    ...secondaryWords.map(([word, count], index) => ({
      word,
      count,
      tier: 'secondary' as const,
      ...SECONDARY_WORD_POSITIONS[index]
    }))
  ].slice(0, 12);
  const maxWordCount = Math.max(wordCounts['河水'] ?? 1, wordCloudWords[0]?.count ?? 1);

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
      <section
        className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5 ${
          isHockney
            ? 'hockney-card'
            : isSanctuary
              ? 'sanctuary-card sanctuary-calendar-card'
              : ''
        }`}
      >
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
        <section
          className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5 ${
            isHockney
              ? 'hockney-card'
              : isSanctuary
                ? 'sanctuary-card sanctuary-spectrum-card'
                : ''
          }`}
        >
          <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className={`rounded-md p-1 ${isSanctuary ? 'bg-[color-mix(in_srgb,#4E8B5B_12%,white)] text-[#4E8B5B]' : 'bg-[#EEF4E8] text-[#2F5D4A]'}`}>
              <Route className="h-4 w-4" />
            </span>
            散步日志纵览
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg border border-[#E5E1D6] bg-[#FAF9F1] p-3 ${isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-metric-card' : ''}`}>
              <p className="font-mono text-[10px] text-[#7D8C74]">BASES</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#243C32]">
                {bases.length} 个
              </p>
              <p className="mt-1 text-xs text-[#6B7E65]">标记基地</p>
            </div>

            <div className={`rounded-lg border border-[#E5E1D6] bg-[#FAF9F1] p-3 ${isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-metric-card' : ''}`}>
              <p className="font-mono text-[10px] text-[#7D8C74]">JOURNALS</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#243C32]">
                {totalLogs} 篇
              </p>
              <p className="mt-1 text-xs text-[#6B7E65]">观察日志</p>
            </div>
          </div>

          <div className={`mt-4 rounded-lg border border-[#DDE5D6] bg-[#F4F7ED] p-4 ${isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-metric-card' : ''}`}>
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
                const baseColor = SANCTUARY_BASE_COLORS[base.id];

                return (
                  <div
                    key={base.id}
                    className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(8.5rem,9.75rem)_minmax(12rem,1fr)_2.25rem] sm:items-center sm:gap-1.5"
                  >
                    <span
                      className="min-w-0 truncate text-xs font-medium text-[#66745E]"
                      style={isSanctuary && baseColor ? { color: baseColor } : undefined}
                    >
                      {base.title.replace(/^(\d)号基地 · /, '0$1号基地 · ')}
                    </span>
                    <div
                      className="flex min-w-0 items-center gap-2 text-[15px] leading-none sm:justify-between"
                      aria-label={`${base.title} 相对访问频次 ${activeFootsteps}/${FOOTSTEP_LEVELS}`}
                    >
                      {Array.from({ length: FOOTSTEP_LEVELS }, (_, index) => (
                        <Footprints
                          key={index}
                          aria-hidden="true"
                          className={`h-4 w-4 shrink-0 ${
                            index < activeFootsteps ? 'text-[#2F6C49]' : 'text-[#BFD1B8]/55'
                          }`}
                          style={
                            isSanctuary && baseColor
                              ? {
                                  color:
                                    index < activeFootsteps
                                      ? baseColor
                                      : `color-mix(in srgb, ${baseColor} 16%, transparent)`
                                }
                              : undefined
                          }
                        />
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
        <section
          className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5 ${
            isHockney
              ? 'hockney-card'
              : isSanctuary
                ? 'sanctuary-card sanctuary-spectrum-card'
                : ''
          }`}
        >
          <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className={`rounded-md p-1 ${isSanctuary ? 'bg-[color-mix(in_srgb,#7A5C8C_12%,white)] text-[#7A5C8C]' : 'bg-[#F4F0E3] text-[#7A693A]'}`}>
              <Leaf className="h-4 w-4" />
            </span>
            自然意象
          </h3>

          <div
            className={`relative h-58 overflow-hidden rounded-lg border border-[#E5E1D6] bg-[#FAF9F1] ${
              isHockney
                ? 'hockney-card bg-[#E8FAFF]/55'
                : isSanctuary
                  ? 'sanctuary-card bg-[#FFF9EC]/70'
                  : ''
            }`}
          >
            {wordCloudWords.length > 0 ? (
              <svg viewBox="0 0 320 180" className="w-full h-full">
                <defs>
                  <clipPath id="wordCloudClip">
                    <rect x="0" y="0" width="320" height="180" />
                  </clipPath>
                </defs>
                <g clipPath="url(#wordCloudClip)">
                  {wordCloudWords.map(({ word, count, tier, x, y }, index) => {
                    const ratio = Math.min(1, count / maxWordCount);
                    const fontSize =
                      tier === 'core'
                        ? 34
                        : tier === 'important'
                          ? 18 + ratio * 6
                          : 13 + ratio * 4;
                    const color = isHockney
                      ? HOCKNEY_WORD_CLOUD_COLORS[word] ??
                        HOCKNEY_WORD_CLOUD_FALLBACK_COLORS[
                          index % HOCKNEY_WORD_CLOUD_FALLBACK_COLORS.length
                        ]
                      : isSanctuary
                        ? SANCTUARY_WORD_CLOUD_COLORS[word] ??
                          SANCTUARY_WORD_CLOUD_FALLBACK_COLORS[
                            index % SANCTUARY_WORD_CLOUD_FALLBACK_COLORS.length
                          ]
                        : WORD_CLOUD_COLORS[word] ??
                          WORD_CLOUD_FALLBACK_COLORS[index % WORD_CLOUD_FALLBACK_COLORS.length];
                    const rotation = tier === 'core' ? 0 : randomRotation(index, isHockney ? 8 : 5);
                    const driftX = isHockney && tier !== 'core' ? ((index % 3) - 1) * 4 : 0;
                    const driftY = isHockney && tier !== 'core' ? ((index % 2) ? 3 : -3) : 0;

                    return (
                      <text
                        key={word}
                        x={x + driftX}
                        y={y + driftY}
                        fontSize={fontSize}
                        fontFamily="serif"
                        fontWeight="600"
                        fill={color}
                        opacity={tier === 'core' ? 1 : 0.68 + ratio * 0.28}
                        transform={`rotate(${rotation}, ${x + driftX}, ${y + driftY})`}
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
