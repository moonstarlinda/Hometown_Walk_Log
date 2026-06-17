/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  Cloud,
  CloudFog,
  CloudRain,
  Compass,
  Filter,
  Map,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sun,
  Trash2,
  Wind
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { INITIAL_BASES, INITIAL_LOGS } from './data';
import { Base, WalkLog } from './types';
import AddBaseModal from './components/AddBaseModal';
import AddLogModal from './components/AddLogModal';
import NatureStats from './components/NatureStats';
import WalkMap from './components/WalkMap';
import openingWalkingIntoForest from './assets/images/opening_walking_into_the_forest.jpeg';

const BASES_STORAGE_KEY = 'hometown_bases';
const LOGS_STORAGE_KEY = 'hometown_logs';
const INTRO_STORAGE_KEY = 'hometown_opening_intro_seen';

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [bases, setBases] = useState<Base[]>([]);
  const [logs, setLogs] = useState<WalkLog[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bases' | 'timeline' | 'stats'>('bases');
  const [showAddLog, setShowAddLog] = useState(false);
  const [showAddBase, setShowAddBase] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBaseId, setFilterBaseId] = useState('all');
  const [filterWeather, setFilterWeather] = useState('all');

  useEffect(() => {
    const savedBases = localStorage.getItem(BASES_STORAGE_KEY);
    const savedLogs = localStorage.getItem(LOGS_STORAGE_KEY);

    if (savedBases && savedLogs) {
      setBases(JSON.parse(savedBases));
      setLogs(JSON.parse(savedLogs));
      return;
    }

    setBases(INITIAL_BASES);
    setLogs(INITIAL_LOGS);
    localStorage.setItem(BASES_STORAGE_KEY, JSON.stringify(INITIAL_BASES));
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
  }, []);

  useEffect(() => {
    const introSeen = localStorage.getItem(INTRO_STORAGE_KEY) === 'true';
    setShowIntro(!introSeen && !prefersReducedMotion);
  }, [prefersReducedMotion]);

  const finishIntro = useCallback(() => {
    localStorage.setItem(INTRO_STORAGE_KEY, 'true');
    setShowIntro(false);
  }, []);

  const replayIntro = useCallback(() => {
    setShowIntro(true);
  }, []);

  useEffect(() => {
    if (!showIntro) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(finishIntro, 1600);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [finishIntro, showIntro]);

  const saveStateToStorage = (nextBases: Base[], nextLogs: WalkLog[]) => {
    localStorage.setItem(BASES_STORAGE_KEY, JSON.stringify(nextBases));
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(nextLogs));
  };

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)),
    [logs]
  );

  const activeBaseDetails = selectedBaseId
    ? bases.find((base) => base.id === selectedBaseId) ?? null
    : null;

  const activeBaseLogs = useMemo(() => {
    if (!selectedBaseId) return [];
    return sortedLogs.filter((log) => log.baseId === selectedBaseId);
  }, [selectedBaseId, sortedLogs]);

  const latestLog = sortedLogs[0] ?? null;
  const latestBase = latestLog
    ? bases.find((base) => base.id === latestLog.baseId) ?? null
    : null;

  const latestLogPerBase = useMemo(() => {
    const latest: Record<string, string | null> = {};
    bases.forEach((base) => {
      latest[base.id] =
        sortedLogs.find((log) => log.baseId === base.id)?.content ?? null;
    });
    return latest;
  }, [bases, sortedLogs]);

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortedLogs.filter((log) => {
      const matchesSearch =
        !query ||
        log.content.toLowerCase().includes(query) ||
        log.weatherText.toLowerCase().includes(query) ||
        log.tags.some((tag) => tag.toLowerCase().includes(query));

      const matchesBase = filterBaseId === 'all' || log.baseId === filterBaseId;
      const matchesWeather = filterWeather === 'all' || log.weather === filterWeather;

      return matchesSearch && matchesBase && matchesWeather;
    });
  }, [filterBaseId, filterWeather, searchQuery, sortedLogs]);

  const handleAddLog = (newLogData: Omit<WalkLog, 'id'>) => {
    const newLog: WalkLog = {
      ...newLogData,
      id: `log-${Date.now()}`
    };
    const nextLogs = [newLog, ...logs];
    setLogs(nextLogs);
    saveStateToStorage(bases, nextLogs);
    setShowAddLog(false);
    setSelectedBaseId(newLog.baseId);
    setActiveTab('bases');
  };

  const handleAddBase = (
    newBaseData: Omit<Base, 'id' | 'coverImage'> & { coverType: string }
  ) => {
    const covers: Record<string, string> = {
      woodland:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600',
      river:
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600',
      mountain:
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
      lake:
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600',
      meadow:
        'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=600'
    };

    const newBase: Base = {
      id: `base-${Date.now()}`,
      title: newBaseData.title,
      subtitle: newBaseData.subtitle,
      description: newBaseData.description,
      location: newBaseData.location,
      coverImage: covers[newBaseData.coverType] || covers.woodland
    };

    const nextBases = [...bases, newBase];
    setBases(nextBases);
    saveStateToStorage(nextBases, logs);
    setShowAddBase(false);
    setSelectedBaseId(newBase.id);
    setActiveTab('bases');
  };

  const handleDeleteLog = (logId: string) => {
    if (!confirm('确定删除这条散步记录吗？')) return;
    const nextLogs = logs.filter((log) => log.id !== logId);
    setLogs(nextLogs);
    saveStateToStorage(bases, nextLogs);
  };

  const handleResetData = () => {
    if (!confirm('确定恢复为默认示例数据吗？你新增的记录会被清空。')) return;
    setBases(INITIAL_BASES);
    setLogs(INITIAL_LOGS);
    setSelectedBaseId(null);
    localStorage.setItem(BASES_STORAGE_KEY, JSON.stringify(INITIAL_BASES));
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
  };

  const getLogsForBase = (baseId: string) =>
    sortedLogs.filter((log) => log.baseId === baseId);

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'cloudy':
        return <Cloud className="h-4 w-4 text-[#6D8D71]" />;
      case 'overcast':
        return <CloudFog className="h-4 w-4 text-stone-500" />;
      case 'rainy':
        return <CloudRain className="h-4 w-4 text-[#4D8390]" />;
      case 'windy':
        return <Wind className="h-4 w-4 text-[#5F7D58]" />;
      default:
        return <Sun className="h-4 w-4 text-amber-500" />;
    }
  };

  const showHome = activeTab === 'bases' && !selectedBaseId;

  return (
    <div className="min-h-screen bg-[#F5F4EC] text-stone-800 antialiased">
      <header className="sticky top-0 z-40 border-b border-[#DDE5D6] bg-[#FAF9F1]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedBaseId(null);
                setActiveTab('bases');
              }}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2F5D4A] text-[#F8F4DD] shadow-sm">
                <Compass className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-lg font-semibold text-[#243C32]">
                  散步笔记
                </span>
                <span className="block truncate text-xs text-[#6B7E65]">
                  家附近的路、天气和慢慢变化的景物
                </span>
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={replayIntro}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#2F5D4A] transition-colors hover:bg-[#EEF4E8]"
              >
                <RefreshCw className="h-4 w-4" />
                重播开场
              </button>
              <button
                type="button"
                onClick={() => setShowAddLog(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D4A] px-3 py-2 text-xs font-medium text-[#FFFDF4] shadow-sm transition-colors hover:bg-[#254938]"
              >
                <Plus className="h-4 w-4" />
                记录
              </button>
              <button
                type="button"
                onClick={handleResetData}
                title="恢复默认数据"
                className="rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] p-2 text-[#6B7E65] transition-colors hover:bg-[#F1F5EA] hover:text-[#2F5D4A]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <nav className="flex gap-1 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] p-1 text-xs shadow-sm shadow-emerald-950/5">
            <TabButton
              active={activeTab === 'bases' && !selectedBaseId}
              icon={<Map className="h-4 w-4" />}
              label="首页"
              onClick={() => {
                setSelectedBaseId(null);
                setActiveTab('bases');
              }}
            />
            <TabButton
              active={activeTab === 'timeline'}
              icon={<BookOpen className="h-4 w-4" />}
              label="日志"
              onClick={() => {
                setSelectedBaseId(null);
                setActiveTab('timeline');
              }}
            />
            <TabButton
              active={activeTab === 'stats'}
              icon={<BarChart3 className="h-4 w-4" />}
              label="整理"
              onClick={() => {
                setSelectedBaseId(null);
                setActiveTab('stats');
              }}
            />
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {showIntro && showHome && (
          <OpeningIntro
            prefersReducedMotion={Boolean(prefersReducedMotion)}
            onSkip={finishIntro}
          />
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        {showHome && (
          <section className="space-y-8">
            <TodayObservation
              base={latestBase}
              log={latestLog}
              getWeatherIcon={getWeatherIcon}
              onOpenBase={() => latestBase && setSelectedBaseId(latestBase.id)}
            />

            <section className="space-y-3">
              <SectionHeading
                title="散步路线"
                description="不是地图服务，只是一张平时走路时脑子里的草图。"
              />
              <WalkMap
                bases={bases}
                selectedBaseId={selectedBaseId}
                onSelectBase={setSelectedBaseId}
                latestLogPerBase={latestLogPerBase}
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <SectionHeading
                  title="五个基地"
                  description="每个地点先是一张照片，然后才是一段描述。"
                />
                <button
                  type="button"
                  onClick={() => setShowAddBase(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#2F5D4A] transition-colors hover:bg-[#EEF4E8]"
                >
                  <Plus className="h-4 w-4" />
                  新地点
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bases.map((base) => (
                  <BaseNoteCard
                    key={base.id}
                    base={base}
                    latestText={latestLogPerBase[base.id] ?? base.description}
                    onClick={() => setSelectedBaseId(base.id)}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeading
                title="最近观察"
                description="按时间倒序留下来的自然观察。"
              />
              <div className="space-y-4">
                {sortedLogs.slice(0, 5).map((log) => {
                  const base = bases.find((item) => item.id === log.baseId);
                  return (
                    <RecentObservation
                      key={log.id}
                      log={log}
                      base={base}
                      getWeatherIcon={getWeatherIcon}
                      onOpenBase={() => {
                        setSelectedBaseId(log.baseId);
                        setActiveTab('bases');
                      }}
                    />
                  );
                })}
              </div>
            </section>
          </section>
        )}

        {activeBaseDetails && (
          <BaseDetail
            base={activeBaseDetails}
            logs={activeBaseLogs}
            getWeatherIcon={getWeatherIcon}
            onBack={() => setSelectedBaseId(null)}
            onAddLog={() => setShowAddLog(true)}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {activeTab === 'timeline' && (
          <section className="space-y-5">
            <div className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-4 shadow-sm shadow-emerald-950/5">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <label className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A987E]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="搜索记录、天气或标签"
                    className="w-full rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#7FA06E]"
                  />
                </label>
                <select
                  value={filterBaseId}
                  onChange={(event) => setFilterBaseId(event.target.value)}
                  className="rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-3 py-2.5 text-sm outline-none focus:border-[#7FA06E]"
                >
                  <option value="all">所有地点</option>
                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.title}
                    </option>
                  ))}
                </select>
                <select
                  value={filterWeather}
                  onChange={(event) => setFilterWeather(event.target.value)}
                  className="rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-3 py-2.5 text-sm outline-none focus:border-[#7FA06E]"
                >
                  <option value="all">所有天气</option>
                  <option value="sunny">晴</option>
                  <option value="cloudy">多云</option>
                  <option value="rainy">雨</option>
                  <option value="overcast">阴</option>
                  <option value="windy">风</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6B7E65]">
              <Filter className="h-4 w-4" />
              找到 {filteredLogs.length} 条记录
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const base = bases.find((item) => item.id === log.baseId);
                return (
                  <LogCard
                    key={log.id}
                    log={log}
                    base={base}
                    getWeatherIcon={getWeatherIcon}
                    onOpenBase={() => {
                      setSelectedBaseId(log.baseId);
                      setActiveTab('bases');
                    }}
                    onDelete={() => handleDeleteLog(log.id)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'stats' && <NatureStats logs={logs} bases={bases} />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-xs text-[#7D8C74] sm:px-6 lg:px-8">
        2026 散步笔记
      </footer>

      <AnimatePresence>
        {showAddLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AddLogModal
              bases={bases}
              selectedBaseId={selectedBaseId}
              onClose={() => setShowAddLog(false)}
              onAddLog={handleAddLog}
            />
          </motion.div>
        )}

        {showAddBase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AddBaseModal onClose={() => setShowAddBase(false)} onAddBase={handleAddBase} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const OpeningIntro: React.FC<{
  prefersReducedMotion: boolean;
  onSkip: () => void;
}> = ({ prefersReducedMotion, onSkip }) => {
  return (
    <motion.section
      className="fixed inset-0 z-[80] isolate flex min-h-svh overflow-hidden bg-[#243C32]"
      aria-label="乡野漫步开场"
      initial={prefersReducedMotion ? false : { opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.img
        src={openingWalkingIntoForest}
        alt="林荫散步路"
        className="absolute inset-0 h-full w-full object-cover object-center"
        initial={prefersReducedMotion ? false : { scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.075 }}
        transition={{ duration: 1.75, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,60,50,0.46)_0%,rgba(36,60,50,0.2)_36%,rgba(36,60,50,0.02)_68%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#243C32]/18 to-transparent" />

      
        <button
          type="button"
          onClick={onSkip}
          className="absolute right-4 top-4 z-10 rounded-lg border border-[#F8F4DD]/35 bg-[#243C32]/45 px-3 py-2 text-xs font-medium text-[#FFFDF4] backdrop-blur-sm transition-colors hover:bg-[#243C32]/65 sm:right-6 sm:top-6"
        >
          跳过
        </button>
      

      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-end px-4 pb-14 pt-20 sm:px-6 sm:pb-20 lg:px-8">
        <motion.div
          className="max-w-md text-[#FFFDF4]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.16, ease: 'easeOut' }}
        >
          <p className="font-mono text-[11px] tracking-[0.24em] text-[#E8E4C9]">
            基地观察志 · 二〇二六夏
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-normal sm:text-5xl">
            乡野漫步
          </h1>
          <p className="mt-4 font-serif text-base leading-7 text-[#F3F0D8] sm:text-lg">
            记录家附近几处普通地点每天微小的变化。
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

function formatDate(date: string) {
  return date.replace(/-/g, '.');
}

function baseName(base?: Base | null) {
  if (!base) return '未命名地点';
  return base.title;
}

function shortText(text: string, maxLength = 72) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function logPhotos(log: WalkLog) {
  return log.photos?.filter(Boolean) ?? [];
}

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ active, icon, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${
        active
          ? 'bg-[#2F5D4A] text-[#FFFDF4] shadow-sm'
          : 'text-[#6B7E65] hover:bg-[#EEF4E8] hover:text-[#2F5D4A]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

const SectionHeading: React.FC<{ title: string; description: string }> = ({
  title,
  description
}) => {
  return (
    <div>
      <h2 className="font-serif text-xl font-semibold tracking-tight text-[#243C32]">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-[#6B7E65]">{description}</p>
    </div>
  );
};

const TodayObservation: React.FC<{
  base: Base | null;
  log: WalkLog | null;
  getWeatherIcon: (weather: string) => React.ReactNode;
  onOpenBase: () => void;
}> = ({ base, log, getWeatherIcon, onOpenBase }) => {
  if (!log || !base) {
    return (
      <section
        id="today-observation"
        className="scroll-mt-32 rounded-2xl border border-[#DDE5D6] bg-[#FFFDF7] p-8 shadow-sm shadow-emerald-950/5"
      >
        <p className="font-serif text-2xl text-[#243C32]">今日观察</p>
        <p className="mt-4 text-sm leading-7 text-[#66745E]">
          还没有散步记录。等第一次写下来的时候，这里会像日记本第一页一样展开。
        </p>
      </section>
    );
  }

  const evidencePhoto = logPhotos(log)[0] ?? base.coverImage;

  return (
    <section
      id="today-observation"
      className="scroll-mt-32 rounded-2xl border border-[#DDE5D6] bg-[#FFFDF7] shadow-sm shadow-emerald-950/5"
    >
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="border-b border-[#DDE5D6] pb-5">
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#7D8C74]">
            FIELD NOTE / {formatDate(log.date)}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-serif text-4xl font-semibold tracking-tight text-[#243C32] sm:text-5xl">
                今日观察
              </p>
              <button
                type="button"
                onClick={onOpenBase}
                className="mt-3 block font-serif text-xl font-semibold text-[#2F5D4A] transition-colors hover:text-[#254938]"
              >
                {baseName(base)}
              </button>
            </div>
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#EEF4E8] px-3 py-1 text-xs text-[#5B7055]">
              {getWeatherIcon(log.weather)}
              {log.weatherText}
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <article className="max-w-3xl">
            <p className="whitespace-pre-line font-serif text-[19px] leading-9 text-stone-800 sm:text-[20px] sm:leading-10">
              {log.content}
            </p>
          </article>

          <figure className="rounded-xl border border-[#DDE5D6] bg-[#F6F6EC] p-2">
            <img
              src={evidencePhoto}
              alt={base.title}
              referrerPolicy="no-referrer"
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
            <figcaption className="px-1 pt-2 text-xs leading-5 text-[#6B7E65]">
              {log.photos?.length ? '这一日留下的照片证据。' : `${base.title} 的地点照片。`}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

const BaseNoteCard: React.FC<{
  base: Base;
  latestText: string;
  onClick: () => void;
}> = ({ base, latestText, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] text-left shadow-sm shadow-emerald-950/5 transition-colors hover:border-[#BFD1B8] hover:bg-[#F9FAF2]"
    >
      <img
        src={base.coverImage}
        alt={base.title}
        referrerPolicy="no-referrer"
        className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span className="block p-4">
        <span className="block font-serif text-lg font-semibold text-[#243C32]">
          {base.title}
        </span>
        <span className="mt-2 block text-sm leading-6 text-[#66745E]">
          {shortText(latestText || base.description)}
        </span>
      </span>
    </button>
  );
};

const RecentObservation: React.FC<{
  log: WalkLog;
  base?: Base;
  getWeatherIcon: (weather: string) => React.ReactNode;
  onOpenBase: () => void;
}> = ({ log, base, getWeatherIcon, onOpenBase }) => {
  return (
    <article className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-sm shadow-emerald-950/5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#6B7E65]">
        <span className="font-mono">{formatDate(log.date)}</span>
        <span className="h-1 w-1 rounded-full bg-[#B7C7AE]" />
        <button
          type="button"
          onClick={onOpenBase}
          className="font-serif text-sm font-semibold text-[#2F5D4A] hover:text-[#254938]"
        >
          {baseName(base)}
        </button>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4E8] px-2 py-0.5">
          {getWeatherIcon(log.weather)}
          {log.weatherText}
        </span>
      </div>
      <p className="font-serif text-base leading-8 text-stone-800">{log.content}</p>
    </article>
  );
};

interface BaseDetailProps {
  base: Base;
  logs: WalkLog[];
  getWeatherIcon: (weather: string) => React.ReactNode;
  onBack: () => void;
  onAddLog: () => void;
  onDeleteLog: (id: string) => void;
}

const BaseDetail: React.FC<BaseDetailProps> = ({
  base,
  logs,
  getWeatherIcon,
  onBack,
  onAddLog,
  onDeleteLog
}) => {
  return (
    <section className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#5B7055] transition-colors hover:bg-[#EEF4E8] hover:text-[#2F5D4A]"
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </button>

      <div className="overflow-hidden rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] shadow-sm shadow-emerald-950/5">
        <div className="grid md:grid-cols-[320px_1fr]">
          <img
            src={base.coverImage}
            alt={base.title}
            referrerPolicy="no-referrer"
            className="h-64 w-full object-cover md:h-full"
          />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs text-[#7D8C74]">{base.subtitle}</p>
                <h1 className="mt-1 font-serif text-3xl font-semibold text-[#243C32]">
                  {base.title}
                </h1>
              </div>
              <button
                type="button"
                onClick={onAddLog}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2F5D4A] px-3 py-2 text-xs font-medium text-[#FFFDF4] transition-colors hover:bg-[#254938]"
              >
                <Plus className="h-4 w-4" />
                写一条
              </button>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-[#6B7E65]">
              <MapPin className="h-4 w-4" />
              {base.location}
            </p>
            <p className="mt-5 font-serif text-base leading-8 text-stone-800">
              {base.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-[#243C32]">这个地点的记录</h2>
        {logs.length === 0 ? (
          <div className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-8 text-center text-sm text-[#6B7E65]">
            还没有记录。
          </div>
        ) : (
          logs.map((log) => (
            <LogCard
              key={log.id}
              log={log}
              getWeatherIcon={getWeatherIcon}
              onDelete={() => onDeleteLog(log.id)}
            />
          ))
        )}
      </div>
    </section>
  );
};

interface LogCardProps {
  log: WalkLog;
  base?: Base;
  getWeatherIcon: (weather: string) => React.ReactNode;
  onOpenBase?: () => void;
  onDelete: () => void;
}

const LogCard: React.FC<LogCardProps> = ({
  log,
  base,
  getWeatherIcon,
  onOpenBase,
  onDelete
}) => {
  const photos = logPhotos(log);

  return (
    <article className="rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-4 shadow-sm shadow-emerald-950/5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7E65]">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#EEF4E8] px-2 py-1 font-mono text-[#5B7055]">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(log.date)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#F4F0E3] px-2 py-1 text-[#6A6046]">
            {getWeatherIcon(log.weather)}
            {log.weatherText}
          </span>
          {base && (
            <button
              type="button"
              onClick={onOpenBase}
              className="rounded-md bg-[#EEF4E8] px-2 py-1 text-[#4D6B50] transition-colors hover:bg-[#E1ECD9]"
            >
              {base.title}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          title="删除"
          className="self-start rounded-md p-1.5 text-stone-300 transition-colors hover:bg-rose-50 hover:text-rose-700 sm:self-auto"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <p className="whitespace-pre-line font-serif text-base leading-8 text-stone-800">
        {log.content}
      </p>
      {photos.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {photos.slice(0, 4).map((photo, index) => (
            <figure
              key={`${photo}-${index}`}
              className="rounded-lg border border-[#DDE5D6] bg-[#F6F6EC] p-1.5"
            >
              <img
                src={photo}
                alt={`${formatDate(log.date)} observation ${index + 1}`}
                referrerPolicy="no-referrer"
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
            </figure>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {log.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#EEF4E8] px-2 py-1 text-xs text-[#5B7055]"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
};
