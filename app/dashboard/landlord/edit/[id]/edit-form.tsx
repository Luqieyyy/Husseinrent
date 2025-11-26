"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Upload, Home, DollarSign, MapPin, FileText, Zap, Droplet, Phone, FileCheck, Plus, Trash2, Users, Image as ImageIcon, X, Save } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";

type Room = {
  id?: number; // Optional because new rooms won't have IDs yet
  name: string;
  capacity: number;
};

export default function EditPropertyForm({ property }: { property: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // --- 1. INITIALIZE STATE WITH EXISTING DATA ---
  // Basic Info
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [location, setLocation] = useState(property.location);
  const [whatsapp, setWhatsapp] = useState(property.whatsapp_number);
  const [gender, setGender] = useState(property.gender_preference);

  // Pricing & Rooms
  const [totalPrice, setTotalPrice] = useState<number>(property.price_per_month);
  const [rooms, setRooms] = useState<Room[]>(property.rooms || []);

  // Verification
  const [grantNo, setGrantNo] = useState(property.grant_number || "");
  const [electric, setElectric] = useState(property.electricity_bill_account || "");
  const [water, setWater] = useState(property.water_bill_account || "");

  // Images (Store URLs directly)
  const [coverImage, setCoverImage] = useState(property.image_url);
  const [gallery, setGallery] = useState<string[]>(property.additional_images || []);
  const [proofDoc, setProofDoc] = useState(property.verification_proof || "");

  // Upload States
  const [uploading, setUploading] = useState(false);

  // --- CALCULATIONS ---
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const pricePerPax = totalCapacity > 0 ? (totalPrice / totalCapacity).toFixed(2) : "0.00";

  // --- HELPER FUNCTIONS ---
  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error } = await supabase.storage.from('property-images').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const url = await uploadFile(e.target.files[0]);
    setCoverImage(url);
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const newUrls = [];
    for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadFile(e.target.files[i]);
        newUrls.push(url);
    }
    setGallery([...gallery, ...newUrls]);
    setUploading(false);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const url = await uploadFile(e.target.files[0]);
    setProofDoc(url);
    setUploading(false);
  };

  // --- ROOM LOGIC ---
  const addRoom = () => setRooms([...rooms, { name: `Room ${rooms.length + 1}`, capacity: 1 }]);
  const removeRoom = (index: number) => setRooms(rooms.filter((_, i) => i !== index));
  const updateRoom = (index: number, field: string, value: any) => {
    const newRooms: any = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };
// --- DELETE FUNCTION (Fixed Cascade) ---
const handleDelete = async () => {
  const confirmed = window.confirm(
    "⚠️ DANGER: Are you sure? This will delete the Property, all Rooms, and all Student Requests associated with it."
  );

  if (!confirmed) return;

  setLoading(true);

  try {
    console.log("Starting deletion for Property ID:", property.id);

    // 1. DELETE REQUESTS FIRST (The most likely blocker)
    const { error: reqError } = await supabase
        .from('requests')
        .delete()
        .eq('property_id', property.id); // Ensure your requests table has property_id, or join via room_id

    if (reqError) {
        console.error("Request Delete Error:", reqError);
        throw new Error("Failed to delete booking requests.");
    }

    // 2. DELETE ROOMS
    const { error: roomError } = await supabase
        .from('rooms')
        .delete()
        .eq('property_id', property.id);

    if (roomError) {
        console.error("Room Delete Error:", roomError);
        throw new Error("Failed to delete rooms.");
    }

    // 3. DELETE PROPERTY
    const { error: propError } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id);

    if (propError) {
        console.error("Property Delete Error:", propError);
        throw new Error("Failed to delete property.");
    }

    // Success
    alert("Property deleted successfully.");
    router.replace('/dashboard/landlord'); // Use replace to prevent back navigation
    router.refresh();

  } catch (error: any) {
    console.error("Full Delete Error:", error);
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
  // --- MAIN UPDATE FUNCTION ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Update Main Property Data
        const { error: propError } = await supabase
            .from('properties')
            .update({
                title,
                description,
                location,
                price_per_month: totalPrice,
                number_of_rooms: rooms.length,
                image_url: coverImage,
                additional_images: gallery,
                gender_preference: gender,
                whatsapp_number: whatsapp,
                grant_number: grantNo,
                electricity_bill_account: electric,
                water_bill_account: water,
                verification_proof: proofDoc,
                status: 'pending' // Reset status to pending on edit for safety
            })
            .eq('id', property.id);

        if (propError) throw propError;

        // 2. Sync Rooms (Strategy: Delete All & Re-Insert)
        // This ensures strict consistency with the UI state
        await supabase.from('rooms').delete().eq('property_id', property.id);
        
        const roomsToInsert = rooms.map(r => ({
            property_id: property.id,
            name: r.name,
            capacity: r.capacity,
            price_per_pax: (totalPrice / totalCapacity).toFixed(2)
        }));

        const { error: roomError } = await supabase.from('rooms').insert(roomsToInsert);
        if (roomError) throw roomError;

        // Success
        router.push('/dashboard/landlord');
        router.refresh();

    } catch (error: any) {
        alert("Update failed: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl space-y-10">
        
        {/* 1. COVER IMAGE */}
        <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">Cover Photo</label>
            <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-dashed border-gray-600 group">
                <Image src={coverImage} alt="Cover" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <Upload className="text-white mb-2" />
                    <p className="text-white font-bold">Change Cover Photo</p>
                </div>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
        </div>

        <hr className="border-white/10" />

        {/* 2. PRICING & ROOMS */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center"><DollarSign className="mr-2 text-emerald-400"/> Pricing & Rooms</h3>
            
            <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl">
                <label className="text-sm font-bold text-emerald-300 mb-2 block">Total House Rent</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-emerald-500 font-bold">RM</span>
                    <input 
                        type="number" 
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(Number(e.target.value))}
                        className="w-full bg-gray-900 border border-emerald-500/30 rounded-xl py-3 pl-12 pr-4 text-white text-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-400">
                    <span>Capacity: <b className="text-white">{totalCapacity} Pax</b></span>
                    <span>Est. Price/Pax: <b className="text-emerald-400 text-lg">RM {pricePerPax}</b></span>
                </div>
            </div>

            <div className="space-y-3">
                {rooms.map((room, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-800/40 p-4 rounded-xl border border-white/5">
                        <div className="flex-1 w-full">
                            <label className="text-xs text-gray-500 mb-1 block">Room Name</label>
                            <input value={room.name} onChange={(e) => updateRoom(index, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm" />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="text-xs text-gray-500 mb-1 block">Capacity</label>
                            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2">
                                <Users size={14} className="text-gray-500 mr-2"/>
                                <input type="number" min="1" value={room.capacity || ''} onChange={(e) => updateRoom(index, 'capacity', parseInt(e.target.value) || 0)} className="w-full bg-transparent p-2 text-white text-sm outline-none" />
                            </div>
                        </div>
                        <button type="button" onClick={() => removeRoom(index)} disabled={rooms.length === 1} className="p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addRoom} className="w-full py-3 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition flex items-center justify-center">
                    <Plus size={18} className="mr-2" /> Add Room
                </button>
            </div>
        </div>

        <hr className="border-white/10" />

        {/* 3. DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-300 mb-2 block">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-300 mb-2 block">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-300 mb-2 block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
            </div>
            
            {/* GALLERY */}
            <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-300 mb-2 block">Gallery</label>
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {gallery.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-700 group">
                            <Image src={url} alt="Gallery" fill className="object-cover" />
                            <button type="button" onClick={() => setGallery(gallery.filter(link => link !== url))} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition">
                        <ImageIcon className="text-gray-500 mb-1" />
                        <span className="text-xs text-gray-400">Add</span>
                        <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                    </label>
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">WhatsApp</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
        </div>

        <hr className="border-white/10" />

        {/* 4. VERIFICATION */}
        <div>
            <h3 className="text-indigo-400 font-bold mb-4 flex items-center"><FileText className="mr-2" /> Verification Details</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <input placeholder="Grant No." value={grantNo} onChange={(e) => setGrantNo(e.target.value)} className="bg-gray-900/30 border border-gray-700 rounded-lg py-2 px-3 text-white text-sm" />
                <input placeholder="Electric Acc" value={electric} onChange={(e) => setElectric(e.target.value)} className="bg-gray-900/30 border border-gray-700 rounded-lg py-2 px-3 text-white text-sm" />
                <input placeholder="Water Acc" value={water} onChange={(e) => setWater(e.target.value)} className="bg-gray-900/30 border border-gray-700 rounded-lg py-2 px-3 text-white text-sm" />
            </div>
            <div className="flex items-center justify-between bg-gray-900/30 border border-dashed border-gray-700 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                    <FileCheck className="text-indigo-400" />
                    <div className="text-sm">
                        <p className="font-bold text-gray-200">Proof Document</p>
                        <Link href={proofDoc} target="_blank" className="text-indigo-400 hover:underline text-xs">View Current File</Link>
                    </div>
                </div>
                <label className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white cursor-pointer transition">
                    Change File
                    <input type="file" onChange={handleDocUpload} className="hidden" />
                </label>
            </div>
        </div>

{/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
            {/* DELETE BUTTON - ADDED THIS */}
            <button 
                type="button" 
                onClick={handleDelete} 
                disabled={loading || uploading}
                className="px-6 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2"
            >
                <Trash2 size={20} />
                <span className="md:hidden">Delete Property</span>
            </button>

            {/* EXISTING CANCEL */}
            <button type="button" onClick={() => router.back()} className="flex-1 py-4 rounded-xl border border-gray-600 text-gray-300 font-bold hover:bg-gray-800 transition">
                Cancel
            </button>

            {/* EXISTING UPDATE */}
            <button type="submit" disabled={loading || uploading} className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 flex justify-center items-center">
                {loading ? "Saving..." : <><Save className="mr-2" /> Update Property</>}
            </button>
        </div>

    </form>
  );
}