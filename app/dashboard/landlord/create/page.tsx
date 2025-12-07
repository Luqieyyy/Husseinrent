"use client";

import { createProperty } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Upload, Home, DollarSign, MapPin, FileText, Zap, Droplet, Phone, FileCheck, Plus, Trash2, Users, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

type Room = {
  id: number;
  name: string;
  capacity: number;
};

export default function CreatePropertyPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  
  // Verification Docs
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUrl, setDocUrl] = useState("");

  // Additional Images Gallery
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ROOM LOGIC
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: 'Master Bedroom', capacity: 2 }
  ]);
  const [totalPrice, setTotalPrice] = useState<number>(1500);

  // Calculations
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const pricePerPax = totalCapacity > 0 ? (totalPrice / totalCapacity).toFixed(2) : "0.00";

  const addRoom = () => {
    setRooms([...rooms, { id: Date.now(), name: `Room ${rooms.length + 1}`, capacity: 1 }]);
  };

  const removeRoom = (id: number) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const updateRoom = (id: number, field: 'name' | 'capacity', value: any) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Image Upload Helpers
  const supabase = createClient();
  
  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // 1. Main Cover Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files?.length) return;
      setUploading(true);
      const url = await uploadFile(e.target.files[0]);
      setImageUrl(url);
      setPreview(URL.createObjectURL(e.target.files[0]));
    } catch (error) { alert('Error uploading image'); } finally { setUploading(false); }
  };

  // 2. Additional Gallery Images
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files?.length) return;
      setUploadingGallery(true);
      
      // Loop through all selected files
const newUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadFile(e.target.files[i]);
        newUrls.push(url);
      }
      
      setGalleryUrls((prev) => [...prev, ...newUrls]);
    } catch (error) { 
        alert('Error uploading gallery images'); 
    } finally { 
        setUploadingGallery(false); 
    }
  };

  const removeGalleryImage = (urlToRemove: string) => {
    setGalleryUrls(galleryUrls.filter(url => url !== urlToRemove));
  };

  // 3. Document
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files?.length) return;
      setUploadingDoc(true);
      const url = await uploadFile(e.target.files[0]);
      setDocUrl(url);
    } catch (error) { alert('Error uploading document'); } finally { setUploadingDoc(false); }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createProperty(formData);
      
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else if (result?.success) {
        setSuccess(true);
        // Redirect after short delay
        setTimeout(() => router.push('/dashboard/landlord'), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center md:text-left">
           <Link href="/dashboard/landlord" className="text-gray-500 hover:text-indigo-400 text-sm mb-2 inline-block transition">
              &larr; Back to Dashboard
           </Link>
           <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
             List New Property 🏡
           </h1>
           <p className="text-gray-400 mt-2">Create a detailed listing to attract the best students.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm animate-pulse">
              ✅ Property submitted successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* 1. MAIN COVER IMAGE */}
            <div className="space-y-4">
               <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">Main Cover Photo</label>
               {/* FIXED: Added 'relative' here so the input doesn't cover the whole page */}
               <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${preview ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'}`}>
                  {preview ? (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
                       <Image src={preview} alt="Preview" fill className="object-cover" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300 pointer-events-none">
                          <p className="text-white font-bold">Click to change</p>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center">
                       <Upload className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                       <p className="text-gray-400 font-medium">Click to upload Main Photo</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
               </div>
               <input type="hidden" name="image_url" value={imageUrl} />
               {uploading && <p className="text-indigo-400 text-sm animate-pulse">Uploading...</p>}
            </div>

            <hr className="border-white/10" />

            {/* 2. PRICE & ROOMS */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center"><DollarSign className="mr-2 text-emerald-400"/> Pricing & Rooms</h3>
                
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl">
                    <label className="text-sm font-bold text-emerald-300 mb-2 block">Total House Rent (Per Month)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-emerald-500 font-bold">RM</span>
                        <input 
                            name="total_price" 
                            type="number" 
                            value={totalPrice}
                            onChange={(e) => setTotalPrice(Number(e.target.value))}
                            className="w-full bg-gray-900 border border-emerald-500/30 rounded-xl py-3 pl-12 pr-4 text-white text-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                        <span>Total Capacity: <b className="text-white">{totalCapacity} Pax</b></span>
                        <span>Est. Price Per Student: <b className="text-emerald-400 text-lg">RM {pricePerPax}</b></span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-300 block">Room Configuration</label>
                    {rooms.map((room) => (
                        <div key={room.id} className="flex flex-col md:flex-row gap-4 items-end bg-gray-800/40 p-4 rounded-xl border border-white/5 animate-fade-in">
                            <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500 mb-1 block">Room Name</label>
                                <input type="text" value={room.name} onChange={(e) => updateRoom(room.id, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm" />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="text-xs text-gray-500 mb-1 block">Capacity (Pax)</label>
                                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2">
                                    <Users size={14} className="text-gray-500 mr-2"/>
<input 
    type="number" 
    min="1"
    // 1. Prevent NaN in the value prop itself just in case
    value={room.capacity || ''} 
    
    // 2. Fix the onChange to fallback to 0 if parseInt fails
    onChange={(e) => {
        const val = parseInt(e.target.value);
        updateRoom(room.id, 'capacity', isNaN(val) ? 0 : val);
    }}
    
    className="w-full bg-transparent p-2 text-white text-sm outline-none"
/>                                </div>
                            </div>
                            <button type="button" onClick={() => removeRoom(room.id)} disabled={rooms.length === 1} className="p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addRoom} className="w-full py-3 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition flex items-center justify-center font-medium">
                        <Plus size={18} className="mr-2" /> Add Another Room
                    </button>
                    <input type="hidden" name="rooms_data" value={JSON.stringify(rooms)} />
                </div>
            </div>

            <hr className="border-white/10" />

            {/* 3. BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                  <label className="text-sm font-bold text-gray-300 mb-2 block">Property Title</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-3.5 text-gray-500 h-5 w-5" />
                    <input name="title" type="text" required placeholder="e.g. Modern Double Storey at Parit Raja" className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
               </div>

               <div className="md:col-span-2">
                  <label className="text-sm font-bold text-gray-300 mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-gray-500 h-5 w-5" />
                    <input name="location" type="text" required placeholder="Full address" className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
               </div>

               <div>
                  <label className="text-sm font-bold text-gray-300 mb-2 block">Latitude</label>
                  <input name="latitude" type="number" step="any" required placeholder="e.g. 1.8546" className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <p className="text-xs text-gray-500 mt-1">For nearby location calculations</p>
               </div>

               <div>
                  <label className="text-sm font-bold text-gray-300 mb-2 block">Longitude</label>
                  <input name="longitude" type="number" step="any" required placeholder="e.g. 103.0833" className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <p className="text-xs text-gray-500 mt-1">Use Google Maps to find coordinates</p>
               </div>

               <div className="md:col-span-2">
                  <label className="text-sm font-bold text-gray-300 mb-2 block">Description</label>
                  <textarea name="description" rows={4} required placeholder="Describe amenities..." className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
               </div>

               {/* --- NEW: REFERENCE PHOTOS SECTION --- */}
               <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-300 mb-2 flex items-center">
                        Reference Photos <span className="text-xs text-gray-500 font-normal ml-2">(Kitchen, Toilet, Parking, etc.)</span>
                    </label>
                    
                    {/* Gallery Grid */}
                    {galleryUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {galleryUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-700 group">
                                    <Image src={url} alt={`Gallery ${index}`} fill className="object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeGalleryImage(url)}
                                        className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Gallery Upload Button */}
                    <div className="relative border-2 border-dashed border-gray-700 bg-gray-900/30 hover:bg-gray-800 hover:border-indigo-500 rounded-xl p-6 transition group cursor-pointer text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-500 group-hover:text-indigo-400 mb-2" />
                        <p className="text-sm text-gray-400 group-hover:text-white">
                             {uploadingGallery ? 'Uploading...' : 'Add More Photos'}
                        </p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple // Allow multiple selection
                            onChange={handleGalleryUpload} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingGallery} 
                        />
                    </div>
                    {/* Hidden Input to send array of URLs to server */}
                    <input type="hidden" name="additional_images_data" value={JSON.stringify(galleryUrls)} />
               </div>
               {/* -------------------------------------- */}

               <div>
                  <label className="text-sm font-bold text-gray-300 mb-2 block">WhatsApp Contact</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-500 h-5 w-5" />
                    <input name="whatsapp" type="text" required placeholder="60123456789" className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
               </div>

               <div>
                  <label className="text-sm font-bold text-gray-300 mb-2 block">Gender Preference</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-3.5 text-gray-500 h-5 w-5" />
                    <select 
                      name="gender_preference" 
                      defaultValue="any"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                      required
                    >
                      <option value="any" className="bg-gray-900">Any (Mixed)</option>
                      <option value="male" className="bg-gray-900">Male Only</option>
                      <option value="female" className="bg-gray-900">Female Only</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
               </div>
            </div>

            <hr className="border-white/10" />

            {/* 4. VERIFICATION */}
            <div>
                <h3 className="text-indigo-400 font-bold mb-4 flex items-center"><FileText className="mr-2" /> Admin Verification Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div><label className="text-xs text-gray-500 mb-1 block">Grant No.</label><input name="grant_number" type="text" className="w-full bg-gray-900/30 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white outline-none" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Electricity Acc</label><input name="electricity_bill" type="text" className="w-full bg-gray-900/30 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white outline-none" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Water Acc</label><input name="water_bill" type="text" className="w-full bg-gray-900/30 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white outline-none" /></div>
                </div>

                <div className="bg-gray-900/30 border border-dashed border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="p-3 bg-indigo-500/20 rounded-lg mr-4"><FileCheck className="text-indigo-400 h-6 w-6" /></div>
                        <div><h4 className="text-sm font-bold text-gray-200">Upload Proof Document</h4><p className="text-xs text-gray-500">Utility Bills or Grant (Max 5MB)</p></div>
                    </div>
                    <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold transition ${docUrl ? 'bg-green-600' : 'bg-gray-800'}`}>
                        {uploadingDoc ? 'Uploading...' : docUrl ? 'Attached ✓' : 'Choose File'}
                        <input type="file" accept="image/*,.pdf" onChange={handleDocUpload} className="hidden" disabled={uploadingDoc} />
                    </label>
                    <input type="hidden" name="verification_proof" value={docUrl} />
                </div>
            </div>

            <button type="submit" disabled={uploading || !imageUrl || uploadingDoc || isSubmitting} className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {isSubmitting ? '⏳ Submitting...' : 'Submit Property for Approval 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}