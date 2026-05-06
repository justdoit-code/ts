export interface Hotspot {
  id: string;
  title: string;
  lat: number;
  lon: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Target {
  id: string;
  type: 'air' | 'sea';
  category: string;
  name: string;
  lat: number;
  lon: number;
  altitude?: number;
  speed: number;
  heading: number;
  timestamp: string;
  status?: string;
}

export interface Base {
  id: string;
  name: string;
  latinName: string;
  level: 1 | 2;
  branch: 'Air Force' | 'Navy' | 'Army' | 'Marines' | 'Joint';
  lat: number;
  lon: number;
  description: string;
}

export interface ConflictEvent {
  date: string;
  title: string;
  description: string;
}

export interface Conflict {
  id: string;
  name: string;
  lat: number;
  lon: number;
  brief: string;
  severity: 'high' | 'medium' | 'low';
  timeline: ConflictEvent[];
}

export const REGIONS = [
  { name: '全球', center: { lat: 20, lon: 0 }, height: 15000000 },
  { name: '亚太', center: { lat: 25, lon: 135 }, height: 6000000 },
  { name: '欧洲', center: { lat: 50, lon: 15 }, height: 4000000 },
  { name: '中东', center: { lat: 28, lon: 45 }, height: 4000000 },
  { name: '非洲', center: { lat: 5, lon: 20 }, height: 7000000 },
  { name: '美洲', center: { lat: 35, lon: -90 }, height: 6000000 },
];
