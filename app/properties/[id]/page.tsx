import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, User, CheckCircle, Wifi, Zap, Droplet, Phone, ArrowLeft } from 'lucide-react';
import JoinButton from './join-button';
import { RoomManager } from './room-manager'; 

// --- 1. NEW CAPACITY VISUALIZER COMPONENT ---
// Shows Green circles for occupied spots, Gray for empty.
const CapacityVisualizer = ({ capacity, occupied }: { capacity: number, occupied: number }) => (
  <div className="flex items-center">
    {/* Visual Circles */}
    <div className="flex -space-x-2 mr-3">
      {Array.from({ length: capacity }).map((_, i) => {
        const isOccupied = i < occupied; // Fill circles based on occupied count
        return (
          <div 
            key={i} 
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-md ${
                isOccupied ? "bg-emerald-600 z-10" : "bg-gray-800 z-0"
            }`}
          >
             <User size={14} className={isOccupied ? "text-white" : "text-gray-500"} />
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
        {occupied >= capacity ? "FULL" : `(${occupied}/${capacity})`}
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
    .select('*, rooms(*)')
    .eq('id', params.id)
    .single();

  if (!property) return notFound();

  // 2. CHECK ROLES & FETCH REQUESTS
  const isLandlord = user?.id === property.owner_id;
  let myRequest = null;
  let allRequests: any[] = [];

  // --- DATA FETCHING STRATEGY ---
  if (user) {
      if (isLandlord) {
         // LANDLORD: Fetch Everything (Pending, Approved, Rejected) + Profiles
         // (Using the Manual Join method we built earlier)
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
         // 1. Fetch ALL approved requests (to calculate occupancy for the UI)
         const { data: approvedData } = await supabase
            .from('requests')
            .select('*')
            .eq('property_id', property.id)
            .eq('status', 'approved');
         
         allRequests = approvedData || [];

         // 2. Fetch MY specific request (to show my status button)
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

         {/* Hero Footer: Title & Total House Price */}
         <div className="absolute bottom-0 p-8 w-full bg-gradient-to-t from-gray-950 to-transparent">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-4">
                
                {/* Left: Title & Location */}
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{property.title}</h1>
                    <p className="text-gray-300 flex items-center">
                        <MapPin size={18} className="mr-2 text-red-500"/> {property.location}
                    </p>
                </div>

                {/* Right: Total House Price (From Database) */}
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 p-4 rounded-xl shadow-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                        Total House Rent
                    </p>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-emerald-400 mr-1">
                            RM {property.price_per_month}
                        </span>
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
                        
                        // 1. Calculate Occupancy
                        const occupiedCount = allRequests.filter(r => r.room_id === room.id && r.status === 'approved').length;

                        // 2. Check if Full
                        const isRoomFull = occupiedCount >= room.capacity;

                        // 3. Filter Lists for Landlord Manager
                        const roomRequests = allRequests.filter(r => r.room_id === room.id && r.status === 'pending');
                        const roomTenants = allRequests.filter(r => r.room_id === room.id && r.status === 'approved');

                        return (
                            <div key={room.id} className="relative bg-gray-800/80 border-2 border-gray-700 rounded-2xl p-5 hover:border-indigo-500 transition-all">
                                <div className="flex justify-between items-start">
                                    {/* Room Name & Visualizer */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{room.name}</h3>
                                        
                                        {/* --- NEW VISUALIZER --- */}
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
                                            isFull={isRoomFull} // <--- PASSING THE FULL STATUS HERE
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
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-400"><Wifi className="mr-3 text-indigo-400" /> High-Speed WiFi</div>
                    <div className="flex items-center text-gray-400"><Zap className="mr-3 text-yellow-400" /> Bill Sharing</div>
                    <div className="flex items-center text-gray-400"><Droplet className="mr-3 text-blue-400" /> Water Heater</div>
                    <div className="flex items-center text-gray-400"><CheckCircle className="mr-3 text-green-400" /> Verified Owner</div>
                </div>
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
            
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl sticky top-24">
                <h3 className="font-bold text-white mb-4">Landlord Contact</h3>
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