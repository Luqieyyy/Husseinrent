'use client';

import { UserPlus } from 'lucide-react';

interface PropertyRequestBadgeProps {
  requestCount: number;
}

export default function PropertyRequestBadge({ requestCount }: PropertyRequestBadgeProps) {
  if (requestCount === 0) return null;

  const handleClick = () => {
    const requestsSection = document.getElementById('rental-requests-section');
    requestsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      className="px-2.5 py-1 rounded-full text-xs font-bold border bg-purple-900/30 text-purple-300 border-purple-500/30 flex items-center hover:bg-purple-900/50 transition"
    >
      <UserPlus className="w-3 h-3 mr-1" />
      {requestCount}
    </button>
  );
}
