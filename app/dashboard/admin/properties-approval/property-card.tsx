// app/dashboard/admin/properties/property-card.tsx

"use client";

import { approveProperty, rejectProperty } from '../../../actions/admin';
import { useState } from 'react';
import Image from 'next/image';

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
            <div className="bg-green-600/20 border border-green-500/30 p-4 rounded-xl text-center text-green-400 font-bold">
                Status Updated for {property.title}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg flex flex-col">
            {/* Property Image & Details */}
            <div className="relative h-48 w-full">
                {property.image_url && <Image src={property.image_url} alt={property.title} fill className="object-cover rounded-t-xl" />}
                <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">PENDING</span>
            </div>
            
            <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-white">{property.title}</h3>
                <p className="text-sm text-gray-400">{property.location}</p>
                
                <div className="mt-3 text-xs text-gray-500 border-t border-gray-800 pt-3">
                    Landlord: **{property.profiles?.full_name}** ({property.profiles?.phone})
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex gap-2 border-t border-gray-800">
                <button
                    onClick={() => handleAction(rejectProperty)}
                    disabled={loading}
                    className="flex-1 py-2 bg-red-600/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600 hover:text-white transition"
                >
                    Reject
                </button>
                <button
                    onClick={() => handleAction(approveProperty)}
                    disabled={loading}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition shadow-lg shadow-green-900/20"
                >
                    {loading ? 'Processing...' : 'Approve'}
                </button>
            </div>
        </div>
    );
}