import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import StudentMaintenanceClient from './client-component';

export default async function StudentMaintenancePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }
  
  // Check if student has active rental
  const { data: activeRental } = await supabase
    .from('requests')
    .select('*, properties(*), rooms(*)')
    .eq('student_id', user.id)
    .eq('status', 'approved')
    .single();

  if (!activeRental) {
    redirect('/dashboard/student');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden pt-28 pb-12">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-orange-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Button */}
        <Link 
          href="/dashboard/student"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Room
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <span className="mr-3">🔧</span>
            Maintenance Reports
          </h1>
          <p className="text-gray-400">
            Report and track maintenance issues for {activeRental.properties.title}
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-orange-900/20 border border-orange-500/20 rounded-2xl p-5 flex items-start space-x-4 mb-8">
          <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-orange-300 text-lg">Report Any Issues</h3>
            <p className="text-orange-200/70 mt-1 leading-relaxed">
              Having problems with plumbing, electrical, internet, or anything else? 
              Report it here and your landlord will be notified immediately.
            </p>
          </div>
        </div>

        {/* Maintenance List */}
        <StudentMaintenanceClient 
          propertyId={activeRental.properties.id}
          roomId={activeRental.rooms.id}
          propertyTitle={activeRental.properties.title}
          roomName={activeRental.rooms.name}
        />
      </div>
    </div>
  );
}
