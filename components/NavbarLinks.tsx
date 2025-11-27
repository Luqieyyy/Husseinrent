// src/components/NavbarLinks.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavbarLinksProps {
  userRole: 'student' | 'landlord' | 'admin' | null;
  hasActiveRental: boolean; // <--- Receive the new prop
}

export default function NavbarLinks({ userRole, hasActiveRental }: NavbarLinksProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // State for Landing Page Scroll Spy
  const [activeSection, setActiveSection] = useState('home');

  // Logic Checks
  const isStudentDashboard = pathname?.startsWith('/dashboard/student');
  const isLandlordDashboard = pathname?.startsWith('/dashboard/landlord');
  const isAdminDashboard = pathname?.startsWith('/dashboard/admin');
  const isLandingPage = pathname === '/';
  
  // Get current view for Landlord Tabs
  const currentView = searchParams.get('view') || 'listings';

  // --- 1. LANDING PAGE SCROLL LOGIC ---
  useEffect(() => {
    if (!isLandingPage) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = 150; 

      const contactSection = document.getElementById('contact');
      const aboutSection = document.getElementById('about');

      if (contactSection && scrollY >= contactSection.offsetTop - offset) {
        setActiveSection('contact');
      } else if (aboutSection && scrollY >= aboutSection.offsetTop - offset) {
        setActiveSection('about');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

  // --- SMOOTH SCROLL ---
  const scrollTo = (e: React.MouseEvent, id: string) => {
    if (isLandingPage) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  // --- STYLES ---
  const baseClasses = "relative px-3 py-2 text-sm font-medium transition duration-300 ease-in-out flex items-center h-full border-b-2";
  
  const getClasses = (isActive: boolean) => 
    `${baseClasses} ${isActive 
      ? 'text-indigo-400 border-indigo-400 drop-shadow-md' 
      : 'text-gray-300 border-transparent hover:text-white hover:border-gray-500'}`;

  return (
    <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
      
      {/* 1. SCENARIO: LANDING PAGE */}
      {isLandingPage && (
        <>
          <Link href="/#home" onClick={(e) => scrollTo(e, 'home')} className={getClasses(activeSection === 'home')}>
            Home
          </Link>
          <Link href="/#about" onClick={(e) => scrollTo(e, 'about')} className={getClasses(activeSection === 'about')}>
            About Us
          </Link>
          <Link href="/#contact" onClick={(e) => scrollTo(e, 'contact')} className={getClasses(activeSection === 'contact')}>
            Contact Us
          </Link>
        </>
      )}

      {/* 2. SCENARIO: STUDENT DASHBOARD (Dynamic Text Change) */}
      {isStudentDashboard && (
        <Link href="/dashboard/student" className={getClasses(true)}>
          {/* Change text based on rental status */}
          {hasActiveRental ? '🏠 My Room' : '🔍 Browse Rooms'}
        </Link>
      )}

      {/* 3. SCENARIO: LANDLORD DASHBOARD */}
      {isLandlordDashboard && (
        <>
          <Link href="/dashboard/landlord?view=listings" className={getClasses(currentView === 'listings')}>
            🏠 My Listings
          </Link>
          <Link href="/dashboard/landlord?view=contracts" className={getClasses(currentView === 'contracts')}>
            📄 Contracts
          </Link>
          <Link href="/dashboard/landlord?view=suggestions" className={getClasses(currentView === 'suggestions')}>
            💡 Suggestions
          </Link>
        </>
      )}

      {/* 4. SCENARIO: ADMIN DASHBOARD */}
      {isAdminDashboard && (
        <>
          <Link href="/dashboard/admin" className={getClasses(pathname === '/dashboard/admin')}>
            📊 Overview
          </Link>
          <Link href="/dashboard/admin/properties-approval" className={getClasses(pathname?.includes('properties-approval'))}>
            ✅ Approve Properties
          </Link>
        </>
      )}

      {/* Fallback Buttons (When on Landing Page but logged in) */}
      {isLandingPage && userRole === 'landlord' && (
         <Link href="/dashboard/landlord" className={getClasses(false)}>
            Go to Portal
         </Link>
      )}
      {isLandingPage && userRole === 'student' && (
         <Link href="/dashboard/student" className={getClasses(false)}>
            {hasActiveRental ? 'Go to My Room' : 'Go to Dashboard'}
         </Link>
      )}
      {isLandingPage && userRole === 'admin' && (
         <Link href="/dashboard/admin" className={getClasses(false)}>
            Go to Admin Panel
         </Link>
      )}

    </div>
  );
}