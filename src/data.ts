/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Base, WalkLog } from './types';

export const INITIAL_BASES: Base[] = [
  {
    id: 'base-1',
    title: '01号基地 · 河岸浅滩',
    subtitle: 'Riverbank Shallows (North)',
    description: '位于河流北侧，大河边缘顺着弯道冲刷出的小沙石头沙滩。河中不远有一处小沙洲，偶有绿头鸭驻留。',
    location: '河流北侧散步道 1.2k 处，老柳树下方坡道',
    coverImage: '/images/base_1.jpg'
  },
  {
    id: 'base-2',
    title: '02号基地 · 松林长椅',
    subtitle: 'Pine Row Bench (North)',
    description: '位于河流北侧高地上。陈旧的松木长椅静置于松针林荫道旁，背后是一排高耸挺拔的翠绿松树，迎面直对北侧山峰，树木将天空围绕成一块不规则区域，是一处绝佳的静坐看云据点。',
    location: '河流北侧森林步道，松针碎石路高坡旁',
    coverImage: '/images/base_2.jpg'
  },
  {
    id: 'base-3',
    title: '03号基地 · 堤坝台阶',
    subtitle: 'Embankment Steps (North)',
    description: '位于河流北侧，防汛水泥大堤上斜插向河水面的水泥石台阶。这里视野开阔，适合黄昏时分漫步至此，坐着看夕阳渐渐沉入西方河谷尽头。',
    location: '河流北侧防汛大堤主段，日落观景台阶',
    coverImage: '/images/base_3.jpg'
  },
  {
    id: 'base-4',
    title: '04号基地 · 河畔水文站',
    subtitle: 'Hydrological Station (South)',
    description: '位于河流南侧的水文测报站。静谧的观测小房矗立河畔，沿着堤坝修筑着一排垂直的水位标尺与一人宽水泥台阶。',
    location: '河流南侧堤坝中段，水文观测浮标旁',
    coverImage: '/images/base_4.jpg'
  },
  {
    id: 'base-5',
    title: '05号基地 · 河谷公园',
    subtitle: 'Bridge Pier Valley Park (West)',
    description: '位于河流西南侧，是一处视野辽阔的河谷草甸。一条质朴的石板游步道在连绵的绿色草海间蜿蜒，地里开满了星星点点的紫色野鸢尾。远方矗立着高而长的公路大桥，桥下的草地上星罗棋布地扎着几顶清雅的白色张拉膜天幕营地，两旁山峦翠绿，十分空灵。',
    location: '河流西侧，公路大桥下方湿地石板游步道',
    coverImage: '/images/base_5.jpg'
  }
];

export const INITIAL_LOGS: WalkLog[] = [
  // Base 1 Logs - Riverbank Shallows
  {
    id: 'log-01',
    baseId: 'base-1',
    date: '2026-06-03',
    weather: 'sunny',
    weatherText: '晴',
    tags: ['捡石头', '投资感悟', '水流温度'],
    content: '在河边捡石头的时候，突然想通了——核心资产应该加仓不是减仓。要伸手到水里才能摸到石头，才能感受到温度。'
  },
  {
    id: 'log-02',
    baseId: 'base-1',
    date: '2026-06-07',
    weather: 'cloudy',
    weatherText: '阴天 · 云速中等',
    tags: ['绿头鸭初现', '午夜巴黎爵士', '悬丝毛毛虫'],
    photos: [
      '/images/base_1_2026_06_07.jpg'
    ],
    content: '水面中央的黄色塑料袋换成了小鸭子🦆 对岸钓鱼人只剩一个。BGM是《午夜巴黎》的Sidney Bechet单簧管。回家的路上看到一条悬丝的绿色毛毛虫，蹲着看了好一会儿。'
  },
  {
    id: 'log-03',
    baseId: 'base-1',
    date: '2026-06-10',
    weather: 'sunny',
    weatherText: '大晴天',
    tags: ['水面干净', '钓鱼人空场', '玉色石头'],
    content: '第一次空场——对岸没有钓鱼人，水面中央的小鸭子也不在了。水面垃圾几乎全没了，被清理或河水带走了。捡了两块玉色的小石头。今天的版本：空、净、亮。'
  },
  {
    id: 'log-04',
    baseId: 'base-1',
    date: '2026-06-12',
    weather: 'cloudy',
    weatherText: '雨后 · 光照不足',
    tags: ['绿头鸭回归', '钓鱼人扎堆', '黄昏送别'],
    content: '两只绿头鸭回来了🦆🦆 对岸三个钓鱼人挤在一起。黄昏又去了一次——看着两只鸭子一前一后游走，消失在河中间水草后面。天色暗了，云变厚变灰了。'
  },
  {
    id: 'log-05',
    baseId: 'base-1',
    date: '2026-06-13',
    weather: 'sunny',
    weatherText: '晴朗万里无云',
    tags: ['老人尿尿占位', '树识别', '棕色毛毛虫'],
    content: '第一次去被河边尿尿的老人占了位置。第二次回来收复了。用ChatGPT认了周围的树，认识了樟子松。地上的棕色毛毛虫有小手指长。捡了一截松树枝。'
  },
  {
    id: 'log-06',
    baseId: 'base-1',
    date: '2026-06-15',
    weather: 'sunny',
    weatherText: '晴',
    tags: ['落枕', '水清澈', '差点滑倒'],
    content: '落枕了还是出了门。水比较清澈，鸭子没来。对岸两个钓鱼人。在岸边差点滑倒——雨后湿滑，以后要小心。'
  },
  {
    id: 'log-07',
    baseId: 'base-1',
    date: '2026-06-17',
    weather: 'cloudy',
    weatherText: '阴天/多云',
    tags: ['玩水扔石子', '白色石头', '野餐', '牛板筋'],
    photos: [
      '/images/base_1_2026_06_17.jpg'
    ],
    content: '伸手玩水啦💧 水凉凉的，很舒服🌊 捡了几颗小石子往河里扔。还捡了一块白色小石头拍照留念。带了蓝莓、樱桃、绿色小番茄和牛板筋，在河边野餐。落枕好多了。'
  },
  {
    id: 'log-1-1',
    baseId: 'base-1',
    date: '2026-06-19',
    weather: 'cloudy',
    weatherText: '多云 ☁️，温度较高，阳光下河滩有点热',
    tags: ['端午节', '骑车钓鱼人', '玩水'],
    content: '端午节又来了。昨晚刚下完雨，森林里有些潮。河中间没有鸭子，对岸没有钓鱼人。但一号基地这边有一位骑自行车的钓鱼人🚴‍♂️🎣。伸手感受了水温，凉快舒服💧。不能久留，玩了一小会儿就出来了。桥边的端午布置全撤了，像什么都没发生过一样。'
  },

  // Base 2 Logs - Pine Row Bench
  {
    id: 'log-21',
    baseId: 'base-2',
    date: '2026-06-06',
    weather: 'cloudy',
    weatherText: '多云 · 风向变化',
    tags: ['云分层', '风向变化', '森林分层'],
    content: '发现云分两层——下层跑得快（南→北），上层像棉絮基本不动。证明不同高度风向不一样。三号太冷没坐，回程太阳出来了。'
  },
  {
    id: 'log-22',
    baseId: 'base-2',
    date: '2026-06-07',
    weather: 'cloudy',
    weatherText: '多云 · 林间有风',
    tags: ['云结构变化', '悬丝毛毛虫', '森林海洋', '午夜巴黎'],
    content: '云层整体移动，看不出分层的结构。发现悬丝毛毛虫在一米七的高度飘着。躺在长椅上发现森林分层——低层树枝不动，高层树冠被风吹动。像海洋：树冠是海面，地面是海底。'
  },
  {
    id: 'log-23',
    baseId: 'base-2',
    date: '2026-06-10',
    weather: 'sunny',
    weatherText: '晴 · 局地有云',
    tags: ['三层云', '风向东向西', '局地云', '被妈喊回家'],
    content: '云移动方向变了——东→西。头顶一小块有云，旁边还有阳光。临走发现低层烟缕云从森林顶端升起来——三层云结构首次观察到。被妈喊回家吃饭，时间不够了。'
  },
  {
    id: 'log-24',
    baseId: 'base-2',
    date: '2026-06-13',
    weather: 'sunny',
    weatherText: '晴',
    tags: ['弹弓男', '清理烟头', '连续被占', '躺卧观察点'],
    content: '一号被尿尿老人占位后转来二号。发现山脚下有桌子长凳，躺下来看树。桌上又有烟头，用破纸包起来扔掉了。旁边有人拿弹弓左打一下右打一下。连续两次没坐回长椅。'
  },
  {
    id: 'log-25',
    baseId: 'base-2',
    date: '2026-06-15',
    weather: 'cloudy',
    weatherText: '多云 · 落枕',
    tags: ['双V树冠', '水流比云快', '老太太占座', '落枕'],
    photos: [
      '/images/base_2_2026_06_15.jpeg',
      '/images/base_2_2026_06_15_2.jpg'
    ],
    content: '长椅被两个老太太占了。发现东向和北向两个V形树冠——天然取景框。河水从西向东流，比云彩快多了。二号基地的社交生态圈：抽烟老头→世界杯老头→两老太太→三喝酒老头。'
  },
  {
    id: 'log-26',
    baseId: 'base-2',
    date: '2026-06-17',
    weather: 'cloudy',
    weatherText: '多云 · 林间有风',
    tags: ['Nuvole Bianche', '连续五次被占', '脱袜老头', '清理垃圾'],
    content: '连续第五次没坐回长椅。老头脱了袜子光脚躺在上面，老头乐停在旁边挡住视线。桌上的垃圾被人塞进木板缝。带走了自己的，顺手清了一件。BGM是Einaudi的Nuvole Bianche。'
  },
  {
    id: 'log-2-9',
    baseId: 'base-2',
    date: '2026-06-19',
    weather: 'cloudy',
    weatherText: '多云→放晴 ☁️→☀️，灰白厚云层，空气潮湿，像要下雨',
    tags: ['端午节', '连续六次被占后终于空出', '云分两层', '舞台', 'Nuvole Bianche', 'Luminous'],
    photos: [
      '/images/base_2-2026_06_19_1.jpg',
      '/images/base_2_2026_06_19_2.jpg'
    ],
    content: '远远看到有车停着，心里一沉——连续第六次要被占？走近一看，长椅空的！旁边四人桌有人而已。终于又在二号基地角度拍天空照片了📸。\n\n天空是灰白色厚厚云层，云从西向东快速运动。山上各层树枝随风摆动。\n\n过了一会儿天空放晴，露出蓝色幕布。云朵依然快速移动，大小块云轮番上场。像是大自然的舞台，只对有心人开放。门票免费，但是门槛还是有。\n\n观察到云分两层：第一层大块云从西向东横着运动（低层风），中间有两片云相对位置不变，呈三角形顶点和对边排列，从南向北带一点偏东方向运动（高层风）。两层风系统在交错。\n\n背景音乐：Nuvole Bianche → Luminous 🎹'
  },

  // Base 3 Logs - Embankment Steps
  {
    id: 'log-31',
    baseId: 'base-3',
    date: '2026-05-26',
    weather: 'sunny',
    weatherText: '晴',
    tags: ['发现日', '黑猫', '守护灵'],
    content: '发现水泥台阶。草丛里蹲着一只黑猫，黄眼睛，尾巴竖起在观察我。它就是三号基地的守护灵。'
  },
  {
    id: 'log-32',
    baseId: 'base-3',
    date: '2026-06-06',
    weather: 'windy',
    weatherText: '风大 · 偏冷',
    tags: ['风大', '打卡即走', '黑猫请假'],
    photos:[
      '/images/base_3_2026_06_06.jpg'
    ],
    content: '太冷了风大，不能长坐。黑猫不在——请假了。打卡即走。'
  },

  // Base 4 Logs - Hydrological Station
  {
    id: 'log-41',
    baseId: 'base-4',
    date: '2026-06-02',
    weather: 'sunny',
    weatherText: '晴',
    tags: ['发现日', 'Einaudi', '水文站台阶'],
    content: '第一次命名这里为四号基地——水文站台阶。耳机里放着Ludovico Einaudi的《Experience》，音乐高潮时水景和音乐完美同步。Einaudi时刻。'
  },
  {
    id: 'log-42',
    baseId: 'base-4',
    date: '2026-06-04',
    weather: 'cloudy',
    weatherText: '安静多云',
    tags: ['安静看水'],
    content: '又来了同一位置。没放音乐，安静地看了一会儿水。'
  },
  {
    id: 'log-43',
    baseId: 'base-4',
    date: '2026-06-13',
    weather: 'cloudy',
    weatherText: '薄云 · 风平浪静',
    tags: ['小鸟画弧', '水浑', '巡游三基地'],
    content: '风平浪静，空中一丝一丝的薄云。水有点浑。一只小鸟从右侧河岸起飞→沿弧线飞向河中心→贴着水面→从左侧飞回。以四号基地为中心画了一个完整的圆弧。'
  },
  {
    id: 'log-44',
    baseId: 'base-4',
    date: '2026-06-16',
    weather: 'cloudy',
    weatherText: '阴天 · 路过',
    tags: ['路过', '采野菜', '转五号'],
    content: '台阶附近有人采野菜，没停留。继续往前走——去了五号基地。'
  },

  // Base 5 Logs - Bridge Pier Valley Park
  {
    id: 'log-13',
    baseId: 'base-5',
    date: '2026-06-11',
    weather: 'sunny',
    weatherText: '晴 · 傍晚',
    tags: ['远征发现', '紫色鸢尾花', '河水清澈', '钓鱼人'],
    photos: [
      '/images/base_5_2026_06_11.jpg',
      '/images/base_5_2026_06_11_2.jpg'
    ],
    content: '一个人往西走了四十分钟。过了水文站、穿过松树林、经过高压塔——一路走到河谷入口。这里山、河、谷、花海同时出现。用手试了河水的温度——凉快、清澈。河岸草坪上开满了紫色鸢尾花，在傍晚的光里安静地亮着。远处有三个钓鱼人，每人相隔五十一百米。白色帐篷还在河对岸。走了这么远的路，找到这个地方，觉得值了。'
  },
  {
    id: 'log-12',
    baseId: 'base-5',
    date: '2026-06-16',
    weather: 'cloudy',
    weatherText: '阴天 · 有风',
    tags: ['第二次远征', '落枕', '丁香花', '彩色帐篷', '鸢尾花凋谢'],
    photos: [
      '/images/base_5_2026_06_16_2.jpg',
      '/images/base_5_2026-06-16.jpeg'
    ],
    content: '落枕第二天，还是决定再去一次五号。入口处的丁香花开了，紫色的香气迎面扑来💜 但上次的鸢尾花已经开始败了。河边多了几顶彩色帐篷——颜色太鲜艳了，跟河谷不搭。公园里人不多，安安静静。回程路上看落叶松的枝叶——像小瀑布，像小烟花。远征50分钟，落枕还没好，但路走完了。'
  },

  // Roadside Notes
  {
    id: 'log-61',
    baseId: 'roadside-observations',
    date: '2026-06-13',
    weather: 'sunny',
    weatherText: '晴',
    tags: ['Einaudi时刻', '水文站', 'Experience'],
    content: '坐在四号基地水文站的台阶上，耳机里放着Ludovico Einaudi的《Experience》。音乐高潮时，面前的河水流动和节奏完美同步——那一刻觉得这个基地选对了。'
  },
  {
    id: 'log-62',
    baseId: 'roadside-observations',
    date: '2026-06-15',
    weather: 'cloudy',
    weatherText: '21°C · 林荫有风',
    tags: ['林荫小路', 'Through the Blue', '绝了时刻'],
    content: '去二号基地的路上，走在林荫小路上。耳机里放着Through the Blue——21°C，鸟在叫，风吹着树叶。那一刻在心里说了句：绝了。'
  },
  {
    id: 'log-63',
    baseId: 'roadside-observations',
    date: '2026-06-17',
    weather: 'cloudy',
    weatherText: '多云 · 路边',
    tags: ['红色纸钱', '路边', '白事'],
    content: '去二号基地的路上，路边有几张红色的纸钱。大概是附近有人办过白事。在这条每天走的路上，出现了一些不属于日常的东西。'
  }
];
