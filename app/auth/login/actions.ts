'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Get data from the form
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Send to Supabase to check
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/auth/login?error=Could not authenticate user')
  }

  // If successful, refresh and go to home
  revalidatePath('/', 'layout')
  redirect('/')
}