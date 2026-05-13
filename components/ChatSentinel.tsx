import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types.ts';
import { motion, AnimatePresence } from 'motion/react';

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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'PLACEHOLDER_API_KEY') {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'model', 
            text: "I am currently in Demo Mode. To enable my full environmental intelligence, please provide a valid Gemini API key in your configuration.", 
            timestamp: new Date() 
          }]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const history = messages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.text }] 
      }));

      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config: { systemInstruction: "You are the EcoGuardian Sentinel. Provide professional, concise, and action-oriented environmental advice." }
      });
      
      const responseText = result.text || "Signal interpretation failed.";
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Signal interference detected. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[380px] h-[580px] bg-[#0f172a] rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-default active:cursor-grabbing"
          >
            <div className="p-6 bg-gradient-to-r from-slate-800 to-emerald-900 border-b border-white/5 flex items-center justify-between text-white drag-handle cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 opacity-40">
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-black text-xs uppercase tracking-widest">Sentinel Interface</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-xl leading-none">×</span>
              </button>
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
        </motion.div>
      )}
    </AnimatePresence>
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
