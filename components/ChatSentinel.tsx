
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const ChatSentinel: React.FC<{ user: User }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Greetings, ${user.name}. I am the Sentinel. How can I assist with environmental monitoring today?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMessage].map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        config: { systemInstruction: "You are the EcoGuardian Sentinel. Provide professional, concise, and action-oriented environmental advice." }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I am processing the data stream...", timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Signal interference detected. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-[100]">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-slate-900 rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="p-8 bg-gradient-to-r from-slate-800 to-emerald-900 border-b border-white/5 flex items-center justify-between text-white">
            <h3 className="font-black">Sentinel</h3>
            <button onClick={() => setIsOpen(false)} className="opacity-60 hover:opacity-100">Close</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-900/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-slate-300 border border-white/5'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Sentinel Thinking...</div>}
          </div>
          <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5 bg-slate-900">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Query the grid..." 
              className="w-full bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/20" 
            />
          </form>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5"/></svg>
      </button>
    </div>
  );
};

export default ChatSentinel;
