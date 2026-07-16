import { useMemo, useState } from 'react';
import { CalendarDays, Leaf, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export type PlantCategory = 'tree' | 'shrub' | 'herb' | 'vine';

type Plant = {
  id: number;
  name: string;
  category: PlantCategory;
  firstSeen: string;
  seenAgain?: string[];
  note?: string;
  image?: string;
};

export const CATEGORY_LABELS: Record<PlantCategory, string> = {
  tree: '乔木',
  shrub: '灌木',
  herb: '草本花卉',
  vine: '藤本草本'
};

export const PLANTS: Plant[] = [
  { id: 1, name: '茶条槭', category: 'tree', firstSeen: '2026.06.12', seenAgain: ['2026.07.11'],
    image: '/images/plants/acer_ginnala.jpg'},
  { id: 2, name: '白蜡树', category: 'tree', firstSeen: '2026.06.13',
    image: '/images/plants/fraxinus_chinensis.jpg'},
  { id: 3, name: '榆树', category: 'tree', firstSeen: '2026.06.13', seenAgain: ['2026.06.20', '2026.07.11'], note: '六月二十日记录到了它的翅果——榆钱。',
    image: '/images/plants/ulmus_pumila.jpg'},
  { id: 4, name: '油松', category: 'tree', firstSeen: '2026.06.13', seenAgain: ['2026.07.11'],
    image: '/images/plants/pinus_tabuliformis.jpg'},
  { id: 5, name: '花楸树', category: 'tree', firstSeen: '2026.06.13', seenAgain: ['2026.07.11'],
    image: '/images/plants/sorbus_pohuashanensis.jpg'},
  { id: 6, name: '榆叶梅', category: 'shrub', firstSeen: '2026.06.14', note: '记录时枝头已经结出青果。' ,
    image: '/images/plants/prunus_triloba.jpg'},
  { id: 7, name: '核桃楸', category: 'tree', firstSeen: '2026.06.17', seenAgain: ['2026.07.11'],
    image: '/images/plants/juglans_mandshurica.jpg'},
  { id: 8, name: '核桃树', category: 'tree', firstSeen: '2026.06.18',
    image: '/images/plants/juglans_regia.jpg'},
  { id: 9, name: '重瓣红刺玫', category: 'shrub', firstSeen: '2026.06.18',
    image: '/images/plants/rosa_multiflora.jpg'},
  { id: 10, name: '芍药', category: 'herb', firstSeen: '2026.06.18',
    image: '/images/plants/paeonia_lactiflora.jpg'},
  { id: 11, name: '栾树', category: 'tree', firstSeen: '2026.06.18', note: '照片中记录的是栾树的果瓣。' ,
    image: '/images/plants/koelreuteria_paniculata.jpg'
  },
  { id: 12, name: '红皮云杉', category: 'tree', firstSeen: '2026.07.03',
    image: '/images/plants/picea_koraiensis.jpg'},
  { id: 13, name: '广布野豌豆', category: 'vine', firstSeen: '2026.07.05',
    image: '/images/plants/vicia_cracca.jpg'},
  { id: 14, name: '路边青', category: 'herb', firstSeen: '2026.07.05',
    image: '/images/plants/plantago_asiatica.jpg'},
  { id: 15, name: '红车轴草', category: 'herb', firstSeen: '2026.07.05',
    image: '/images/plants/trifolium_pratense.jpg'},
  { id: 16, name: '宽叶打碗花', category: 'vine', firstSeen: '2026.07.05',
    image: '/images/plants/clematis_dahurica.jpg'
  },
  { id: 17, name: '白桦', category: 'tree', firstSeen: '2026.07.05', seenAgain: ['2026.07.11'],
    image: '/images/plants/betula_platyphylla.jpg'},
  { id: 18, name: '葎草', category: 'vine', firstSeen: '2026.07.05',
    image: '/images/plants/cayratia_japonica.jpg'},
  { id: 19, name: '龙芽草', category: 'herb', firstSeen: '2026.07.05',seenAgain: ['2026.07.16'],
    image: '/images/plants/agrimonia_pilosa.jpg'
   },
  { id: 20, name: '蒙古栎', category: 'tree', firstSeen: '2026.07.11',
    image: '/images/plants/quercus_mongolica.jpg'},
  { id: 21, name: '紫叶稠李', category: 'tree', firstSeen: '2026.07.11',
    image: '/images/plants/prunus_padus.jpg'
   },
  { id: 22, name: '旱柳', category: 'tree', firstSeen: '2026.07.11',
    image: '/images/plants/salix_psammophila.jpg'
   },
  { id: 23, name: '野火球', category: 'herb', firstSeen: '2026.07.11',
    image: '/images/plants/eryngium_planum.jpg'
   },
  { id: 24, name: '野大豆', category: 'vine', firstSeen: '2026.07.11',
    image: '/images/plants/glycine_soja.jpg'
   },
   { id: 25, name: '珍珠梅', category: 'shrub', firstSeen: '2026.07.15',
    image: '/images/plants/sorbaria_sorbifolia.jpg'
   },
   {  id: 26, name: '柳叶蒿', category: 'herb', firstSeen: '2026.07.16',
    image: '/images/plants/artemisia_leptophylla.jpg'
   },
   { id: 27, name: '牛蒡', category: 'herb', firstSeen: '2026.07.16',
    image: '/images/plants/arctium_lappa.jpg'
   },
   { id: 28, name: '玉簪', category: 'herb', firstSeen: '2026.07.16',
    image: '/images/plants/hosta_plantaginea.jpg'
   },
   { id: 29, name: '鸭跖草', category: 'herb', firstSeen: '2026.07.16',
    image: '/images/plants/commelina_benghalensis.jpg'
   },
   {id: 30, name: '落叶松', category: 'tree', firstSeen: '2026.07.16',
    image: '/images/plants/larix_gmelinii.jpg'
   },
   {id: 31, name: '樟子松', category: 'tree', firstSeen: '2026.07.16',
    image: '/images/plants/pinus_sylvestris.jpg'
   },
   {id: 32, name: '黄海棠', category: 'herb', firstSeen: '2026.07.16',
    image: '/images/plants/huanghaitang.jpg'
   },
   { id: 33, name: '胡枝子', category: 'shrub', firstSeen: '2026.07.16',
    image: '/images/plants/lespedeza_bicolor.jpg'
   }
];

const FILTERS: Array<{ id: 'all' | PlantCategory; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'tree', label: '乔木' },
  { id: 'shrub', label: '灌木' },
  { id: 'herb', label: '草本花卉' },
  { id: 'vine', label: '藤本草本' }
];

const PLACEHOLDER_COLORS = [
  ['#D9E5CE', '#79966A'], ['#E8DEC2', '#7E8E5D'], ['#D5E5D8', '#527A65'],
  ['#D9DED0', '#536E57'], ['#E8D8D0', '#8B695E'], ['#E7D9DF', '#90677A']
];

interface PlantAtlasProps {
  isHockney?: boolean;
  isHockneySummer?: boolean;
  isSanctuary?: boolean;
}

export default function PlantAtlas({ isHockney, isHockneySummer, isSanctuary }: PlantAtlasProps) {
  const [filter, setFilter] = useState<'all' | PlantCategory>('all');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const reduceMotion = useReducedMotion();
  const filteredPlants = useMemo(
    () => filter === 'all' ? PLANTS : PLANTS.filter((plant) => plant.category === filter),
    [filter]
  );

  const countFor = (id: 'all' | PlantCategory) =>
    id === 'all' ? PLANTS.length : PLANTS.filter((plant) => plant.category === id).length;

  return (
    <section className={`plant-atlas space-y-6 ${isHockneySummer ? 'hockney-summer-atlas' : isSanctuary ? 'sanctuary-plant-atlas' : !isHockney ? 'default-plant-atlas' : ''}`}>
      <div className={`plant-atlas-hero relative min-h-[250px] overflow-hidden rounded-2xl border border-[#D8E0D1] bg-[#F7F4E8] px-5 py-7 sm:min-h-[280px] sm:px-8 sm:py-8 lg:flex lg:items-center lg:py-6 ${
        isHockneySummer ? 'hockney-summer-panel' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card' : ''
      }`}>
        <div
          aria-hidden="true"
          className="plant-atlas-artwork pointer-events-none absolute inset-0 hidden select-none sm:block"
        />
        <div className="relative z-10 flex max-w-xl flex-col justify-center sm:max-w-[58%] lg:max-w-[46%]">
            <div className="plant-atlas-kicker mb-4 inline-flex w-fit max-w-max self-start items-center gap-1.5 whitespace-nowrap rounded-full border border-[#CED9C5] bg-white/55 px-2.5 py-1 text-xs text-[#667A5E] lg:mb-3">
              <Leaf className="h-3.5 w-3.5" />
              散步中的草木相遇
            </div>
            <h1 className="plant-atlas-title font-serif text-3xl font-semibold tracking-tight text-[#243C32] sm:text-4xl">植物图鉴</h1>
            <p className="plant-atlas-description mt-3 max-w-xl text-sm leading-7 text-[#687761] sm:text-base lg:mt-2 lg:leading-6">
              我在日常散步中见过的树、花与草木。比起准确地命名，这里更想保存每一次认真看见。
            </p>
            <p className="plant-atlas-ai-note mt-2 text-xs text-[#879181] lg:mt-1.5">
              （植物种类由 AI 辅助识别）
            </p>
            <div className="plant-atlas-count mt-6 flex items-baseline gap-2 text-[#2F5D4A] lg:mt-4">
              <strong className="font-serif text-4xl font-semibold">{PLANTS.length}</strong>
              <span className="text-sm">种植物已收录</span>
            </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="植物分类">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-filter={item.id}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`plant-filter-button rounded-full border px-4 py-2 text-xs transition-colors ${
              filter === item.id
                ? 'border-[#2F5D4A] bg-[#2F5D4A] text-[#FFFDF4]'
                : 'border-[#D6DFCE] bg-[#FFFDF7] text-[#63735E] hover:bg-[#EEF4E8]'
            }`}
          >
            {item.label} <span className="ml-1 opacity-65">{countFor(item.id)}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filteredPlants.map((plant) => {
            const palette = PLACEHOLDER_COLORS[(plant.id - 1) % PLACEHOLDER_COLORS.length];
            return (
              <motion.button
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
                key={plant.id}
                type="button"
                data-category={plant.category}
                onClick={() => setSelectedPlant(plant)}
                className={`plant-window-card group cursor-pointer overflow-hidden rounded-xl border border-[#DCE3D6] bg-[#FFFDF7] p-2 text-left shadow-sm shadow-emerald-950/5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-2.5 ${
                  isHockneySummer ? 'hockney-summer-panel' : isHockney ? 'hockney-card' : isSanctuary ? 'sanctuary-card' : ''
                }`}
              >
                <div className="plant-window-frame relative aspect-[4/5] overflow-hidden rounded-lg" style={{ background: `linear-gradient(145deg, ${palette[0]}, #F3F0E2)` }}>
                  {plant.image ? (
                    <img src={plant.image} alt={plant.name} loading="lazy" decoding="async" className="plant-window-image h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Leaf className="h-16 w-16 opacity-45 sm:h-20 sm:w-20" strokeWidth={1} style={{ color: palette[1] }} />
                    </div>
                  )}
                  {!plant.image && <span className="absolute bottom-3 left-3 text-[10px] text-[#60705A]/60">等待植物照片</span>}
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 px-1 pb-1 pt-3 sm:gap-x-3 sm:px-1.5 sm:pt-3.5">
                  <span className="row-span-2 pt-0.5 font-mono text-[10px] tracking-[0.14em] text-[#899386] sm:text-[11px]">
                    {String(plant.id).padStart(2, '0')}
                  </span>
                  <h2 className="truncate font-serif text-base font-semibold text-[#293D32] sm:text-lg">{plant.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[10px] text-[#71806B] sm:text-[11px]">
                    <span>{CATEGORY_LABELS[plant.category]}</span>
                    <span>{plant.firstSeen.replaceAll('.', '/')}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
      </div>

      <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-[11px] text-[#879181]">
        <Sparkles className="h-3 w-3" /> 植物名称由 AI 辅助识别，可能存在误差
      </p>

      <AnimatePresence>
        {selectedPlant && (
          <motion.div
            className={`plant-detail-overlay fixed inset-0 z-[150] flex items-end justify-center bg-[#1B2B23]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6 ${
              isHockneySummer ? 'hockney-summer-plant-overlay' : isHockney ? 'hockney-plant-overlay' : isSanctuary ? 'sanctuary-plant-overlay' : ''
            }`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(event) => event.target === event.currentTarget && setSelectedPlant(null)}
          >
            <motion.div
              role="dialog" aria-modal="true" aria-label={selectedPlant.name}
              data-category={selectedPlant.category}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              className={`plant-detail-modal max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-[#FFFDF7] shadow-2xl sm:rounded-2xl ${
                isHockneySummer ? 'hockney-summer-plant-modal' : isHockney ? 'hockney-plant-modal' : isSanctuary ? 'sanctuary-plant-modal' : 'default-plant-modal'
              }`}
            >
              <button type="button" onClick={() => setSelectedPlant(null)} aria-label="关闭" className="plant-detail-close sticky right-3 top-3 z-20 float-right m-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E0D3] bg-[#FFFDF7]/90 text-[#52654E] shadow-sm">
                <X className="h-4 w-4" />
              </button>
              <div className="grid sm:grid-cols-[1.05fr_1fr]">
                <div className="plant-detail-media flex min-h-72 items-center justify-center bg-[#E4E9D9] sm:min-h-[500px]">
                  {selectedPlant.image ? <img src={selectedPlant.image} alt={selectedPlant.name} className="h-full w-full object-cover" /> : <Leaf className="h-28 w-28 text-[#78916E]/45" strokeWidth={0.9} />}
                </div>
                <div className="plant-detail-info p-6 pt-8 sm:p-8 sm:pt-12">
                  <span className="plant-detail-kicker text-xs tracking-[0.2em] text-[#86917F]">PLANT {String(selectedPlant.id).padStart(2, '0')}</span>
                  <h2 className="plant-detail-title mt-3 font-serif text-3xl font-semibold text-[#243C32]">{selectedPlant.name}</h2>
                  <span className="plant-detail-tag mt-3 inline-flex rounded-full bg-[#EEF3E8] px-3 py-1 text-xs text-[#60745A]">{CATEGORY_LABELS[selectedPlant.category]}</span>
                  <div className="plant-detail-dates mt-8 border-t border-[#E2E6DC] pt-5">
                    <p className="plant-detail-date flex items-center gap-2 text-xs text-[#758071]"><CalendarDays className="h-4 w-4" /> 初次记录 · {selectedPlant.firstSeen}</p>
                    {selectedPlant.seenAgain && <p className="plant-detail-date mt-3 text-xs leading-6 text-[#758071]">再次记录 · {selectedPlant.seenAgain.join(' · ')}</p>}
                  </div>
                  {selectedPlant.note && <p className="plant-detail-note mt-6 border-l-2 border-[#A5B79B] pl-4 text-sm leading-7 text-[#566452]">{selectedPlant.note}</p>}
                  <p className="plant-detail-disclaimer mt-8 text-[11px] leading-5 text-[#92998E]">AI 辅助识别，仅作为散步观察记录。</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
