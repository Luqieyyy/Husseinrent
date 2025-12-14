import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertCircle, MapPin, DollarSign, Users, Phone, FileText, Home, Shield } from 'lucide-react';
import ApprovalActions from './approval-actions';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    
    // --- 1. Auth & Role Check ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return notFound();
    }

    // --- 2. Fetch Property Details ---
    const { data: property, error } = await supabase
        .from('properties')
        .select(`
            id,
            title,
            description,
            location,
            latitude,
            longitude,
            price_per_month,
            number_of_rooms,
            image_url,
            status,
            grant_number,
            whatsapp_number,
            electricity_bill_account,
            water_bill_account,
            verification_proof,
            owner_id,
            created_at,
            is_available
        `)
        .eq('id', id)
        .single() as { data: any; error: any };

    if (error) {
        console.error("Property fetch error:", error);
        console.error("Looking for property ID:", id);
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 pt-28 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-400 mb-4">Error Loading Property</h1>
                    <p className="text-gray-400 mb-2">Property ID: {id}</p>
                    <p className="text-gray-400 mb-4">{error.message}</p>
                    <Link href="/dashboard/admin/properties-approval" className="text-indigo-400 hover:text-indigo-300">
                        ← Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    if (!property) {
        console.error("Property not found for ID:", id);
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 pt-28 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-400 mb-4">Property Not Found</h1>
                    <p className="text-gray-400 mb-4">ID: {id}</p>
                    <Link href="/dashboard/admin/properties-approval" className="text-indigo-400 hover:text-indigo-300">
                        ← Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    if (property.status !== 'pending') {
        return notFound();
    }

    // Fetch landlord profile separately
    const { data: landlord } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .eq('id', property.owner_id)
        .single();

    // Fetch rooms separately
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', property.id);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-900/20 blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard/admin/properties-approval" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">
                        ← Back to Pending Properties
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-white">Property Approval Review</h1>
                        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm font-bold">
                            ⏳ PENDING REVIEW
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Property Image */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="relative h-96 w-full">
                                {property.image_url ? (
                                    <Image
                                        src={property.image_url}
                                        alt={property.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Property Basic Info */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-3xl font-bold text-white mb-4">{property.title}</h2>
                            <p className="text-gray-400 text-lg mb-6">{property.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-gray-500 text-sm mb-2">Location</p>
                                    <div className="flex items-start space-x-2">
                                        <MapPin size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
                                        <p className="text-white font-semibold">{property.location}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-2">Monthly Rent</p>
                                    <p className="text-white font-bold text-xl">RM {property.price_per_month}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-2">Total Rooms</p>
                                    <p className="text-white font-bold text-xl">{rooms?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-2">Total Capacity</p>
                                    <p className="text-white font-bold text-xl">{rooms?.reduce((sum: number, r: any) => sum + r.capacity, 0) || 0} persons</p>
                                </div>
                            </div>

                            {/* Coordinates */}
                            {(property.latitude || property.longitude) && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <p className="text-gray-500 text-sm mb-3">GPS Coordinates</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-900/50 border border-white/5 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1">Latitude</p>
                                            <p className="text-white font-mono font-semibold">{property.latitude || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-900/50 border border-white/5 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1">Longitude</p>
                                            <p className="text-white font-mono font-semibold">{property.longitude || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Room Details */}
                        {rooms && rooms.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <Home size={24} className="mr-3 text-indigo-400" />
                                    Room Configuration
                                </h3>
                                <div className="space-y-4">
                                    {rooms.map((room: any, idx: number) => (
                                        <div key={room.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-white/5 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-white">{room.name}</p>
                                                <p className="text-sm text-gray-400">Room {idx + 1}</p>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Capacity</p>
                                                    <p className="text-white font-bold text-lg flex items-center">
                                                        <Users size={16} className="mr-2" /> {room.capacity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Per Pax</p>
                                                    <p className="text-white font-bold text-lg">RM {room.price_per_pax}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Landlord Verification Details */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <Shield size={24} className="mr-3 text-indigo-400" />
                                Landlord Verification
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Landlord Info */}
                                <div className="bg-gray-900/50 border border-white/5 rounded-xl p-6">
                                    <h4 className="text-white font-bold mb-4">Landlord Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">Full Name</p>
                                            <p className="text-white font-semibold">{landlord?.full_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">Email</p>
                                            <p className="text-white font-semibold">{landlord?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">Phone</p>
                                            <p className="text-white font-semibold flex items-center">
                                                <Phone size={16} className="mr-2 text-indigo-400" />
                                                {landlord?.phone || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">WhatsApp Contact</p>
                                            <p className="text-white font-semibold">{property.whatsapp_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Documents */}
                                <div className="bg-gray-900/50 border border-white/5 rounded-xl p-6">
                                    <h4 className="text-white font-bold mb-4">Verification Documents</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText size={20} className="text-indigo-400" />
                                                <div>
                                                    <p className="text-white font-semibold">Grant Number</p>
                                                    <p className="text-gray-400 text-sm">{property.grant_number || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText size={20} className="text-green-400" />
                                                <div>
                                                    <p className="text-white font-semibold">Electricity Bill Account</p>
                                                    <p className="text-gray-400 text-sm">{property.electricity_bill_account || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText size={20} className="text-blue-400" />
                                                <div>
                                                    <p className="text-white font-semibold">Water Bill Account</p>
                                                    <p className="text-gray-400 text-sm">{property.water_bill_account || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Proof Document */}
                                {property.verification_proof && (
                                    <div className="bg-gray-900/50 border border-white/5 rounded-xl p-6">
                                        <h4 className="text-white font-bold mb-4">Proof Document</h4>
                                        <a 
                                            href={property.verification_proof}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition"
                                        >
                                            <FileText size={18} />
                                            <span className="underline">View Document</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Approval Actions */}
                    <div className="lg:col-span-1">
                        <ApprovalActions propertyId={property.id} propertyTitle={property.title} />
                    </div>
                </div>
            </div>
        </div>
    );
}
