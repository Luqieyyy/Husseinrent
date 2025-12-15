import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import DashboardView from '@/components/DashboardView'; // <--- Import the new component
import ActiveResidence from '@/components/ActiveResidence'; 
import StudentChatWidget from '@/components/StudentChatWidget'; 

interface Property {
  id: number;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price_per_month: number;
  total_capacity?: number;
  number_of_rooms: number;
  image_url: string | null;
  gender_preference?: string;
  description?: string;
  owner_id?: string;
}

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
  let properties: Property[] = [];
  if (!activeRental) {
      const { data } = await supabase
        .from('properties')
        .select('id, title, location, latitude, longitude, price_per_month, number_of_rooms, image_url, gender_preference, description, owner_id, rooms(capacity)')
        .eq('is_available', true)
        .eq('status', 'approved') // <--- ADDED: Only show approved properties
        .neq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      // Calculate total_capacity from rooms
      properties = (data || []).map((prop: any) => {
        const { rooms, ...rest } = prop;
        return {
          ...rest,
          total_capacity: rooms?.reduce((sum: number, room: any) => sum + (room.capacity || 0), 0) || 0
        };
      });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden pt-24 sm:pt-28">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[300px] sm:h-[500px] bg-indigo-900/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        
        {/* LOGIC SWITCH */}
        {activeRental ? (
             <ActiveResidence rental={activeRental} />
        ) : (
             // Replaced all the static toggle code with this single line:
             <DashboardView properties={properties} />
        )}
      </div>

      <StudentChatWidget userId={user.id} />

      {/* Footer */}
      <footer className="bg-gray-950 py-12 px-4 text-center text-gray-400 text-sm border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto">
          <p className="mb-4">
            &copy; {new Date().getFullYear()} UTHM Housing Project. All rights reserved.
          </p>
          
          <div className="mb-4 space-y-2">
            <p>Designed with <span className="text-red-500">❤️</span> for the UTHM Community.</p>
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-wide opacity-50 mb-1">Developed by</span>
              <span className="font-bold text-indigo-400">LuqieyyDev</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}