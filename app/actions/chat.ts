'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(conversationId: string, message: string, receiverId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  // Insert message
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: message.trim()
    })

  if (error) return { error: error.message }

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ 
      last_message_at: new Date().toISOString(),
      last_message: message.trim().substring(0, 100)
    })
    .eq('id', conversationId)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getOrCreateConversation(landlordId: string, propertyId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('student_id', user.id)
    .eq('landlord_id', landlordId)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    return { conversation: existing }
  }

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      student_id: user.id,
      landlord_id: landlordId,
      property_id: propertyId
    })
    .select()
    .single()

  if (error) return { error: error.message }

  return { conversation: newConv }
}

export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { conversations: [] }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { conversations: [] }

  let query = supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })

  if (profile.role === 'student') {
    query = query.eq('student_id', user.id)
  } else if (profile.role === 'landlord') {
    query = query.eq('landlord_id', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Get conversations error:', error)
    return { conversations: [] }
  }

  // Enrich with student, landlord, and property info
  const enrichedConversations = await Promise.all(
    (data || []).map(async (conv) => {
      // Get student name
      const { data: student } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', conv.student_id)
        .single()

      // Get landlord name
      const { data: landlord } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', conv.landlord_id)
        .single()

      // Get property title
      const { data: property } = await supabase
        .from('properties')
        .select('title')
        .eq('id', conv.property_id)
        .single()

      return {
        ...conv,
        student_name: student?.full_name || 'Unknown',
        landlord_name: landlord?.full_name || 'Unknown',
        property_title: property?.title || 'Unknown Property'
      }
    })
  )

  return { conversations: enrichedConversations }
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { messages: [] }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Get messages error:', error);
    return { messages: [] }
  }

  // Fetch sender names separately
  const messagesWithNames = await Promise.all(
    (data || []).map(async (msg) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', msg.sender_id)
        .single();
      
      return {
        ...msg,
        sender: { full_name: profile?.full_name || 'Unknown' }
      };
    })
  );

  return { messages: messagesWithNames }
}

export async function markMessagesAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  revalidatePath('/dashboard')
  return { success: true }
}
