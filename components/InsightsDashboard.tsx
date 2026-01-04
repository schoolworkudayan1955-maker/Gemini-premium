
import React from 'react';
import { UserAnalytics } from '../types';

interface InsightsDashboardProps {
  analytics: UserAnalytics;
  onClose: () => void;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ analytics, onClose }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-medium text-[#e3e3e3]">Analytics Insights</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2e2f31] rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e1f20] p-6 rounded-3xl border border-[#3c4043]">
             <p className="text-sm text-gray-400 mb-1">Total Interaction Volume</p>
             <p className="text-4xl font-semibold text-[#8ab4f8]">{analytics.totalMessages}</p>
          </div>
          <div className="bg-[#1e1f20] p-6 rounded-3xl border border-[#3c4043]">
             <p className="text-sm text-gray-400 mb-1">Performance Efficiency</p>
             <div className="flex items-end gap-2">
                <p className="text-4xl font-semibold text-green-400">{analytics.performanceScore}%</p>
                <p className="text-sm text-gray-500 pb-1">Excellent</p>
             </div>
          </div>
          <div className="bg-[#1e1f20] p-6 rounded-3xl border border-[#3c4043]">
             <p className="text-sm text-gray-400 mb-1">Focus Areas</p>
             <p className="text-lg text-white font-medium">{analytics.topics[0]?.name || 'Analyzing...'}</p>
          </div>
        </div>

        <div className="bg-[#1e1f20] p-8 rounded-3xl border border-[#3c4043]">
          <h3 className="text-xl font-medium mb-6">Activity Progress (7 Days)</h3>
          <div className="flex items-end justify-between h-48 gap-4 px-4">
            {analytics.recentActivity.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-[#8ab4f8] rounded-t-lg transition-all duration-500" 
                  style={{ height: `${Math.min(count * 5, 100)}%` }}
                ></div>
                <span className="text-[10px] text-gray-500">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[#1e1f20] p-6 rounded-3xl border border-[#3c4043]">
              <h3 className="text-lg font-medium mb-4">Topic Distribution</h3>
              <div className="space-y-4">
                 {analytics.topics.map((t, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.name}</span>
                        <span className="text-gray-500">{t.count} messages</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#3c4043] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(t.count / analytics.totalMessages) * 100}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="bg-[#1e1f20] p-6 rounded-3xl border border-[#3c4043] flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h4 className="font-medium text-white">Power Suggestion</h4>
              <p className="text-sm text-gray-400 mt-2">Based on your recent coding queries, try exploring the Gemini Function Calling documentation for automation.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;
