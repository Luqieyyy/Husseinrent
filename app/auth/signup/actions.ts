// app/auth/signup/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
    const supabase = createClient() 
    
    // 1. Get all the form data
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    // 🛑 FIX: Use || '' (empty string) as a safe fallback for potentially missing fields
    const fullName = formData.get('fullName') as string || '' 
    const phone = formData.get('phone') as string || ''
    
    // The role should always be present if the form is correctly rendered
    const role = formData.get('role') as string 

    // 2. Create the user in Supabase Auth (The secure login part)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return redirect('/auth/signup?error=' + authError.message)
    }

    // 3. If successful, add their details to your "profiles" table
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id, // Links this profile to the login account
                    full_name: fullName, // Now safely defaults to '' if input is missing
                    role: role,
                    phone: phone, // Now safely defaults to '' if input is missing
                }
            ])

        if (profileError) {
            console.error("Profile Error:", profileError)
            return redirect('/auth/signup?error=Profile creation failed.')
        }
    }

    // 4. Success! Send them to the login page
    revalidatePath('/', 'layout')
    redirect('/auth/login?success=Account created! Please log in.')
}