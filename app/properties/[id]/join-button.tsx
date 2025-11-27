"use client";

import { joinRoom } from "@/app/actions/booking";
import { useState } from "react";
import { LogIn, CheckCircle, Clock, Ban } from "lucide-react"; 

// We add 'isFull' to the props here so the button knows the room status
export default function JoinButton({ propertyId, roomId, landlordId, myRequest, isFull }: any) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    const res = await joinRoom(propertyId, roomId, landlordId);
    if (res?.error) {
        alert(res.error);
    } else {
        alert("Request Sent! Wait for Landlord approval.");
    }
    setLoading(false);
  };

  // 1. If I have a request for THIS room (Pending/Joined)
  if (myRequest && myRequest.room_id === roomId) {
      if (myRequest.status === 'approved') {
          return <button disabled className="w-full px-4 py-2 bg-green-600/20 text-green-500 border border-green-600/30 rounded-lg font-bold flex items-center justify-center"><CheckCircle size={16} className="mr-2"/> Joined</button>;
      }
      return <button disabled className="w-full px-4 py-2 bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded-lg font-bold flex items-center justify-center"><Clock size={16} className="mr-2"/> Pending</button>;
  }

  // 2. If I have a request elsewhere (One-to-One rule)
  if (myRequest) {
      return <button disabled className="w-full px-4 py-2 bg-gray-800 text-gray-500 rounded-lg font-bold text-xs cursor-not-allowed">Unavailable (Renting elsewhere)</button>;
  }

  // 3. NEW LOGIC: If Room is Full -> DISABLE BUTTON
  if (isFull) {
      return (
        <button disabled className="w-full px-4 py-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-lg font-bold flex items-center justify-center cursor-not-allowed opacity-80">
            <Ban size={16} className="mr-2" /> Full
        </button>
  )}

  // 4. Default State (Available)
  return (
    <button 
        onClick={handleJoin} 
        disabled={loading}
        className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition flex items-center justify-center"
    >
        {loading ? "..." : <><LogIn size={16} className="mr-2" /> Join Room</>}
    </button>
  );
}