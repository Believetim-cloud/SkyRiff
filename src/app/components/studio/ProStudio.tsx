import { useState, useEffect } from 'react';
import { 
  PanelLeft, 
  PanelRight, 
  Play, 
  Settings, 
  Layers, 
  Type, 
  Image as ImageIcon, 
  Video, 
  Download,
  Share2,
  Undo,
  Redo,
  Save,
  Monitor,
  Loader,
  Plus
} from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/app/components/ui/resizable";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { getStoryboards, type Storyboard, type Shot } from '@/app/services/storyboard-api';
import { getLocalVideos, type LocalVideo } from '@/app/services/storage';

export function ProStudio({ onExit }: { onExit?: () => void }) {
  const [activeTab, setActiveTab] = useState('script');
  const [storyboards, setStoryboards] = useState<Storyboard[]>([]);
  const [selectedStoryboard, setSelectedStoryboard] = useState<Storyboard | null>(null);
  const [localVideos, setLocalVideos] = useState<LocalVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Storyboards
      const sbRes = await getStoryboards();
      if (sbRes.code === 200) {
        setStoryboards(sbRes.data.items);
        if (sbRes.data.items.length > 0) {
          setSelectedStoryboard(sbRes.data.items[0]);
        }
      }

      // 2. Fetch Local Videos (Assets)
      const videos = getLocalVideos();
      setLocalVideos(videos);
    } catch (e) {
      console.error("Failed to load studio data", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0b0f14] text-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar (App Menu-like) */}
      <header className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#141922]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={onExit}>
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Video className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm">SkyRiff Studio</span>
            <Badge variant="outline" className="text-[10px] h-4 border-white/20 text-white/50">PRO</Badge>
          </div>
          
          <nav className="flex items-center gap-1 ml-4">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-400 hover:text-white">文件</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-400 hover:text-white">编辑</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-400 hover:text-white">视图</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-400 hover:text-white">帮助</Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5 mr-2">
             <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
               <Undo className="w-3 h-3" />
             </Button>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
               <Redo className="w-3 h-3" />
             </Button>
          </div>
          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 border-0">
            <Save className="w-3 h-3" /> 保存
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-500 border-0">
            <Download className="w-3 h-3" /> 导出
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          
          {/* Left Sidebar: Resources & Script */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#11161d]">
            <div className="h-full flex flex-col">
              <Tabs defaultValue="script" className="flex-1 flex flex-col">
                <div className="px-2 py-2 border-b border-white/5">
                  <TabsList className="w-full bg-black/20">
                    <TabsTrigger value="script" className="flex-1 text-xs">文案</TabsTrigger>
                    <TabsTrigger value="assets" className="flex-1 text-xs">素材</TabsTrigger>
                    <TabsTrigger value="templates" className="flex-1 text-xs">模板</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="script" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
                   <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#141922]">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400">分镜脚本</span>
                        {isLoading && <Loader className="w-3 h-3 animate-spin text-gray-500" />}
                     </div>
                     <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/10"><Plus className="w-3 h-3" /></Button>
                   </div>
                   <ScrollArea className="flex-1 p-3">
                     <div className="space-y-3">
                       {selectedStoryboard ? (
                         selectedStoryboard.shots.map((shot, i) => (
                           <div key={i} className="p-3 rounded bg-white/5 border border-white/5 hover:border-blue-500/50 cursor-pointer group transition-colors">
                             <div className="flex justify-between items-start mb-2">
                               <Badge variant="outline" className="bg-black/20 border-white/10 text-[10px]">镜头 {i + 1}</Badge>
                               <span className="text-[10px] text-gray-500">{shot.duration_sec}s</span>
                             </div>
                             <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                               {shot.prompt}
                             </p>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-8 text-gray-500 text-xs">
                           {isLoading ? '加载中...' : '暂无脚本，请先创建'}
                         </div>
                       )}
                     </div>
                   </ScrollArea>
                </TabsContent>

                <TabsContent value="assets" className="flex-1 p-3 m-0 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                      {localVideos.map((video) => (
                        <div key={video.id} className="aspect-square bg-white/5 rounded border border-white/5 hover:border-blue-500/50 cursor-pointer relative group overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                               <Video className="w-6 h-6 text-white/20" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-[10px] truncate px-2">
                            {video.prompt}
                          </div>
                        </div>
                      ))}
                      {localVideos.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-500 text-xs">
                          暂无素材
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-black border-l border-r border-white/5 w-[2px]" />

          {/* Center: Preview & Timeline */}
          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="vertical">
              
              {/* Preview Area */}
              <ResizablePanel defaultSize={70} className="bg-[#0b0f14] relative">
                <div className="absolute inset-0 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center p-8">
                     {/* Video Player Placeholder */}
                     <div className="aspect-video w-full max-w-3xl bg-black rounded-lg border border-white/10 shadow-2xl flex flex-col relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button size="icon" className="w-16 h-16 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 hover:scale-105 transition-all">
                            <Play className="w-6 h-6 fill-white text-white ml-1" />
                          </Button>
                        </div>
                        {/* Fake Controls */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-full flex items-center justify-between text-xs text-white/70">
                             <span>00:15 / 00:45</span>
                             <Monitor className="w-4 h-4" />
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Toolbar */}
                  <div className="h-10 border-t border-white/5 bg-[#141922] flex items-center justify-center gap-4">
                     <Button variant="ghost" size="icon" className="h-8 w-8"><Undo className="w-3 h-3" /></Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8"><Play className="w-3 h-3" /></Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8"><Redo className="w-3 h-3" /></Button>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle className="bg-black border-t border-b border-white/5 h-[2px]" />

              {/* Timeline Area */}
              <ResizablePanel defaultSize={30} minSize={15} className="bg-[#11161d]">
                <div className="h-full flex flex-col">
                  <div className="h-8 border-b border-white/5 flex items-center px-2 bg-[#141922]">
                    <span className="text-xs text-gray-500 font-mono">00:00</span>
                    <div className="flex-1 mx-4 h-4 relative">
                       {/* Ruler */}
                       <div className="absolute bottom-0 left-0 right-0 h-1 border-b border-white/10 flex justify-between">
                         {[...Array(10)].map((_, i) => (
                           <div key={i} className="h-1 w-[1px] bg-white/10"></div>
                         ))}
                       </div>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {/* Track 1: Video */}
                      <div className="h-12 bg-black/20 rounded flex items-center px-1 relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-blue-500/20 border-r border-blue-500/30"></div>
                        <div className="absolute left-20 top-0 bottom-0 w-32 bg-purple-500/20 border-r border-purple-500/30 border-l border-white/5"></div>
                        <div className="absolute left-52 top-0 bottom-0 w-24 bg-green-500/20 border-r border-green-500/30 border-l border-white/5"></div>
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 pointer-events-none">Video Track</span>
                      </div>
                      
                      {/* Track 2: Audio */}
                      <div className="h-8 bg-black/20 rounded flex items-center px-1 relative overflow-hidden mt-1">
                         <div className="absolute left-0 right-0 h-[1px] bg-white/5 top-1/2"></div>
                         <div className="absolute left-0 top-0 bottom-0 w-full">
                           {/* Fake waveform */}
                           <svg className="w-full h-full text-yellow-500/20" preserveAspectRatio="none">
                             <path d="M0,15 L10,5 L20,25 L30,10 L40,20 L50,15 L60,25 L70,5 L80,15 L90,20 L100,10" fill="none" stroke="currentColor" />
                           </svg>
                         </div>
                         <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 pointer-events-none">Audio</span>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="bg-black border-l border-r border-white/5 w-[2px]" />

          {/* Right Sidebar: Inspector */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#11161d]">
             <div className="h-full flex flex-col">
               <div className="px-3 py-2 border-b border-white/5">
                 <h3 className="text-xs font-medium text-gray-400">属性面板</h3>
               </div>
               <ScrollArea className="flex-1 p-3">
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[10px] text-gray-500 uppercase tracking-wider">模型设置</label>
                     <div className="p-2 bg-white/5 rounded border border-white/5">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-xs text-gray-300">Sora 2.0</span>
                         <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-0 text-[10px]">Active</Badge>
                       </div>
                       <p className="text-[10px] text-gray-500">Video Generation Model</p>
                     </div>
                   </div>

                   <Separator className="bg-white/5" />

                   <div className="space-y-2">
                     <label className="text-[10px] text-gray-500 uppercase tracking-wider">参数调整</label>
                     <div className="space-y-3">
                       <div className="space-y-1">
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-400">时长</span>
                           <span className="text-gray-300">15s</span>
                         </div>
                         <div className="h-1 bg-white/10 rounded overflow-hidden">
                           <div className="h-full w-1/3 bg-blue-500"></div>
                         </div>
                       </div>
                       
                       <div className="space-y-1">
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-400">随机种子</span>
                           <span className="text-gray-300">1024</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <input type="text" value="3847291" className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-gray-300" readOnly />
                         </div>
                       </div>
                     </div>
                   </div>

                   <Separator className="bg-white/5" />
                   
                   <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                     <h4 className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                       <Sparkles className="w-3 h-3" /> AI 建议
                     </h4>
                     <p className="text-[10px] text-blue-300/70 leading-relaxed">
                       当前镜头描述较短，建议增加关于光影和环境的细节，以获得更好的生成效果。
                     </p>
                     <Button size="sm" variant="ghost" className="w-full mt-2 h-6 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                       一键优化
                     </Button>
                   </div>

                 </div>
               </ScrollArea>
             </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <footer className="h-6 border-t border-white/10 bg-[#0b0f14] flex items-center justify-between px-3 text-[10px] text-gray-500">
         <div className="flex items-center gap-3">
           <span>Ready</span>
           <span className="text-green-500">● Online</span>
         </div>
         <div className="flex items-center gap-3">
           <span>CPU: 12%</span>
           <span>Mem: 450MB</span>
           <span>v1.0.0-beta</span>
         </div>
      </footer>
    </div>
  );
}
