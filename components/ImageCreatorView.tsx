
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

interface ImageCreatorViewProps {
  onClose: () => void;
}

const ImageCreatorView: React.FC<ImageCreatorViewProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "4:3" | "9:16" | "16:9">("1:1");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt, { aspectRatio, isPro });
      setGeneratedImages(prev => [url, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const ratios: ("1:1" | "3:4" | "4:3" | "9:16" | "16:9")[] = ["1:1", "4:3", "16:9", "9:16", "3:4"];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-hidden">
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2e2f31]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2.001 0 012.828 0L16 16m-2-2l1.586-1.586a2.001 2.001 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-medium text-white">Ultra Image Studio</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#2e2f31] rounded-full text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-96 p-6 border-r border-[#2e2f31] flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-400">What should Arlo create?</label>
              <button 
                onClick={() => setIsPro(!isPro)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-all ${isPro ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                title="Pro mode uses more advanced models for high-detail generation"
              >
                {isPro ? 'Hyper Mode' : 'Instant Mode'}
              </button>
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars..."
              className="w-full h-32 bg-[#1e1f20] border border-[#3c4043] rounded-2xl p-4 text-white focus:border-[#8ab4f8] outline-none resize-none transition-all"
            />
          </div>

          <div className="space-y-3">
             <label className="text-sm font-medium text-gray-400">Aspect Ratio</label>
             <div className="grid grid-cols-5 gap-2">
                {ratios.map(r => (
                  <button 
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-2 rounded-xl text-[10px] font-medium border transition-all ${aspectRatio === r ? 'bg-white text-[#131314] border-white' : 'bg-[#1e1f20] text-gray-400 border-[#3c4043] hover:border-gray-500'}`}
                  >
                    {r}
                  </button>
                ))}
             </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full py-4 font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg ${isGenerating ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#8ab4f8] text-[#131314] hover:scale-105 active:scale-95'}`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                Thinking...
              </>
            ) : (
              'Create Now'
            )}
          </button>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mt-auto">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Instant Engine</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Arlo AI uses optimized Flash inference for sub-3-second image generation.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0e0e0f]">
          {generatedImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2.001 0 012.828 0L16 16m-2-2l1.586-1.586a2.001 2.001 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-400 italic">Describe your vision and hit 'Create Now'</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((url, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-[#3c4043] shadow-xl animate-in zoom-in duration-300">
                  <img src={url} alt={`Creation ${i}`} className="w-full h-auto object-cover bg-[#1e1f20]" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button 
                      onClick={() => window.open(url)}
                      className="px-4 py-1.5 bg-white text-[#131314] rounded-full text-xs font-bold"
                    >
                      View Full
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCreatorView;
