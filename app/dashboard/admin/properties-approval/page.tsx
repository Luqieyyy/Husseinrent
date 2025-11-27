// app/dashboard/admin/properties/page.tsx

import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import PropertyCard from './property-card';

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
        return <div className="text-red-500">Error loading properties.</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-white">Property Approval Queue ({pendingProperties?.length || 0})</h1>
            
            {pendingProperties && pendingProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProperties.map((property: any) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-800 rounded-xl mt-10 text-gray-400">
                    🎉 All properties are currently reviewed!
                </div>
            )}
        </div>
    );
}