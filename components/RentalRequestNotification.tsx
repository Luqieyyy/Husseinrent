'use client';

import { Bell } from 'lucide-react';

interface RentalRequestNotificationProps {
  pendingRentalCount: number;
}

export default function RentalRequestNotification({ pendingRentalCount }: RentalRequestNotificationProps) {
  if (pendingRentalCount === 0) return null;

  const handleClick = () => {
    const requestsSection = document.getElementById('rental-requests-section');
    requestsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/40 rounded-xl p-4 mb-6 hover:from-purple-900/50 hover:to-indigo-900/50 transition group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/30 rounded-lg group-hover:bg-purple-500/40 transition">
            <Bell className="w-5 h-5 text-purple-300" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-purple-200 text-sm flex items-center">
              {pendingRentalCount} New Rental Request{pendingRentalCount > 1 ? 's' : ''}
              <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">{pendingRentalCount}</span>
            </h3>
            <p className="text-purple-300/70 text-xs">
              Students are waiting for your response • Click to review
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-purple-400 hidden sm:block">View Details</span>
          <div className="text-purple-400 group-hover:translate-x-1 transition">→</div>
        </div>
      </div>
    </button>
  );
}
