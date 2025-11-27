// src/app/dashboard/landlord/create/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createProperty(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 1. Basic Info
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const totalPrice = parseFloat(formData.get('total_price') as string)
  const imageUrl = formData.get('image_url') as string
  
  // 2. Verification Info
  const whatsapp = formData.get('whatsapp') as string
  const grantNo = formData.get('grant_number') as string
  const electric = formData.get('electricity_bill') as string
  const water = formData.get('water_bill') as string
  const verificationProof = formData.get('verification_proof') as string

  // 3. JSON Data (Rooms & Additional Images)
  const roomsJson = formData.get('rooms_data') as string
  const rooms = JSON.parse(roomsJson)

  // --- NEW: Capture Additional Images ---
  const additionalImagesJson = formData.get('additional_images_data') as string
  const additionalImages = additionalImagesJson ? JSON.parse(additionalImagesJson) : []

  if (!title || !totalPrice || !rooms || rooms.length === 0) {
     return { error: 'Please fill in all fields and add at least one room.' }
  }

  const totalCapacity = rooms.reduce((sum: number, r: any) => sum + r.capacity, 0)

  try {
    // 4. Insert Property
    const { data: propertyData, error: propError } = await supabase
    .from('properties')
    .insert([
      {
        owner_id: user.id,
        title: title,
        description: description,
        location: location,
        price_per_month: totalPrice,
        number_of_rooms: rooms.length,
        image_url: imageUrl,
        gender_preference: 'any',
        is_available: false,
        status: 'pending',
        grant_number: grantNo,
        whatsapp_number: whatsapp,
        electricity_bill_account: electric,
        water_bill_account: water,
        verification_proof: verificationProof,
      }
    ])
    .select()
    .single()

    if (propError) {
      console.error("Property Insert Error:", propError);
      return { error: `Failed to create property: ${propError.message}`, success: false };
    }

    // 5. Insert Rooms
    const roomsToInsert = rooms.map((r: any) => ({
        property_id: propertyData.id,
        name: r.name,
        capacity: r.capacity,
        price_per_pax: (totalPrice / totalCapacity).toFixed(2)
    }))

    const { error: roomError } = await supabase
      .from('rooms')
      .insert(roomsToInsert)

    if (roomError) {
      console.error("Room Insert Error:", roomError);
      return { error: `Failed to create rooms: ${roomError.message}`, success: false };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return { error: error.message || "An unexpected error occurred", success: false };
  }
}