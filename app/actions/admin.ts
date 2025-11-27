// app/actions/admin.ts

"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper function to update property status
const updatePropertyStatus = async (propertyId: string, newStatus: string) => {
    const supabase = await createClient();
    
    // Check if the user is an Admin (Crucial Security Check!)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    
    // Verify the user is an admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (!profile || profile.role !== 'admin') {
        return { error: "Unauthorized: Admin access required" };
    }

    const { error } = await supabase
        .from('properties')
        .update({ 
            status: newStatus,
            // Only set is_available to true if approved
            is_available: newStatus === 'approved' 
        })
        .eq('id', propertyId);

    if (error) {
        console.error("Database Error:", error);
        return { error: `Failed to update status: ${error.message}` };
    }

    // Revalidate the entire properties page to show the new listing
    revalidatePath('/properties'); 
    revalidatePath('/dashboard/admin/properties-approval');
    revalidatePath('/dashboard/admin'); 
};


export async function approveProperty(propertyId: string) {
    return updatePropertyStatus(propertyId, 'approved');
}

export async function rejectProperty(propertyId: string) {
    return updatePropertyStatus(propertyId, 'rejected');
}