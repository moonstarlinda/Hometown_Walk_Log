/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Base } from '../types';
import { X, Save, Plus, MapPin } from 'lucide-react';

interface AddBaseModalProps {
  onClose: () => void;
  onAddBase: (base: Omit<Base, 'id' | 'coverImage'> & { coverType: string }) => void;
}

export default function AddBaseModal({ onClose, onAddBase }: AddBaseModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coverType, setCoverType] = useState('woodland'); // woodland, river, mountain, lake, meadow

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      alert('请填写完整的秘密基地标题、观测地点和简述。');
      return;
    }

    onAddBase({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Custom Wander Spot',
      description: description.trim(),
      location: location.trim(),
      coverType
    });
  };

  const coverOptions = [
    { type: 'woodland', label: '林荫斑驳 Woodland', sample: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400' },
    { type: 'river', label: '河川浅滩 River Shallows', sample: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400' },
    { type: 'mountain', label: '苍翠远山 Green Mountain', sample: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400' },
    { type: 'lake', label: '静池明水 Calm Lake', sample: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400' },
    { type: 'meadow', label: '山麓原野 Summer Meadow', sample: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=400' }
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200/60 bg-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
              <span className="p-1 bg-emerald-50 text-emerald-800 rounded-md">
                <MapPin className="w-4 h-4" />
              </span>
              标记并记录一处新的秘密基地
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              在你散步环线的山野林泉中发现新视角？立即绘制并加入地图卡组。
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 select-none">
          {/* Base Title */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              1. 基地标题 Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：06号基地 · 落叶大壑、林中小池"
              className="w-full text-sm p-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              2. 英文或拼音别名 Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="例如：Deep Woodland Valley 或者是 Song Lin Xiao Chi"
              className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none font-mono"
            />
          </div>

          {/* Location Description */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              3. 地点描述 / 寻路标志 Location Mark *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：森林东入口右侧古樟树夹道、后山石阶最顶端"
              className="w-full text-sm p-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none"
            />
          </div>

          {/* Cover option */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              4. 选取明信片封面 Nature Vibe *
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto p-2 border border-stone-200/50 rounded-xl bg-stone-50/50">
              {coverOptions.map(opt => {
                const isSelected = coverType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setCoverType(opt.type)}
                    className={`flex items-center gap-3 p-1.5 rounded-lg border text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-white border-stone-100 hover:border-stone-200 text-stone-600'
                    }`}
                  >
                    <img 
                      src={opt.sample} 
                      alt={opt.label} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-7 object-cover rounded-md" 
                    />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-700 mb-1.5">
              5. 秘密基地风貌描述 Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述此处的自然形态，例如：两排古槐合抱形成阴凉，底下长满厚厚的苔地，常有溪流分支流过，偶尔可见野兔和红松鼠，仰面是一小块纯粹的苍穹..."
              className="w-full text-xs p-3 bg-white border border-stone-200 rounded-xl focus:border-emerald-700 outline-none font-serif leading-relaxed"
            />
          </div>
        </form>

        {/* Footer */}
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
            建立并发布此基地
          </button>
        </div>
      </div>
    </div>
  );
}
