// src/components/Navbar.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { headers } from "next/headers";
import { signOut } from '../app/auth/signout/action';
import NavbarLinks from './NavbarLinks'; 
import Image from 'next/image'; // <--- 1. Import Image

export default async function Navbar() {
    const supabase = await createClient(); // Ensure await is here
    const { data: { user } } = await supabase.auth.getUser();
    const username = user?.email?.split('@')[0] || 'Guest';

    // Fetch user role
    let userRole: 'student' | 'landlord' | null = null;
    let hasActiveRental = false; // <--- NEW VARIABLE

    if (user) {
        // 1. Get Profile Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (profile) userRole = profile.role as 'student' | 'landlord';

        // 2. CHECK IF ACTIVE TENANT (Only if student) <--- NEW LOGIC
        if (userRole === 'student') {
            const { data: rental } = await supabase
                .from('requests')
                .select('id')
                .eq('student_id', user.id)
                .eq('status', 'approved')
                .single();
            
            if (rental) hasActiveRental = true;
        }
    }

    const h = await headers();
    const currentPath = h.get("x-pathname") || ""; 
    const hideLoginButton = currentPath.startsWith("/auth/login") || currentPath.startsWith("/auth/signup");

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-black/10 backdrop-blur-md border-b border-white/10 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20"> 

                {/* --- LOGO SECTION START --- */}
                    <div className="flex-shrink-0 flex items-center">
                     <Link 
                       href="/" 
                     // UPDATED: increased height to h-16 (was h-12) and width to w-64 (was w-58)
                    className="relative h-20 w-64 transition-opacity hover:opacity-80"
                 >
                  <Image 
                           src="/logo.png"
                         alt="HusseinRent"
                            fill
                        className="object-contain object-left" // Added object-left to keep it aligned to start
                              priority
                          />
                          </Link>
                        </div>
                    {/* --- LOGO SECTION END --- */}

                    {/* Links - PASS THE NEW PROP HERE */}
                    <NavbarLinks userRole={userRole} hasActiveRental={hasActiveRental} />

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-sm font-medium text-gray-300 hidden lg:block">
                                    Hi, <b className="text-indigo-400">{username}</b>
                                </span>
                                <form action={signOut}> 
                                    <button type="submit" className="py-2 px-5 rounded-full text-sm font-semibold text-white bg-red-600/90 hover:bg-red-600 shadow-lg transition transform hover:scale-105">
                                        Log Out
                                    </button>
                                </form>
                            </>
                        ) : (
                            !hideLoginButton && (
                                <Link
                                    href="/auth/login"
                                    className="whitespace-nowrap flex-shrink-0 py-2.5 px-6 rounded-full font-semibold text-white bg-indigo-600/90 hover:bg-indigo-500 shadow-lg shadow-indigo-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}