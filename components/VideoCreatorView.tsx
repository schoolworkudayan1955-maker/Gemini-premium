
import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';

interface VideoCreatorViewProps {
  onClose: () => void;
}

const VideoCreatorView: React.FC<VideoCreatorViewProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);

  const handleGenerate = async () => {
    // Check for API key before starting if using Veo models as per guidelines
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Assume the key selection was successful to mitigate race conditions
    }

    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStatusMessage('Initiating high-speed generation...');
    
    try {
      const url = await generateVideo(prompt, (msg) => setStatusMessage(msg));
      setGeneratedVideos(prev => [url, ...prev]);
      setStatusMessage('');
    } catch (err: any) {
      console.error(err);
      // If the request fails with this specific message, prompt the user to select a key again
      if (err.message?.includes("Requested entity was not found.")) {
         if (window.aistudio) await window.aistudio.openSelectKey();
      }
      setStatusMessage('Error creating video. Please check your project billing or API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2e2f31]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-medium text-white">Video Creator <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded ml-2 uppercase">Veo 3.1</span></h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#2e2f31] rounded-full text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Prompt Input */}
        <div className="w-full md:w-96 p-6 border-r border-[#2e2f31] flex flex-col gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-400">Visual Prompt</label>
              <span className="text-[10px] text-green-400 font-bold uppercase">Free Access</span>
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cyber-city at night, rain splashing on neon signs, cinematic 4k..."
              className="w-full h-48 bg-[#1e1f20] border border-[#3c4043] rounded-2xl p-4 text-white focus:border-[#8ab4f8] outline-none resize-none"
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-3 bg-purple-500 text-white font-semibold rounded-full hover:bg-purple-400 transition-all disabled:bg-gray-700 disabled:text-gray-400 flex items-center justify-center gap-2 shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              'Generate Video'
            )}
          </button>

          {statusMessage && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl animate-pulse">
              <p className="text-xs text-blue-400 text-center">{statusMessage}</p>
            </div>
          )}

          <div className="mt-auto p-4 bg-gray-500/5 border border-white/5 rounded-2xl">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Capabilities</h4>
            <ul className="text-[11px] text-gray-400 space-y-1">
              <li>• 16:9 Landscape Aspect Ratio</li>
              <li>• 720p Optimized Resolution</li>
              <li>• AI-Powered Motion Synthesis</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Gallery */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0e0e0f]">
          {generatedVideos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-400 italic">Generate cinematic videos with Veo 3.1</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {generatedVideos.map((url, i) => (
                <div key={i} className="group relative rounded-3xl overflow-hidden border border-[#3c4043] shadow-2xl bg-black aspect-video">
                  <video src={url} controls className="w-full h-full object-contain" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={url} download={`gemini-video-${i}.mp4`} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
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

export default VideoCreatorView;
