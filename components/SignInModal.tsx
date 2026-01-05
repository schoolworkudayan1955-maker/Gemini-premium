
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SignInModalProps {
  onSignIn: (user: UserProfile) => void;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ onSignIn, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onSignIn({ name, email });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#1e1f20] border border-[#3c4043] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full arlo-star-gradient flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-white">Sign in to Arlo AI</h2>
            <p className="text-gray-400 text-sm mt-2 text-center">Your history and preferences, synced and secure.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1 ml-1">Your Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full bg-[#131314] border border-[#3c4043] rounded-xl px-4 py-3 text-white focus:border-[#8ab4f8] outline-none transition-all placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1 ml-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@arloai.com"
                className="w-full bg-[#131314] border border-[#3c4043] rounded-xl px-4 py-3 text-white focus:border-[#8ab4f8] outline-none transition-all placeholder-gray-600"
              />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                type="submit"
                className="w-full py-3 bg-[#8ab4f8] hover:bg-white text-[#131314] font-bold rounded-full transition-all shadow-lg"
              >
                Let's Go
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 rounded-full transition-all text-sm"
              >
                Maybe later
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
