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

  const tagCounts: Record<string, number> = {};
  logs.forEach((log) => {
    log.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const topTags = sortedTags.slice(0, 18);
  const maxTagCount = topTags[0]?.[1] ?? 1;

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

  const latestDate = logs.length
    ? logs.map((log) => parseDate(log.date)).sort((a, b) => b.getTime() - a.getTime())[0]
    : new Date();
  const endDate = new Date(latestDate);
  const startDate = new Date(endDate.getTime() - 364 * DAY_MS);
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#243C32]">
              <Calendar className="h-5 w-5 text-[#5F7D58]" />
              散步日历
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7E65]">
              最近一年里留下日志的日子，颜色越深，记录越密。
            </p>
          </div>
          <p className="text-xs text-[#7D8C74]">
            {formatDateKey(startDate)} 至 {formatDateKey(endDate)}
          </p>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[760px]">
            <div className="mb-2 grid grid-cols-[36px_repeat(53,12px)] gap-1 text-[10px] text-[#7D8C74]">
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
            <div className="grid grid-cols-[36px_repeat(53,12px)] grid-rows-7 gap-1">
              <span className="row-start-2 text-[10px] text-[#7D8C74]">一</span>
              <span className="row-start-4 text-[10px] text-[#7D8C74]">三</span>
              <span className="row-start-6 text-[10px] text-[#7D8C74]">五</span>
              {calendarDays.map((day, index) => (
                <span
                  key={day.key}
                  title={`${day.key}: ${day.count} 篇日志`}
                  className={`h-3 w-3 rounded-[3px] border ${activityClass(day.count)} ${
                    day.inRange ? '' : 'opacity-0'
                  }`}
                  style={{
                    gridColumn: Math.floor(index / 7) + 2,
                    gridRow: (index % 7) + 1
                  }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-1 text-xs text-[#7D8C74]">
              <span>少</span>
              {[0, 1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`h-3 w-3 rounded-[3px] border ${activityClass(level)}`}
                />
              ))}
              <span>多</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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

          <div className="mt-4 rounded-lg border border-[#DDE5D6] bg-[#F4F7ED] p-3">
            <p className="flex items-center gap-1.5 font-serif text-sm font-semibold text-[#2F5D4A]">
              <Heart className="h-4 w-4 fill-[#DCEBD5] text-[#5F7D58]" />
              人与自然连接
            </p>
            <p className="mt-2 text-xs leading-5 text-[#66745E]">
              水、天、松、木反复出现，形成这份散步笔记的基本气味。
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className="rounded-md bg-[#EEF4E8] p-1 text-[#2F5D4A]">
              <CloudSun className="h-4 w-4" />
            </span>
            天气分布
          </h3>

          <div className="flex items-center gap-5">
            <div className="relative h-32 w-32 shrink-0">
              <svg width="128" height="128" className="-rotate-90">
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="transparent"
                  stroke="#EEF1EA"
                  strokeWidth="14"
                />
                {weatherDataArray.map((item) => {
                  const ratio = item.count / totalLogs;
                  const dashArray = `${ratio * circumference} ${circumference}`;
                  const dashOffset = -currentAngle * circumference;
                  currentAngle += ratio;

                  return (
                    <circle
                      key={item.key}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="14"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-xl font-semibold text-[#243C32]">
                  {totalLogs}
                </span>
                <span className="text-[10px] text-[#7D8C74]">记录</span>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {weatherDataArray.map((item) => (
                <div key={item.key} className="text-xs">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[#66745E]">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="font-mono">{item.count}次</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF1EA]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
              {weatherDataArray.length === 0 && (
                <p className="text-xs text-[#7D8C74]">暂无记录可统计。</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5">
          <h3 className="mb-3 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className="rounded-md bg-[#F4F0E3] p-1 text-[#7A693A]">
              <Leaf className="h-4 w-4" />
            </span>
            自然词云
          </h3>
          <p className="mb-4 text-xs leading-5 text-[#66745E]">
            日志里最常被捕捉到的自然迹象。字号越大，出现越频繁。
          </p>

          <div className="flex min-h-32 flex-wrap content-center items-center gap-x-3 gap-y-2 rounded-lg border border-[#E5E1D6] bg-[#FAF9F1] p-4">
            {topTags.map(([tag, count], index) => {
              const ratio = count / maxTagCount;
              const fontSize = 12 + ratio * 10;
              const colors = ['#2F5D4A', '#4D8390', '#7A693A', '#6B7E65'];

              return (
                <span
                  key={tag}
                  className="font-serif font-semibold"
                  style={{
                    color: colors[index % colors.length],
                    fontSize: `${fontSize}px`,
                    opacity: 0.72 + ratio * 0.28
                  }}
                  title={`${tag}: ${count}次`}
                >
                  #{tag}
                </span>
              );
            })}
            {topTags.length === 0 && (
              <p className="text-xs text-[#7D8C74]">等待第一次散步观测。</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
