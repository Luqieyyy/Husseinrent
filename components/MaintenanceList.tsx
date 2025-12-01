'use client';

import { useState, useEffect } from 'react';
import { getMaintenanceRequests, updateMaintenanceStatus } from '@/app/actions/maintenance';
import { AlertCircle, Clock, CheckCircle, XCircle, Droplet, Zap, Wifi, Wrench, Home as HomeIcon, Bug, MoreHorizontal, MapPin, Calendar, User } from 'lucide-react';

interface MaintenanceRequest {
  id: number;
  category: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  response_note: string | null;
  reporter_type: string;
  properties: {
    id: number;
    title: string;
    location: string;
  };
  rooms: {
    id: number;
    name: string;
  } | null;
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
}

const categoryIcons: Record<string, any> = {
  plumbing: Droplet,
  electrical: Zap,
  water_supply: Droplet,
  internet: Wifi,
  appliances: Wrench,
  structural: HomeIcon,
  pest_control: Bug,
  other: MoreHorizontal,
};

const statusColors = {
  pending: 'bg-yellow-900/20 border-yellow-700 text-yellow-300',
  in_progress: 'bg-blue-900/20 border-blue-700 text-blue-300',
  resolved: 'bg-green-900/20 border-green-700 text-green-300',
  rejected: 'bg-red-900/20 border-red-700 text-red-300',
};

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export default function MaintenanceList({ propertyId, userRole }: { propertyId?: number; userRole: string }) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadRequests();
  }, [propertyId]);

  const loadRequests = async () => {
    setLoading(true);
    const result = await getMaintenanceRequests(propertyId);
    if (result.success && result.data) {
      setRequests(result.data as MaintenanceRequest[]);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (requestId: number, status: string) => {
    setUpdating(true);
    const result = await updateMaintenanceStatus(
      requestId,
      status as any,
      responseNote.trim() || undefined
    );
    setUpdating(false);

    if (result.success) {
      setSelectedRequest(null);
      setResponseNote('');
      loadRequests();
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return req.status === 'pending';
    if (filterStatus === 'in_progress') return req.status === 'in_progress';
    if (filterStatus === 'resolved') return req.status === 'resolved';
    return true;
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-400">Loading maintenance requests...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-12 border border-gray-800 rounded-2xl bg-gray-900/50">
        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No Maintenance Requests</h3>
        <p className="text-gray-500 text-sm">All maintenance issues have been resolved or no reports yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      {userRole === 'landlord' && (
        <div className="flex space-x-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
              filterStatus === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            In Progress ({statusCounts.in_progress})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
              filterStatus === 'resolved'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Resolved ({statusCounts.resolved})
          </button>
        </div>
      )}

      {/* Requests List */}
      {filteredRequests.map((request) => {
        const Icon = categoryIcons[request.category] || MoreHorizontal;
        
        return (
          <div
            key={request.id}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition"
          >
            {/* Header Section */}
            <div className="bg-gray-800/50 p-4 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="bg-gray-700 p-2.5 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{request.title}</h3>
                    
                    {/* Property Name - Prominent Display */}
                    <div className="flex items-center text-indigo-400 font-semibold mb-2">
                      <HomeIcon className="w-4 h-4 mr-1.5" />
                      {request.properties.title}
                      {request.rooms && (
                        <span className="ml-2 text-gray-500">• {request.rooms.name}</span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      {request.properties.location}
                    </div>
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex flex-col items-end space-y-2">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${statusColors[request.status as keyof typeof statusColors]}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded capitalize ${priorityColors[request.priority as keyof typeof priorityColors]}`}>
                    {request.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{request.description}</p>

              {request.image_url && (
                <img
                  src={request.image_url}
                  alt="Issue"
                  className="w-full max-w-md h-48 object-cover rounded-lg mb-4 border border-gray-700"
                />
              )}

              {/* Reporter Info */}
              <div className="flex items-center justify-between text-xs bg-gray-800/30 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-400">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-medium text-white">{request.profiles.full_name}</span>
                    <span className="ml-1.5 capitalize text-gray-500">({request.reporter_type})</span>
                  </div>
                  {request.profiles.phone && (
                    <div className="text-gray-500">
                      📞 {request.profiles.phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(request.created_at).toLocaleDateString('en-MY', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {request.response_note && (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-400 font-semibold mb-1">Landlord Response:</p>
                  <p className="text-sm text-blue-200">{request.response_note}</p>
                </div>
              )}

              {/* Landlord Actions */}
              {userRole === 'landlord' && request.status !== 'resolved' && (
                <div className="pt-4 border-t border-gray-800">
                  {selectedRequest?.id === request.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder="Add a note for the tenant (optional)..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-indigo-500 outline-none resize-none"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                            disabled={updating}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                          >
                            {updating ? 'Updating...' : 'Mark In Progress'}
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'resolved')}
                          disabled={updating}
                          className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                        >
                          {updating ? 'Updating...' : '✓ Mark Resolved'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(null);
                            setResponseNote('');
                          }}
                          className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition font-medium"
                    >
                      Respond to Request
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
