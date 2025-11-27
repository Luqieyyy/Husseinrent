import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Clock, Home } from 'lucide-react';

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    
    // --- 1. Auth Check ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/auth/login');
    }

    // --- 2. Admin Role Check ---
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        return notFound();
    }

    // --- 3. Fetch Property Statistics ---
    const [
        { data: pendingProperties, count: pendingCount },
        { data: approvedProperties, count: approvedCount },
        { data: rejectedProperties, count: rejectedCount }
    ] = await Promise.all([
        supabase
            .from('properties')
            .select('id', { count: 'exact' })
            .eq('status', 'pending'),
        supabase
            .from('properties')
            .select('id', { count: 'exact' })
            .eq('status', 'approved'),
        supabase
            .from('properties')
            .select('id', { count: 'exact' })
            .eq('status', 'rejected')
    ]);

    // --- 4. Fetch Recent Pending Properties (Preview) ---
    const { data: recentPending } = await supabase
        .from('properties')
        .select('id, title, location, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

    const stats = [
        {
            label: 'Pending Review',
            count: pendingCount || 0,
            icon: <Clock size={24} className="text-yellow-400" />,
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            href: '/dashboard/admin/properties-approval'
        },
        {
            label: 'Approved',
            count: approvedCount || 0,
            icon: <CheckCircle size={24} className="text-emerald-400" />,
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            label: 'Rejected',
            count: rejectedCount || 0,
            icon: <AlertCircle size={24} className="text-red-400" />,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden pt-28">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center space-x-3 mb-2">
                        <Home size={32} className="text-indigo-400" />
                        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <p className="text-gray-400 text-lg">Manage property listings and approvals</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, idx) => (
                        <Link key={idx} href={stat.href || '#'} className={`group ${stat.href ? 'cursor-pointer' : ''}`}>
                            <div className={`${stat.bgColor} border ${stat.borderColor} rounded-2xl p-6 backdrop-blur-md transition-all duration-300 ${stat.href ? 'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-900/20' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                                        <p className="text-5xl font-bold text-white">{stat.count}</p>
                                    </div>
                                    <div className="p-3 bg-black/20 rounded-xl">
                                        {stat.icon}
                                    </div>
                                </div>
                                {stat.href && (
                                    <div className="text-indigo-400 text-sm font-semibold group-hover:text-indigo-300 transition">
                                        View Details →
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Pending Properties */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Pending Properties</h2>
                    
                    {recentPending && recentPending.length > 0 ? (
                        <div className="space-y-3">
                            {recentPending.map((property) => (
                                <Link
                                    key={property.id}
                                    href="/dashboard/admin/properties-approval"
                                    className="flex items-center justify-between p-4 bg-gray-900/50 border border-white/5 rounded-xl hover:border-indigo-500/30 hover:bg-gray-900/80 transition-all duration-300 group"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white group-hover:text-indigo-400 transition">
                                            {property.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">{property.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                                            PENDING
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(property.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400">🎉 No pending properties! All caught up.</p>
                        </div>
                    )}

                    {(pendingCount || 0) > 5 && (
                        <Link
                            href="/dashboard/admin/properties-approval"
                            className="mt-6 block w-full text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
                        >
                            View All Pending Properties →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
