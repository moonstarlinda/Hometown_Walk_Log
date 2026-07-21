/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WalkLog, Base } from '../types';
import { BookOpenText, Calendar, CalendarRange, CloudSun, Flame, Leaf, Route, TreePine } from 'lucide-react';
import { PLANTS } from './PlantAtlas';

interface NatureStatsProps {
  logs: WalkLog[];
  bases: Base[];
  isHockney?: boolean;
  isHockneySummer?: boolean;
  isSanctuary?: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function compactDateLabel(date: string) {
  return date ? date.slice(5).replace('-', '.') : '—';
}

function activityTreeClass(count: number) {
  if (count <= 0) return 'text-[#DCE4D9]';
  if (count === 1) return 'text-[#A5C99F]';
  if (count === 2) return 'text-[#72AC70]';
  return 'text-[#2F7A4F]';
}

const SANCTUARY_BASE_COLORS: Record<string, string> = {
  'base-1': '#4BA3C3',
  'base-2': '#4E8B5B',
  'base-3': '#4B4E6D',
  'base-4': '#D98C3A',
  'base-5': '#7A5C8C',
  'base-6': '#8A7A45'
};

function isDoubleTreeBenchBase(base: Base) {
  return /06号基地|双树长椅|雙樹長椅/.test(base.title);
}

function sanctuaryBaseColorForBase(base: Base) {
  if (SANCTUARY_BASE_COLORS[base.id]) return SANCTUARY_BASE_COLORS[base.id];
  if (isDoubleTreeBenchBase(base)) return SANCTUARY_BASE_COLORS['base-6'];
  return undefined;
}

export default function NatureStats({
  logs,
  bases,
  isHockney = false,
  isHockneySummer = false,
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

  const logsByDate = logs.reduce<Record<string, number>>((counts, log) => {
    counts[log.date] = (counts[log.date] || 0) + 1;
    return counts;
  }, {});

  const recordDateKeys = Object.keys(logsByDate).sort();
  const firstRecordKey = recordDateKeys[0] ?? '';
  const latestRecordKey = recordDateKeys.at(-1) ?? '';
  const archiveYear = Number((latestRecordKey || firstRecordKey || '2026').slice(0, 4));
  const recordStartDate = firstRecordKey ? parseDate(firstRecordKey) : null;
  const latestRecordDate = latestRecordKey ? parseDate(latestRecordKey) : null;
  const recordSpanDays = recordStartDate && latestRecordDate
    ? Math.floor((latestRecordDate.getTime() - recordStartDate.getTime()) / DAY_MS) + 1
    : 0;

  const timelineDays = recordStartDate
    ? Array.from({ length: recordSpanDays }, (_, index) => {
        const date = new Date(recordStartDate.getTime() + index * DAY_MS);
        const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
        return { key, date, count: logsByDate[key] ?? 0 };
      })
    : [];

  const timelineMonthMarkers = timelineDays
    .map((day, index) => ({ day, index }))
    .filter(({ day, index }) => index === 0 || day.date.getDate() === 1)
    .map(({ day, index }) => ({
      key: `${day.date.getFullYear()}-${day.date.getMonth() + 1}`,
      label: `${day.date.getMonth() + 1}月`,
      position: timelineDays.length > 1 ? (index / (timelineDays.length - 1)) * 100 : 0
    }));

  const timelineTickCandidates = timelineDays
    .map((day, index) => ({ day, index }))
    .filter(({ day, index }) => (
      index === 0 ||
      index === timelineDays.length - 1 ||
      [1, 10, 20, 30].includes(day.date.getDate())
    ))
    .map(({ day, index }) => ({
      key: day.key,
      label: day.date.getDate(),
      index,
      isEndpoint: index === 0 || index === timelineDays.length - 1,
      position: timelineDays.length > 1 ? (index / (timelineDays.length - 1)) * 100 : 0
    }));
  const timelineTickMarkers = timelineTickCandidates
    .filter((marker) => (
      marker.isEndpoint ||
      !timelineTickCandidates.some((candidate) => (
        candidate.isEndpoint && Math.abs(candidate.index - marker.index) <= 2
      ))
    ))
    .map((marker, index, markers) => ({
      ...marker,
      row: index > 0 && marker.index - markers[index - 1].index <= 2 ? 1 : 0
    }));

  let busiestWeek = { start: '', end: '', count: 0 };
  timelineDays.forEach((day, index) => {
    const windowDays = timelineDays.slice(index, index + 7);
    const count = windowDays.reduce((sum, item) => sum + item.count, 0);
    if (count > busiestWeek.count && windowDays.length > 0) {
      busiestWeek = {
        start: day.key,
        end: windowDays.at(-1)?.key ?? day.key,
        count
      };
    }
  });

  let longestStreak = 0;
  let currentStreak = 0;
  let previousActiveDate: Date | null = null;
  recordDateKeys.forEach((key) => {
    const date = parseDate(key);
    currentStreak = previousActiveDate && date.getTime() - previousActiveDate.getTime() === DAY_MS
      ? currentStreak + 1
      : 1;
    longestStreak = Math.max(longestStreak, currentStreak);
    previousActiveDate = date;
  });

  const mostCommonWeather = [...weatherDataArray].sort((left, right) => right.count - left.count)[0];
  const averageLogsPerWalkDay = recordDateKeys.length > 0 ? totalLogs / recordDateKeys.length : 0;

  const recordCalendarMonths: Array<{
    key: string;
    label: string;
    leadingDays: number;
    days: Array<{ key: string; count: number; inRecordPeriod: boolean }>;
  }> = [];

  if (recordStartDate && latestRecordDate) {
    const cursor = new Date(recordStartDate.getFullYear(), recordStartDate.getMonth(), 1);
    const finalMonth = new Date(latestRecordDate.getFullYear(), latestRecordDate.getMonth(), 1);

    while (cursor <= finalMonth) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const key = `${year}-${`${month + 1}`.padStart(2, '0')}`;
      recordCalendarMonths.push({
        key,
        label: `${year} 年 ${month + 1} 月`,
        leadingDays: new Date(year, month, 1).getDay(),
        days: Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayKey = `${key}-${`${day}`.padStart(2, '0')}`;
          return {
            key: dayKey,
            count: logsByDate[dayKey] ?? 0,
            inRecordPeriod: dayKey >= firstRecordKey && dayKey <= latestRecordKey
          };
        })
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  // Calculate base statistics
  const logsPerBase = bases.map(base => ({
    ...base,
    count: logs.filter(log => log.baseId === base.id).length
  })).sort((a, b) => b.count - a.count);

  const baseRhythms = logsPerBase.filter((base) => base.count > 0).map((base) => {
    const weekCount = Math.max(1, Math.ceil(recordSpanDays / 7));
    const weeklyCounts = Array.from({ length: weekCount }, () => 0);
    logs.filter((log) => log.baseId === base.id).forEach((log) => {
      if (!recordStartDate) return;
      const weekIndex = Math.floor((parseDate(log.date).getTime() - recordStartDate.getTime()) / DAY_MS / 7);
      if (weekIndex >= 0 && weekIndex < weeklyCounts.length) weeklyCounts[weekIndex] += 1;
    });
    const maxCount = Math.max(...weeklyCounts, 1);
    const firstActiveWeek = weeklyCounts.findIndex((count) => count > 0);
    let lastActiveWeek = weeklyCounts.length - 1;
    while (lastActiveWeek > firstActiveWeek && weeklyCounts[lastActiveWeek] === 0) {
      lastActiveWeek -= 1;
    }
    const activeWeeklyCounts = weeklyCounts.slice(firstActiveWeek, lastActiveWeek + 1);
    let points = activeWeeklyCounts.map((count, localIndex) => {
      const weekIndex = firstActiveWeek + localIndex;
      const x = weeklyCounts.length > 1 ? (weekIndex / (weeklyCounts.length - 1)) * 180 : 90;
      const y = 20 - (count / maxCount) * 14;
      return `${x},${y}`;
    }).join(' ');
    if (activeWeeklyCounts.length === 1) {
      const x = weeklyCounts.length > 1 ? (firstActiveWeek / (weeklyCounts.length - 1)) * 180 : 90;
      const y = 20 - (activeWeeklyCounts[0] / maxCount) * 14;
      points = `${Math.max(0, x - 2)},${y} ${Math.min(180, x + 2)},${y}`;
    }
    return { ...base, points };
  });

  return (
    <div className={isHockneySummer ? 'stats-archive-page hockney-summer-page space-y-6' : 'stats-archive-page space-y-6'}>
      <section
        className={`page-hero stats-archive-overview overflow-hidden rounded-2xl border border-[#DDE5D6] bg-[#F4F3E8] p-5 shadow-sm shadow-emerald-950/5 sm:p-6 ${
          isHockneySummer
            ? 'hockney-summer-panel'
              : isHockney
              ? 'hockney-card stats-archive-overview-artwork'
              : isSanctuary
                ? 'sanctuary-card stats-archive-overview-artwork'
                : 'stats-archive-overview-artwork'
        }`}
      >
        <div className="page-hero-copy stats-archive-overview-copy">
          <div className="stats-archive-kicker inline-flex w-fit items-center gap-1.5 rounded-full border border-[#CED9C5] bg-white/55 px-3 py-1.5 text-xs text-[#667A5E]">
            <Route className="h-3.5 w-3.5" /> 散步观察小结
          </div>
          <h1 className="page-hero-title mt-4 font-serif text-3xl font-semibold tracking-tight text-[#243C32] sm:text-4xl">这一季，走过的路</h1>
          <p className="page-hero-description mt-3 font-serif text-sm text-[#61715F] sm:text-base">
            {firstRecordKey ? `${firstRecordKey.replaceAll('-', '.')}—${compactDateLabel(latestRecordKey)} · 一个夏天的观察记录` : '等待第一篇散步日志。'}
          </p>
          {recordSpanDays > 0 && (
            <p className="page-hero-support mt-3 text-sm text-[#5E705D] sm:text-base">
              出门 <strong className="mx-1 font-serif text-xl text-[#2F5D4A]">{recordDateKeys.length}</strong>天
              <span className="mx-2 text-[#A6B1A1]">·</span>写下
              <strong className="mx-1 font-serif text-xl text-[#2F5D4A]">{totalLogs}</strong>篇日志
              <span className="mx-2 text-[#A6B1A1]">·</span>认识
              <strong className="mx-1 font-serif text-xl text-[#2F5D4A]">{PLANTS.length}</strong>种植物
            </p>
          )}
        </div>
      </section>

      {/* 桌面端：连续观察时间带；移动端：按月松树日历 */}
      <section
        className={`stats-timeline-card rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5 ${
          isHockneySummer
            ? 'hockney-summer-panel'
            : isHockney
            ? 'hockney-card'
            : isSanctuary
              ? 'sanctuary-card sanctuary-calendar-card'
              : ''
        }`}
      >
        <div className="mb-5 hidden md:block">
          <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <CalendarRange className="h-5 w-5 text-[#5F7D58]" />
            {recordSpanDays} 天的观察时间带
          </h2>
        </div>

        <div className="hidden md:block">
          {timelineDays.length > 0 ? (
            <>
              <div className="observation-timeline-months relative h-7" aria-hidden="true">
                {timelineMonthMarkers.map((marker, index) => (
                  <span
                    key={marker.key}
                    className="absolute whitespace-nowrap font-serif text-xs text-[#6F7E69]"
                    style={{
                      left: `${marker.position}%`,
                      transform: index === 0 ? undefined : 'translateX(-50%)'
                    }}
                  >
                    {index === 0 && recordStartDate?.getDate() !== 1 ? `${marker.label}（下旬）` : marker.label}
                  </span>
                ))}
              </div>
              <div className="observation-timeline-track relative pt-2">
                <span className="observation-timeline-baseline absolute inset-x-0 bottom-1.5 h-px" aria-hidden="true" />
                <div
                  className="relative grid h-12 items-end gap-[2px]"
                  style={{ gridTemplateColumns: `repeat(${timelineDays.length}, minmax(0, 1fr))` }}
                >
                  {timelineDays.map((day) => (
                    <span
                      key={day.key}
                      role="img"
                      data-count={Math.min(day.count, 3)}
                      aria-label={`${day.key}，${day.count}篇日志`}
                      title={`${day.key} · ${day.count} 篇日志`}
                      className="observation-timeline-mark mx-auto w-full max-w-[6px] rounded-full"
                      style={{ height: `${day.count === 0 ? 6 : 10 + Math.min(day.count, 3) * 6}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="observation-timeline-ticks relative mt-1 h-8" aria-hidden="true">
                {timelineTickMarkers.map((marker) => (
                  <span
                    key={marker.key}
                    className={`observation-timeline-tick absolute text-[10px] tabular-nums text-[#788575] ${marker.isEndpoint ? 'font-semibold' : ''}`}
                    style={{
                      left: `${marker.position}%`,
                      top: `${marker.row * 12}px`,
                      transform: marker.position === 0
                        ? 'translateX(0)'
                        : marker.position === 100
                          ? 'translateX(-100%)'
                          : 'translateX(-50%)'
                    }}
                  >
                    {marker.label}
                  </span>
                ))}
              </div>
              {busiestWeek.count > 0 && (
                <p className="mt-2 flex items-center justify-center gap-2 text-xs text-[#66745E]">
                  <Leaf className="h-4 w-4 text-[#5F7D58]" />
                  最密集的一周：{compactDateLabel(busiestWeek.start)} 至 {compactDateLabel(busiestWeek.end)}，共记录 {busiestWeek.count} 次观察。
                </p>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-[#7D8C74]">等待第一篇散步日志。</p>
          )}
        </div>

        <div className="mb-5 md:hidden">
          <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <Calendar className="h-5 w-5 text-[#5F7D58]" />
            {archiveYear} 散步日历
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:hidden">
          {recordCalendarMonths.length > 0 ? recordCalendarMonths.map((month) => (
            <section key={month.key} className="record-calendar-month rounded-lg border border-[#E2E7DD] bg-[#FAF9F1] p-3 sm:p-4">
              <h3 className="font-serif text-sm font-semibold text-[#304438]">{month.label}</h3>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] text-[#879181]" aria-hidden="true">
                {['日', '一', '二', '三', '四', '五', '六'].map((weekday) => <span key={weekday}>{weekday}</span>)}
              </div>
              <div className="mt-1.5 grid grid-cols-7 gap-1">
                {Array.from({ length: month.leadingDays }, (_, index) => <span key={`blank-${index}`} />)}
                {month.days.map((day) => (
                  <div
                    key={day.key}
                    role="img"
                    data-in-record={day.inRecordPeriod ? 'true' : 'false'}
                    data-count={Math.min(day.count, 3)}
                    aria-label={day.inRecordPeriod ? `${day.key}，${day.count}篇日志` : `${day.key}，记录范围外`}
                    title={day.inRecordPeriod ? `${day.key} · ${day.count} 篇日志` : `${day.key} · 记录范围外`}
                    className={`flex aspect-square items-center justify-center ${
                      day.inRecordPeriod ? activityTreeClass(day.count) : 'text-[#EBEEE8]'
                    }`}
                  >
                    <TreePine aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.7} />
                  </div>
                ))}
              </div>
            </section>
          )) : (
            <p className="py-8 text-center text-sm text-[#7D8C74]">等待第一篇散步日志。</p>
          )}
        </div>
      </section>

      {/* 底部：双列布局 */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        {/* 左侧列：反复走过的地方 */}
        <section
        className={`stats-places-card flex h-full flex-col rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5 ${
            isHockneySummer
              ? 'hockney-summer-panel'
              : isHockney
              ? 'hockney-card'
              : isSanctuary
                ? 'sanctuary-card sanctuary-spectrum-card'
                : ''
          }`}
        >
          <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className={`rounded-md p-1 ${isHockneySummer ? 'hockney-summer-heading-icon' : isSanctuary ? 'bg-[color-mix(in_srgb,#4E8B5B_12%,white)] text-[#4E8B5B]' : 'bg-[#EEF4E8] text-[#2F5D4A]'}`}>
              <Route className="h-4 w-4" />
            </span>
            反复走过的地方
          </h3>

          <div className={`flex flex-1 flex-col rounded-lg border border-[#DDE5D6] bg-[#F4F7ED] p-4 ${isHockneySummer ? 'hockney-summer-metric hockney-summer-metric-green' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-metric-card' : ''}`}>
            <div className="space-y-3">
              {baseRhythms.map((base) => {
                const baseColor = sanctuaryBaseColorForBase(base);

                return (
                  <div
                    key={base.id}
                    className="base-rhythm-row grid grid-cols-[auto_minmax(7.5rem,10rem)_minmax(5rem,1fr)_2.5rem] items-center gap-2"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border-2 border-[#FFFDF7] bg-[#6D8D65] shadow-[0_0_0_1px_#8BA083]"
                      style={isSanctuary && baseColor ? { backgroundColor: baseColor } : undefined}
                      aria-hidden="true"
                    />
                    <span
                      className="min-w-0 truncate text-xs font-medium text-[#66745E]"
                      style={isSanctuary && baseColor ? { color: baseColor } : undefined}
                    >
                      {base.title.replace(/^(\d)号基地 · /, '0$1号基地 · ')}
                    </span>
                    <svg
                      viewBox="0 0 180 24"
                      preserveAspectRatio="none"
                      className="h-6 w-full overflow-visible"
                      role="img"
                      aria-label={`${base.title} 在记录期间的每周访问节奏`}
                    >
                      <polyline
                        points={base.points}
                        fill="none"
                        stroke={isSanctuary && baseColor ? baseColor : 'currentColor'}
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        className="base-rhythm-line text-[#72906B]"
                      />
                    </svg>
                    <span className="text-left text-xs font-medium text-[#4D6B50] sm:text-right">
                      {base.count}次
                    </span>
                  </div>
                );
              })}
              {baseRhythms.length === 0 && (
                <p className="text-xs text-[#66745E]">暂无记录。</p>
              )}
            </div>
          </div>

        </section>

        {/* 右侧列：这一季的节奏 */}
        <section
          className={`stats-season-card flex h-full flex-col rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5 ${
            isHockneySummer
              ? 'hockney-summer-panel'
              : isHockney
              ? 'hockney-card'
              : isSanctuary
                ? 'sanctuary-card sanctuary-spectrum-card'
                : ''
          }`}
        >
          <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-[#243C32]">
            <span className={`rounded-md p-1 ${isHockneySummer ? 'hockney-summer-heading-icon' : isSanctuary ? 'bg-[color-mix(in_srgb,#7A5C8C_12%,white)] text-[#7A5C8C]' : 'bg-[#F4F0E3] text-[#7A693A]'}`}>
              <CalendarRange className="h-4 w-4" />
            </span>
            这一季的节奏
          </h3>
          <div className={`flex flex-1 flex-col justify-center rounded-lg border border-[#E5E1D6] bg-[#FAF9F1] px-4 ${isHockneySummer ? 'hockney-summer-metric' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-metric-card' : ''}`}>
            <div className="season-rhythm-row grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[#E4E6DC] py-4">
              <BookOpenText className="h-6 w-6 text-[#69805E]" />
              <span className="text-xs text-[#66745E]">平均每个散步日</span>
              <strong className="text-right font-serif text-lg font-medium text-[#28483B]">
                {averageLogsPerWalkDay > 0 ? averageLogsPerWalkDay.toFixed(1) : '—'}
                {averageLogsPerWalkDay > 0 && <small className="ml-1 font-sans text-xs font-normal">篇</small>}
              </strong>
            </div>
            <div className="season-rhythm-row grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[#E4E6DC] py-4">
              <CloudSun className="h-6 w-6 text-[#69805E]" />
              <span className="text-xs text-[#66745E]">最常见天气</span>
              <strong className="font-serif text-2xl font-medium text-[#28483B]">{mostCommonWeather?.label ?? '—'}</strong>
            </div>
            <div className="season-rhythm-row grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4">
              <Flame className="h-6 w-6 text-[#69805E]" />
              <span className="text-xs text-[#66745E]">最长连续记录</span>
              <strong className="font-serif text-2xl font-medium text-[#28483B]">{longestStreak}<small className="ml-1 font-sans text-xs font-normal">天</small></strong>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
