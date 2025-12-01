'use client';

import { useState } from 'react';
import MaintenanceList from '@/components/MaintenanceList';
import MaintenanceReportModal from '@/components/MaintenanceReportModal';
import { Plus } from 'lucide-react';

interface StudentMaintenanceClientProps {
  propertyId: number;
  roomId: number;
  propertyTitle: string;
  roomName: string;
}

export default function StudentMaintenanceClient({
  propertyId,
  roomId,
  propertyTitle,
  roomName,
}: StudentMaintenanceClientProps) {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <MaintenanceList propertyId={propertyId} userRole="student" />

      {/* Floating Action Button */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl shadow-orange-900/50 flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
        title="Report New Issue"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Report Modal */}
      <MaintenanceReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        propertyId={propertyId}
        roomId={roomId}
        propertyTitle={propertyTitle}
        roomName={roomName}
      />
    </>
  );
}
