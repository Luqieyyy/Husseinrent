"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function LandlordChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center">
              <span className="mr-2">💬</span> Student Chat
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area (Dummy Data for now) */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 p-2 rounded-lg rounded-tl-none text-sm max-w-[80%]">
                Hi, is the room at Parit Raja still available?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white p-2 rounded-lg rounded-tr-none text-sm max-w-[80%]">
                Yes! It is currently available for male students.
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white flex items-center">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="ml-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}