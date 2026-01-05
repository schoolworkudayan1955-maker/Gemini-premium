
import React, { useState } from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  onShowAnalytics: () => void;
  onShowLearning: () => void;
  onShowImageCreator: () => void;
  onShowHumaniser: () => void;
  onShowAIDetector: () => void;
  onShowComicsMaker: () => void;
  onShowCodeMaker: () => void;
  isLoggedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  onClearHistory,
  onShowAnalytics,
  onShowLearning,
  onShowImageCreator,
  onShowHumaniser,
  onShowAIDetector,
  onShowComicsMaker,
  onShowCodeMaker,
  isLoggedIn,
  onSignIn,
  onSignOut
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const userStr = localStorage.getItem('arlo_user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className={`${isExpanded ? 'w-[280px]' : 'w-[68px]'} flex flex-col h-full bg-[#1e1f20] transition-all duration-300 ease-in-out overflow-hidden z-20 border-r border-[#3c4043]/30`}>
      <div className="p-4 flex items-center">
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </div>

      <div className="px-3 mb-4">
        <button 
          onClick={onNewChat}
          className={`flex items-center gap-3 p-3 bg-[#131314] hover:bg-[#2e2f31] rounded-full transition-all text-sm font-medium text-gray-400 group border border-[#3c4043] ${!isExpanded ? 'w-10 h-10 p-0 justify-center ml-1' : 'w-fit pr-6'}`}
        >
          <svg className="w-6 h-6 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isExpanded && <span className="group-hover:text-white whitespace-nowrap">New chat</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
        {isExpanded && <div className="px-3 py-4 text-xs font-medium text-gray-500 uppercase tracking-widest">Recent</div>}
        
        <div className="space-y-1">
          {sessions.slice(0, 5).map((session) => (
            <div 
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center gap-3 p-3 rounded-full cursor-pointer transition-colors ${
                currentSessionId === session.id ? 'bg-[#004a77] text-[#c2e7ff]' : 'text-gray-300 hover:bg-[#2e2f31]'
              } ${!isExpanded && 'justify-center'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {isExpanded && <span className="text-sm truncate flex-1">{session.title}</span>}
            </div>
          ))}
        </div>

        {isExpanded && <div className="px-3 py-6 text-xs font-medium text-gray-500 uppercase tracking-widest">Creative Suite</div>}
        <div className="space-y-1 pb-2">
          <button onClick={onShowImageCreator} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 transition-colors ${!isExpanded && 'justify-center'}`}>
             <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2.001 2.001 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             {isExpanded && <span className="text-sm">Instant Images</span>}
          </button>
          <button onClick={onShowComicsMaker} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 transition-colors ${!isExpanded && 'justify-center'}`}>
             <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             {isExpanded && <span className="text-sm">Comics Lab</span>}
          </button>
        </div>

        {isExpanded && <div className="px-3 py-6 text-xs font-medium text-gray-500 uppercase tracking-widest">Developer Lab</div>}
        <div className="space-y-1 pb-4">
          <button onClick={onShowCodeMaker} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 transition-colors ${!isExpanded && 'justify-center'}`}>
             <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
             {isExpanded && <span className="text-sm">Code Architect</span>}
          </button>
          <button onClick={onShowAIDetector} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 transition-colors ${!isExpanded && 'justify-center'}`}>
             <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             {isExpanded && <span className="text-sm">Content Audit</span>}
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-[#3c4043]/30 space-y-1">
        <div className="pt-2">
          {!isLoggedIn ? (
            <button 
              onClick={onSignIn}
              className={`w-full flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-400 rounded-full text-white transition-all font-medium ${!isExpanded && 'justify-center'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
              {isExpanded && <span className="whitespace-nowrap">Sign in</span>}
            </button>
          ) : (
            <div className={`flex items-center gap-3 p-2 rounded-full hover:bg-[#2e2f31] transition-all cursor-pointer ${!isExpanded && 'justify-center'}`} onClick={onSignOut}>
              <div className="w-8 h-8 rounded-full arlo-star-gradient flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white">
                {user?.name?.[0].toUpperCase()}
              </div>
              {isExpanded && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-xs font-medium text-white">{user?.name}</span>
                  <span className="text-[10px] text-gray-500 truncate">Arlo Pro Plan</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
