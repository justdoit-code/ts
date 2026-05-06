import { Target, Base, Conflict } from './types';

export const MOCK_BASES: Base[] = [
  {
    id: 'andersen',
    name: '安德森空军基地',
    latinName: 'Andersen AFB',
    level: 1,
    branch: 'Air Force',
    lat: 13.576,
    lon: 144.923,
    description: '战略级、多军种联合、海外关键节点。美国空军第36联队驻地。'
  },
  {
    id: 'kadena',
    name: '嘉手纳空军基地',
    latinName: 'Kadena Air Base',
    level: 1,
    branch: 'Air Force',
    lat: 26.355,
    lon: 127.767,
    description: '远东地区最大的空军基地。'
  },
  {
    id: 'ramstein',
    name: '拉姆施泰因空军基地',
    latinName: 'Ramstein Air Base',
    level: 1,
    branch: 'Air Force',
    lat: 49.437,
    lon: 7.6,
    description: '美国驻欧空军总部。'
  },
  {
    id: 'diego-garcia',
    name: '迪戈加西亚海军支援设施',
    latinName: 'NSF Diego Garcia',
    level: 1,
    branch: 'Navy',
    lat: -7.313,
    lon: 72.411,
    description: '印度洋核心战略支点。'
  },
  {
    id: 'guam-navy',
    name: '关岛海军基地',
    latinName: 'Naval Base Guam',
    level: 1,
    branch: 'Navy',
    lat: 13.444,
    lon: 144.667,
    description: '太平洋美舰母港。'
  }
];

export const MOCK_CONFLICTS: Conflict[] = [
  {
    id: 'red-sea-crisis',
    name: '红海航行安全危机',
    lat: 13.5,
    lon: 42.5,
    brief: '由于胡塞武装对商船的袭击，红海局势持续紧张，美军部署打击群执行“繁荣卫士”行动。',
    severity: 'high',
    timeline: [
      { date: '2023-11-19', title: '首艘商船被扣', description: '“银河领袖”号商船被胡塞武装扣押。' },
      { date: '2023-12-18', title: '繁荣卫士行动启动', description: '美国宣布组建多国海军力量保护红海航道。' },
      { date: '2024-01-12', title: '美英空袭开始', description: '美英军队首次对也门境内胡塞武装目标实施空袭。' },
      { date: '2024-03-06', title: '“真信心”号遇袭', description: '导弹击中商船导致平民伤亡，局势进一步升级。' }
    ]
  },
  {
    id: 'ukraine-border',
    name: '北约东翼态势',
    lat: 50.0,
    lon: 25.0,
    brief: '北约在波兰及波罗的海国家部署快速反应部队，监控美军轰炸机在欧洲的轮转任务。',
    severity: 'medium',
    timeline: [
      { date: '2022-02-24', title: '大规模冲突爆发', description: '地区安全局势发生根本性改变。' },
      { date: '2023-04-04', title: '芬兰加入北约', description: '北约与俄罗斯边界线长度增加一倍。' },
      { date: '2024-02-20', title: '斯特拉斯堡声明', description: '北约加强在东翼的综合防空力量。' }
    ]
  }
];

export const MOCK_HOTSPOTS: Hotspot[] = [
  { id: 'h1', title: '浏阳烟花爆炸', lat: 28.14, lon: 113.63, sentiment: 'negative' },
  { id: 'h2', title: '菲方自导自演海上闹剧', lat: 14.59, lon: 119.82, sentiment: 'negative' },
  { id: 'h3', title: '日本政府为再军事化披上虚伪法治外衣', lat: 35.68, lon: 139.65, sentiment: 'negative' },
  { id: 'h4', title: '中柬金龙联合演习', lat: 11.55, lon: 104.91, sentiment: 'positive' }
];

export const INITIAL_AIRCRAFT: Target[] = [
  { id: "AE58A1", type: "air", category: "B-52H", name: "BRIG01", lat: 35.212, lon: 139.456, altitude: 9448, speed: 450, heading: 85, timestamp: new Date().toISOString() },
  { id: "AE01A2", type: "air", category: "RC-135", name: "JAKE11", lat: 50.1, lon: 15.2, altitude: 8000, speed: 400, heading: 120, timestamp: new Date().toISOString() },
  { id: "AE4D03", type: "air", category: "P-8A", name: "LANCER5", lat: 25.5, lon: 125.2, altitude: 5000, speed: 380, heading: 240, timestamp: new Date().toISOString() },
  { id: "AE53A4", type: "air", category: "RQ-4", name: "FORTE10", lat: 37.5, lon: 126.9, altitude: 15000, speed: 300, heading: 180, timestamp: new Date().toISOString() },
];

export const INITIAL_SHIPS: Target[] = [
  { id: "368926000", type: "sea", category: "Carrier", name: "USS GERALD R FORD", lat: 36.967, lon: -76.320, speed: 18, heading: 270, status: "Underway", timestamp: new Date().toISOString() },
  { id: "367000760", type: "sea", category: "Carrier", name: "USS RONALD REAGAN", lat: 34.6, lon: 139.8, speed: 22, heading: 180, status: "Operating", timestamp: new Date().toISOString() },
  { id: "368000070", type: "sea", category: "Carrier", name: "USS CARL VINSON", lat: 20.1, lon: 155.1, speed: 15, heading: 320, status: "Underway", timestamp: new Date().toISOString() },
];
