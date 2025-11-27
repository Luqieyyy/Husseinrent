import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import DashboardView from '@/components/DashboardView'; // <--- Import the new component
import ActiveResidence from '@/components/ActiveResidence'; 
import ChatWidget from '@/components/Chat/ChatWidget'; 

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
          <Link href="/auth/login" className="text-indigo-400">Please Login</Link>
      </div>
    )
  }
  
  // 2. CHECK IF STUDENT IS ALREADY RENTING
  const { data: activeRental } = await supabase
    .from('requests')
    .select('*, properties(*), rooms(*)')
    .eq('student_id', user.id)
    .eq('status', 'approved')
    .single();

  // 3. Fetch properties (Only if NOT renting)
  let properties = [];
  if (!activeRental) {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('is_available', true)
        .eq('status', 'approved') // <--- ADDED: Only show approved properties
        .neq('owner_id', user.id)
        .order('created_at', { ascending: false });
      properties = data || [];
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden pt-28">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* LOGIC SWITCH */}
        {activeRental ? (
             <ActiveResidence rental={activeRental} />
        ) : (
             // Replaced all the static toggle code with this single line:
             <DashboardView properties={properties} />
        )}
      </div>

      <ChatWidget currentUserId={user.id} />
    </div>
  );
}