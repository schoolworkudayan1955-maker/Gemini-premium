
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

interface ImageCreatorViewProps {
  onClose: () => void;
}

const ImageCreatorView: React.FC<ImageCreatorViewProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      setGeneratedImages(prev => [url, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2e2f31]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2.001 0 012.828 0L16 16m-2-2l1.586-1.586a2.001 2.001 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-medium text-white">Image Creator</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#2e2f31] rounded-full text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Prompt Input */}
        <div className="w-full md:w-96 p-6 border-r border-[#2e2f31] flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              className="w-full h-48 bg-[#1e1f20] border border-[#3c4043] rounded-2xl p-4 text-white focus:border-[#8ab4f8] outline-none resize-none"
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-3 bg-[#8ab4f8] text-[#131314] font-semibold rounded-full hover:bg-white transition-all disabled:bg-gray-700 disabled:text-gray-400 flex items-center justify-center gap-2 shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-[#131314] border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              'Create'
            )}
          </button>

          <div className="mt-auto p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-xs text-gray-400">Be descriptive! Instead of "a cat", try "a fluffy ginger cat wearing sunglasses on a beach, cinematic lighting, 4k".</p>
          </div>
        </div>

        {/* Right Side: Gallery */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0e0e0f]">
          {generatedImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2.001 0 012.828 0L16 16m-2-2l1.586-1.586a2.001 2.001 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-400 italic">No images yet. Start creating!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((url, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-[#3c4043] shadow-2xl transition-transform hover:scale-[1.02]">
                  <img src={url} alt={`Generated ${i}`} className="w-full h-auto aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => window.open(url)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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
