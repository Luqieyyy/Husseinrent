// app/actions/admin.ts

"use server";

import { createAdminClient, createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper function to update property status
const updatePropertyStatus = async (propertyId: string, newStatus: string) => {
    console.log(`Updating property ${propertyId} to status ${newStatus}`);
    
    // Get the current user to verify they're an admin
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    
    // Verify the user is an admin
    const { data: profile } = await authClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (!profile || profile.role !== 'admin') {
        return { error: "Unauthorized: Admin access required" };
    }

    // Use admin client for the update operation (bypasses RLS)
    const adminSupabase = createAdminClient();
    
    // Convert propertyId to number if it's a string
    const id = parseInt(propertyId, 10);
    console.log(`Converted ID: ${id}, Type: ${typeof id}`);

    const { error, data } = await adminSupabase
        .from('properties')
        .update({ 
            status: newStatus,
            // Only set is_available to true if approved
            is_available: newStatus === 'approved' 
        })
        .eq('id', id)
        .select();

    if (error) {
        console.error("Database Error:", error);
        console.error("Error Code:", error.code);
        console.error("Error Details:", error.details);
        console.error("Failed to update property:", id, "Error:", error);
        return { error: `Failed to update status: ${error.message}` };
    }

    console.log(`Successfully updated property ${id} to ${newStatus}`);
    console.log("Update response data:", data);
    // Revalidate the entire properties page to show the new listing
    revalidatePath('/properties'); 
    revalidatePath('/dashboard/admin/properties-approval');
    revalidatePath('/dashboard/admin');
    
    return { success: true };
};


export async function approveProperty(propertyId: string) {
    return updatePropertyStatus(propertyId, 'approved');
}

export async function rejectProperty(propertyId: string) {
    return updatePropertyStatus(propertyId, 'rejected');
}