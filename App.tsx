
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InsightsDashboard from './components/InsightsDashboard';
import LearningPathView from './components/LearningPathView';
import ImageCreatorView from './components/ImageCreatorView';
import HumaniserView from './components/HumaniserView';
import AIDetectorView from './components/AIDetectorView';
import ComicsMakerView from './components/ComicsMakerView';
import HTMLCodeMakerView from './components/HTMLCodeMakerView';
import SignInModal from './components/SignInModal';
import { ChatMessage, ChatSession, GeminiModel, UserAnalytics, LearningPath, UserProfile, ViewMode } from './types';
import { streamChat, generateImage } from './services/geminiService';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'arlo_ai_premium_v2';

const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 z-[100] bg-[#131314] flex flex-col items-center justify-center animate-in fade-in duration-500">
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full arlo-star-gradient animate-pulse blur-xl opacity-20 absolute inset-0 scale-150"></div>
      <div className="w-24 h-24 rounded-full arlo-star-gradient flex items-center justify-center shadow-[0_0_50px_rgba(66,133,244,0.3)] relative z-10">
        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
        </svg>
      </div>
    </div>
    <h1 className="text-4xl font-medium tracking-tight mb-4">
      <span className="arlo-gradient-text font-sans">Arlo AI</span>
    </h1>
    <div className="flex flex-col items-center gap-2">
      <div className="w-48 h-1 bg-[#1e1f20] rounded-full overflow-hidden border border-[#3c4043]">
        <div className="h-full bg-[#8ab4f8] animate-[loading_1.5s_ease-in-out_infinite] w-1/3 rounded-full shadow-[0_0_10px_#8ab4f8]"></div>
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-2 font-bold animate-pulse">
        Powering Up
      </p>
    </div>
    <style>{`
      @keyframes loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(300%); }
      }
    `}</style>
  </div>
);

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(GeminiModel.LITE); 
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  const getAnalytics = (): UserAnalytics => ({
    totalMessages: sessions.reduce((acc, s) => acc + s.messages.length, 0),
    topics: [
      { name: 'Creative Generation', count: 68 },
      { name: 'Web Engineering', count: 55 },
      { name: 'Logic Reasoning', count: 42 }
    ],
    performanceScore: 99,
    recentActivity: [12, 18, 15, 24, 32, 28, 45]
  });

  useEffect(() => {
    const initApp = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSessions(parsed);
          if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
        } catch (e) { console.error(e); }
      }
      const savedUser = localStorage.getItem('arlo_user');
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (e) { console.error(e); }
      }
      setTimeout(() => setIsAppLoading(false), 1200);
    };
    initApp();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const handleSignIn = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('arlo_user', JSON.stringify(profile));
    setShowSignIn(false);
  };

  const handleSignOut = () => {
    if (window.confirm("Sign out and clear local history?")) {
      setUser(null);
      localStorage.removeItem('arlo_user');
      handleClearHistory();
    }
  };

  const handleClearHistory = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Discussion',
      messages: [],
      lastUpdated: Date.now(),
      model: selectedModel
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setViewMode('chat');
  };

  const handleSendMessage = async (text: string) => {
    let sessionId = currentSessionId;
    if (!sessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: text.slice(0, 30),
        messages: [],
        lastUpdated: Date.now(),
        model: selectedModel
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
      sessionId = newId;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      type: 'text'
    };

    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, messages: [...s.messages, userMsg], lastUpdated: Date.now() } : s
    ));

    setIsLoading(true);
    const isImageRequest = /\b(generate|create|draw|make|show)\b.*\b(image|picture|photo|illustration)\b/i.test(text);

    try {
      if (isImageRequest) {
        const imageUrl = await generateImage(text);
        const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: "I've generated this for you:",
          timestamp: Date.now(),
          type: 'image',
          attachments: [imageUrl]
        };
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, messages: [...s.messages, modelMsg] } : s
        ));
      } else {
        const currentSession = sessions.find(s => s.id === sessionId);
        const history = (currentSession?.messages || []).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));
        history.push({ role: 'user', parts: [{ text }] });

        const modelMsgId = (Date.now() + 1).toString();
        let streamingText = "";

        const result = await streamChat(
          selectedModel,
          history,
          (chunk) => {
            streamingText += chunk;
            setSessions(prev => prev.map(s => 
              s.id === sessionId ? {
                ...s,
                messages: s.messages.map(m => m.id === modelMsgId ? { ...m, content: streamingText } : m).concat(
                  s.messages.some(m => m.id === modelMsgId) ? [] : [{ 
                    id: modelMsgId, role: 'model', content: streamingText, timestamp: Date.now(), type: 'text' 
                  }] as any
                )
              } : s
            ));
          },
          { useSearch: true }
        );

        setSessions(prev => prev.map(s => 
          s.id === sessionId ? {
            ...s,
            messages: s.messages.map(m => m.id === modelMsgId ? { 
              ...m, 
              content: result.fullText,
              groundingUrls: result.groundingUrls 
            } : m)
          } : s
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] overflow-hidden selection:bg-blue-500/30">
      {isAppLoading && <LoadingScreen />}
      {showSignIn && <SignInModal onSignIn={handleSignIn} onClose={() => setShowSignIn(false)} />}
      
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => { setCurrentSessionId(id); setViewMode('chat'); }}
        onNewChat={createNewChat}
        onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        onClearHistory={handleClearHistory}
        onShowAnalytics={() => setViewMode('analytics')}
        onShowLearning={() => setViewMode('learning')}
        onShowImageCreator={() => setViewMode('image-creator')}
        onShowHumaniser={() => setViewMode('humaniser')}
        onShowAIDetector={() => setViewMode('ai-detector')}
        onShowComicsMaker={() => setViewMode('comics-maker')}
        onShowCodeMaker={() => setViewMode('code-maker')}
        isLoggedIn={!!user}
        onSignIn={() => setShowSignIn(true)}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {viewMode === 'chat' && (
          <ChatArea 
            messages={sessions.find(s => s.id === currentSessionId)?.messages || []}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            user={user}
            onSignInClick={() => setShowSignIn(true)}
          />
        )}
        {viewMode === 'analytics' && (
          <InsightsDashboard analytics={getAnalytics()} onClose={() => setViewMode('chat')} />
        )}
        {viewMode === 'learning' && (
          <LearningPathView path={learningPath} onCreate={(obj) => {}} isLoading={isLoading} />
        )}
        {viewMode === 'image-creator' && (
          <ImageCreatorView onClose={() => setViewMode('chat')} />
        )}
        {viewMode === 'humaniser' && (
          <HumaniserView onClose={() => setViewMode('chat')} />
        )}
        {viewMode === 'ai-detector' && (
          <AIDetectorView onClose={() => setViewMode('chat')} />
        )}
        {viewMode === 'comics-maker' && (
          <ComicsMakerView onClose={() => setViewMode('chat')} />
        )}
        {viewMode === 'code-maker' && (
          <HTMLCodeMakerView onClose={() => setViewMode('chat')} />
        )}
      </main>
    </div>
  );
};

export default App;
