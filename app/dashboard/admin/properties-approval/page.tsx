// app/dashboard/admin/properties/page.tsx

import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import PropertyCard from './property-card';
import { CheckCircle, AlertTriangle } from 'lucide-react'; // Import new icons

export default async function AdminPropertiesPage() {
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

    // --- 2. Fetch Pending Properties ---
    const { data: pendingProperties, error } = await supabase
        .from('properties')
        .select(`
            id, 
            title, 
            location, 
            image_url, 
            price_per_month,
            profiles(full_name, phone) // Fetch Landlord details
        `)
        .eq('status', 'pending'); // Filter by pending status

    if (error) {
        console.error(error);
        return <div className="text-red-500 p-8">Error loading properties.</div>;
    }
    
    // Count the number of properties to review
    const propertyCount = pendingProperties?.length || 0;

    return (
        // Added background/padding to match the overall modern dashboard theme
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden pt-28 pb-16">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-1/3 h-2/3 bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header Section */}
                <div className="mb-10 p-6 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        Property Approval Queue
                    </h1>
                    <p className="text-lg text-gray-400">
                        Total Pending: <span className="text-yellow-400 font-bold">{propertyCount}</span> listing{propertyCount !== 1 ? 's' : ''} awaiting review.
                    </p>
                </div>
                
                {propertyCount > 0 ? (
                    // Modern grid layout
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pendingProperties.map((property: any) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    // Styled empty state
                    <div className="text-center py-24 bg-gray-800/80 rounded-2xl mt-10 border border-dashed border-gray-700 shadow-inner">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h2 className="text-2xl font-semibold text-white">All Clear!</h2>
                        <p className="text-gray-400 mt-2 text-lg">
                            🎉 All properties have been successfully reviewed.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}