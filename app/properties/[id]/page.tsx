import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, User, CheckCircle, Wifi, Zap, Droplet, Phone, ArrowLeft } from 'lucide-react';
import JoinButton from './join-button';
import { RoomManager } from './room-manager';
import ChatTrigger from './chat-trigger'; 
import { getDistances } from '@/utils/getDistance';
import MapMini from "@/components/MapMini";

// --- 1. NEW CAPACITY VISUALIZER COMPONENT ---
// (If you see BLUE circles, this code is not active yet)
const CapacityVisualizer = ({ capacity, occupied }: { capacity: number, occupied: number }) => (
  <div className="flex items-center">
    {/* Visual Circles */}
    <div className="flex -space-x-2 mr-3">
      {Array.from({ length: capacity }).map((_, i) => {
        const isOccupied = i < occupied; 
        return (
          <div 
            key={i} 
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-md ${
                isOccupied ? "bg-emerald-600 z-10" : "bg-gray-700 z-0"
            }`}
          >
             <User size={14} className={isOccupied ? "text-white" : "text-gray-400"} />
          </div>
        );
      })}
    </div>

    {/* Text Status */}
    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
        occupied >= capacity 
        ? "bg-red-500/20 border-red-500/30 text-red-400" 
        : "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
    }`}>
        {occupied >= capacity ? "FULL" : `(${occupied}/${capacity} Taken)`}
    </span>
  </div>
);

export default async function PropertyDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch Property
  const { data: property } = await supabase
    .from('properties')
    .select('*, rooms(*), profiles!properties_owner_id_fkey(full_name)')
    .eq('id', params.id)
    .single();

  if (!property) return notFound();
// --- GET DISTANCES TO LANDMARKS ---
let distances: any[] = [];

if (property.latitude && property.longitude) {
  try {
    distances = await getDistances(property.latitude, property.longitude);
  } catch (err) {
    console.error("Distance API Error:", err);
  }
}

  const landlordName = property.profiles?.full_name || 'Landlord';


  // Get student's gender if logged in
  let studentGender: string | null = null;
  let genderCompatible = true;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single();
    
    studentGender = profile?.gender || null;
    
    // Check compatibility if property has gender preference
    if (property.gender_preference && property.gender_preference !== 'any' && studentGender) {
      genderCompatible = property.gender_preference === studentGender;
    }
  }

  // 2. CHECK ROLES & FETCH REQUESTS
  const isLandlord = user?.id === property.owner_id;
  let myRequest = null;
  let allRequests: any[] = [];

  // --- DATA FETCHING STRATEGY ---
  if (user) {
      if (isLandlord) {
         // LANDLORD: Fetch Everything
         const { data: rawRequests } = await supabase
            .from('requests')
            .select('*')
            .eq('property_id', property.id);
         
         const studentIds = rawRequests?.map((r) => r.student_id) || [];
         const { data: profiles } = await supabase.from('profiles').select('*').in('id', studentIds);

         allRequests = rawRequests?.map((req) => ({
             ...req,
             profiles: profiles?.find((p) => p.id === req.student_id) || { full_name: "Unknown", phone: "-" }
         })) || [];

      } else {
         // STUDENT: 
         // 1. Fetch APPROVED requests (Visible to public due to Step 1 SQL)
         const { data: approvedData } = await supabase
            .from('requests')
            .select('*')
            .eq('property_id', property.id)
            .eq('status', 'approved');
         
         allRequests = approvedData || [];

         // 2. Fetch MY specific request 
         const { data: myData } = await supabase
            .from('requests')
            .select('*')
            .eq('student_id', user.id)
            .eq('property_id', property.id)
            .single();
         myRequest = myData;
      }
  }

  // Navigation Logic
  let backLink = "/";
  if (isLandlord) backLink = "/dashboard/landlord";
  else if (user) backLink = "/dashboard/student";

  const gallery = property.additional_images || [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
      {/* HERO SECTION */}
      <div className="relative h-[40vh] w-full group">
         {property.image_url ? (
            <Image src={property.image_url} alt="Cover" fill className="object-cover brightness-50 group-hover:brightness-75 transition duration-700" />
         ) : (
            <div className="absolute inset-0 bg-gray-800" />
         )}
         
         {/* Navbar */}
         <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
            <Link href={backLink} className="bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition text-white border border-white/10">
                <ArrowLeft size={20} />
            </Link>
            {isLandlord && (
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 border border-indigo-400">
                    👑 Landlord Mode
                </div>
            )}
         </div>

         {/* Hero Footer */}
         <div className="absolute bottom-0 p-8 w-full bg-gradient-to-t from-gray-950 to-transparent">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold text-white">{property.title}</h1>
                        {property.gender_preference && property.gender_preference !== 'any' && (
                            <span className="px-3 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-purple-400/50">
                                {property.gender_preference === 'male' ? '♂ Male Only' : '♀ Female Only'}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-300 flex items-center">
                        <MapPin size={18} className="mr-2 text-red-500"/> {property.location}
                    </p>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 p-4 rounded-xl shadow-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total House Rent</p>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-emerald-400 mr-1">RM {property.price_per_month}</span>
                        <span className="text-sm text-gray-400">/ month</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
            {/* VISUAL FLOOR PLAN */}
            <div className="bg-gray-900 border-2 border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-black/50">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <span className="mr-2">🗺️</span> {isLandlord ? 'Manage Rooms' : 'Visual House Layout'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {property.rooms.map((room: any) => {
                        
                        // 1. Calculate Occupancy (How many people are APPROVED in this room)
                        const occupiedCount = allRequests.filter(r => r.room_id === room.id && r.status === 'approved').length;

                        // 2. Check if Full
                        const isRoomFull = occupiedCount >= Number(room.capacity);

                        // 3. Filter Lists for Landlord Manager
                        const roomRequests = allRequests.filter(r => r.room_id === room.id && r.status === 'pending');
                        const roomTenants = allRequests.filter(r => r.room_id === room.id && r.status === 'approved');

                        return (
                            <div key={room.id} className="relative bg-gray-800/80 border-2 border-gray-700 rounded-2xl p-5 hover:border-indigo-500 transition-all">
                                <div className="flex justify-between items-start">
                                    {/* Room Name & Visualizer */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{room.name}</h3>
                                        {/* --- THIS SHOWS THE GREEN/GRAY DOTS --- */}
                                        <div className="mt-2 mb-2">
                                            <CapacityVisualizer capacity={room.capacity} occupied={occupiedCount} />
                                        </div>
                                    </div>

                                    {/* Price Section */}
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-emerald-400">
                                            RM {room.price_per_pax * room.capacity}
                                            <span className="text-xs text-gray-500 font-normal ml-1">/ room</span>
                                        </p>
                                        {room.capacity > 1 && (
                                            <p className="text-xs font-semibold text-indigo-300 bg-indigo-900/40 border border-indigo-500/30 px-2 py-1 rounded mt-1 inline-block">
                                                RM {room.price_per_pax} / person
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* --- THE SWITCH: LANDLORD vs STUDENT --- */}
                                {isLandlord ? (
                                    <RoomManager 
                                        roomId={room.id} 
                                        propertyId={property.id}
                                        requests={roomRequests} 
                                        tenants={roomTenants}
                                        capacity={room.capacity}
                                    />
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <JoinButton 
                                            propertyId={property.id} 
                                            roomId={room.id} 
                                            landlordId={property.owner_id}
                                            myRequest={myRequest}
                                            isFull={isRoomFull}
                                            genderCompatible={genderCompatible}
                                            propertyGenderPreference={property.gender_preference}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Description */}
            <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold text-lg text-white mb-2">About this unit</h3>
                <p className="text-gray-400 whitespace-pre-line">{property.description}</p>
                {/* Icons... */}
            </div>
        </div>

        {/* RIGHT COLUMN (Gallery & Contact) */}

        <div className="space-y-6">
            {gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {gallery.map((url: string, i: number) => (
                        <div key={i} className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer border border-gray-800">
                            <Image src={url} alt="Gallery" fill className="object-cover group-hover:scale-110 transition duration-500" />
                        </div>
                    ))}
                </div>
            )}
            
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl sticky top-24 space-y-3">
                <h3 className="font-bold text-white mb-4">Landlord Contact</h3>
 {/* MAP */}
<div className="bg-gray-900/30 border border-gray-700 rounded-2xl p-4 shadow-lg">
  <h2 className="text-lg font-bold text-white mb-3">📍 Property Location</h2>
  <MapMini lat={property.latitude} lng={property.longitude} />
</div>

{/* NEARBY LOCATIONS */}
<div className="bg-gray-900/30 border border-gray-700 rounded-2xl p-4 shadow-lg">
  <h2 className="text-lg font-bold text-white mb-4">📌 Nearby Locations</h2>

  <div className="space-y-3">
    {distances.map((d) => (
      <div 
        key={d.name} 
        className="flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition rounded-xl p-3 border border-gray-700/50"
      >
        <div>
          <p className="text-white font-semibold">{d.name}</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-400 font-bold">{d.distance}</p>
          <p className="text-gray-400 text-sm">{d.duration}</p>
        </div>
      </div>
    ))}
  </div>
</div>
                {/* Chat Button */}
                
                {user && (
                    <ChatTrigger
                        landlordId={property.owner_id}
                        propertyId={property.id}
                        propertyTitle={property.title}
                        landlordName={landlordName}
                        currentUserId={user.id}
                        isLandlord={isLandlord}
                    />
                )}

                {/* WhatsApp Button */}
                <Link 
                    href={`https://wa.me/${property.whatsapp_number}`} 
                    target="_blank"
                    className="flex items-center justify-center w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition transform hover:scale-105"
                >
                    <Phone className="mr-2" size={18} /> WhatsApp
                </Link>
                <p className="text-xs text-center text-gray-500 mt-4">
                    {isLandlord ? "This is how students see your contact info." : "Contact owner for specific questions."}
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}