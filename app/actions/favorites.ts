'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addToFavorites(propertyId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: propertyId });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/student/favorites');
    return { success: true };
}

export async function removeFromFavorites(propertyId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/student/favorites');
    return { success: true };
}

export async function getFavorites() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { favorites: [] };
    }

    const { data: favorites, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

    if (error) {
        return { favorites: [] };
    }

    return { favorites: favorites.map(f => f.property_id) };
}

export async function getFavoriteProperties() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { properties: [] };
    }

    // Get favorite property IDs
    const { data: favorites } = await supabase
        .from('favorites')
        .select('property_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (!favorites || favorites.length === 0) {
        return { properties: [] };
    }

    const propertyIds = favorites.map(f => f.property_id);

    // Get full property details
    const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds)
        .eq('status', 'approved')
        .eq('is_available', true);

    if (error) {
        return { properties: [] };
    }

    return { properties: properties || [] };
}
