
import React, { useState } from 'react';
import { LearningPath } from '../types';

interface LearningPathViewProps {
  path: LearningPath | null;
  onCreate: (objective: string) => void;
  isLoading: boolean;
}

const LearningPathView: React.FC<LearningPathViewProps> = ({ path, onCreate, isLoading }) => {
  const [objective, setObjective] = useState('');

  if (!path && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#131314] p-8 text-center">
        <div className="max-w-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-4xl font-medium text-white tracking-tight">Personalized Learning</h2>
          <p className="text-gray-400 text-lg">Input your learning goal and I'll build a tailored 4-week curriculum with modules and curated resources.</p>
          
          <div className="relative pt-4">
            <input 
              type="text" 
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Master React and TypeScript in a month"
              className="w-full bg-[#1e1f20] border border-[#3c4043] rounded-2xl px-6 py-4 text-white focus:border-[#8ab4f8] outline-none"
            />
            <button 
              onClick={() => onCreate(objective)}
              disabled={!objective.trim()}
              className="mt-4 px-8 py-3 bg-[#8ab4f8] text-[#131314] font-semibold rounded-full hover:bg-white transition-colors disabled:bg-gray-700 disabled:text-gray-500"
            >
              Generate Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#131314]">
           <div className="w-16 h-16 rounded-full gemini-gradient animate-spin mb-6"></div>
           <p className="text-xl font-medium animate-pulse">Designing your custom learning path...</p>
        </div>
     );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#131314] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
           <span className="text-[#8ab4f8] text-sm font-semibold uppercase tracking-widest">Your Roadmap</span>
           <h2 className="text-4xl font-medium text-white mt-2">{path?.objective}</h2>
        </header>

        <div className="space-y-6">
           {path?.modules.map((m, i) => (
             <div key={i} className="bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#8ab4f8]/20 group-hover:bg-[#8ab4f8] transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold text-[#3c4043] group-hover:text-[#8ab4f8] transition-colors">0{i+1}</span>
                      <h3 className="text-2xl font-medium text-white">{m.title}</h3>
                   </div>
                   <span className="bg-[#3c4043] text-gray-300 px-3 py-1 rounded-full text-xs font-medium">{m.duration}</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">{m.description}</p>
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Key Resources</h4>
                   <div className="flex flex-wrap gap-2">
                      {m.resources.map((r, j) => (
                        <div key={j} className="bg-[#2e2f31] text-xs text-blue-400 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-400 cursor-pointer transition-all">
                           {r}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPathView;
