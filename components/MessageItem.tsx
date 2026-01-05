
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { textToSpeech, decode, decodeAudioData } from '../services/geminiService';

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isModel = message.role === 'model';
  const [isPlaying, setIsPlaying] = useState(false);

  // Get user info from localStorage if available
  const userStr = localStorage.getItem('gemini_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleSpeech = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const base64 = await textToSpeech(message.content);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const audioBuffer = await decodeAudioData(
        decode(base64),
        audioContext,
        24000,
        1
      );
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (err) {
      console.error("Speech playback error:", err);
      setIsPlaying(false);
    }
  };

  return (
    <div className={`flex gap-4 md:gap-8 animate-in fade-in duration-500`}>
      <div className="flex-shrink-0 mt-1">
        {isModel ? (
          <div className="w-8 h-8 rounded-full gemini-star-gradient flex items-center justify-center border border-[#3c4043]/50 shadow-sm">
             <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#131314] border border-[#3c4043] flex items-center justify-center text-[10px] font-bold text-gray-300 shadow-sm">
            {user?.name?.[0].toUpperCase() || 'U'}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 min-w-0">
        <div className="text-[#e3e3e3] leading-relaxed text-[16px] break-words whitespace-pre-wrap font-normal selection:bg-blue-500/40">
          {message.content}
          
          {message.type === 'image' && message.attachments && message.attachments.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {message.attachments.map((url, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[#3c4043] shadow-2xl group relative bg-[#1e1f20]">
                   <img src={url} alt="Gemini generated" className="w-full h-auto object-cover max-h-[600px] transition-transform duration-700 group-hover:scale-[1.02]" />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-zoom-in">
                      <button 
                        onClick={() => window.open(url)}
                        className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 hover:scale-110 transition-transform"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21l-7-7m0 0l7-7m-7 7h18" /></svg>
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModel && (
          <div className="flex items-center gap-1 mt-6 opacity-0 animate-in fade-in duration-1000 fill-mode-forwards" style={{ animationDelay: '500ms' }}>
            <button className="p-2 text-[#8e918f] hover:text-[#e3e3e3] hover:bg-[#2e2f31] rounded-full transition-all" title="Good response">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708c.949 0 1.71.777 1.648 1.725l-.7 10.745A1.71 1.71 0 0117.958 24H7a1 1 0 01-1-1v-8.28c0-.623.284-1.213.774-1.597l6.216-4.872a.37.37 0 00.125-.285V4.62c0-.895.725-1.62 1.62-1.62h.54c.448 0 .81.362.81.81V10h-2.115" /></svg>
            </button>
            <button className="p-2 text-[#8e918f] hover:text-[#e3e3e3] hover:bg-[#2e2f31] rounded-full transition-all" title="Bad response">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.292c-.949 0-1.71-.777-1.648-1.725l.7-10.745A1.71 1.71 0 015.958 0H17a1 1 0 011 1v8.28c0 .623-.284 1.213-.774 1.597l-6.216 4.872a.37.37 0 00-.125.285V19.38c0 .895-.725 1.62-1.62 1.62h-.54a.81.81 0 01-.81-.81V14h2.115" /></svg>
            </button>
            <button className="p-2 text-[#8e918f] hover:text-[#e3e3e3] hover:bg-[#2e2f31] rounded-full transition-all" title="Share">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z" /></svg>
            </button>
            <button 
                onClick={handleSpeech}
                disabled={isPlaying}
                className={`p-2 rounded-full hover:bg-[#2e2f31] transition-all ${isPlaying ? 'text-[#8ab4f8]' : 'text-[#8e918f]'}`}
                title="Listen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </button>
            <button className="p-2 text-[#8e918f] hover:text-[#e3e3e3] hover:bg-[#2e2f31] rounded-full transition-all" title="Modify response">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
          </div>
        )}

        {message.groundingUrls && message.groundingUrls.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#3c4043]/40">
            <span className="text-[10px] font-bold text-[#8e918f] uppercase tracking-widest block mb-4">Search Grounding Sources</span>
            <div className="flex flex-wrap gap-3">
              {message.groundingUrls.map((url, i) => (
                <a 
                  key={i} 
                  href={url.uri} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-[#1e1f20] hover:bg-[#2e2f31] border border-[#3c4043] text-[12px] text-[#8ab4f8] transition-all flex items-center gap-2.5 max-w-[280px] shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8ab4f8]"></div>
                  <span className="truncate">{url.title}</span>
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
