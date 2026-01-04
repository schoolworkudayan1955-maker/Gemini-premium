
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
  isLoggedIn,
  onSignIn,
  onSignOut
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-16'} flex flex-col h-full bg-[#1e1f20] transition-all duration-300 overflow-hidden shadow-2xl z-20`}>
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-[#2e2f31] rounded-full text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="px-3 mb-4">
        <button 
          onClick={onNewChat}
          className={`flex items-center gap-3 p-3 bg-[#131314] hover:bg-[#2e2f31] rounded-full transition-all text-sm font-medium border border-transparent shadow-sm ${!isExpanded && 'justify-center'}`}
        >
          <svg className="w-6 h-6 text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isExpanded && <span className="text-gray-300">New chat</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
        {isExpanded && <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Creative Tools</div>}
        <button onClick={onShowImageCreator} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 ${!isExpanded && 'justify-center'}`}>
           <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           {isExpanded && <span className="text-sm">Image Creator</span>}
        </button>
        <button onClick={onShowHumaniser} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 ${!isExpanded && 'justify-center'}`}>
           <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
           {isExpanded && <span className="text-sm">Humaniser</span>}
        </button>
        <button onClick={onShowAIDetector} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 ${!isExpanded && 'justify-center'}`}>
           <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
           {isExpanded && <span className="text-sm">AI Detector</span>}
        </button>
        
        {isExpanded && (
          <div className="flex items-center justify-between px-4 py-2 mt-4">
            <div className="text-xs font-medium text-gray-500 uppercase">History</div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClearHistory(); }}
              className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
            >
              Clear All
            </button>
          </div>
        )}
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group flex items-center gap-3 p-3 rounded-full cursor-pointer transition-colors ${
              currentSessionId === session.id ? 'bg-[#004a77] text-white' : 'text-gray-300 hover:bg-[#2e2f31]'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {isExpanded && <span className="text-sm truncate flex-1">{session.title}</span>}
            {isExpanded && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-[#2e2f31] space-y-1">
        <button onClick={onShowAnalytics} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 ${!isExpanded && 'justify-center'}`}>
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
           {isExpanded && <span className="text-sm">Insights</span>}
        </button>
        <button onClick={onShowLearning} className={`w-full flex items-center gap-3 p-3 hover:bg-[#2e2f31] rounded-full text-gray-300 ${!isExpanded && 'justify-center'}`}>
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
           {isExpanded && <span className="text-sm">Learning Path</span>}
        </button>

        <div className="pt-2">
          {!isLoggedIn ? (
            <button 
              onClick={onSignIn}
              className={`w-full flex items-center gap-3 p-3 bg-white hover:bg-gray-100 rounded-full text-[#131314] transition-all font-medium ${!isExpanded && 'justify-center'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isExpanded && <span>Sign in with Google</span>}
            </button>
          ) : (
            <div className="space-y-1">
              <div className={`flex items-center gap-3 p-2 rounded-full hover:bg-[#2e2f31] transition-all cursor-default ${!isExpanded && 'justify-center'}`}>
                <div className="w-8 h-8 rounded-full gemini-gradient flex-shrink-0"></div>
                {isExpanded && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-xs font-medium text-white">Ultra User</span>
                    <span className="text-[10px] text-gray-500 truncate">ultra-pro@google.com</span>
                  </div>
                )}
              </div>
              <button 
                onClick={onSignOut}
                className={`w-full flex items-center gap-3 p-2 text-xs text-red-400 hover:bg-red-400/10 rounded-full transition-all ${!isExpanded && 'justify-center'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {isExpanded && <span>Sign Out / Remove Account</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
