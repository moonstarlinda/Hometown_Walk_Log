/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BookOpen,
  Calendar,
  Cloud,
  CloudFog,
  CloudRain,
  Compass,
  Filter,
  LogIn,
  LogOut,
  Map as MapIcon,
  MapPin,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sun,
  Trash2,
  TreePine,
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
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  createBase,
  createLog,
  deleteLog,
  getBases,
  getLogs
} from './services/walkLogService';

const INTRO_STORAGE_KEY = 'hometown_opening_intro_seen';
const ROADSIDE_LOCATION_ID = 'roadside-observations';
const AUTHOR_USER_ID = import.meta.env.VITE_AUTHOR_USER_ID ?? '';
type Theme = 'default' | 'hockney' | 'hockneySummer' | 'sanctuary';
type BasePalette = {
  accent: string;
  soft: string;
  text: string;
  shadow: string;
};

const SANCTUARY_PALETTES: Record<string, BasePalette> = {
  'base-1': {
    accent: '#4BA3C3',
    soft: 'color-mix(in srgb, #4BA3C3 12%, white)',
    text: '#4BA3C3',
    shadow: 'rgba(75,163,195,0.12)'
  },
  'base-2': {
    accent: '#4E8B5B',
    soft: 'color-mix(in srgb, #4E8B5B 12%, white)',
    text: '#4E8B5B',
    shadow: 'rgba(78,139,91,0.12)'
  },
  'base-3': {
    accent: '#4B4E6D',
    soft: 'color-mix(in srgb, #4B4E6D 12%, white)',
    text: '#4B4E6D',
    shadow: 'rgba(75,78,109,0.13)'
  },
  'base-4': {
    accent: '#D98C3A',
    soft: 'color-mix(in srgb, #D98C3A 12%, white)',
    text: '#D98C3A',
    shadow: 'rgba(217,140,58,0.13)'
  },
  'base-5': {
    accent: '#7A5C8C',
    soft: 'color-mix(in srgb, #7A5C8C 12%, white)',
    text: '#7A5C8C',
    shadow: 'rgba(122,92,140,0.13)'
  },
  [ROADSIDE_LOCATION_ID]: {
    accent: '#7A7F68',
    soft: '#ECEBDD',
    text: '#5C624D',
    shadow: 'rgba(122,127,104,0.18)'
  }
};

function sanctuaryPaletteForBase(baseId?: string): BasePalette {
  return SANCTUARY_PALETTES[baseId ?? ''] ?? SANCTUARY_PALETTES[ROADSIDE_LOCATION_ID];
}

const THEME_OPTIONS: Array<{
  id: Theme;
  label: string;
  title: string;
  icon: React.ReactNode;
  swatches: string[];
}> = [
  {
    id: 'default',
    label: '经典自然',
    title: '经典自然皮肤',
    icon: <Compass className="h-3.5 w-3.5" />,
    swatches: ['#2F5D4A', '#7F9E65', '#D8D0B4']
  },
  {
    id: 'hockney',
    label: '清凉夏日',
    title: '清凉夏日皮肤',
    icon: <Palette className="h-3.5 w-3.5" />,
    swatches: ['#1F9CC1', '#63C9E8', '#DFF7FF']
  },
  {
    id: 'sanctuary',
    label: '五色秘境',
    title: 'Five Sanctuary 五基地色谱',
    icon: (
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {['#4BA3C3', '#4E8B5B', '#4B4E6D', '#D98C3A', '#7A5C8C'].map((color) => (
          <span
            key={color}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
    ),
    swatches: ['#4BA3C3', '#4E8B5B', '#4B4E6D', '#D98C3A', '#7A5C8C']
  },
  {
    id: 'hockneySummer',
    label: '霍克尼夏日',
    title: '霍克尼夏日皮肤',
    icon: <Sun className="h-3.5 w-3.5" />,
    swatches: ['#FFF22E', '#0057D9', '#16A9D8', '#F338C8', '#14B85A', '#FF5A2D']
  }
];
const ROADSIDE_LOCATION: Base = {
  id: ROADSIDE_LOCATION_ID,
  title: '途中见闻',
  subtitle: 'Roadside Notes',
  description: '不属于任何固定基地的路上事情：偶遇的云影、岔路口的风、临时停下来看见的小变化，都先放在这里。',
  location: '散步途中，尚未归入某个基地的片段',
  coverImage: openingWalkingIntoForest
};

function parseSavedItems(savedValue: string | null) {
  if (!savedValue) return null;

  try {
    const parsed = JSON.parse(savedValue);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeSavedBases(savedItems: unknown[] | null): Base[] | null {
  if (!savedItems) return null;

  return savedItems
    .filter((item): item is Partial<Base> => Boolean(item && typeof item === 'object'))
    .filter((item) => typeof item.id === 'string')
    .map((item) => ({
      id: item.id ?? '',
      title: item.title ?? '未命名地点',
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      location: item.location ?? '',
      coverImage: item.coverImage ?? openingWalkingIntoForest
    }));
}

function normalizeSavedLogs(savedItems: unknown[] | null): WalkLog[] | null {
  if (!savedItems) return null;

  return savedItems
    .filter((item): item is Partial<WalkLog> => Boolean(item && typeof item === 'object'))
    .filter((item) => typeof item.id === 'string' && typeof item.baseId === 'string')
    .map((item) => ({
      id: item.id ?? '',
      baseId: item.baseId ?? '',
      date: item.date ?? '',
      weather: item.weather ?? 'sunny',
      weatherText: item.weatherText ?? '',
      tags: Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === 'string') : [],
      photos: Array.isArray(item.photos)
        ? item.photos.filter((photo) => typeof photo === 'string')
        : undefined,
      content: item.content ?? ''
    })) as WalkLog[];
}

function mergeInitialItems<T extends { id: string }>(savedItems: T[], initialItems: T[]) {
  const initialById = new Map(initialItems.map((item) => [item.id, item]));
  const savedIds = new Set(savedItems.map((item) => item.id));
  const refreshedSavedItems = savedItems.map((item) => initialById.get(item.id) ?? item);
  const missingInitialItems = initialItems.filter((item) => !savedIds.has(item.id));
  return [...refreshedSavedItems, ...missingInitialItems];
}

function formatSupabaseError(error: unknown) {
  if (!error || typeof error !== 'object') return String(error);

  const errorRecord = error as Record<string, unknown>;
  const parts = [
    typeof errorRecord.message === 'string' ? errorRecord.message : null,
    typeof errorRecord.code === 'string' ? `code: ${errorRecord.code}` : null,
    typeof errorRecord.details === 'string' ? `details: ${errorRecord.details}` : null,
    typeof errorRecord.hint === 'string' ? `hint: ${errorRecord.hint}` : null
  ].filter(Boolean);

  return parts.join('\n');
}

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [bases, setBases] = useState<Base[]>([]);
  const [logs, setLogs] = useState<WalkLog[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bases' | 'timeline' | 'stats'>('bases');
  const [showAddLog, setShowAddLog] = useState(false);
  const [showAddBase, setShowAddBase] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showAuthorLogin, setShowAuthorLogin] = useState(false);
  const [authUser, setAuthUser] = useState<{ id: string; email?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterBaseId, setFilterBaseId] = useState('all');
  const [filterWeather, setFilterWeather] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('default');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const activeThemeOption = THEME_OPTIONS.find((option) => option.id === theme) ?? THEME_OPTIONS[0];
  const isHockney = theme === 'hockney';
  const isHockneySummer = theme === 'hockneySummer';
  const isSanctuary = theme === 'sanctuary';
  const isAuthor = Boolean(AUTHOR_USER_ID && authUser?.id === AUTHOR_USER_ID);
  const hasOpenModal = showAddLog || showAddBase || showAuthorLogin;

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const user = data.session?.user;
      setAuthUser(user ? { id: user.id, email: user.email } : null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setAuthUser(user ? { id: user.id, email: user.email } : null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleAuthorSignOut = async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(`退出登录失败。\n\n${formatSupabaseError(error)}`);
      return;
    }

    setIsEditing(false);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadWalkData() {
      setIsDataLoading(true);

      try {
        const [remoteBases, remoteLogs] = await Promise.all([getBases(), getLogs()]);

        if (!isMounted) return;
        setBases(remoteBases);
        setLogs(remoteLogs);
      } catch (error) {
        console.error('Failed to load walk data from Supabase.', error);

        if (!isMounted) return;
        setBases(INITIAL_BASES);
        setLogs(INITIAL_LOGS);
        alert(
          isSupabaseConfigured
            ? `无法从 Supabase 读取数据，已临时显示本地示例数据。\n\n${formatSupabaseError(error)}`
            : '缺少 Vercel 环境变量 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY，已临时显示本地示例数据。'
        );
      } finally {
        if (isMounted) setIsDataLoading(false);
      }
    }

    loadWalkData();

    return () => {
      isMounted = false;
    };
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
    setSelectedBaseId(null);
    setActiveTab('bases');
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

  useEffect(() => {
    if (!themeMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [themeMenuOpen]);

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)),
    [logs]
  );

  const activeBaseDetails = selectedBaseId
    ? selectedBaseId === ROADSIDE_LOCATION_ID
      ? ROADSIDE_LOCATION
      : bases.find((base) => base.id === selectedBaseId) ?? null
    : null;

  const activeBaseLogs = useMemo(() => {
    if (!selectedBaseId) return [];
    return sortedLogs.filter((log) => log.baseId === selectedBaseId);
  }, [selectedBaseId, sortedLogs]);

  const latestLogPerBase = useMemo(() => {
    const latest: Record<string, WalkLog | undefined> = {};
    bases.forEach((base) => {
      latest[base.id] = sortedLogs.find((log) => log.baseId === base.id);
    });
    latest[ROADSIDE_LOCATION_ID] = sortedLogs.find(
      (log) => log.baseId === ROADSIDE_LOCATION_ID
    );
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
      const matchesDate = !filterDate || log.date === filterDate;
      const matchesWeather = filterWeather === 'all' || log.weather === filterWeather;

      return matchesSearch && matchesBase && matchesDate && matchesWeather;
    });
  }, [filterBaseId, filterDate, filterWeather, searchQuery, sortedLogs]);

  const handleAddLog = async (newLogData: Omit<WalkLog, 'id'>) => {
    const logToCreate: WalkLog = {
      ...newLogData,
      id: `log-${Date.now()}`
    };

    try {
      const newLog = await createLog(logToCreate);
      setLogs((currentLogs) => [newLog, ...currentLogs]);
      setShowAddLog(false);
      setSelectedBaseId(newLog.baseId);
      setActiveTab('bases');
    } catch (error) {
      console.error('Failed to create log.', error);
      alert(`保存散步记录失败。\n\n${formatSupabaseError(error)}`);
    }
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

    const nextBaseData: Base = {
      id: `base-${Date.now()}`,
      title: newBaseData.title,
      subtitle: newBaseData.subtitle,
      description: newBaseData.description,
      location: newBaseData.location,
      coverImage: covers[newBaseData.coverType] || covers.woodland
    };

    createBase(nextBaseData)
      .then((newBase) => {
        setBases((currentBases) => [...currentBases, newBase]);
        setShowAddBase(false);
        setSelectedBaseId(newBase.id);
        setActiveTab('bases');
      })
      .catch((error) => {
        console.error('Failed to create base.', error);
        alert(`保存新基地失败。\n\n${formatSupabaseError(error)}`);
      });
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('确定删除这条散步记录吗？')) return;
    const previousLogs = logs;

    setLogs((currentLogs) => currentLogs.filter((log) => log.id !== logId));

    try {
      await deleteLog(logId);
    } catch (error) {
      console.error('Failed to delete log.', error);
      setLogs(previousLogs);
      alert(`删除记录失败。\n\n${formatSupabaseError(error)}`);
    }
  };

  const handleResetData = () => {
    if (!confirm('确定恢复为默认示例数据吗？你新增的记录会被清空。')) return;
    setBases(INITIAL_BASES);
    setLogs(INITIAL_LOGS);
    setSelectedBaseId(null);
    alert('当前只是临时恢复本地示例数据，不会覆盖 Supabase。需要的话我们可以再加一个正式的 seed/reset 脚本。');
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
  const showBackToTopControl = activeTab === 'timeline' || Boolean(activeBaseDetails);

  useEffect(() => {
    if (!showBackToTopControl) {
      setShowBackToTop(false);
      return;
    }

    const updateBackToTop = () => setShowBackToTop(window.scrollY > 360);
    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop, { passive: true });

    return () => window.removeEventListener('scroll', updateBackToTop);
  }, [showBackToTopControl]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, [prefersReducedMotion]);

  return (
    <div
      className={`min-h-screen text-stone-800 antialiased ${
        isHockneySummer ? 'hockney-summer-root' : isHockney ? 'hockney-root' : isSanctuary ? 'sanctuary-root' : 'bg-[#F5F4EC]'
      }`}
    >
      <header
        className={`sticky top-0 z-[70] border-b border-[#DDE5D6] bg-[#FAF9F1]/95 backdrop-blur ${
          isHockneySummer ? 'hockney-summer-header' : isHockney ? 'hockney-header' : isSanctuary ? 'sanctuary-header' : ''
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative z-[110] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedBaseId(null);
                setActiveTab('bases');
              }}
              className="flex min-w-0 flex-1 items-center gap-3 text-left sm:flex-none"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2F5D4A] text-[#F8F4DD] shadow-sm">
                <TreePine className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-lg font-semibold text-[#243C32]">
                  乡野漫步 
                </span>
                <span className="block truncate text-xs text-[#6B7E65]">
                  漫步于家乡的山水间，发现并记录“秘密基地”的点滴变化
                </span>
              </span>
            </button>

            <div className="order-3 flex w-full min-w-0 items-center gap-2 sm:order-none sm:w-auto sm:shrink-0">
              <div
                role="group"
                aria-label="视觉皮肤"
                className="relative z-[90] min-w-0 flex-1 sm:flex-none"
                ref={themeMenuRef}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={themeMenuOpen}
                  aria-label={`当前皮肤：${activeThemeOption.title}`}
                  title={`当前使用：${activeThemeOption.title}`}
                  onClick={() => setThemeMenuOpen((current) => !current)}
                  className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#2F5D4A] shadow-sm transition-colors hover:bg-[#EEF4E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A68B]/35 sm:w-auto ${
                    themeMenuOpen
                      ? 'ring-1 ring-[#D9E5D1]'
                      : ''
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Palette className="h-4 w-4 shrink-0 text-[#5F8C53]" aria-hidden="true" />
                    <span className="truncate leading-none">{activeThemeOption.label}</span>
                  </span>
                  <span className="ml-2 text-[10px] leading-none text-[#7B8C76]" aria-hidden="true">
                    ▾
                  </span>
                </button>

                <div
                  role="menu"
                  aria-label="选择皮肤"
                  onMouseDown={(event) => event.stopPropagation()}
                  className={`absolute right-0 top-full z-[120] mt-2 w-[190px] overflow-hidden rounded-lg border border-[#DDE5D6] p-2 text-xs shadow-[0_12px_32px_rgba(21,29,59,0.08)] transition-all duration-150 ${
                    themeMenuOpen ? 'pointer-events-auto visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-1 opacity-0'
                  }`}
                  style={{
                    background: 'rgba(255, 253, 247, 0.96)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}
                >
                  {THEME_OPTIONS.map((option) => {
                    const active = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => {
                          setTheme(option.id);
                          setThemeMenuOpen(false);
                        }}
                        aria-pressed={active}
                        title={active ? `当前使用：${option.title}` : `切换至${option.title}`}
                        className={`flex w-full items-center gap-3 rounded-[10px] px-[14px] py-[10px] text-left text-xs transition-colors duration-200 hover:bg-[#EEF4E8] focus-visible:outline-none focus-visible:bg-[#EEF4E8] ${
                          active ? 'font-semibold text-[#2F5D4A]' : 'text-[#667463]'
                        }`}
                      >
                        <span className="flex shrink-0 items-center gap-[3px]" aria-hidden="true">
                          {option.swatches.slice(0, option.id === 'sanctuary' || option.id === 'hockneySummer' ? 5 : 3).map((color) => (
                            <span
                              key={color}
                              className="h-1.5 w-1.5 rounded-full ring-1 ring-inset ring-black/5"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </span>
                        <span className="min-w-0 flex-1 truncate leading-none">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={replayIntro}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#2F5D4A] transition-colors hover:bg-[#EEF4E8]"
              >
                <RefreshCw className="h-4 w-4" />
                重播开场
              </button>
              {isAuthor ? (
                <button
                  type="button"
                  onClick={handleAuthorSignOut}
                  title={authUser?.email ? `当前作者：${authUser.email}` : '退出作者登录'}
                  className="order-2 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#2F5D4A] transition-colors hover:bg-[#EEF4E8] sm:order-none"
                >
                  <LogOut className="h-4 w-4" />
                  退出
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthorLogin(true)}
                  className="order-2 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#2F5D4A] transition-colors hover:bg-[#EEF4E8] sm:order-none"
                >
                  <LogIn className="h-4 w-4" />
                  作者
                </button>
              )}
            </div>
          </div>

          <nav
            className={`relative z-10 flex gap-1 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] p-1 text-xs shadow-sm shadow-emerald-950/5 ${
              isSanctuary ? 'sanctuary-nav' : ''
            }`}
          >
            <TabButton
              active={activeTab === 'bases' && !selectedBaseId}
              icon={<MapIcon className="h-4 w-4" />}
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

      {isAuthor && (
        <>
          <AuthorTools
            isEditing={isEditing}
            onAddLog={() => setShowAddLog(true)}
            onAddBase={() => setShowAddBase(true)}
            onToggleEditing={() => setIsEditing((current) => !current)}
            onResetData={handleResetData}
            isHockney={isHockney}
            isHockneySummer={isHockneySummer}
            isSanctuary={isSanctuary}
          />
          {!hasOpenModal && (
            <MobileAuthorTools
              isEditing={isEditing}
              onAddLog={() => setShowAddLog(true)}
              onAddBase={() => setShowAddBase(true)}
              onToggleEditing={() => setIsEditing((current) => !current)}
              onResetData={handleResetData}
              isHockney={isHockney}
              isHockneySummer={isHockneySummer}
              isSanctuary={isSanctuary}
            />
          )}
        </>
      )}

      <AnimatePresence>
        {showIntro && showHome && (
          <OpeningIntro
            prefersReducedMotion={Boolean(prefersReducedMotion)}
            onSkip={finishIntro}
          />
        )}
      </AnimatePresence>

      <main className={`mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 ${isAuthor ? 'pb-28 xl:pb-7' : ''} ${isHockneySummer && showHome ? 'hockney-summer-home-main' : isHockney && showHome ? 'hockney-home-main' : ''}`}>
        {isDataLoading && (
          <div className="mb-4 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-4 py-3 text-sm text-[#6B7E65] shadow-sm shadow-emerald-950/5">
            正在从 Supabase 读取散步记录...
          </div>
        )}

        {showHome && (
          <section className={isHockneySummer ? 'hockney-summer-home space-y-6' : isHockney ? 'hockney-home space-y-7' : 'space-y-8'}>
            <section className={isHockneySummer ? 'hockney-summer-map-hero space-y-3' : isHockney ? 'hockney-map-hero space-y-3' : 'space-y-3'}>
              <SectionHeading
                title="探索地图"
                description="基地位置分布图，按发现的先后顺序编号。鼠标悬停速览，点击进入基地。"
              />
              <WalkMap
                bases={bases}
                selectedBaseId={selectedBaseId}
                onSelectBase={setSelectedBaseId}
                latestLogPerBase={latestLogPerBase}
                isHockney={isHockney}
                isHockneySummer={isHockneySummer}
                isSanctuary={isSanctuary}
              />
            </section>

            <section className={isHockneySummer ? 'hockney-summer-notes-section space-y-3' : 'space-y-3'}>
              <SectionHeading
                title="基地卡片"
                description="每张卡片展示该基地的最新记录和照片。点击查看该基地的所有日志。"
              />

              <div className={isHockneySummer ? 'hockney-summer-notes-grid' : 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'}>
                {bases.map((base) => (
                  <BaseNoteCard
                    key={base.id}
                    base={base}
                    latestLog={latestLogPerBase[base.id]}
                    onClick={() => setSelectedBaseId(base.id)}
                    isHockney={isHockney}
                    isHockneySummer={isHockneySummer}
                    isSanctuary={isSanctuary}
                    palette={sanctuaryPaletteForBase(base.id)}
                  />
                ))}
                <BaseNoteCard
                  base={ROADSIDE_LOCATION}
                  latestLog={latestLogPerBase[ROADSIDE_LOCATION_ID]}
                  onClick={() => setSelectedBaseId(ROADSIDE_LOCATION_ID)}
                  isHockney={isHockney}
                  isHockneySummer={isHockneySummer}
                  isSanctuary={isSanctuary}
                  palette={sanctuaryPaletteForBase(ROADSIDE_LOCATION_ID)}
                />
              </div>
            </section>

          </section>
        )}

        {activeBaseDetails && (
          <BaseDetail
            base={activeBaseDetails}
            logs={activeBaseLogs}
            getWeatherIcon={getWeatherIcon}
            isEditing={isEditing}
            onBack={() => setSelectedBaseId(null)}
            onDeleteLog={handleDeleteLog}
            isHockney={isHockney}
            isHockneySummer={isHockneySummer}
            isSanctuary={isSanctuary}
            palette={sanctuaryPaletteForBase(activeBaseDetails.id)}
          />
        )}

        {activeTab === 'timeline' && (
          <section className={isHockneySummer ? 'hockney-summer-page space-y-5' : 'space-y-5'}>
            <div
              className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7]/90 p-3 shadow-sm shadow-emerald-950/5 backdrop-blur ${
                isHockneySummer ? 'hockney-summer-panel' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card' : ''
              }`}
            >
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[minmax(260px,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <label className="group relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A987E] transition-colors group-focus-within:text-[#2F5D4A]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="搜索记录、天气或标签"
                    className={`h-12 w-full rounded-lg border border-[#DDE5D6] bg-[#FAF9F1] pl-10 pr-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-[#8A987E] focus:border-[#7FA06E] focus:bg-[#FFFDF7] ${
                      isHockneySummer ? 'hockney-summer-field' : ''
                    }`}
                  />
                </label>
                <label className="group relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A987E] transition-colors group-focus-within:text-[#2F5D4A]" />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(event) => setFilterDate(event.target.value)}
                    className={`h-12 w-full rounded-lg border border-[#DDE5D6] bg-[#FAF9F1] pl-10 pr-3 text-sm text-stone-800 outline-none transition-colors focus:border-[#7FA06E] focus:bg-[#FFFDF7] ${
                      isHockneySummer ? 'hockney-summer-field' : ''
                    }`}
                  />
                </label>
                <label className="group relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A987E] transition-colors group-focus-within:text-[#2F5D4A]" />
                  <select
                    value={filterBaseId}
                    onChange={(event) => setFilterBaseId(event.target.value)}
                    className={`h-12 w-full rounded-lg border border-[#DDE5D6] bg-[#FAF9F1] pl-10 pr-3 text-sm text-stone-800 outline-none transition-colors focus:border-[#7FA06E] focus:bg-[#FFFDF7] ${
                      isHockneySummer ? 'hockney-summer-field' : ''
                    }`}
                  >
                    <option value="all">所有地点</option>
                    {bases.map((base) => (
                      <option key={base.id} value={base.id}>
                        {base.title}
                      </option>
                    ))}
                    <option value={ROADSIDE_LOCATION_ID}>途中见闻</option>
                  </select>
                </label>
                <label className="group relative">
                  <Cloud className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A987E] transition-colors group-focus-within:text-[#2F5D4A]" />
                  <select
                    value={filterWeather}
                    onChange={(event) => setFilterWeather(event.target.value)}
                    className={`h-12 w-full rounded-lg border border-[#DDE5D6] bg-[#FAF9F1] pl-10 pr-3 text-sm text-stone-800 outline-none transition-colors focus:border-[#7FA06E] focus:bg-[#FFFDF7] ${
                      isHockneySummer ? 'hockney-summer-field' : ''
                    }`}
                  >
                    <option value="all">所有天气</option>
                    <option value="sunny">晴</option>
                    <option value="cloudy">多云</option>
                    <option value="rainy">雨</option>
                    <option value="overcast">阴</option>
                    <option value="windy">风</option>
                  </select>
                </label>
              </div>
            </div>

            <div className={`flex items-center gap-2 text-xs text-[#6B7E65] ${isHockneySummer ? 'hockney-summer-filter-count' : ''}`}>
              <Filter className="h-4 w-4" />
              找到 {filteredLogs.length} 条记录
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const base =
                  log.baseId === ROADSIDE_LOCATION_ID
                    ? ROADSIDE_LOCATION
                    : bases.find((item) => item.id === log.baseId);
                return (
                  <LogCard
                    key={log.id}
                    log={log}
                    base={base}
                    getWeatherIcon={getWeatherIcon}
                    isEditing={isEditing}
                    isHockney={isHockney}
                    isHockneySummer={isHockneySummer}
                    isSanctuary={isSanctuary}
                    palette={sanctuaryPaletteForBase(log.baseId)}
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

        {activeTab === 'stats' && (
          <NatureStats logs={logs} bases={bases} isHockney={isHockney} isHockneySummer={isHockneySummer} isSanctuary={isSanctuary} />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-xs text-[#7D8C74] sm:px-6 lg:px-8">
        2026 散步笔记
      </footer>

      <AnimatePresence>
        {showBackToTopControl && showBackToTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            title="回到顶部"
            aria-label="回到顶部"
            className={`fixed bottom-5 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] text-[#2F5D4A] shadow-lg shadow-emerald-950/10 transition-colors hover:bg-[#EEF4E8] sm:bottom-6 lg:right-[max(1rem,calc((100vw-72rem)/2-3.75rem))] ${
              isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-back-to-top' : ''
            }`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AddLogModal
              bases={[...bases, ROADSIDE_LOCATION]}
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

        {showAuthorLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthorLoginModal
              authorUserId={AUTHOR_USER_ID}
              onClose={() => setShowAuthorLogin(false)}
            />
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

const AuthorLoginModal: React.FC<{
  authorUserId: string;
  onClose: () => void;
}> = ({ authorUserId, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!supabase) {
      alert('缺少 Supabase 环境变量，暂时无法登录作者账号。');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;

      if (!authorUserId || data.user?.id !== authorUserId) {
        await supabase.auth.signOut();
        alert('这个账号不是作者账号。');
        return;
      }

      onClose();
    } catch (error) {
      alert(`作者登录失败。\n\n${formatSupabaseError(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-5 shadow-xl shadow-stone-900/10"
      >
        <div className="mb-4">
          <h2 className="font-serif text-xl font-semibold text-[#243C32]">作者登录</h2>
          <p className="mt-1 text-xs leading-5 text-[#6B7E65]">
            登录后才会显示记录、编辑和删除工具。
          </p>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[#5B7055]">邮箱</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#DDE5D6] bg-[#FAF9F1] px-3 text-sm text-stone-800 outline-none transition-colors focus:border-[#7FA06E] focus:bg-[#FFFDF7]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#5B7055]">密码</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#DDE5D6] bg-[#FAF9F1] px-3 text-sm text-stone-800 outline-none transition-colors focus:border-[#7FA06E] focus:bg-[#FFFDF7]"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-4 py-2 text-xs font-medium text-[#6B7E65] transition-colors hover:bg-[#F1F5EA]"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#2F5D4A] px-4 py-2 text-xs font-semibold text-[#FFFDF4] transition-colors hover:bg-[#254938] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '登录中...' : '登录'}
          </button>
        </div>
      </form>
    </div>
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

const LogPhotoGrid: React.FC<{
  photos: string[];
  date: string;
  isHockney?: boolean;
}> = ({ photos, date, isHockney = false }) => {
  const visiblePhotos = photos.slice(0, 3);
  const photoFrameClass = isHockney
    ? 'hockney-image-frame bg-[#E8FAFF]/70'
    : 'overflow-hidden rounded-lg';

  if (visiblePhotos.length === 0) return null;

  if (visiblePhotos.length === 1) {
    return (
      <div className="mt-4 w-fit">
        <figure className={photoFrameClass}>
          <img
            src={visiblePhotos[0]}
            alt={`${formatDate(date)} observation`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-44 w-auto max-w-xs object-contain"
          />
        </figure>
      </div>
    );
  }

  if (visiblePhotos.length === 2) {
    return (
      <div className="mt-4 flex flex-wrap items-start gap-2">
        {visiblePhotos.map((photo, index) => (
          <figure key={`${photo}-${index}`} className={photoFrameClass}>
            <img
              src={photo}
              alt={`${formatDate(date)} observation ${index + 1}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="h-36 w-auto max-w-[240px] object-contain sm:h-40"
            />
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-start gap-2">
      {visiblePhotos.map((photo, index) => (
        <figure key={`${photo}-${index}`} className={photoFrameClass}>
          <img
            src={photo}
            alt={`${formatDate(date)} observation ${index + 1}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-28 w-auto max-w-[200px] object-contain sm:h-36"
          />
        </figure>
      ))}
    </div>
  );
};

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

type AuthorToolProps = {
  isEditing: boolean;
  onAddLog: () => void;
  onAddBase: () => void;
  onToggleEditing: () => void;
  onResetData: () => void;
  isHockney?: boolean;
  isHockneySummer?: boolean;
  isSanctuary?: boolean;
};

function authorToolsThemeClass({
  isHockney,
  isHockneySummer,
  isSanctuary
}: Pick<AuthorToolProps, 'isHockney' | 'isHockneySummer' | 'isSanctuary'>) {
  if (isHockneySummer) return 'hockney-summer-author-tools';
  if (isHockney) return 'hockney-author-tools';
  if (isSanctuary) return 'sanctuary-author-tools';
  return '';
}

const AuthorTools: React.FC<AuthorToolProps> = ({
  isEditing,
  onAddLog,
  onAddBase,
  onToggleEditing,
  onResetData,
  isHockney = false,
  isHockneySummer = false,
  isSanctuary = false
}) => {
  const themeClass = authorToolsThemeClass({ isHockney, isHockneySummer, isSanctuary });

  return (
    <aside
      className={`fixed top-28 z-30 hidden w-36 flex-col gap-2 xl:right-4 xl:flex 2xl:left-[calc(50%+36rem+1.5rem)] 2xl:right-auto ${
        themeClass
      }`}
    >
      <p className="px-1 text-[11px] font-medium text-[#7D8C74]">作者工具</p>
      <button
        type="button"
        onClick={onAddLog}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2F5D4A] px-3 py-2 text-xs font-medium text-[#FFFDF4] shadow-sm transition-colors hover:bg-[#254938]"
      >
        <Plus className="h-4 w-4" />
        记录
      </button>
      <button
        type="button"
        onClick={onAddBase}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#2F5D4A] shadow-sm transition-colors hover:bg-[#EEF4E8]"
      >
        <Plus className="h-4 w-4" />
        新基地
      </button>
      <button
        type="button"
        onClick={onToggleEditing}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition-colors ${
          isEditing
            ? 'border-[#2F5D4A] bg-[#EEF4E8] text-[#2F5D4A] hover:bg-[#E1ECD9]'
            : 'border-[#C9D9C3] bg-[#FFFDF7] text-[#2F5D4A] hover:bg-[#EEF4E8]'
        }`}
      >
        <Pencil className="h-4 w-4" />
        {isEditing ? '完成' : '编辑'}
      </button>
      <button
        type="button"
        onClick={onResetData}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-3 py-2 text-xs font-medium text-[#6B7E65] shadow-sm transition-colors hover:bg-[#F1F5EA] hover:text-[#2F5D4A]"
        title="恢复默认数据"
      >
        <RotateCcw className="h-4 w-4" />
        恢复默认
      </button>
    </aside>
  );
};

const MobileAuthorTools: React.FC<AuthorToolProps> = ({
  isEditing,
  onAddLog,
  onAddBase,
  onToggleEditing,
  onResetData,
  isHockney = false,
  isHockneySummer = false,
  isSanctuary = false
}) => {
  const themeClass = authorToolsThemeClass({ isHockney, isHockneySummer, isSanctuary });

  return (
    <nav
      aria-label="作者工具"
      className={`author-mobile-tools fixed inset-x-3 bottom-3 z-[75] grid grid-cols-4 gap-2 rounded-xl border border-[#DDE5D6] bg-[#FFFDF7]/95 p-2 shadow-xl shadow-stone-900/10 backdrop-blur xl:hidden ${themeClass}`}
    >
      <button
        type="button"
        onClick={onAddLog}
        className="inline-flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg bg-[#2F5D4A] px-2 py-2 text-[11px] font-medium leading-none text-[#FFFDF4] shadow-sm"
      >
        <Plus className="h-4 w-4" />
        记录
      </button>
      <button
        type="button"
        onClick={onAddBase}
        className="inline-flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border border-[#C9D9C3] bg-[#FFFDF7] px-2 py-2 text-[11px] font-medium leading-none text-[#2F5D4A] shadow-sm"
      >
        <MapPin className="h-4 w-4" />
        基地
      </button>
      <button
        type="button"
        onClick={onToggleEditing}
        className={`inline-flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-medium leading-none shadow-sm ${
          isEditing
            ? 'border-[#2F5D4A] bg-[#EEF4E8] text-[#2F5D4A]'
            : 'border-[#C9D9C3] bg-[#FFFDF7] text-[#2F5D4A]'
        }`}
      >
        <Pencil className="h-4 w-4" />
        {isEditing ? '完成' : '编辑'}
      </button>
      <button
        type="button"
        onClick={onResetData}
        className="inline-flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-2 py-2 text-[11px] font-medium leading-none text-[#6B7E65] shadow-sm"
        title="恢复默认"
      >
        <RotateCcw className="h-4 w-4" />
        恢复
      </button>
    </nav>
  );
};

const BaseNoteCard: React.FC<{
  base: Base;
  latestLog?: WalkLog;
  onClick: () => void;
  isHockney?: boolean;
  isHockneySummer?: boolean;
  isSanctuary?: boolean;
  palette?: BasePalette;
}> = ({ base, latestLog, onClick, isHockney = false, isHockneySummer = false, isSanctuary = false, palette }) => {
  const cardImage = latestLog?.photos?.filter(Boolean)[0] ?? base.coverImage;
  const summary = latestLog?.content
    ? `“${shortText(latestLog.content, 42)}”`
    : shortText(base.description, 48);
  const accent = palette?.accent ?? '#2F5D4A';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] text-left shadow-sm shadow-emerald-950/5 transition-colors hover:border-[#BFD1B8] hover:bg-[#F9FAF2] ${
        isHockneySummer ? 'hockney-summer-note-card' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card' : ''
      }`}
      style={
        isSanctuary && palette
          ? ({
              '--sanctuary-accent': palette.accent,
              '--sanctuary-soft': palette.soft,
              '--sanctuary-shadow': palette.shadow
            } as React.CSSProperties)
          : undefined
      }
    >
      {isSanctuary && (
        <span
          aria-hidden="true"
          className="sanctuary-card-strip block h-2.5 w-full"
        />
      )}
      <span
        className={`block h-40 w-full flex-none ${
          isHockneySummer ? 'hockney-summer-note-image' : isHockney ? 'hockney-image-frame' : isSanctuary ? 'sanctuary-image-frame' : ''
        }`}
      >
        <img
          src={cardImage}
          alt={base.title}
          referrerPolicy="no-referrer"
          className="block h-full w-full object-cover object-center align-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </span>
      <span className="block p-4">
        <span
          className="flex items-center gap-2 font-serif text-lg font-semibold text-[#243C32]"
          style={isSanctuary ? { color: accent } : undefined}
        >
          {isSanctuary && (
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
          )}
          {base.title}
        </span>
        <span className="mt-2 block text-sm leading-6 text-[#66745E]">
          {summary}
        </span>
        {latestLog && (
          <span
            className="mt-3 block text-xs text-[#7D8C74]"
            style={isSanctuary ? { color: accent } : undefined}
          >
            最近访问：{formatDate(latestLog.date)}
          </span>
        )}
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

const BaseDetailCover: React.FC<{
  src: string;
  alt: string;
  isHockney?: boolean;
  isHockneySummer?: boolean;
  isSanctuary?: boolean;
}> = ({ src, alt, isHockney = false, isHockneySummer = false, isSanctuary = false }) => {
  return (
    <figure
      className={`h-44 w-full self-start overflow-hidden bg-[#F4F7ED] md:h-64 md:max-h-64 ${
        isHockneySummer ? 'hockney-summer-detail-image' : isHockney ? 'hockney-image-frame' : isSanctuary ? 'sanctuary-image-frame' : ''
      }`}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
      />
    </figure>
  );
};

interface BaseDetailProps {
  base: Base;
  logs: WalkLog[];
  getWeatherIcon: (weather: string) => React.ReactNode;
  isEditing: boolean;
  onBack: () => void;
  onDeleteLog: (id: string) => void;
  isHockney?: boolean;
  isHockneySummer?: boolean;
  isSanctuary?: boolean;
  palette?: BasePalette;
}

const BaseDetail: React.FC<BaseDetailProps> = ({
  base,
  logs,
  getWeatherIcon,
  isEditing,
  onBack,
  onDeleteLog,
  isHockney = false,
  isHockneySummer = false,
  isSanctuary = false,
  palette
}) => {
  const accent = palette?.accent ?? '#2F5D4A';

  return (
    <section className={isHockneySummer ? 'hockney-summer-page space-y-3' : 'space-y-3'}>
      <button
        type="button"
        onClick={onBack}
        className={`relative z-10 inline-flex items-center gap-1.5 rounded-lg border border-[#DDE5D6] bg-[#FFFDF7] px-3 py-1.5 text-xs font-medium text-[#5B7055] transition-colors hover:bg-[#EEF4E8] hover:text-[#2F5D4A] ${
          isHockneySummer ? 'hockney-summer-back-button' : isSanctuary ? 'sanctuary-back-button' : ''
        }`}
        style={
          isSanctuary && palette
            ? ({
                '--sanctuary-accent': palette.accent,
                '--sanctuary-soft': palette.soft,
                '--sanctuary-shadow': palette.shadow,
                color: palette.text,
                borderColor: `color-mix(in srgb, ${palette.accent} 15%, transparent)`
              } as React.CSSProperties)
            : undefined
        }
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </button>

      <div
        className={`overflow-hidden rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] shadow-sm shadow-emerald-950/5 ${
          isHockneySummer ? 'hockney-summer-detail-card' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card' : ''
        }`}
        style={
          isSanctuary && palette
            ? ({
                '--sanctuary-accent': palette.accent,
                '--sanctuary-soft': palette.soft,
                '--sanctuary-shadow': palette.shadow,
                borderColor: `color-mix(in srgb, ${palette.accent} 15%, transparent)`
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className="grid items-start md:grid-cols-[300px_1fr]">
          <BaseDetailCover
            src={base.coverImage}
            alt={base.title}
            isHockney={isHockney}
            isHockneySummer={isHockneySummer}
            isSanctuary={isSanctuary}
          />
          <div className="p-4 sm:p-5">
            <div>
              <div>
                <p className={`text-xs text-[#7D8C74] ${isHockneySummer ? 'hockney-summer-detail-subtitle' : ''}`}>{base.subtitle}</p>
                <h1
                  className={`mt-0.5 flex items-center gap-2 font-serif text-2xl font-semibold text-[#243C32] sm:text-3xl ${
                    isHockneySummer ? 'hockney-summer-detail-title' : ''
                  }`}
                  style={isSanctuary ? { color: accent } : undefined}
                >
                  {isSanctuary && (
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                  )}
                  {base.title}
                </h1>
              </div>
            </div>
            <p className={`mt-2 flex items-center gap-1.5 text-xs text-[#6B7E65] ${isHockneySummer ? 'hockney-summer-detail-meta' : ''}`}>
              <MapPin className="h-4 w-4" />
              {base.location}
            </p>
            <p className={`mt-3 font-serif text-sm leading-6 text-stone-800 sm:text-base sm:leading-7 ${isHockneySummer ? 'hockney-summer-detail-description' : ''}`}>
              {base.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2
          className={`font-serif text-xl font-semibold text-[#243C32] ${isHockneySummer ? 'hockney-summer-section-title' : ''}`}
          style={isSanctuary ? { color: accent } : undefined}
        >
          这个地点的记录
        </h2>
        {isSanctuary && (
          <span aria-hidden="true" className="block h-1 w-16 rounded-full" style={{ backgroundColor: accent }} />
        )}
        {logs.length === 0 ? (
          <div
            className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-8 text-center text-sm text-[#6B7E65] ${
              isHockneySummer ? 'hockney-summer-panel' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card' : ''
            }`}
          >
            还没有记录。
          </div>
        ) : (
          logs.map((log) => (
            <LogCard
              key={log.id}
              log={log}
              getWeatherIcon={getWeatherIcon}
              isEditing={isEditing}
              isHockney={isHockney}
              isHockneySummer={isHockneySummer}
              isSanctuary={isSanctuary}
              palette={palette}
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
  isEditing: boolean;
  isHockney?: boolean;
  isHockneySummer?: boolean;
  isSanctuary?: boolean;
  palette?: BasePalette;
  onOpenBase?: () => void;
  onDelete: () => void;
}

const LogCard: React.FC<LogCardProps> = ({
  log,
  base,
  getWeatherIcon,
  isEditing,
  isHockney = false,
  isHockneySummer = false,
  isSanctuary = false,
  palette,
  onOpenBase,
  onDelete
}) => {
  const photos = logPhotos(log);
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showActions) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (actionsRef.current?.contains(event.target as Node)) return;
      setShowActions(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [showActions]);

  useEffect(() => {
    if (!isEditing) setShowActions(false);
  }, [isEditing]);

  return (
    <div className="relative" ref={actionsRef}>
      <article
        className={`rounded-xl border border-[#DDE5D6] bg-[#FFFDF7] p-4 pr-12 shadow-sm shadow-emerald-950/5 xl:pr-4 ${
          isHockneySummer ? 'hockney-summer-log-card' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card sanctuary-log-card' : ''
        }`}
        style={
          isSanctuary && palette
            ? ({
                '--sanctuary-accent': palette.accent,
                '--sanctuary-soft': palette.soft,
                '--sanctuary-shadow': palette.shadow
              } as React.CSSProperties)
            : undefined
        }
      >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7E65]">
          <span className={`inline-flex items-center gap-1 rounded-md bg-[#EEF4E8] px-2 py-1 font-mono text-[#5B7055] ${isHockneySummer ? 'hockney-summer-chip' : ''}`}>
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(log.date)}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-md bg-[#F4F0E3] px-2 py-1 text-[#6A6046] ${isHockneySummer ? 'hockney-summer-chip hockney-summer-chip-pink' : ''}`}>
            {getWeatherIcon(log.weather)}
            {log.weatherText}
          </span>
          {base && (
            <button
              type="button"
              onClick={onOpenBase}
              className={`rounded-md bg-[#EEF4E8] px-2 py-1 text-[#4D6B50] transition-colors hover:bg-[#E1ECD9] ${
                isHockneySummer ? 'hockney-summer-chip hockney-summer-chip-green' : isSanctuary ? 'sanctuary-base-tag' : ''
              }`}
              style={
                isSanctuary && palette
                  ? {
                      '--sanctuary-accent': palette.accent,
                      backgroundColor: palette.soft,
                      color: palette.text
                    } as React.CSSProperties
                  : undefined
              }
            >
              {base.title}
            </button>
          )}
        </div>
      </div>
      <p className={`whitespace-pre-line font-serif text-base leading-8 text-stone-800 ${isHockneySummer ? 'hockney-summer-log-text' : ''}`}>
        {log.content}
      </p>
      <LogPhotoGrid photos={photos} date={log.date} isHockney={isHockney} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {log.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-md border border-transparent bg-[#EEF4E8] px-2 py-1 text-xs text-[#5B7055] ${isHockneySummer ? 'hockney-summer-tag' : ''}`}
            style={
              isSanctuary && palette
                ? {
                    backgroundColor: `color-mix(in srgb, ${palette.accent} 8%, white)`,
                    borderColor: `color-mix(in srgb, ${palette.accent} 20%, transparent)`,
                    color: palette.text
                  }
                : undefined
            }
          >
            #{tag}
          </span>
        ))}
      </div>
      </article>
      {isEditing && (
        <button
          type="button"
          onClick={() => setShowActions((current) => !current)}
          title="更多操作"
          aria-expanded={showActions}
          className="absolute right-3 top-3 hidden rounded-md border border-transparent bg-[#FFFDF7] p-1.5 text-[#8A987E] shadow-sm transition-colors hover:border-[#DDE5D6] hover:bg-[#F1F5EA] hover:text-[#2F5D4A] xl:block xl:-right-11 xl:border-[#E5DED3]"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
      {isEditing && (
        <button
          type="button"
          onClick={onDelete}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 shadow-sm transition-colors hover:bg-rose-100 xl:hidden"
        >
          <Trash2 className="h-3.5 w-3.5" />
          删除
        </button>
      )}
      {isEditing && showActions && (
        <div className="absolute right-3 top-11 z-20 w-28 rounded-lg border border-[#E5DED3] bg-[#FFFDF7] p-1 shadow-lg shadow-stone-900/10 xl:-right-11">
          <button
            type="button"
            onClick={() => {
              setShowActions(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            删除
          </button>
        </div>
      )}
    </div>
  );
};
