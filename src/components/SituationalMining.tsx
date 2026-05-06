import React, { useState } from 'react';
import { 
  Plane, 
  Ship, 
  MapPin, 
  Crosshair, 
  Search, 
  MessageSquare, 
  Send,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Base, Conflict } from '../types';

interface SituationalMiningProps {
  targets: Target[];
  bases: Base[];
  conflicts: Conflict[];
}

export const SituationalMining: React.FC<SituationalMiningProps> = ({ targets, bases, conflicts }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'air' | 'sea' | 'bases' | 'conflicts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: '您好，我是态势智能分析助手。您可以询问我关于当前部署、航线动态或冲突发展的任何问题。' }
  ]);

  // Interaction State
  const [selectedItem, setSelectedItem] = useState<{ type: 'target' | 'base' | 'conflict', data: any } | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredTargets = targets.filter(t => t.name.includes(searchQuery) || t.id.includes(searchQuery));
  const filteredBases = bases.filter(b => b.name.includes(searchQuery));
  const filteredConflicts = conflicts.filter(c => c.name.includes(searchQuery));

  const handleTargetClick = async (target: Target) => {
    setSelectedItem({ type: 'target', data: target });
    setIsLoadingHistory(true);
    try {
      const resp = await fetch(`/api/track?id=${target.id}&range=day`);
      const data = await resp.json();
      setHistoryData(data.track || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const response = `基于当前最新数据，${userMsg.includes('红海') ? '红海区域的冲突演变正处于高度活跃期，美军部署了额外的预警机资产。' : '我正在分析全球态势，目前的部署情况趋于稳定，但需关注波罗的海方向的异动。'}`;
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '抱歉，暂时无法获取分析结果。' }]);
    }
  };

  return (
    <div className="absolute inset-0 pt-24 pb-6 px-6 bg-slate-950 flex gap-6 overflow-hidden">
      {/* Left Panels - Data Mining */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Data Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-white italic tracking-tighter">SITUATIONAL MINING <span className="text-brand-primary">态势挖掘</span></h1>
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              {['all', 'air', 'sea', 'bases', 'conflicts'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {tab === 'all' ? '全部' : tab === 'air' ? '航空' : tab === 'sea' ? '舰船' : tab === 'bases' ? '基地' : '冲突'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索情报明细..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-primary/50"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-4 scrollbar-hide">
          {(activeTab === 'all' || activeTab === 'air') && (
            <MiningSection 
              title="实时飞行动态" 
              icon={<Plane className="w-4 h-4" />} 
              items={filteredTargets.filter(t => t.type === 'air')} 
              renderItem={(item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleTargetClick(item)}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary/30 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{item.id}</p>
                    </div>
                    <span className="text-[10px] text-brand-primary font-bold bg-brand-primary/10 px-2 py-0.5 rounded italic">ALT: {item.altitude}m</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-brand-primary" /> {item.speed}km/h</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary underline underline-offset-2">点击查看历史坐标</span>
                  </div>
                </div>
              )}
            />
          )}

          {(activeTab === 'all' || activeTab === 'sea') && (
            <MiningSection 
              title="实时舰船态势" 
              icon={<Ship className="w-4 h-4" />} 
              items={filteredTargets.filter(t => t.type === 'sea')} 
              renderItem={(item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleTargetClick(item)}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary/30 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{item.category}</p>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded italic">HEADING: {item.heading}°</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-brand-primary font-bold">SPD: {item.speed}kn</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary underline underline-offset-2">点击查看历史坐标</span>
                  </div>
                </div>
              )}
            />
          )}

          {(activeTab === 'all' || activeTab === 'bases') && (
            <MiningSection 
              title="军事基地详情" 
              icon={<MapPin className="w-4 h-4" />} 
              items={filteredBases} 
              renderItem={(item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem({ type: 'base', data: item })}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary/30 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-bold text-sm">{item.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.level === 1 ? 'bg-red-500/20 text-red-500' : 'bg-slate-500/20 text-slate-400'}`}>
                      {item.level === 1 ? '核心基地' : '常规驻点'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>{item.lat.toFixed(3)}, {item.lon.toFixed(3)}</span>
                    <span className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">查看详情</span>
                  </div>
                </div>
              )}
            />
          )}

          {(activeTab === 'all' || activeTab === 'conflicts') && (
            <MiningSection 
              title="区域冲突分析" 
              icon={<Crosshair className="w-4 h-4" />} 
              items={filteredConflicts} 
              renderItem={(item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem({ type: 'conflict', data: item })}
                  className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-white font-bold mb-1 tracking-tight">{item.name}</h4>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.brief}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">{item.severity} SEVERITY</span>
                    <button className="text-[10px] text-white bg-red-500 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                      查看脉络 <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {/* Right Drawer - AI Assistant */}
      <div className="w-[420px] glass-panel rounded-3xl overflow-hidden border-white/5 flex flex-col shadow-2xl">
        <div className="p-6 bg-brand-primary/10 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-brand-primary rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white italic tracking-tighter uppercase">AI Intelligence Assistant</h2>
          </div>
          <p className="text-xs text-brand-primary font-bold">实时情报深度解析引擎</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-brand-primary text-white rounded-br-none' 
                  : 'bg-white/5 text-slate-300 rounded-bl-none border border-white/10'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-white/10">
          <div className="relative">
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="询问关于当前态势的分析..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-brand-primary/50"
            />
            <button 
              onClick={handleSendMessage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-white rounded-xl hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['分析红海现状', '预测轨迹变化', '最新部署警告'].map((hint, idx) => (
              <button 
                key={idx}
                onClick={() => setChatInput(hint)}
                className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popups / Modals */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] glass-panel rounded-3xl border-white/10 bg-slate-900/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-primary text-white rounded-lg">
                    {selectedItem.type === 'target' && (selectedItem.data.type === 'air' ? <Plane className="w-5 h-5"/> : <Ship className="w-5 h-5"/>)}
                    {selectedItem.type === 'base' && <MapPin className="w-5 h-5"/>}
                    {selectedItem.type === 'conflict' && <Crosshair className="w-5 h-5"/>}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{selectedItem.data.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                      {selectedItem.type === 'target' ? '历史航线追踪' : selectedItem.type === 'base' ? '情报详细参数' : '冲突事件脉络'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <MoreVertical className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {selectedItem.type === 'target' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">当前高度</p>
                        <p className="text-xl font-mono font-bold text-brand-primary">{selectedItem.data.altitude || 0}m</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">瞬时航速</p>
                        <p className="text-xl font-mono font-bold text-brand-primary">{selectedItem.data.speed} <span className="text-xs">{selectedItem.data.type === 'air' ? 'km/h' : 'kn'}</span></p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">信号源</p>
                        <p className="text-xl font-mono font-bold text-brand-primary">AES-256</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-3">历史采样坐标 (24H)</h4>
                      {isLoadingHistory ? (
                        <div className="h-40 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {historyData.map((pt, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary/20 transition-colors">
                              <span className="text-[10px] font-mono text-slate-500">{new Date(pt.timestamp).toLocaleTimeString()}</span>
                              <div className="flex gap-4">
                                <span className="text-[10px] font-mono text-slate-300">LAT: {pt.lat.toFixed(6)}</span>
                                <span className="text-[10px] font-mono text-slate-300">LON: {pt.lon.toFixed(6)}</span>
                              </div>
                              <span className="text-[10px] font-mono text-brand-primary font-bold">{pt.altitude}m</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedItem.type === 'base' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden relative border border-white/10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-50 z-10"></div>
                        <img 
                          src={`https://images.unsplash.com/photo-1544161515-436cefd1f16d?auto=format&fit=crop&q=80&w=800`} 
                          className="w-full h-full object-cover grayscale opacity-60"
                          alt="Base Satellite"
                        />
                        <div className="absolute bottom-4 left-4 z-20">
                          <span className="px-2 py-1 bg-red-500 text-[10px] font-black italic rounded text-white mb-1 inline-block">SATELLITE VIEW</span>
                          <p className="text-[10px] text-white/70 font-mono tracking-tighter">POS: {selectedItem.data.lat}°N / {selectedItem.data.lon}°E</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-1 italic">情报评级</p>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <div key={s} className={`h-1 flex-1 rounded-full ${s <= (selectedItem.data.level === 1 ? 5 : 3) ? 'bg-brand-primary' : 'bg-slate-700'}`}></div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-1 italic">驻防规模</p>
                          <p className="text-sm font-bold text-white tracking-widest">{selectedItem.data.level === 1 ? 'STRATEGIC CORE' : 'TACTICAL OUTPOST'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">功能职能与部署</h4>
                       <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                        {selectedItem.data.description} 该设施承担着重要的区域监视和通讯任务，内部装备有最新的多相控阵雷达系统。
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['防空火力', '电子监听', '后勤中转', '快速反应'].map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(255,51,102,0.6)]"></div>
                          <span className="text-xs text-slate-300 font-bold">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.type === 'conflict' && (
                  <div className="space-y-8 relative py-4">
                    <div className="absolute left-6 top-8 bottom-8 w-px bg-white/10 z-0"></div>
                    
                    {(selectedItem.data.events || [
                      { id: '1', date: '2026-04-12', title: '初始冲突爆发', brief: '边境雷达站遭遇不明信号干扰，引发局部对峙。', detail: '由于电子战手段的介入，第一防线在短短12分钟内失去了全部态势感知能力。' },
                      { id: '2', date: '2026-04-18', title: '军事资产调动', brief: '周边核心基地进入二级战备状态，航母编队转向。', detail: '卫星监控显示，超过48架战术飞机被要求在一小时内完成挂弹升空待命。' },
                      { id: '3', date: '2026-05-02', title: '全面制裁与降温期', brief: '多方介入调停，冲突转入电子对抗相持阶段。', detail: '目前的对抗主要集中在公海区域的频谱主权争夺，物理冲突已被有效遏制。' }
                    ]).map((ev: any, idx: number) => (
                      <div key={ev.id} className="relative z-10 pl-14">
                        <div className={`absolute left-0 top-1 w-12 h-12 rounded-full border-4 border-slate-950 flex items-center justify-center transition-colors ${expandedEventId === ev.id ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                          <span className="text-[10px] font-black">{idx + 1}</span>
                        </div>
                        <div 
                          onClick={() => setExpandedEventId(expandedEventId === ev.id ? null : ev.id)}
                          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                            expandedEventId === ev.id ? 'bg-white/10 border-red-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-mono text-red-500 font-black">{ev.date}</span>
                            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedEventId === ev.id ? 'rotate-90' : ''}`} />
                          </div>
                          <h4 className="text-white font-bold mb-2 tracking-tight">{ev.title}</h4>
                          <p className="text-xs text-slate-400 mb-2">{ev.brief}</p>
                          
                          <AnimatePresence>
                            {expandedEventId === ev.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-white/10 mt-3 pt-3"
                              >
                                <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-red-500 pl-3">
                                  {ev.detail}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10 flex justify-between items-center">
                <p className="text-[10px] text-slate-500 font-mono italic">CONFIDENTIAL // TOP SECRET // INTEL-928X</p>
                <div className="flex gap-2">
                   <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors">导出情报</button>
                   <button className="px-4 py-2 bg-brand-primary rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-primary/20">加入分析序列</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MiningSection: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  items: any[]; 
  renderItem: (item: any) => React.ReactNode;
}> = ({ title, icon, items, renderItem }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 px-2">
      <div className="text-brand-primary">{icon}</div>
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{title} <span className="ml-2 text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{items.length}</span></h3>
    </div>
    <div className="space-y-3">
      {items.map(item => renderItem(item))}
      {items.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-dashed border-white/10">
          <AlertCircle className="w-6 h-6 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">未找到相关数据</p>
        </div>
      )}
    </div>
  </div>
);
