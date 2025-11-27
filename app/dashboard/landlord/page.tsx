import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import LandlordChatWidget from '@/components/LandlordChatWidget';
import { Edit, Eye, MapPin, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// --- SUB-COMPONENTS FOR DIFFERENT VIEWS ---

// 1. Listings View (The Cards)
function ListingsView({ properties }: { properties: any[] }) {
  // Status Colors adapted for Dark Mode
  const statusStyles: any = {
    pending_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'approved': return <CheckCircle size={14} className="mr-1" />;
        case 'rejected': return <AlertCircle size={14} className="mr-1" />;
        case 'pending_review': return <Clock size={14} className="mr-1" />;
        default: return <Clock size={14} className="mr-1" />;
    }
  };

  if (!properties || properties.length === 0) {
    return (
        <div className="text-center border border-dashed border-gray-700 p-20 rounded-3xl mt-8 bg-gray-900/50 backdrop-blur-sm animate-fade-in-up">
            <div className="text-6xl mb-6 opacity-50 grayscale">🏚️</div>
            <p className="text-2xl font-bold text-gray-200 mb-3">No Listings Yet</p>
            <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">Ready to find a tenant? Publish your first property and start receiving applications.</p>
            <Link href="/dashboard/landlord/create" className="inline-flex items-center bg-indigo-600 text-white py-4 px-8 rounded-full font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition duration-300 hover:scale-105">
                <span>+ Start Listing Now</span>
            </Link>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {properties.map((property) => {
        const status = property.status || 'pending';
        
        return (
            <div key={property.id} className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20">
                
                {/* Admin Status Badge - ABSOLUTE TOP RIGHT */}
                <div className={`absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide flex items-center z-10 ${statusStyles[status]}`}>
                    {getStatusIcon(status)}
                    {status === 'pending_review' ? 'Pending Approval' : status}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start">
                    
                    {/* Main Info */}
                    <div className="mb-6 md:mb-0 w-full md:w-2/3 pr-0 md:pr-4">
                        <h2 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
                            {property.title}
                        </h2>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                            <span className="flex items-center bg-gray-800/50 px-3 py-1 rounded-lg border border-white/5">
                                <MapPin size={14} className="mr-2 text-indigo-400" /> 
                                {property.location}
                            </span>
                            <span className="flex items-center bg-gray-800/50 px-3 py-1 rounded-lg border border-white/5 capitalize">
                                <Users size={14} className="mr-2 text-indigo-400" /> 
                                {property.gender_preference || 'Any'}
                            </span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-6">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Monthly Rent</p>
                                <p className="text-3xl font-extrabold text-white mt-1">
                                    <span className="text-base text-gray-500 font-normal mr-1">RM</span>
                                    {property.price_per_month}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Availability</p>
                                <p className="text-xl font-bold text-emerald-400 mt-1">
                                    {property.number_of_rooms} <span className="text-sm text-gray-500 font-normal">Rooms Left</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {/* FIXED: Added 'md:mt-14' to push buttons down below the badge on desktop */}
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-14 relative z-20"> 
                        <Link 
                            href={`/dashboard/landlord/edit/${property.id}`} 
                            className="flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-semibold border border-white/10 transition hover:border-white/20"
                        >
                            <Edit size={16} className="mr-2" /> Edit
                        </Link>
                        
                        <Link 
                            href={`/properties/${property.id}`} 
                            className="flex items-center justify-center px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white rounded-xl font-semibold border border-indigo-500/20 transition"
                        >
                            <Eye size={16} className="mr-2" /> View
                        </Link>
                    </div>
                </div>
            </div>
        )
      })}
    </div>
  );
}

// 2. Contracts View
function ContractsView() {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-3xl text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📄</div>
            <h2 className="text-3xl font-bold text-white mb-2">Rental Contracts</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Manage your digital tenancy agreements securely. Track renewals, signatures, and deposits.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-medium">
                🚧 Feature coming in Update v1.2
            </div>
        </div>
    )
}

// 3. Suggestions View
function SuggestionsView() {
    return (
        <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-gradient-to-br from-indigo-900/40 to-gray-900/40 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <Users size={100} />
                </div>
                <h3 className="text-xl font-bold text-indigo-300 mb-2">📸 Pro Tip: Photography</h3>
                <p className="text-gray-400 leading-relaxed">
                    Listings with <span className="text-white font-semibold">at least 4 high-quality photos</span> receive 
                    <span className="text-emerald-400 font-bold"> 3x more inquiries</span>. 
                    Try to capture natural light during the day.
                </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/40 to-gray-900/40 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <CheckCircle size={100} />
                </div>
                <h3 className="text-xl font-bold text-emerald-300 mb-2">💰 Pricing Strategy</h3>
                <p className="text-gray-400 leading-relaxed">
                    Students prefer <span className="text-white font-semibold">All-Inclusive Rent</span>. 
                    Including WiFi and Utilities in the base price reduces friction and speeds up decision making.
                </p>
            </div>
        </div>
    )
}


// --- MAIN PAGE COMPONENT ---
export default async function LandlordDashboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const currentView = searchParams.view || 'listings';
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-gray-950 text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">🔒 Access Denied</h1>
        <Link href="/auth/login" className="px-6 py-3 bg-gray-800 rounded-full hover:bg-gray-700 transition">Go to Login</Link>
      </div>
    );
  }

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    // DARK THEME WRAPPER
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decor (Blob) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 animate-fade-in-up">
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                    Landlord <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Portal</span>
                </h1>
                <p className="text-lg text-gray-400">
                    {currentView === 'listings' && "Overview of your active real estate portfolio."}
                    {currentView === 'contracts' && "Digital agreements and tenant records."}
                    {currentView === 'suggestions' && "Insights to boost your rental performance."}
                </p>
            </div>
            
            {currentView === 'listings' && (
                <Link
                    href="/dashboard/landlord/create"
                    className="mt-6 md:mt-0 flex items-center bg-indigo-600 text-white px-7 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                    <span className="mr-2 text-xl">+</span> List Property
                </Link>
            )}
        </div>

        {/* CONTENT AREA */}
        <div className="animate-fade-in-up delay-100 min-h-[500px]">
            {currentView === 'listings' && (
                 <>
                    {/* Admin Alert Box (Dark Mode) */}
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-5 flex items-start space-x-4 mb-8">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-300 text-lg">Admin Approval Required</h3>
                            <p className="text-blue-200/70 mt-1 leading-relaxed">
                                To ensure student safety, all new listings must be verified. 
                                Please make sure your <b>utility bills</b> are uploaded clearly for faster approval.
                            </p>
                        </div>
                    </div>
                    <ListingsView properties={properties || []} />
                 </>
            )}

            {currentView === 'contracts' && <ContractsView />}
            {currentView === 'suggestions' && <SuggestionsView />}
        </div>
      </div>

      <LandlordChatWidget />
    </div>
  );
}