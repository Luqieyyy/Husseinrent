"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { getConversations } from "@/app/actions/chat";
import ChatWindow from "./Chat/ChatWindow";

interface Conversation {
  id: string;
  student_id: string;
  property_id: string;
  last_message: string;
  last_message_at: string;
  student_name: string;
  property_title: string;
}

interface LandlordChatWidgetProps {
  userId: string;
}

export default function LandlordChatWidget({ userId }: LandlordChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    const result = await getConversations();
    if (result.conversations) {
      setConversations(result.conversations as Conversation[]);
      // Calculate unread count (this is placeholder - you can add unread tracking later)
      setUnreadCount(result.conversations.length);
    }
  };

  const handleConversationClick = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsOpen(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* CONVERSATIONS LIST */}
        {isOpen && (
          <div className="mb-4 w-96 h-[500px] bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center">
                <MessageCircle className="mr-2" size={20} />
                Student Messages
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleConversationClick(conv)}
                    className="w-full p-4 border-b border-gray-800 hover:bg-gray-800/50 transition text-left"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-white">{conv.student_name}</p>
                      <span className="text-xs text-gray-400">
                        {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-indigo-400 mb-1">{conv.property_title}</p>
                    <p className="text-sm text-gray-400 truncate">{conv.last_message}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* FLOATING ACTION BUTTON */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* CHAT WINDOW */}
      {selectedConversation && (
        <ChatWindow
          conversationId={selectedConversation.id}
          userId={userId}
          otherUserId={selectedConversation.student_id}
          otherUserName={selectedConversation.student_name}
          propertyTitle={selectedConversation.property_title}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </>
  );
}