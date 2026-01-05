
export type MessageRole = 'user' | 'model';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio';
  attachments?: string[];
  groundingUrls?: { uri: string; title: string }[];
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
  model: string;
}

export interface UserAnalytics {
  totalMessages: number;
  topics: { name: string; count: number }[];
  performanceScore: number; // 0-100
  recentActivity: number[]; // Last 7 days message counts
}

export interface LearningPath {
  objective: string;
  modules: { title: string; duration: string; description: string; resources: string[] }[];
  status: 'active' | 'completed';
}

export enum GeminiModel {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  LITE = 'gemini-flash-lite-latest',
  IMAGE = 'gemini-2.5-flash-image',
  IMAGE_PRO = 'gemini-3-pro-image-preview',
  TTS = 'gemini-2.5-flash-preview-tts'
}

export type ViewMode = 'chat' | 'analytics' | 'learning' | 'image-creator' | 'humaniser' | 'ai-detector' | 'comics-maker' | 'code-maker';
