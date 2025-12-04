"use client";

import { useState } from "react";
import { MessageCircle, Home } from "lucide-react";
import Image from "next/image";
import ChatWindow from "@/components/Chat/ChatWindow";

interface Conversation {
  id: string;
  property_id: number;
  last_message: string | null;
  last_message_at: string;
  properties: {
    id: number;
    title: string;
    image_url: string;
  };
  otherUserName: string;
  otherUserId: string;
}

interface ConversationsListProps {
  conversations: Conversation[];
  currentUserId: string;
  isStudent: boolean;
}

export default function ConversationsList({ 
  conversations, 
  currentUserId,
  isStudent 
}: ConversationsListProps) {
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const handleOpenChat = (conv: Conversation) => {
    setSelectedConv(conv);
    setOpenChat(conv.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="space-y-3">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => handleOpenChat(conv)}
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-center gap-4">
              {/* Property Image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
                {conv.properties?.image_url ? (
                  <Image 
                    src={conv.properties.image_url} 
                    alt={conv.properties.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Home className="text-gray-600" size={24} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition truncate">
                    {conv.otherUserName}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-1 truncate">
                  <Home className="inline mr-1" size={12} />
                  {conv.properties?.title || 'Property'}
                </p>
                {conv.last_message && (
                  <p className="text-sm text-gray-500 truncate">
                    {conv.last_message}
                  </p>
                )}
              </div>

              {/* Chat Icon */}
              <MessageCircle 
                className="text-gray-600 group-hover:text-indigo-400 transition flex-shrink-0" 
                size={20} 
              />
            </div>
          </button>
        ))}
      </div>

      {/* Chat Window */}
      {openChat && selectedConv && (
        <ChatWindow
          conversationId={openChat}
          userId={currentUserId}
          otherUserId={selectedConv.otherUserId}
          otherUserName={selectedConv.otherUserName}
          propertyTitle={selectedConv.properties?.title || 'Property'}
          onClose={() => {
            setOpenChat(null);
            setSelectedConv(null);
          }}
        />
      )}
    </>
  );
}
