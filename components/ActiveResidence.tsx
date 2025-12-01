"use client";

import { useState } from "react";
import { Home, LogOut, CheckCircle, MapPin, AlertCircle } from "lucide-react";
import Image from "next/image";
import { leaveRoom } from "@/app/actions/booking"; // You need to create this server action
import MaintenanceReportModal from "./MaintenanceReportModal";
import MaintenanceList from "./MaintenanceList";

export default function ActiveResidence({ rental }: { rental: any }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMaintenanceList, setShowMaintenanceList] = useState(false);
  
  const handleLeave = async () => {
      const confirm = window.confirm("Are you sure you want to end your tenancy? You will have to find a new room.");
      if (confirm) {
          // Trigger server action to delete/update request
          await leaveRoom(rental.id); 
      }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
        <div className="bg-gradient-to-br from-indigo-900/50 to-gray-900 border border-indigo-500/30 p-8 rounded-3xl shadow-2xl max-w-2xl w-full text-center relative overflow-hidden">
            
            {/* Success Badge */}
            <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 flex items-center">
                <CheckCircle size={12} className="mr-1" /> ACTIVE TENANT
            </div>

            <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <Home size={40} className="text-white" />
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Welcome Home!</h2>
            <p className="text-gray-400 mb-8">You are currently renting a room at:</p>

            {/* Property Card details */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-8 text-left flex items-start space-x-4 border border-gray-700">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {rental.properties?.image_url && (
                        <Image src={rental.properties.image_url} alt="House" fill className="object-cover" />
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{rental.properties?.title}</h3>
                    <p className="text-gray-400 text-sm flex items-center mt-1">
                        <MapPin size={14} className="mr-1" /> {rental.properties?.location}
                    </p>
                    <div className="mt-2 inline-block bg-indigo-900/50 text-indigo-300 text-xs px-2 py-1 rounded">
                        Room: {rental.rooms?.name}
                    </div>
                </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-xl mb-6 text-yellow-200 text-sm">
                ⚠️ You cannot browse other rooms while you have an active tenancy.
            </div>

            {/* Maintenance Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                    onClick={() => setShowReportModal(true)}
                    className="py-3 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-600/30 rounded-xl font-bold transition flex items-center justify-center group"
                >
                    <AlertCircle size={18} className="mr-2" />
                    Report Issue
                </button>
                <button
                    onClick={() => setShowMaintenanceList(!showMaintenanceList)}
                    className="py-3 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-600/30 rounded-xl font-bold transition flex items-center justify-center group"
                >
                    View Reports
                </button>
            </div>

            <button 
                onClick={handleLeave}
                className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-xl font-bold transition flex items-center justify-center group"
            >
                <LogOut size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                End Tenancy & Leave Room
            </button>
        </div>

        {/* Maintenance List Section */}
        {showMaintenanceList && (
            <div className="mt-8 w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">My Maintenance Reports</h3>
                <MaintenanceList propertyId={rental.properties.id} userRole="student" />
            </div>
        )}

        {/* Report Modal */}
        <MaintenanceReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            propertyId={rental.properties.id}
            roomId={rental.rooms.id}
            propertyTitle={rental.properties.title}
            roomName={rental.rooms.name}
        />
    </div>
  );
}