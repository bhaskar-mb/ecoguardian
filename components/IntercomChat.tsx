import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { User } from '../types.ts';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderOrg?: string;
  text: string;
  timestamp: Date;
}

interface IntercomChatProps {
  user: User;
}

const IntercomChat: React.FC<IntercomChatProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const socket = useMemo(() => io('http://localhost:5000'), []);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    socket.on('intercomMessage', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('intercomMessage');
    };
  }, [socket, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      senderOrg: user.organization,
      text: input,
      timestamp: new Date()
    };

    socket.emit('sendIntercom', newMsg);
    // Optimistic update
    setMessages(prev => [...prev, newMsg]);
    setInput('');
  };

  return (
    <div className="fixed bottom-32 right-12 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm tracking-tight">Agency Intercom</h3>
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-0.5">Secure Peer-to-Peer Stream</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mb-4">💬</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">System standby.<br/>Send a message to start the secure broadcast.</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.senderId === user.id ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">{m.senderName}</span>
                    {m.senderOrg && <span className="text-[7px] font-bold text-indigo-400 uppercase px-1.5 py-0.5 bg-indigo-50 rounded">{m.senderOrg}</span>}
                  </div>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[11px] font-bold shadow-sm ${
                    m.senderId === user.id 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[7px] font-bold text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Broadcast message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-[11px] font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 border-2 border-white ${
          isOpen ? 'bg-slate-900' : 'bg-indigo-600'
        }`}
      >
        {isOpen ? (
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round"/></svg>
        ) : (
          <div className="relative">
             <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             {unreadCount > 0 && (
               <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 border-2 border-indigo-600 rounded-full flex items-center justify-center text-[9px] font-black">{unreadCount}</span>
             )}
          </div>
        )}
      </button>
    </div>
  );
};

export default IntercomChat;
