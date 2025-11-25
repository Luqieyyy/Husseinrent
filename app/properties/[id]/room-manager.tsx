"use client";

import { approveRequest, rejectRequest, removeTenant } from "@/app/actions/booking";
import { User, Phone, Check, X, Trash2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function RoomManager({ roomId, propertyId, requests, tenants, capacity }: any) {  const [loading, setLoading] = useState<number | null>(null); // Track which ID is loading

  const handleAction = async (id: number, action: Function) => {
    setLoading(id);
    await action(id, propertyId);
    setLoading(null);
  };

  const spotsTaken = tenants.length;
  const spotsLeft = capacity - spotsTaken;

  return (
    <div className="mt-4 space-y-4 border-t border-gray-700 pt-4">
      
      {/* 1. CAPACITY BAR */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
         <span>Occupancy</span>
         <span className={spotsLeft === 0 ? "text-red-400" : "text-emerald-400"}>
            {spotsTaken} / {capacity} Filled
         </span>
      </div>
      
      {/* 2. PENDING REQUESTS SECTION */}
      {requests.length > 0 && (
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-3">
            <p className="text-xs font-bold text-indigo-300 mb-2 flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
                {requests.length} Pending Request{requests.length > 1 ? 's' : ''}
            </p>
            
            <div className="space-y-2">
                {requests.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between bg-gray-900 p-2 rounded-lg">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                                {req.profiles?.full_name?.[0] || "S"}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">{req.profiles?.full_name || "Student"}</p>
                                <p className="text-[10px] text-gray-400">{req.profiles?.phone || "No Phone"}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => handleAction(req.id, rejectRequest)}
                                disabled={loading === req.id}
                                className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white transition"
                            >
                                <X size={14} />
                            </button>
                            <button 
                                onClick={() => handleAction(req.id, approveRequest)}
                                disabled={loading === req.id}
                                className="p-1.5 bg-green-600 text-white rounded hover:bg-green-500 transition shadow-lg shadow-green-900/20"
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 3. ACTIVE TENANTS SECTION */}
      {tenants.length > 0 ? (
          <div className="space-y-2">
             <p className="text-xs font-bold text-gray-500 uppercase">Current Tenants</p>
             {tenants.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between bg-gray-800/50 border border-gray-700 p-2 rounded-lg group hover:border-gray-600 transition">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                             <User size={14} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-200">{req.profiles?.full_name || "Tenant"}</p>
                            <Link href={`https://wa.me/${req.profiles?.phone}`} target="_blank" className="text-[10px] text-indigo-400 flex items-center hover:underline">
                                <MessageCircle size={10} className="mr-1" /> {req.profiles?.phone}
                            </Link>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if(confirm("Are you sure you want to remove this tenant?")) {
                                handleAction(req.id, removeTenant);
                            }
                        }}
                        disabled={loading === req.id}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Remove Tenant"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
             ))}
          </div>
      ) : (
          <div className="text-center py-4 border-2 border-dashed border-gray-800 rounded-xl">
              <p className="text-xs text-gray-600">Room is empty</p>
          </div>
      )}

    </div>
  );
}