'use client';

import { useState } from 'react';
import { updateRentalRequestStatus } from '@/app/actions/booking';
import { Check, X, Phone, Mail, User, Home as HomeIcon, Calendar } from 'lucide-react';

interface RentalRequest {
  id: number;
  status: string;
  created_at: string;
  properties: {
    title: string;
  };
  rooms: {
    name: string;
  };
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function RentalRequestsList({ requests }: { requests: any[] }) {
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const handleUpdateStatus = async (requestId: number, status: 'approved' | 'rejected') => {
    setUpdating(requestId);
    await updateRentalRequestStatus(requestId, status);
    setUpdating(null);
    window.location.reload(); // Refresh to show updated data
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div id="rental-requests-section" className="mt-12">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <User className="w-8 h-8 mr-3 text-indigo-400" />
        Rental Requests
      </h2>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gray-900 p-2 rounded-xl border border-gray-800 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Pending ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Approved ({statusCounts.approved})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Rejected ({statusCounts.rejected})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          All ({statusCounts.all})
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center p-12 border border-gray-800 rounded-2xl bg-gray-900/50">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Requests</h3>
          <p className="text-gray-500 text-sm">
            {filter === 'pending' && 'No pending rental requests at the moment.'}
            {filter === 'approved' && 'No approved rentals yet.'}
            {filter === 'rejected' && 'No rejected requests.'}
            {filter === 'all' && 'No rental requests received yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request: any) => (
            <div
              key={request.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition"
            >
              <div className="bg-gray-800/50 p-4 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {request.profiles?.full_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">
                        {request.profiles?.full_name || 'Unknown Student'}
                      </h3>
                      
                      <div className="flex items-center text-indigo-400 font-semibold mb-2">
                        <HomeIcon className="w-4 h-4 mr-1.5" />
                        {request.properties?.title}
                        <span className="ml-2 text-gray-500">• {request.rooms?.name}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {request.profiles?.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1.5" />
                            {request.profiles.phone}
                          </div>
                        )}
                        {request.profiles?.email && (
                          <div className="flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            {request.profiles.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${
                        request.status === 'pending'
                          ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                          : request.status === 'approved'
                          ? 'bg-green-900/20 border-green-700 text-green-300'
                          : 'bg-red-900/20 border-red-700 text-red-300'
                      }`}
                    >
                      {request.status}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(request.created_at).toLocaleDateString('en-MY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="p-4 flex space-x-3">
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'approved')}
                    disabled={updating === request.id}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {updating === request.id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'rejected')}
                    disabled={updating === request.id}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    {updating === request.id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
