// app/dashboard/admin/properties/property-card.tsx

"use client";

import { approveProperty, rejectProperty } from '../../../actions/admin';
import { useState } from 'react';
import Image from 'next/image';
import { MapPin, DollarSign, User, Activity, XCircle, CheckCircle } from 'lucide-react'; // Import new icons

export default function PropertyCard({ property }: { property: any }) {
    const [loading, setLoading] = useState(false);
    const [reviewed, setReviewed] = useState(false);

    const handleAction = async (action: Function) => {
        setLoading(true);
        const res = await action(property.id);
        if (res?.error) {
            alert(res.error);
        } else {
            setReviewed(true); // Hide the card or show success
        }
        setLoading(false);
    };

    if (reviewed) {
        return (
            <div className="bg-green-600/20 border border-green-500/30 p-6 rounded-2xl text-center text-green-400 font-bold shadow-xl transition-all duration-500 transform scale-95 opacity-0 animate-fade-out">
                <CheckCircle size={32} className="mx-auto mb-2" />
                <p className="text-xl">Approved!</p>
                <p className="text-sm font-normal mt-1">Status Updated for **{property.title}**</p>
            </div>
        );
    }

    // Modern Card Styles
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-900/30">
            
            {/* Property Image & Status Badge */}
            <div className="relative h-56 w-full">
                {property.image_url ? (
                    <Image 
                        src={property.image_url} 
                        alt={property.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">No Image Available</div>
                )}
                <span className="absolute top-4 left-4 bg-yellow-500/90 text-black text-xs font-extrabold px-3 py-1 rounded-full shadow-lg tracking-widest">
                    PENDING REVIEW
                </span>
            </div>
            
            {/* Details Section */}
            <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-white mb-2 truncate">{property.title}</h3>
                
                <div className="flex items-center text-sm text-gray-400 mb-4">
                    <MapPin size={16} className="text-indigo-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-700 pt-4">
                    {/* Price */}
                    <div className="flex items-center space-x-2">
                        <DollarSign size={18} className="text-green-400" />
                        <span className="font-semibold text-white">
                            ${property.price_per_month || 'N/A'}
                        </span>
                        <span className="text-gray-400">/mo</span>
                    </div>

                    {/* Landlord Info */}
                    <div className="flex items-center space-x-2">
                        <User size={18} className="text-sky-400" />
                        <span className="text-gray-400 truncate" title={property.profiles?.full_name}>
                            {property.profiles?.full_name || 'N/A'}
                        </span>
                    </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                    Phone: {property.profiles?.phone || 'N/A'}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 flex gap-4">
                <button
                    onClick={() => handleAction(rejectProperty)}
                    disabled={loading}
                    className="flex-1 py-3 flex items-center justify-center space-x-2 bg-red-600/20 text-red-400 border border-red-500/50 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? <Activity size={20} className="animate-spin" /> : <XCircle size={20} />}
                    <span className="font-semibold">Reject</span>
                </button>
                <button
                    onClick={() => handleAction(approveProperty)}
                    disabled={loading}
                    className="flex-1 py-3 flex items-center justify-center space-x-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-900/30 disabled:opacity-50"
                >
                    {loading ? <Activity size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                    <span className="font-semibold">{loading ? 'Processing...' : 'Approve'}</span>
                </button>
            </div>
        </div>
    );
}