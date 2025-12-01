'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Student Joins
export async function joinRoom(propertyId: number, roomId: number, landlordId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Please login first" }

  // Check One-to-One Rule
  const { data: existing } = await supabase
    .from('requests')
    .select('*')
    .eq('student_id', user.id)
    .in('status', ['pending', 'approved'])
    .single()

  if (existing) {
    return { error: "You already have an active booking. You cannot join two rooms." }
  }

  const { error } = await supabase
    .from('requests')
    .insert({
      student_id: user.id,
      landlord_id: landlordId,
      property_id: propertyId,
      room_id: roomId,
      status: 'pending'
    })

  if (error) return { error: error.message }

  revalidatePath(`/properties/${propertyId}`)
  return { success: true }
}

// 2. Landlord Approves
export async function approveRequest(requestId: number, propertyId: number) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('requests')
        .update({ status: 'approved' })
        .eq('id', requestId)

    if (error) return { error: error.message }

    revalidatePath(`/properties/${propertyId}`)
    return { success: true }
}

// 3. Landlord Rejects
export async function rejectRequest(requestId: number, propertyId: number) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

    if (error) return { error: error.message }

    revalidatePath(`/properties/${propertyId}`)
    return { success: true }
}

// 4. Landlord Removes Tenant (Kick)
export async function removeTenant(requestId: number, propertyId: number) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)

    if (error) return { error: error.message }

    revalidatePath(`/properties/${propertyId}`)
    return { success: true }
}

// --- NEW FUNCTION ---
// 5. Student Leaves Room (End Tenancy)
export async function leaveRoom(requestId: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // Delete the request where ID matches AND student_id matches current user (Security)
    const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)
        .eq('student_id', user.id)

    if (error) return { error: error.message }

    // Revalidate the student dashboard so the "ActiveResidence" disappears
    revalidatePath('/dashboard/student')
    return { success: true }
}

// 6. Update Rental Request Status (for landlord dashboard)
export async function updateRentalRequestStatus(requestId: number, status: 'approved' | 'rejected') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // Verify landlord owns this property
    const { data: request } = await supabase
        .from('requests')
        .select('property_id, properties!inner(owner_id)')
        .eq('id', requestId)
        .single()

    if (!request || (request as any).properties.owner_id !== user.id) {
        return { error: "Unauthorized - not your property" }
    }

    const { error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', requestId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/landlord')
    return { success: true }
}