'use client';

import { useState, useEffect } from 'react';
import { getFavoriteProperties } from '@/app/actions/favorites';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, DollarSign, Bed, Home } from 'lucide-react';

export default function FavoritesPage() {
    const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        const result = await getFavoriteProperties();
        setFavoriteProperties(result.properties || []);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 flex items-center justify-center">
                <div className="text-white text-xl">Loading favorites...</div>
            </div>
        );
    }

    if (favoriteProperties.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                        <Heart className="text-red-500" fill="currentColor" size={28} />
                        <span className="sm:inline">My Favorites</span>
                    </h1>

                    <div className="text-center py-12 sm:py-16 md:py-20 bg-gray-900/50 rounded-2xl sm:rounded-3xl border border-gray-800">
                        <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mx-auto mb-4 sm:mb-6" />
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 px-4">No Favorites Yet</h3>
                        <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                            Start exploring properties and add your favorites to find them here later!
                        </p>
                        <Link
                            href="/dashboard/student"
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl transition"
                        >
                            <Home size={18} className="sm:w-5 sm:h-5" />
                            Browse Properties
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <Heart className="text-red-500 w-7 h-7 sm:w-9 sm:h-9" fill="currentColor" />
                        My Favorites
                    </h1>
                    <div className="px-3 sm:px-4 py-2 bg-gray-800 rounded-lg sm:rounded-xl border border-gray-700">
                        <span className="text-gray-400 text-xs sm:text-sm">Total: </span>
                        <span className="text-white font-bold text-base sm:text-lg">{favoriteProperties.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {favoriteProperties.map((property, index) => (
                        <Link
                            key={property.id}
                            href={`/properties/${property.id}`}
                            className="group"
                            style={{
                                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                            }}
                        >
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20">
                                {/* Image */}
                                <div className="relative h-[250px] overflow-hidden">
                                    <Image
                                        src={property.image_url || '/placeholder.jpg'}
                                        alt={property.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                    
                                    {/* Favorite Badge */}
                                    <div className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                        <Heart size={20} fill="white" className="text-white" />
                                    </div>

                                    {/* Gender Badge */}
                                    {property.gender_preference && property.gender_preference !== 'any' && (
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-purple-600/90 backdrop-blur-md rounded-full text-xs font-bold text-white border border-purple-400/30">
                                            {property.gender_preference === 'male' ? '♂ Male Only' : '♀ Female Only'}
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-600/90 backdrop-blur-md rounded-xl border border-indigo-400/30">
                                        <div className="flex items-center space-x-1">
                                            <DollarSign size={16} className="text-white" />
                                            <span className="text-lg font-bold text-white">RM {property.price_per_month}</span>
                                            <span className="text-xs text-indigo-200">/mo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
                                        {property.title}
                                    </h3>

                                    <div className="flex items-center text-gray-400 text-sm mb-4">
                                        <MapPin size={14} className="mr-1 text-indigo-400" />
                                        <span className="line-clamp-1">{property.location}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                        <div className="flex items-center space-x-1 text-gray-300">
                                            <Bed size={16} className="text-indigo-400" />
                                            <span className="text-sm font-medium">{property.number_of_rooms} Rooms</span>
                                        </div>

                                        <div className="px-4 py-2 bg-gray-700/50 group-hover:bg-indigo-600 rounded-lg font-medium text-sm text-gray-300 group-hover:text-white transition-all duration-300">
                                            View Details →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
