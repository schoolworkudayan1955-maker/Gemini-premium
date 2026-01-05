
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from '../types';

interface HTMLCodeMakerViewProps {
  onClose: () => void;
}

const HTMLCodeMakerView: React.FC<HTMLCodeMakerViewProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    try {
      const systemInstruction = `You are a world-class Frontend Engineer. Generate a single-file HTML document (including CSS in <style> and JS in <script>) based on the user's request. Return ONLY the code, no markdown wrappers, no explanation. Output a complete, modern, and beautiful UI.`;
      
      const response = await ai.models.generateContent({
        model: GeminiModel.FLASH,
        contents: prompt,
        config: { systemInstruction, temperature: 0.7 }
      });
      
      let generatedCode = response.text || '';
      // Clean up markdown if model included it
      generatedCode = generatedCode.replace(/^```html\n?/, '').replace(/\n?```$/, '');
      setCode(generatedCode);
      setActiveTab('preview');
    } catch (err) {
      console.error(err);
      alert("Failed to generate code.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (iframeRef.current && code) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code, activeTab]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2e2f31]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <h2 className="text-xl font-medium text-white">Code Architect</h2>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-[#1e1f20] p-1 rounded-xl border border-[#3c4043]">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'preview' ? 'bg-[#8ab4f8] text-[#131314]' : 'text-gray-400 hover:text-white'}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setActiveTab('code')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'code' ? 'bg-[#8ab4f8] text-[#131314]' : 'text-gray-400 hover:text-white'}`}
              >
                Code
              </button>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-[#2e2f31] rounded-full text-gray-400 ml-2">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Area */}
        <div className="flex-1 relative overflow-hidden bg-black">
          {activeTab === 'preview' ? (
            code ? (
              <iframe 
                ref={iframeRef}
                className="w-full h-full bg-white border-none"
                title="Arlo Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <p className="text-lg italic">Describe a UI component and click Build</p>
              </div>
            )
          ) : (
            <textarea 
              readOnly
              value={code || '// Code will appear here...'}
              className="w-full h-full bg-[#0e0e0f] text-[#8ab4f8] p-8 font-mono text-sm resize-none outline-none custom-scrollbar"
            />
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-[#131314]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20">
               <div className="w-16 h-16 rounded-full arlo-star-gradient animate-spin shadow-[0_0_30px_rgba(66,133,244,0.4)]"></div>
               <p className="text-xl font-medium arlo-gradient-text animate-pulse">Architecting UI...</p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-[#2e2f31] bg-[#131314]">
           <form onSubmit={handleGenerate} className="max-w-4xl mx-auto relative group">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Build a modern landing page for a coffee shop..."
                className="w-full bg-[#1e1f20] border border-[#3c4043] rounded-2xl px-6 py-4 pr-32 text-white focus:border-[#8ab4f8] outline-none transition-all shadow-xl group-hover:border-[#3c4043]/80"
              />
              <button 
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="absolute right-3 top-2 bottom-2 px-6 bg-[#8ab4f8] text-[#131314] rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:bg-gray-700 disabled:text-gray-500"
              >
                {code ? 'Refine' : 'Build'}
              </button>
           </form>
           <p className="text-center text-[10px] text-gray-500 mt-3 uppercase tracking-widest font-bold">Arlo AI Code Engine v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default HTMLCodeMakerView;
