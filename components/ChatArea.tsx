
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, GeminiModel, UserProfile } from '../types';
import MessageItem from './MessageItem';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  user: UserProfile | null;
  onSignInClick: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  selectedModel,
  onModelChange,
  user,
  onSignInClick
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
      const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
      if (textarea) textarea.style.height = 'auto';
    }
  };

  const suggestions = [
    { text: 'Help me draft a business proposal for a new startup', icon: '🚀', color: 'text-blue-400' },
    { text: 'Explain gravity using a basketball analogy', icon: '🏀', color: 'text-purple-400' },
    { text: 'Create a 15-minute high-intensity workout plan', icon: '⚡', color: 'text-green-400' },
    { text: 'Code a simple weather app using modern JavaScript', icon: '☁️', color: 'text-yellow-400' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#131314] transition-all">
      <header className="h-16 flex items-center justify-between px-6 z-10 sticky top-0 bg-[#131314]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2e2f31] rounded-lg cursor-pointer transition-colors group">
             <span className="text-xl font-medium text-gray-200">Arlo AI</span>
             <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
           </div>
        </div>
        <div className="flex items-center gap-4">
            <button className="hidden md:block px-4 py-2 bg-[#1e1f20] hover:bg-[#2e2f31] border border-[#3c4043] rounded-full text-xs font-medium text-gray-300 transition-colors">
              Upgrade to Pro
            </button>
            {user ? (
               <div className="w-8 h-8 rounded-full arlo-star-gradient cursor-pointer border border-[#3c4043] flex items-center justify-center text-[10px] font-black text-white">
                {user.name?.[0].toUpperCase()}
               </div>
            ) : (
              <button 
                onClick={onSignInClick}
                className="w-8 h-8 rounded-full bg-[#1e1f20] hover:bg-[#2e2f31] cursor-pointer border border-[#3c4043] flex items-center justify-center text-gray-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
              </button>
            )}
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar py-4"
      >
        <div className="max-w-[850px] mx-auto px-4 md:px-8 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col py-[8vh] space-y-16 animate-in fade-in slide-in-from-top-4 duration-1000">
               <div>
                 <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-2">
                   <span className="arlo-gradient-text text-nowrap">Hello, {user?.name?.split(' ')[0] || 'Explorer'}</span>
                 </h1>
                 <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-[#444746]">
                   How can Arlo assist you?
                 </h2>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {suggestions.map((s, i) => (
                   <div 
                    key={i}
                    onClick={() => setInput(s.text)}
                    className="suggestion-card group"
                   >
                     <p className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">{s.text}</p>
                     <div className={`w-12 h-12 rounded-full bg-[#131314] flex items-center justify-center text-2xl mt-4 border border-[#3c4043]/50 group-hover:border-[#8ab4f8]/30 transition-all ${s.color}`}>
                       {s.icon}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className="space-y-12 pb-12">
              {messages.map((msg) => <MessageItem key={msg.id} message={msg} />)}
              {isLoading && (
                <div className="flex gap-4 md:gap-6 animate-in fade-in duration-300">
                  <div className="w-8 h-8 rounded-full arlo-star-gradient flex-shrink-0 thinking-pulse shadow-[0_0_15px_rgba(66,133,244,0.3)]"></div>
                  <div className="space-y-4 flex-1 pt-1.5">
                    <div className="h-4 bg-[#1e1f20] rounded-full w-[40%] animate-pulse"></div>
                    <div className="h-4 bg-[#1e1f20] rounded-full w-[75%] animate-pulse delay-75"></div>
                    <div className="h-4 bg-[#1e1f20] rounded-full w-[60%] animate-pulse delay-150"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[850px] mx-auto p-4 md:px-8 pb-6 relative bg-[#131314]">
        <form 
          onSubmit={handleSubmit}
          className="input-pill-container flex items-end gap-2 px-6 py-4 border border-transparent shadow-2xl relative"
        >
          <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-[#2e2f31] mb-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          
          <textarea 
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Type your message to Arlo..."
            className="flex-1 bg-transparent border-none outline-none text-white resize-none py-2 text-base placeholder-gray-500 overflow-y-auto custom-scrollbar"
            style={{ height: 'auto' }}
          />

          <div className="flex items-center gap-1 self-end mb-1">
            <button type="submit" disabled={!input.trim() || isLoading} className={`p-2 rounded-full transition-all ${input.trim() ? 'text-[#8ab4f8] hover:bg-[#3c4043]' : 'text-gray-600'}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </form>
        <p className="text-[11px] text-[#8e918f] text-center mt-3 font-normal opacity-80">
          Arlo AI is built for speed and efficiency. <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
