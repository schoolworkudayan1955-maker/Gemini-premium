
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

interface ComicPanel {
  id: string;
  prompt: string;
  caption: string;
  imageUrl: string | null;
  isGenerating: boolean;
  error?: string;
}

interface ComicsMakerViewProps {
  onClose: () => void;
}

const STYLE_PRESETS = [
  { name: 'Modern Comic', prompt: 'Modern high-contrast superhero comic book art, sharp lines' },
  { name: 'Cyberpunk Manga', prompt: 'Detailed cyberpunk anime style, neon lighting, clean ink' },
  { name: 'Pencil Sketch', prompt: 'Rough pencil sketch style, graphite textures' },
  { name: 'Watercolor Storybook', prompt: 'Soft watercolor illustration, storybook aesthetic' }
];

const ComicsMakerView: React.FC<ComicsMakerViewProps> = ({ onClose }) => {
  const [globalStyle, setGlobalStyle] = useState(STYLE_PRESETS[0].prompt);
  const [isPro, setIsPro] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [panels, setPanels] = useState<ComicPanel[]>([
    { id: '1', prompt: '', caption: '', imageUrl: null, isGenerating: false },
    { id: '2', prompt: '', caption: '', imageUrl: null, isGenerating: false },
    { id: '3', prompt: '', caption: '', imageUrl: null, isGenerating: false }
  ]);

  const addPanel = () => {
    if (panels.length < 6) {
      setPanels([...panels, { id: Date.now().toString(), prompt: '', caption: '', imageUrl: null, isGenerating: false }]);
    }
  };

  const removePanel = (id: string) => {
    if (panels.length > 1) {
      setPanels(panels.filter(p => p.id !== id));
    }
  };

  const updatePanel = (id: string, updates: Partial<ComicPanel>) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const generatePanelImage = async (panelId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel || !panel.prompt.trim() || panel.isGenerating) return;
    
    updatePanel(panelId, { isGenerating: true, error: undefined });
    
    try {
      const fullPrompt = `Comic art: ${panel.prompt}. Style: ${globalStyle}. High quality.`;
      const url = await generateImage(fullPrompt, { aspectRatio: "4:3", isPro });
      updatePanel(panelId, { imageUrl: url, isGenerating: false });
    } catch (err: any) {
      console.error(err);
      updatePanel(panelId, { 
        isGenerating: false, 
        error: err.message || 'Error' 
      });
    }
  };

  const generateAll = async () => {
    if (isBulkGenerating) return;
    setIsBulkGenerating(true);
    for (const panel of panels) {
      if (panel.prompt.trim() && !panel.imageUrl) {
        await generatePanelImage(panel.id);
      }
    }
    setIsBulkGenerating(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-hidden">
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2e2f31] bg-[#131314] z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-white">Arlo Comic Studio</h2>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={generateAll}
             disabled={isBulkGenerating}
             className="px-4 py-2 bg-yellow-500 text-[#131314] text-xs font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-50"
           >
             {isBulkGenerating ? 'Sketching...' : 'Illustrate Story'}
           </button>
           <button onClick={onClose} className="p-2 hover:bg-[#2e2f31] rounded-full text-gray-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 p-6 border-r border-[#2e2f31] flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-[#18191a]">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Story Timeline</label>
            {panels.map((panel, index) => (
              <div key={panel.id} className="p-4 bg-[#1e1f20] rounded-2xl border border-[#3c4043] group">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-5 h-5 rounded-full bg-yellow-500 text-[#131314] flex items-center justify-center text-[10px] font-black">
                     {index + 1}
                   </div>
                   <input 
                     placeholder="Panel prompt..."
                     value={panel.prompt}
                     onChange={(e) => updatePanel(panel.id, { prompt: e.target.value })}
                     className="bg-transparent border-none outline-none text-xs text-white w-full"
                   />
                </div>
                <textarea 
                  placeholder="Caption text..."
                  value={panel.caption}
                  onChange={(e) => updatePanel(panel.id, { caption: e.target.value })}
                  className="w-full bg-black/40 rounded-lg px-2 py-2 text-[10px] text-gray-400 border border-white/5 outline-none focus:border-yellow-500/20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-[#0e0e0f] p-8 overflow-y-auto custom-scrollbar">
           <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {panels.map((panel, index) => (
                <div key={panel.id} className="aspect-[4/3] bg-[#1e1f20] rounded border-4 border-black shadow-2xl relative overflow-hidden flex flex-col">
                   {panel.imageUrl ? (
                     <>
                       <img src={panel.imageUrl} className="w-full flex-1 object-cover" alt={`Panel ${index + 1}`} />
                       {panel.caption && (
                         <div className="bg-white border-t-2 border-black p-3 text-center">
                            <p className="text-black text-[12px] font-bold tracking-tight leading-tight">
                              {panel.caption}
                            </p>
                         </div>
                       )}
                     </>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
                          {panel.isGenerating ? 'Rendering...' : 'Empty Panel ' + (index + 1)}
                        </p>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComicsMakerView;
