"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "@/components/Chat/ChatWindow";
import { getOrCreateConversation } from "@/app/actions/chat";

interface ChatTriggerProps {
  landlordId: string;
  propertyId: number;
  propertyTitle: string;
  landlordName: string;
  currentUserId: string;
  isLandlord: boolean;
}

export default function ChatTrigger({ 
  landlordId, 
  propertyId, 
  propertyTitle,
  landlordName,
  currentUserId,
  isLandlord
}: ChatTriggerProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenChat = async () => {
    if (isLandlord) {
      alert("You are the landlord of this property. Students will contact you.");
      return;
    }

    setLoading(true);
    try {
      const result = await getOrCreateConversation(landlordId, propertyId);
      if (result.conversation) {
        setConversationId(result.conversation.id);
        setChatOpen(true);
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to open chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenChat}
        disabled={loading || isLandlord}
        className={`flex items-center justify-center w-full py-3 rounded-xl font-bold transition transform hover:scale-105 ${
          isLandlord 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        }`}
      >
        <MessageCircle className="mr-2" size={18} />
        {loading ? 'Opening...' : isLandlord ? 'Owner View' : 'Chat with Landlord'}
      </button>

      {chatOpen && conversationId && (
        <ChatWindow
          conversationId={conversationId}
          userId={currentUserId}
          otherUserId={landlordId}
          otherUserName={landlordName}
          propertyTitle={propertyTitle}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}
