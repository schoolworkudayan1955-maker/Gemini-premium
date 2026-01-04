
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from '../types';

interface HumaniserViewProps {
  onClose: () => void;
}

const HumaniserView: React.FC<HumaniserViewProps> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleHumanise = async () => {
    if (!inputText.trim() || isProcessing) return;
    setIsProcessing(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: GeminiModel.PRO,
        contents: `Humanise the following text. Make it sound natural, conversational, and avoid AI-specific robotic patterns while maintaining the exact original meaning. Do not use overly formal or repetitive structures. 
        
        TEXT TO HUMANISE:
        "${inputText}"`,
        config: {
          temperature: 0.9,
          topP: 0.95,
        }
      });
      setOutputText(response.text || 'Error processing text.');
    } catch (err) {
      console.error(err);
      setOutputText('Failed to humanise text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2e2f31]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-xl font-medium text-white">Text Humaniser</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#2e2f31] rounded-full text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Input section */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-400">Original / AI Generated Text</h3>
            <span className="text-[10px] text-gray-500 uppercase font-bold">{inputText.length} characters</span>
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            className="flex-1 bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 text-white focus:border-[#8ab4f8] outline-none resize-none custom-scrollbar leading-relaxed"
          />
          <button 
            onClick={handleHumanise}
            disabled={!inputText.trim() || isProcessing}
            className="w-full py-4 bg-[#8ab4f8] text-[#131314] font-bold rounded-2xl hover:bg-white transition-all disabled:bg-gray-700 disabled:text-gray-500 shadow-lg"
          >
            {isProcessing ? 'Humanising...' : 'Humanise Content'}
          </button>
        </div>

        {/* Output section */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-400">Human-Like Output</h3>
            {outputText && (
              <button onClick={copyToClipboard} className="text-xs text-[#8ab4f8] hover:text-white transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4l-2 2m0 0l-2-2m2 2v-5" /></svg>
                Copy
              </button>
            )}
          </div>
          <div className="flex-1 bg-[#0e0e0f] border border-[#2e2f31] rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
            {isProcessing ? (
               <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#8ab4f8] border-t-transparent animate-spin"></div>
                  <p className="text-sm text-gray-500 animate-pulse font-medium">Refining tone and flow...</p>
               </div>
            ) : (
              <div className="h-full overflow-y-auto custom-scrollbar text-gray-200 leading-relaxed whitespace-pre-wrap">
                {outputText || <span className="text-gray-600 italic">Polished text will appear here...</span>}
              </div>
            )}
          </div>
          <div className="p-4 bg-[#1e1f20] rounded-2xl border border-[#2e2f31] flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             </div>
             <div>
               <p className="text-xs font-bold text-white">AI Detection Guard</p>
               <p className="text-[10px] text-gray-500">Optimized to pass common patterns found in automated detectors.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumaniserView;
