/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Base, WalkLog } from '../types';
import { X, Save, CloudRain, Sun, Cloud, Wind, CloudFog, Plus } from 'lucide-react';

interface AddLogModalProps {
  bases: Base[];
  selectedBaseId: string | null;
  onClose: () => void;
  onAddLog: (log: Omit<WalkLog, 'id'>) => void;
}

type Weather = WalkLog['weather'];

function inferWeatherFromText(selectedWeather: Weather, weatherText: string): Weather {
  const text = weatherText.trim();

  if (selectedWeather !== 'sunny' || !text) return selectedWeather;
  if (/[雨雪霰雹]/.test(text)) return 'rainy';
  if (/[风風吹]/.test(text)) return 'windy';
  if (/[阴陰]/.test(text)) return 'overcast';
  if (/[云雲]/.test(text)) return 'cloudy';

  return selectedWeather;
}

function defaultTagForWeather(weather: Weather) {
  switch (weather) {
    case 'sunny':
      return '烈日晴天';
    case 'cloudy':
      return '流云缓行';
    case 'rainy':
      return '淅沥小雨';
    case 'overcast':
      return '阴天漫步';
    case 'windy':
      return '风声穿林';
    default:
      return '偶有随感';
  }
}

export default function AddLogModal({
  bases,
  selectedBaseId,
  onClose,
  onAddLog
}: AddLogModalProps) {
  const [baseId, setBaseId] = useState(selectedBaseId || bases[0]?.id || '');
  const [date, setDate] = useState('2026-06-15'); // default to current local date
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy' | 'overcast' | 'windy'>('sunny');
  const [weatherText, setWeatherText] = useState('微风晴朗');
  const [content, setContent] = useState('');
  const [photoPaths, setPhotoPaths] = useState('');
  
  // Tag presets
  const presetTags = [
    '水质清澈', '水质浑浊', '野鸭出没', '静坐垂钓', 
    '松涛低吟', '山峦晨雾', '白云移影', '暴雨前夕', 
    '割草芳香', '林间幽凉', '苔藓亮色', '野花漫地', 
    '晨露晶莹', '溪水潺潺', '柳荫波光', '时光缓缓'
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customTag.trim();
    if (cleaned && !selectedTags.includes(cleaned)) {
      setSelectedTags([...selectedTags, cleaned]);
      setCustomTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('请输入漫步观测记录文字。');
      return;
    }
    
    const submittedWeatherText = weatherText.trim() || '温润天气';
    const submittedWeather = inferWeatherFromText(weather, submittedWeatherText);

    // Add default tags if none chosen to preserve visual beauty
    let tagsToSubmit = [...selectedTags];
    if (tagsToSubmit.length === 0) {
      tagsToSubmit.push(defaultTagForWeather(submittedWeather));
    }
    if (false && tagsToSubmit.length === 0) {
      if (weather === 'sunny') tagsToSubmit.push('烈日晴天');
      else if (weather === 'cloudy') tagsToSubmit.push('清云悠悠');
      else if (weather === 'rainy') tagsToSubmit.push('淅沥小雨');
      else tagsToSubmit.push('偶有随感');
    }

    const photos = photoPaths
      .split(/[\n,]/)
      .map(path => path.trim())
      .filter(Boolean);

    onAddLog({
      baseId,
      date,
      weather: submittedWeather,
      weatherText: submittedWeatherText,
      tags: tagsToSubmit,
      ...(photos.length > 0 ? { photos } : {}),
      content: content.trim()
    });
  };

  // Weather configuration details for quick selection UI
  const weatherConfigs = [
    { key: 'sunny', label: '晴', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { key: 'cloudy', label: '多云', icon: <CloudSunIcon className="w-4 h-4 text-emerald-500" /> },
    { key: 'overcast', label: '阴', icon: <CloudFog className="w-4 h-4 text-stone-500" /> },
    { key: 'rainy', label: '急雨', icon: <CloudRain className="w-4 h-4 text-blue-500" /> },
    { key: 'windy', label: '起风', icon: <Wind className="w-4 h-4 text-purple-500" /> },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 border-b border-stone-200/60 bg-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-800">记下一笔新的散步观测</h3>
            <p className="text-xs text-stone-500 mt-1">
              文字不长，字字珠玑。记录基地里的水草、飞禽、松涛，也收好路上的偶遇。
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form Scroll Container */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 select-none">
          {/* Base Selection Row */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              1. 选定记录位置 Place *
            </label>
            <select
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              className="w-full text-sm p-3 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none transition-colors"
              required
            >
              {bases.map(base => (
                <option key={base.id} value={base.id}>
                  {base.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              2. 记录到访日期 Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm p-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none font-mono"
              required
            />
          </div>

          {/* Weather configuration Grid */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              3. 气候环境状态 Weather *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {weatherConfigs.map(cfg => {
                const isSelected = weather === cfg.key;
                return (
                  <button
                    key={cfg.key}
                    type="button"
                    onClick={() => setWeather(cfg.key)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-white border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
            
            <input
              type="text"
              value={weatherText}
              onChange={(e) => setWeatherText(e.target.value)}
              placeholder="自定义微气候详情（例如：骤雨放晴、薄雾笼罩、风急松鸣）"
              className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none mt-2"
            />
          </div>

          {/* Tags Select Group */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              4. 标记你今日观察到的独特迹象 Tags (可多选)
            </label>
            
            <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-2 border border-stone-200/50 rounded-xl bg-stone-50/50">
              {presetTags.map(tag => {
                const isChecked = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      isChecked
                        ? 'bg-emerald-800 border-emerald-800 text-white'
                        : 'bg-white border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag additions */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="在此追加你今日偶遇的特殊标签（如：小白羽毛、苔藓变褐）"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className="flex-1 text-xs p-2 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs px-3 rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                添入
              </button>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              5. 照片路径 Photos (可选)
            </label>
            <textarea
              rows={2}
              value={photoPaths}
              onChange={(e) => setPhotoPaths(e.target.value)}
              placeholder="/images/base_1_ducks.jpg，或每行一张照片路径"
              className="w-full text-xs p-3 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none font-mono leading-relaxed"
            />
          </div>

          {/* Diary write Area */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              6. 今日林泉随感 Observation Record *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日河水是清澈还是有些浑浊？河中的小沙洲上，野鸭子今天在吗？钓鱼人钓到什么了吗？长椅后松涛声多大，对山的长天云朵发生了何种神妙变迁？静静看了一会儿，随便写下一两行心语..."
              className="w-full text-sm p-4 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none transition-colors font-serif leading-relaxed"
            />
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-200/60 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs border border-stone-200 hover:bg-stone-50 rounded-xl font-medium text-stone-600 transition-colors"
          >
            取消关闭
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-xs bg-emerald-800 hover:bg-emerald-950 rounded-xl font-semibold text-white transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            保存散步日志
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple custom component for CloudSun icon to prevent rendering warnings
function CloudSunIcon({ className }: { className?: string }) {
  return (
    <span className={className}>
      <Cloud className="w-4 h-4 inline" />
    </span>
  );
}
