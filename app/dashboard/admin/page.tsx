import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Clock, Home, ArrowRight } from 'lucide-react';

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
            colorClass: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            href: '/dashboard/admin/properties-approval'
        },
        {
            label: 'Approved',
            count: approvedCount || 0,
            icon: <CheckCircle size={24} className="text-emerald-400" />,
            colorClass: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            label: 'Rejected',
            count: rejectedCount || 0,
            icon: <AlertCircle size={24} className="text-red-400" />,
            colorClass: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
        }
    ];

    return (
        // Increased base padding/margin for a cleaner look, kept pt-28 to account for fixed Navbar
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden pt-28 pb-16"> 
            {/* Background Ambience (More diffused and modern) */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-sky-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header Section (Bigger, Bolder) */}
                <div className="mb-14">
                    <div className="flex items-center space-x-3 mb-2">
                        <Home size={36} className="text-indigo-400" /> {/* Larger icon */}
                        <h1 className="text-5xl font-extrabold text-white">Admin Dashboard</h1> {/* Larger title */}
                    </div>
                    <p className="text-gray-400 text-xl font-light pl-11">A quick overview of property management status.</p>
                </div>

                {/* --- Stats Grid (Glassmorphic Cards) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"> {/* Increased gap for breathing room */}
                    {stats.map((stat, idx) => (
                        <Link key={idx} href={stat.href || '#'} className={`group ${stat.href ? 'cursor-pointer' : ''}`}>
                            <div className={`
                                ${stat.bgColor} border ${stat.borderColor} 
                                rounded-3xl p-8 backdrop-blur-md 
                                transition-all duration-500 transform
                                hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-900/40
                                ${stat.href ? 'hover:-translate-y-1' : ''}
                            `}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-gray-300 text-base font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className="text-6xl font-extrabold text-white">{stat.count}</p> {/* Bolder, larger count */}
                                    </div>
                                    <div className={`p-4 rounded-xl ${stat.bgColor.replace('/10', '/30')}`}> {/* Slightly darker background for the icon container */}
                                        {stat.icon}
                                    </div>
                                </div>
                                
                                {stat.href && (
                                    <div className={`flex items-center space-x-2 text-sm font-semibold transition group-hover:text-indigo-300 ${stat.colorClass}`}>
                                        <span>View Details</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> {/* Modern arrow icon */}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* --- Recent Pending Properties Section --- */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl"> {/* Tighter glassmorphic look */}
                    <h2 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Recent Pending Properties</h2> {/* Bolder title, separator line */}
                    
                    {recentPending && recentPending.length > 0 ? (
                        <div className="space-y-4"> {/* Increased space */}
                            {recentPending.map((property) => (
                                <Link
                                    key={property.id}
                                    href="/dashboard/admin/properties-approval"
                                    className="flex items-center justify-between p-5 bg-gray-800/70 border border-white/5 rounded-2xl hover:border-indigo-600/50 hover:bg-gray-800/90 transition-all duration-300 group shadow-md"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="truncate font-semibold text-white group-hover:text-indigo-400 transition text-lg">
                                            {property.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 mt-1 truncate">{property.location}</p>
                                    </div>
                                    
                                    <div className="text-right flex items-center space-x-4 pl-4">
                                        <div className="hidden sm:block">
                                            <p className="text-xs text-gray-500">
                                                Added: {new Date(property.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {/* Status badge - more prominent and modern */}
                                        <span className="inline-block px-4 py-1.5 bg-yellow-500/30 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/50 shadow-inner tracking-widest">
                                            PENDING
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-dashed border-gray-700"> {/* Styled empty state */}
                            <p className="text-gray-400 text-lg">🎉 No pending properties! All caught up.</p>
                        </div>
                    )}

                    {(pendingCount || 0) > 5 && (
                        <Link
                            href="/dashboard/admin/properties-approval"
                            className="mt-8 block w-full text-center py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg rounded-xl transition shadow-lg shadow-indigo-900/30 transform hover:scale-[1.005] active:scale-[0.99]"
                        >
                            View All Pending Properties <ArrowRight size={18} className="inline-block ml-2" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}