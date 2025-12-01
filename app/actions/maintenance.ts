'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type MaintenanceCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'water_supply' 
  | 'internet' 
  | 'appliances' 
  | 'structural' 
  | 'pest_control'
  | 'other';

export type MaintenanceStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

interface CreateMaintenanceRequest {
  propertyId: number;
  roomId?: number;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  title: string;
  description: string;
  imageUrl?: string;
}

export async function createMaintenanceRequest(data: CreateMaintenanceRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { error: 'Profile not found' };
    }

    // Insert maintenance request
    const { data: maintenanceData, error } = await supabase
      .from('maintenance_requests')
      .insert({
        property_id: data.propertyId,
        room_id: data.roomId,
        reporter_id: user.id,
        reporter_type: profile.role,
        category: data.category,
        priority: data.priority,
        title: data.title,
        description: data.description,
        image_url: data.imageUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Maintenance request error:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/landlord');

    return { success: true, data: maintenanceData };
  } catch (error) {
    console.error('Exception:', error);
    return { error: 'Failed to create maintenance request' };
  }
}

export async function updateMaintenanceStatus(
  requestId: number, 
  status: MaintenanceStatus,
  responseNote?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify user is landlord
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'landlord') {
      return { error: 'Unauthorized: Only landlords can update status' };
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (responseNote) {
      updateData.response_note = responseNote;
    }

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('maintenance_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      console.error('Update error:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/landlord');

    return { success: true };
  } catch (error) {
    console.error('Exception:', error);
    return { error: 'Failed to update maintenance request' };
  }
}

export async function getMaintenanceRequests(propertyId?: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    let query = supabase
      .from('maintenance_requests')
      .select(`
        *,
        properties (
          id,
          title,
          location
        ),
        rooms (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch error:', error);
      return { error: error.message };
    }

    // Fetch reporter profiles separately
    if (data && data.length > 0) {
      const reporterIds = [...new Set(data.map(req => req.reporter_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .in('id', reporterIds);

      // Map profiles to requests
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const enrichedData = data.map(req => ({
        ...req,
        profiles: profilesMap.get(req.reporter_id) || {
          full_name: 'Unknown User',
          phone: '',
          email: ''
        }
      }));

      return { success: true, data: enrichedData };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception:', error);
    return { error: 'Failed to fetch maintenance requests' };
  }
}
