
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { textToSpeech, decode, decodeAudioData } from '../services/geminiService';

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isModel = message.role === 'model';
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle speech playback using AudioContext as Gemini returns raw PCM data
  const handleSpeech = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const base64 = await textToSpeech(message.content);
      // Initialize AudioContext with 24000Hz sample rate for TTS output
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
    <div className={`flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className="flex-shrink-0 mt-1">
        {isModel ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-xs font-bold border border-white/5 text-gray-400">
            {message.role === 'user' ? 'U' : 'AI'}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {isModel ? 'Gemini Ultra' : 'You'}
          </span>
          {isModel && (
            <button 
                onClick={handleSpeech}
                disabled={isPlaying}
                className={`p-1.5 rounded-lg hover:bg-[#2e2f31] transition-colors ${isPlaying ? 'text-blue-400' : 'text-gray-500'}`}
                title="Listen to response"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
          )}
        </div>

        <div className="text-gray-200 leading-relaxed text-[15px] break-words whitespace-pre-wrap">
          {message.content}
          
          {message.type === 'image' && message.attachments && message.attachments.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {message.attachments.map((url, i) => (
                <img key={i} src={url} alt="Gemini generated" className="rounded-2xl border border-white/10 shadow-2xl max-h-[400px] object-cover w-full cursor-zoom-in hover:opacity-90 transition-opacity" />
              ))}
            </div>
          )}
        </div>

        {message.groundingUrls && message.groundingUrls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#2d2d30]">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2">Verified Sources</span>
            <div className="flex flex-wrap gap-2">
              {message.groundingUrls.map((url, i) => (
                <a 
                  key={i} 
                  href={url.uri} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#1e1f20] hover:bg-[#2e2f31] border border-[#3c4043] text-[11px] text-blue-400 truncate max-w-[240px] transition-all flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {url.title}
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
