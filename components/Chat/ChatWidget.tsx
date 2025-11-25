"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client"; // Use CLIENT client here
import { format } from "date-fns";

interface ChatWidgetProps {
    currentUserId: string;
}

export default function ChatWidget({ currentUserId }: ChatWidgetProps) {
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'list' | 'chat'>('list'); // 'list' of contacts or specific 'chat'
    
    // Data States
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChatUser, setActiveChatUser] = useState<any>(null); // The user we are talking to
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversations (Distinct users interacted with)
    useEffect(() => {
        if (!isOpen) return;

        const fetchConversations = async () => {
            // This is a complex query. Simplified: fetch all messages involved, process unique IDs in JS
            // In a production app, you'd want a 'conversations' table.
            const { data } = await supabase
                .from('messages')
                .select('*, sender:sender_id(id, full_name), receiver:receiver_id(id, full_name)')
                .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                .order('created_at', { ascending: false });

            if (data) {
                const uniqueUsersMap = new Map();
                
                data.forEach((msg: any) => {
                    const otherUser = msg.sender_id === currentUserId ? msg.receiver : msg.sender;
                    // Fix: Handle cases where profile might be null/deleted
                    if (!otherUser) return;
                    
                    if (!uniqueUsersMap.has(otherUser.id)) {
                        uniqueUsersMap.set(otherUser.id, {
                            user: otherUser,
                            lastMessage: msg.content,
                            time: msg.created_at
                        });
                    }
                });
                setConversations(Array.from(uniqueUsersMap.values()));
            }
        };

        fetchConversations();
    }, [isOpen, currentUserId, supabase]);

    // 2. Fetch Messages for Active Chat & Subscribe to Realtime
    useEffect(() => {
        if (view !== 'chat' || !activeChatUser) return;

        // Fetch History
        const fetchHistory = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${activeChatUser.id}),and(sender_id.eq.${activeChatUser.id},receiver_id.eq.${currentUserId})`)
                .order('created_at', { ascending: true });
            
            if (data) setMessages(data);
        };
        fetchHistory();

        // Subscribe to Realtime
        const channel = supabase
            .channel('chat_room')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `receiver_id=eq.${currentUserId}` // Listen for incoming
            }, (payload) => {
                // If the message is from the person we are currently looking at
                if (payload.new.sender_id === activeChatUser.id) {
                    setMessages((prev) => [...prev, payload.new]);
                }
            })
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `sender_id=eq.${currentUserId}` // Listen for my own sends (if multiple tabs)
            }, (payload) => {
                 // Optimization: Usually we optimistic update, but this ensures sync
                 // We verify we haven't already added it via optimistic update
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [view, activeChatUser, currentUserId, supabase]);

    // Auto Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // 3. Send Message
    const handleSend = async () => {
        if (!newMessage.trim() || !activeChatUser) return;

        const msgContent = newMessage;
        setNewMessage(""); // Clear input immediately (Optimistic UI)

        // Optimistic Update
        const optimisticMsg = {
            id: Date.now(),
            sender_id: currentUserId,
            receiver_id: activeChatUser.id,
            content: msgContent,
            created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: currentUserId,
                receiver_id: activeChatUser.id,
                content: msgContent
            });

        if (error) {
            console.error("Error sending:", error);
            // Revert logic would go here
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            
            {/* MAIN WINDOW */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up">
                    
                    {/* HEADER */}
                    <div className="bg-indigo-600 p-3 flex justify-between items-center text-white">
                        <div className="flex items-center">
                            {view === 'chat' && (
                                <button onClick={() => setView('list')} className="mr-2 hover:bg-white/20 p-1 rounded-full">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <h3 className="font-bold flex items-center">
                                {view === 'list' ? '💬 Messages' : activeChatUser?.full_name || 'Chat'}
                            </h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    {/* VIEW: CONVERSATION LIST */}
                    {view === 'list' && (
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            {conversations.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                    <MessageCircle size={40} className="mb-2 opacity-50" />
                                    <p className="text-sm">No messages yet.</p>
                                    <p className="text-xs">Chat with a landlord from property details.</p>
                                </div>
                            ) : (
                                conversations.map((convo: any) => (
                                    <div 
                                        key={convo.user.id}
                                        onClick={() => { setActiveChatUser(convo.user); setView('chat'); }}
                                        className="p-4 border-b border-gray-100 hover:bg-gray-100 cursor-pointer flex items-center transition"
                                    >
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                                            {convo.user.full_name?.[0] || <User size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 text-sm truncate">{convo.user.full_name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{convo.lastMessage}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            {format(new Date(convo.time), 'MMM d')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* VIEW: ACTIVE CHAT */}
                    {view === 'chat' && (
                        <>
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-100 space-y-3" ref={scrollRef}>
                                {messages.map((msg) => {
                                    const isMe = msg.sender_id === currentUserId;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div 
                                                className={`max-w-[75%] p-3 text-sm rounded-2xl shadow-sm ${
                                                    isMe 
                                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..." 
                                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                />
                                <button 
                                    onClick={handleSend}
                                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* FAB (Launcher) */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}