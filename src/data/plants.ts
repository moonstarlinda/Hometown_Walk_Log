export type PlantCategory = 'tree' | 'shrub' | 'herb' | 'vine';

export interface Plant {
  id: number;
  name: string;
  category: PlantCategory;
  firstSeen: string;
  seenAgain?: string[];
  note?: string;
  image?: string;
}

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
   },
   {id: 34, name: '加拿大一枝黄花', category: 'herb', firstSeen: '2026.07.17',
    image: '/images/plants/solidago_canadensis.jpg'
   },
   {id: 35, name:'毛水苏', category : 'herb', firstSeen: '2026.07.17',
    image:'/images/plants/maoshuisu.jpg'
   },
   {id: 36, name: '白芷', category: 'herb', firstSeen: '2026.07.19',
    image: '/images/plants/angelica_sinensis.jpg'
   }
];
