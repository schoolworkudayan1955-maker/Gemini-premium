
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InsightsDashboard from './components/InsightsDashboard';
import LearningPathView from './components/LearningPathView';
import ImageCreatorView from './components/ImageCreatorView';
import HumaniserView from './components/HumaniserView';
import AIDetectorView from './components/AIDetectorView';
import { ChatMessage, ChatSession, GeminiModel, UserAnalytics, LearningPath } from './types';
import { streamChat, generateImage } from './services/geminiService';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEY = 'gemini_advanced_v3_ultra_final_no_video';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(GeminiModel.LITE); 
  const [viewMode, setViewMode] = useState<'chat' | 'analytics' | 'learning' | 'image-creator' | 'humaniser' | 'ai-detector'>('chat');
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock Analytics data generator
  const getAnalytics = (): UserAnalytics => ({
    totalMessages: sessions.reduce((acc, s) => acc + s.messages.length, 0),
    topics: [
      { name: 'Creative Generation', count: 68 },
      { name: 'Technical Reasoning', count: 42 },
      { name: 'Media Synthesis', count: 25 }
    ],
    performanceScore: 99,
    recentActivity: [12, 18, 15, 24, 32, 28, 45]
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      } catch (e) { console.error(e); }
    }
    const loginState = localStorage.getItem('isLoggedIn');
    if (loginState === 'true') setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const handleSignIn = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to remove your account? This will also clear your history for privacy.")) {
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
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
      title: 'New Chat',
      messages: [],
      lastUpdated: Date.now(),
      model: selectedModel
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setViewMode('chat');
  };

  const handleCreateLearningPath = async (objective: string) => {
    setIsLoading(true);
    setViewMode('learning');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: GeminiModel.PRO,
        contents: `Create a ultra-fast, comprehensive 4-week learning roadmap for: "${objective}". Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING },
              modules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    description: { type: Type.STRING },
                    resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "duration", "description", "resources"]
                }
              }
            },
            required: ["objective", "modules"]
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      setLearningPath({ ...data, status: 'active' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
          content: "Here is the image you requested:",
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
          { 
            useSearch: true, 
            thinkingBudget: selectedModel === GeminiModel.PRO ? 2048 : 0 
          }
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
      const errMsg: ChatMessage = {
        id: (Date.now() + 5).toString(),
        role: 'model',
        content: "I encountered an error. This might be due to safety filters, quota limits, or project billing requirements. Please try a different prompt or check your settings.",
        timestamp: Date.now(),
        type: 'text'
      };
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, messages: [...s.messages, errMsg] } : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] overflow-hidden selection:bg-blue-500/30">
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
        isLoggedIn={isLoggedIn}
        onSignIn={handleSignIn}
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
          />
        )}
        {viewMode === 'analytics' && (
          <InsightsDashboard 
            analytics={getAnalytics()} 
            onClose={() => setViewMode('chat')}
          />
        )}
        {viewMode === 'learning' && (
          <LearningPathView 
            path={learningPath} 
            onCreate={handleCreateLearningPath}
            isLoading={isLoading}
          />
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
      </main>
    </div>
  );
};

export default App;
