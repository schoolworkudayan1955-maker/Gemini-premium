
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, GeminiModel } from '../types';
import MessageItem from './MessageItem';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  selectedModel,
  onModelChange 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#131314] transition-all">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-[#2e2f31]/50">
        <div className="flex items-center gap-2">
           <span className="text-xl font-medium text-gray-100 tracking-tight">Gemini</span>
           <select 
             value={selectedModel}
             onChange={(e) => onModelChange(e.target.value)}
             className="bg-transparent text-xs text-gray-400 outline-none border-none cursor-pointer hover:bg-[#2e2f31] px-2 py-1 rounded transition-colors font-medium"
           >
             <option value={GeminiModel.LITE} className="bg-[#1e1f20]">Ultra Fast (Flash Lite)</option>
             <option value={GeminiModel.FLASH} className="bg-[#1e1f20]">Balanced (3 Flash)</option>
             <option value={GeminiModel.PRO} className="bg-[#1e1f20]">Deep Thinking (3 Pro)</option>
           </select>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Ultra Pro</span>
            </div>
            <div className="w-8 h-8 rounded-full gemini-gradient"></div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar py-4"
      >
        <div className="max-w-3xl mx-auto px-4 md:px-0 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
               <h1 className="text-5xl font-medium tracking-tight bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent pb-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                 Speed of Thought.
               </h1>
               <p className="text-gray-400 text-lg max-w-md animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                 Gemini Ultra Premium is now optimized for latency. Ask anything, create instantly.
               </p>
               <div className="flex gap-3 flex-wrap justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                 {['Fastest recipe for dinner', 'Explain quantum physics simply', 'Write a short story about Mars'].map(suggestion => (
                   <button 
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 rounded-full bg-[#1e1f20] border border-[#3c4043] text-sm text-gray-300 hover:bg-[#2e2f31] transition-all"
                   >
                     {suggestion}
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full gemini-gradient flex-shrink-0 animate-spin"></div>
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-4 bg-[#1e1f20] rounded-full w-24 animate-pulse"></div>
                <div className="h-4 bg-[#1e1f20] rounded-full w-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Pill */}
      <div className="w-full max-w-3xl mx-auto p-4 relative mb-4">
        <form 
          onSubmit={handleSubmit}
          className="input-pill flex items-end gap-2 px-4 py-3 border border-[#3c4043] focus-within:border-[#8ab4f8] shadow-xl"
        >
          <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          
          <textarea 
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Enter a prompt here"
            className="flex-1 bg-transparent border-none outline-none text-white resize-none py-2 text-base placeholder-gray-500"
          />

          <div className="flex items-center gap-1">
            <button type="button" className="p-2 text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
            <button type="button" className="p-2 text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
            {input.trim() && (
              <button type="submit" className="p-2 text-[#8ab4f8] hover:bg-[#3c4043] rounded-full transition-all">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              </button>
            )}
          </div>
        </form>
        <p className="text-[11px] text-gray-500 text-center mt-3">
          Gemini Ultra Premium is now running at <span className="text-blue-400">Turbo Speed</span>. <a href="#" className="underline">Terms & Privacy</a>
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
