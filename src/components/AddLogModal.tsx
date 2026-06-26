/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudRain,
  Image,
  Plus,
  RotateCcw,
  Save,
  Sun,
  Trash2,
  Upload,
  Wind,
  X
} from 'lucide-react';
import { Base, WalkLog } from '../types';
import { uploadLogPhotos } from '../services/walkLogService';

interface AddLogModalProps {
  bases: Base[];
  mode?: 'create' | 'edit';
  selectedBaseId: string | null;
  initialLog?: WalkLog | null;
  themeVariant?: 'default' | 'hockneySummer';
  onClose: () => void;
  onSaveLog: (log: Omit<WalkLog, 'id'>) => Promise<void> | void;
}

type Weather = WalkLog['weather'];
type DraftLog = Omit<WalkLog, 'id'> & { customTag: string };

const WEATHER_OPTIONS: Array<{
  key: Weather;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: 'sunny', label: '晴', icon: <Sun className="h-4 w-4 text-amber-500" /> },
  { key: 'cloudy', label: '多云', icon: <Cloud className="h-4 w-4 text-emerald-500" /> },
  { key: 'overcast', label: '阴', icon: <CloudFog className="h-4 w-4 text-stone-500" /> },
  { key: 'rainy', label: '雨', icon: <CloudRain className="h-4 w-4 text-blue-500" /> },
  { key: 'windy', label: '风', icon: <Wind className="h-4 w-4 text-purple-500" /> }
];

const PRESET_TAGS = [
  '水质清澈',
  '水质浑浊',
  '野鸭出没',
  '静坐垂钓',
  '松涛低吟',
  '山岚晨雾',
  '白云移影',
  '暴雨前夕',
  '割草芳香',
  '林间幽凉',
  '苔藓亮色',
  '野花漫地',
  '晨露晶莹',
  '溪水潺潺',
  '柳荫波光',
  '时光缓缓'
];
const PRESET_TAG_SET = new Set(PRESET_TAGS);

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function inferWeatherFromText(selectedWeather: Weather, weatherText: string): Weather {
  void weatherText;
  return selectedWeather;
}

function defaultTagForWeather(weather: Weather) {
  switch (weather) {
    case 'sunny':
      return '晴日漫步';
    case 'cloudy':
      return '流云缓行';
    case 'rainy':
      return '清润小雨';
    case 'overcast':
      return '阴天漫步';
    case 'windy':
      return '风声穿林';
    default:
      return '偶有随感';
  }
}

function weatherLabelForWeather(weather: Weather) {
  return WEATHER_OPTIONS.find((option) => option.key === weather)?.label ?? '晴';
}

function makeDraftKey(mode: 'create' | 'edit', logId?: string) {
  return mode === 'edit' && logId ? `walk-log-draft:edit:${logId}` : 'walk-log-draft:create';
}

function parseDraft(value: string | null): DraftLog | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<DraftLog>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      baseId: typeof parsed.baseId === 'string' ? parsed.baseId : '',
      date: typeof parsed.date === 'string' ? parsed.date : todayKey(),
      weather: parsed.weather ?? 'sunny',
      weatherText: typeof parsed.weatherText === 'string' ? parsed.weatherText : '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((tag) => typeof tag === 'string') : [],
      photos: Array.isArray(parsed.photos)
        ? parsed.photos.filter((photo) => typeof photo === 'string')
        : undefined,
      content: typeof parsed.content === 'string' ? parsed.content : '',
      customTag: typeof parsed.customTag === 'string' ? parsed.customTag : ''
    };
  } catch {
    return null;
  }
}

function hasMeaningfulDraft(draft: DraftLog) {
  return Boolean(
    draft.content.trim() ||
      draft.weatherText.trim() ||
      draft.tags.length ||
      (draft.photos?.length ?? 0) > 0 ||
      draft.customTag.trim()
  );
}

function sameStringList(firstList: string[] | undefined, secondList: string[] | undefined) {
  const first = firstList ?? [];
  const second = secondList ?? [];
  return first.length === second.length && first.every((item, index) => item === second[index]);
}

function sameDraft(first: DraftLog, second: DraftLog) {
  return (
    first.baseId === second.baseId &&
    first.date === second.date &&
    first.weather === second.weather &&
    first.weatherText === second.weatherText &&
    first.content === second.content &&
    first.customTag === second.customTag &&
    sameStringList(first.tags, second.tags) &&
    sameStringList(first.photos, second.photos)
  );
}

function acceptedImageFiles(fileList: FileList | File[]) {
  return Array.from(fileList).filter((file) => file.type.startsWith('image/'));
}

export default function AddLogModal({
  bases,
  mode = 'create',
  selectedBaseId,
  initialLog,
  themeVariant = 'default',
  onClose,
  onSaveLog
}: AddLogModalProps) {
  const isHockneySummer = themeVariant === 'hockneySummer';
  const draftKey = useMemo(() => makeDraftKey(mode, initialLog?.id), [initialLog?.id, mode]);
  const initialDraft = useMemo<DraftLog>(() => {
    const savedDraft = parseDraft(localStorage.getItem(draftKey));
    if (savedDraft) return savedDraft;

    return {
      baseId: initialLog?.baseId || selectedBaseId || bases[0]?.id || '',
      date: initialLog?.date || todayKey(),
      weather: initialLog?.weather || 'sunny',
      weatherText: initialLog?.weatherText || '',
      tags: initialLog?.tags ?? [],
      photos: initialLog?.photos,
      content: initialLog?.content || '',
      customTag: ''
    };
  }, [bases, draftKey, initialLog, selectedBaseId]);

  const [baseId, setBaseId] = useState(initialDraft.baseId);
  const [date, setDate] = useState(initialDraft.date);
  const [weather, setWeather] = useState<Weather>(initialDraft.weather);
  const [weatherText, setWeatherText] = useState(initialDraft.weatherText);
  const [content, setContent] = useState(initialDraft.content);
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialDraft.photos ?? []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialDraft.tags);
  const [customTag, setCustomTag] = useState(initialDraft.customTag);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<string | null>(null);

  const draft: DraftLog = {
    baseId,
    date,
    weather,
    weatherText,
    tags: selectedTags,
    photos: photoUrls,
    content,
    customTag
  };
  const hasDraftChanges = !sameDraft(draft, initialDraft);

  useEffect(() => {
    if (isSaving) return;

    const timer = window.setTimeout(() => {
      if (!hasDraftChanges) return;

      if (hasMeaningfulDraft(draft)) {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        localStorage.removeItem(draftKey);
        setLastDraftSavedAt(null);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [baseId, content, customTag, date, draftKey, hasDraftChanges, initialDraft, isSaving, photoUrls, selectedTags, weather, weatherText]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    );
  };

  const handleAddCustomTag = (event?: React.FormEvent) => {
    event?.preventDefault();
    const cleaned = customTag.trim();
    if (cleaned && !selectedTags.includes(cleaned)) {
      setSelectedTags((currentTags) => [...currentTags, cleaned]);
      setCustomTag('');
    }
  };

  const removeSelectedTag = (tag: string) => {
    setSelectedTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag));
  };

  const handleUploadPhotos = async (fileList: FileList | File[]) => {
    const files = acceptedImageFiles(fileList);
    if (files.length === 0) return;

    setIsUploadingPhotos(true);
    try {
      const uploadedUrls = await uploadLogPhotos(files);
      setPhotoUrls((currentUrls) => [...currentUrls, ...uploadedUrls]);
    } catch (error) {
      console.error('Failed to upload photos.', error);
      alert('照片上传失败。请确认 Supabase Storage bucket 已创建，并允许作者账号上传图片。');
    } finally {
      setIsUploadingPhotos(false);
      setIsDraggingPhoto(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setPhotoUrls((currentUrls) => currentUrls.filter((url) => url !== photoUrl));
  };

  const handleClose = () => {
    if (hasDraftChanges && hasMeaningfulDraft(draft)) {
      const shouldClose = confirm('当前内容已经保存为草稿。现在关闭，之后再打开可以继续编辑。要关闭吗？');
      if (!shouldClose) return;
    }

    onClose();
  };

  const handleDiscardDraft = () => {
    if (!confirm('确定清空这份草稿吗？当前未保存的内容会被移除。')) return;
    localStorage.removeItem(draftKey);
    setBaseId(initialLog?.baseId || selectedBaseId || bases[0]?.id || '');
    setDate(initialLog?.date || todayKey());
    setWeather(initialLog?.weather || 'sunny');
    setWeatherText(initialLog?.weatherText || '');
    setContent(initialLog?.content || '');
    setPhotoUrls(initialLog?.photos ?? []);
    setSelectedTags(initialLog?.tags ?? []);
    setCustomTag('');
    setLastDraftSavedAt(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      alert('请输入散步观察记录文字。');
      return;
    }
    if (isUploadingPhotos) {
      alert('照片还在上传中，稍等一下再保存。');
      return;
    }

    const submittedWeatherText = weatherText.trim() || weatherLabelForWeather(weather);
    const submittedWeather = inferWeatherFromText(weather, submittedWeatherText);
    const pendingCustomTag = customTag.trim();
    const explicitTags = pendingCustomTag && !selectedTags.includes(pendingCustomTag)
      ? [...selectedTags, pendingCustomTag]
      : selectedTags;
    const tagsToSubmit =
      explicitTags.length > 0 ? explicitTags : [defaultTagForWeather(submittedWeather)];

    setIsSaving(true);
    try {
      await onSaveLog({
        baseId,
        date,
        weather: submittedWeather,
        weatherText: submittedWeatherText,
        tags: tagsToSubmit,
        ...(photoUrls.length > 0 ? { photos: photoUrls } : {}),
        content: content.trim()
      });
      localStorage.removeItem(draftKey);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[130] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs ${isHockneySummer ? 'hockney-summer-modal-shell' : ''}`}>
      <div className={`flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#FAF9F5] shadow-xl ${isHockneySummer ? 'hockney-summer-modal' : ''}`}>
        <div className="flex items-start justify-between gap-4 border-b border-stone-200/60 bg-white p-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-800">
              {mode === 'edit' ? '编辑这条散步记录' : '记下一笔新的散步观察'}
            </h3>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              写到一半会自动保存草稿。地点、天气、标签和照片之后也可以回来修改。
            </p>
            {lastDraftSavedAt && (
              <p className="mt-1 text-[11px] text-emerald-700">草稿已保存 {lastDraftSavedAt}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <div>
            <label className="mb-1.5 block font-serif text-xs font-bold text-stone-700">
              1. 记录位置 Place *
            </label>
            <select
              value={baseId}
              onChange={(event) => setBaseId(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none transition-colors focus:border-emerald-700"
              required
            >
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-serif text-xs font-bold text-stone-700">
              2. 到访日期 Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white p-2.5 font-mono text-sm outline-none focus:border-emerald-700"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block font-serif text-xs font-bold text-stone-700">
              3. 天气 Weather *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {WEATHER_OPTIONS.map((option) => {
                const isSelected = weather === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setWeather(option.key)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-xs transition-colors ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-950'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    } ${isHockneySummer ? 'hockney-summer-weather-option' : ''} ${
                      isHockneySummer && isSelected ? 'hockney-summer-weather-option-selected' : ''
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={weatherText}
              onChange={(event) => setWeatherText(event.target.value)}
              placeholder="自定义微天气，例如：薄雾放晴、雨后微凉、风急松鸣"
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-serif text-xs font-bold text-stone-700">
              4. 标签 Tags
            </label>

            <div className="max-h-[110px] overflow-y-auto rounded-xl border border-stone-200/50 bg-stone-50/50 p-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                        isChecked
                          ? 'border-emerald-800 bg-emerald-800 text-white'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedTags.some((tag) => !PRESET_TAG_SET.has(tag)) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedTags
                  .filter((tag) => !PRESET_TAG_SET.has(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeSelectedTag(tag)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 transition-colors hover:bg-emerald-100"
                      title="点击移除这个标签"
                    >
                      #{tag}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
              </div>
            )}

            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="追加一个自己的标签"
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white p-2 text-xs outline-none focus:border-emerald-700"
              />
              <button
                type="button"
                onClick={() => handleAddCustomTag()}
                className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
              >
                <Plus className="h-3.5 w-3.5" />
                加入
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-serif text-xs font-bold text-stone-700">
              5. 照片 Photos
            </label>
            <label
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingPhoto(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDraggingPhoto(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleUploadPhotos(event.dataTransfer.files);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors ${
                isDraggingPhoto
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-stone-300 bg-white text-stone-600 hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploadingPhotos}
                onChange={(event) => {
                  if (event.target.files) handleUploadPhotos(event.target.files);
                  event.currentTarget.value = '';
                }}
                className="sr-only"
              />
              <Upload className="mb-2 h-5 w-5" />
              <span className="text-sm font-medium">
                {isUploadingPhotos ? '照片上传中...' : '拖拽照片到这里，或点击选择/拍摄'}
              </span>
              <span className="mt-1 text-xs text-stone-500">
                上传后会自动保存为照片 URL，写进这条日志。
              </span>
            </label>

            {photoUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photoUrls.map((photoUrl) => (
                  <div
                    key={photoUrl}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-100"
                  >
                    <img src={photoUrl} alt="散步照片预览" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photoUrl)}
                      className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md bg-stone-950/70 text-white opacity-100 transition-colors hover:bg-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="移除照片"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoUrls.length === 0 && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-stone-500">
                <Image className="h-3.5 w-3.5" />
                暂时没有照片，也可以先保存文字。
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block font-serif text-xs font-bold text-stone-700">
              6. 观察记录 Observation *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="今天河水、树影、风、云、路边偶遇了什么？随便写下一两行也很好。"
              className="w-full rounded-xl border border-stone-200 bg-white p-4 font-serif text-sm leading-7 outline-none transition-colors focus:border-emerald-700"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/60 bg-white p-4">
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            清空草稿
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
            >
              关闭
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isUploadingPhotos}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-950 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <Save className="h-4 w-4" />
              {isSaving ? '保存中...' : mode === 'edit' ? '保存修改' : '保存记录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
