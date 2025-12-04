import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Trash2, Eye, Filter } from 'lucide-react';
import PropertyManagementCard from './property-management-card';

export default async function AdminAllPropertiesPage() {
    const supabase = await createClient();
    
    // --- 1. Admin Role Check ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/auth/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return notFound();
    }

    // --- 2. Fetch ALL Properties ---
    const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

    if (propError) {
        console.error('Error fetching properties:', propError);
        return <div className="text-red-500 p-8">Error loading properties: {propError.message}</div>;
    }

    // --- 3. Enrich with Landlord Info ---
    const allProperties = await Promise.all(
        (properties || []).map(async (property) => {
            const { data: landlord } = await supabase
                .from('profiles')
                .select('id, full_name, phone, email')
                .eq('id', property.owner_id)
                .single();

            return {
                ...property,
                profiles: landlord || { id: '', full_name: 'Unknown', phone: 'N/A', email: 'N/A' }
            };
        })
    );

    // Group properties by status
    const pendingProperties = allProperties?.filter(p => p.status === 'pending') || [];
    const approvedProperties = allProperties?.filter(p => p.status === 'approved') || [];
    const rejectedProperties = allProperties?.filter(p => p.status === 'rejected') || [];

    const stats = [
        { label: 'Pending', count: pendingProperties.length, color: 'yellow' },
        { label: 'Approved', count: approvedProperties.length, color: 'green' },
        { label: 'Rejected', count: rejectedProperties.length, color: 'red' },
        { label: 'Total', count: allProperties?.length || 0, color: 'blue' }
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden pt-28 pb-16">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-1/3 h-2/3 bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white mb-2">
                                All Property Listings
                            </h1>
                            <p className="text-lg text-gray-400">
                                Manage all property listings across all statuses
                            </p>
                        </div>
                        <Link
                            href="/dashboard/admin"
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`
                            bg-gray-900/50 backdrop-blur-md border rounded-2xl p-6
                            ${stat.color === 'yellow' ? 'border-yellow-500/20' : ''}
                            ${stat.color === 'green' ? 'border-green-500/20' : ''}
                            ${stat.color === 'red' ? 'border-red-500/20' : ''}
                            ${stat.color === 'blue' ? 'border-blue-500/20' : ''}
                        `}>
                            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                            <p className={`text-3xl font-bold
                                ${stat.color === 'yellow' ? 'text-yellow-400' : ''}
                                ${stat.color === 'green' ? 'text-green-400' : ''}
                                ${stat.color === 'red' ? 'text-red-400' : ''}
                                ${stat.color === 'blue' ? 'text-blue-400' : ''}
                            `}>{stat.count}</p>
                        </div>
                    ))}
                </div>

                {/* Pending Properties Section */}
                {pendingProperties.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center space-x-3 mb-6 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
                            <Clock className="text-yellow-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">
                                Pending Review ({pendingProperties.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {pendingProperties.map((property: any) => (
                                <PropertyManagementCard key={property.id} property={property} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Approved Properties Section */}
                {approvedProperties.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center space-x-3 mb-6 bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                            <CheckCircle className="text-green-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">
                                Approved Properties ({approvedProperties.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {approvedProperties.map((property: any) => (
                                <PropertyManagementCard key={property.id} property={property} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Rejected Properties Section */}
                {rejectedProperties.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center space-x-3 mb-6 bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                            <XCircle className="text-red-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">
                                Rejected Properties ({rejectedProperties.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {rejectedProperties.map((property: any) => (
                                <PropertyManagementCard key={property.id} property={property} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {allProperties?.length === 0 && (
                    <div className="text-center py-24 bg-gray-800/80 rounded-2xl mt-10 border border-dashed border-gray-700">
                        <p className="text-gray-400 text-lg">No properties found in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
