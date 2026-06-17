/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WalkLog, Base } from '../types';
import { Compass, CloudSun, Leaf, Eye, Heart, Calendar } from 'lucide-react';

interface NatureStatsProps {
  logs: WalkLog[];
  bases: Base[];
}

export default function NatureStats({ logs, bases }: NatureStatsProps) {
  // Count weather statistics
  const weatherCounts: Record<string, number> = {
    sunny: 0,
    cloudy: 0,
    rainy: 0,
    overcast: 0,
    windy: 0,
  };

  logs.forEach(log => {
    if (weatherCounts[log.weather] !== undefined) {
      weatherCounts[log.weather]++;
    } else {
      weatherCounts.cloudy++;
    }
  });

  const totalLogs = logs.length;
  
  // Aggregate tags for natural phenomenon trends
  const tagCounts: Record<string, number> = {};
  logs.forEach(log => {
    log.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort tags by frequency
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // SVG Doughnut logic
  const weatherLabels: Record<string, { label: string; color: string }> = {
    sunny: { label: '晴天 Sunny', color: '#f59e0b' },   // amber-500
    cloudy: { label: '多云 Cloudy', color: '#10b981' },  // emerald-500
    rainy: { label: '雨天 Rainy', color: '#3b82f6' },   // blue-500
    overcast: { label: '阴天 Overcast', color: '#6b7280' }, // gray-500
    windy: { label: '有风 Windy', color: '#8b5cf6' },   // purple-500
  };

  const weatherDataArray = Object.entries(weatherCounts)
    .filter(([_, count]) => count > 0)
    .map(([weather, count]) => ({
      key: weather,
      count,
      percent: totalLogs ? Math.round((count / totalLogs) * 100) : 0,
      ...weatherLabels[weather]
    }));

  // Simple SVG Arc calculations for Doughnut
  let currentAngle = 0;
  const radius = 55;
  const cx = 75;
  const cy = 75;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Panel 1: Overview stats card */}
      <div className="bg-[#fcfbf9] border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <h4 className="font-serif text-base font-semibold text-stone-800 flex items-center gap-2 mb-4">
            <span className="p-1 bg-emerald-50 text-emerald-800 rounded-md">
              <Compass className="w-4 h-4" />
            </span>
            散步日志纵览
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 border border-stone-200/40 rounded-xl p-3">
              <div className="text-[10px] text-stone-400 font-mono tracking-wider">OBSERVATION BASES</div>
              <div className="text-2xl font-serif font-bold text-stone-800 mt-1">{bases.length} 个</div>
              <div className="text-[10px] text-stone-500 mt-0.5">精心标记的基地</div>
            </div>
            
            <div className="bg-stone-50 border border-stone-200/40 rounded-xl p-3">
              <div className="text-[10px] text-stone-400 font-mono tracking-wider">TOTAL WALK JOURNAL</div>
              <div className="text-2xl font-serif font-bold text-stone-800 mt-1">{totalLogs} 篇</div>
              <div className="text-[10px] text-stone-500 mt-0.5">累积散步观测日志</div>
            </div>
            
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 flex flex-col justify-center">
              <div className="text-xs text-emerald-950 font-serif font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-emerald-700 fill-emerald-100" />
                人与自然连接
              </div>
              <div className="text-[10px] text-emerald-800 font-mono mt-1">
                水、天、松、木
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200/50 text-xs text-stone-500 italic font-serif flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-800/70" />
          "散步是与大地深交最温柔的方式。"
        </div>
      </div>

      {/* Panel 2: Weather Dynamics (Beautiful SVG chart) */}
      <div className="bg-[#fcfbf9] border border-stone-200/80 rounded-2xl p-6">
        <h4 className="font-serif text-base font-semibold text-stone-800 flex items-center gap-2 mb-4">
          <span className="p-1 bg-sky-50 text-sky-800 rounded-md">
            <CloudSun className="w-4 h-4" />
          </span>
          散步天气频次分布
        </h4>
        
        <div className="flex items-center gap-6">
          {/* Doughnut SVG */}
          <div className="relative w-[150px] h-[150px] flex-shrink-0">
            <svg width="150" height="150" className="transform -rotate-90">
              <circle 
                cx={cx} 
                cy={cy} 
                r={radius} 
                fill="transparent" 
                stroke="#f5f5f4" 
                strokeWidth="16" 
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
                    strokeWidth="16"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                    className="transition-all duration-500 hover:stroke-amber-900 cursor-pointer"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-serif font-bold text-stone-800">{totalLogs}</span>
              <span className="text-[10px] text-stone-400 font-mono">OBSERVATIONS</span>
            </div>
          </div>

          {/* Legend list */}
          <div className="flex-1 flex flex-col gap-2">
            {weatherDataArray.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
                <span className="font-mono text-stone-500 font-semibold">{item.count}次 ({item.percent}%)</span>
              </div>
            ))}
            {weatherDataArray.length === 0 && (
              <div className="text-xs text-stone-400 italic">暂无记录无法统计...</div>
            )}
          </div>
        </div>
      </div>

      {/* Panel 3: Tag Cloud / Natural Phenomenon Trends */}
      <div className="bg-[#fcfbf9] border border-stone-200/80 rounded-2xl p-6">
        <h4 className="font-serif text-base font-semibold text-stone-800 flex items-center gap-2 mb-4">
          <span className="p-1 bg-amber-50 text-amber-800 rounded-md">
            <Leaf className="w-4 h-4" />
          </span>
          自然奇观与万物萌动
        </h4>
        <p className="text-xs text-stone-500 mb-3">
          连续30天里散步时，被重点捕捉、最常出现在日志中的自然迹象、动植物动态标签统计：
        </p>

        <div className="flex flex-wrap gap-2.5 mt-2">
          {sortedTags.map(([tag, count], index) => {
            // Give different aesthetic warm shades based on rank
            const bgClasses = [
              'bg-[#F0F5F2] text-[#2E5E4E] border-[#DCEBE4]',
              'bg-[#F0F4F7] text-[#2B4C5E] border-[#DCE4EC]',
              'bg-amber-50 text-amber-900 border-amber-200/50',
              'bg-stone-100 text-stone-700 border-stone-200',
              'bg-purple-50 text-purple-950 border-purple-100',
              'bg-rose-50 text-rose-950 border-rose-100'
            ];
            
            return (
              <div 
                key={tag}
                className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.03] ${bgClasses[index] || bgClasses[3]}`}
              >
                <Eye className="w-3.5 h-3.5 opacity-70" />
                <span className="font-medium font-serif">{tag}</span>
                <span className="font-mono text-[9px] px-1 bg-black/5 rounded-md font-bold">{count}次</span>
              </div>
            );
          })}
          {sortedTags.length === 0 && (
            <div className="text-xs text-stone-400 italic">等待开始第一次散步观测，标签正在孕育...</div>
          )}
        </div>

        <div className="mt-5 text-[10px] text-stone-400 flex items-center justify-between border-t border-stone-200/40 pt-3 font-mono">
          <span>PHENOMENOLOGY SCORE: High</span>
          <span>生态连接感良好</span>
        </div>
      </div>
    </div>
  );
}
