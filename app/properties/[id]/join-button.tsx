"use client";

import { joinRoom } from "@/app/actions/booking";
import { useState } from "react";
import { LogIn, CheckCircle, Clock } from "lucide-react";

export default function JoinButton({ propertyId, roomId, landlordId, myRequest }: any) {
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

  // 1. If I requested THIS specific room
  if (myRequest && myRequest.room_id === roomId) {
      if (myRequest.status === 'approved') {
          return <button disabled className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center"><CheckCircle size={16} className="mr-2"/> Joined</button>;
      }
      return <button disabled className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold flex items-center"><Clock size={16} className="mr-2"/> Pending</button>;
  }

  // 2. If I have a request elsewhere (One-to-One rule)
  if (myRequest) {
      return <button disabled className="px-4 py-2 bg-gray-700 text-gray-500 rounded-lg font-bold text-xs">Unavailable</button>;
  }

  // 3. Default State
  return (
    <button 
        onClick={handleJoin} 
        disabled={loading}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition flex items-center"
    >
        {loading ? "..." : <><LogIn size={16} className="mr-2" /> Join</>}
    </button>
  );
}