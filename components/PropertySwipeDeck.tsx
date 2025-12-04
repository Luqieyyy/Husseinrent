'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Heart, MapPin, Users, Home, DollarSign, ChevronLeft, ChevronRight, X, Phone, Mail, Bed } from 'lucide-react';
import { addToFavorites, removeFromFavorites, getFavorites } from '@/app/actions/favorites';
import Link from 'next/link';

interface Property {
    id: number;
    title: string;
    location: string;
    price_per_month: number;
    image_url: string;
    number_of_rooms: number;
    gender_preference?: string;
    description?: string;
    owner_id?: string;
}

interface PropertySwipeDeckProps {
    initialProperties: Property[];
}

export default function PropertySwipeDeck({ initialProperties }: PropertySwipeDeckProps) {
    const properties = initialProperties;
    const [favorites, setFavorites] = useState<number[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    useEffect(() => {
        checkScrollButtons();
    }, [properties]);

    const loadFavorites = async () => {
        const result = await getFavorites();
        if (result.favorites) {
            setFavorites(result.favorites);
        }
    };

    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 10
            );
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 400;
            const newScrollLeft = direction === 'left' 
                ? container.scrollLeft - scrollAmount 
                : container.scrollLeft + scrollAmount;
            
            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });

            setTimeout(checkScrollButtons, 300);
        }
    };

    const toggleFavorite = async (propertyId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (favorites.includes(propertyId)) {
            await removeFromFavorites(propertyId);
            setFavorites(favorites.filter(id => id !== propertyId));
        } else {
            await addToFavorites(propertyId);
            setFavorites([...favorites, propertyId]);
        }
    };

    if (properties.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
                <Home className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Properties Available</h3>
                <p className="text-gray-400">Check back later for new listings!</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative group w-full">
                {/* Scroll Buttons */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition shadow-2xl opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition shadow-2xl opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}

                {/* Horizontal Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    className="flex gap-6 overflow-x-scroll pb-4 px-4"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {properties.map((property, index) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            isFavorite={favorites.includes(property.id)}
                            onToggleFavorite={toggleFavorite}
                            onViewDetails={() => setSelectedProperty(property)}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            {/* Property Detail Modal */}
            {selectedProperty && (
                <PropertyDetailModal
                    property={selectedProperty}
                    isFavorite={favorites.includes(selectedProperty.id)}
                    onClose={() => setSelectedProperty(null)}
                    onToggleFavorite={toggleFavorite}
                />
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                div::-webkit-scrollbar {
                    height: 8px;
                }
                div::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5);
                    border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.5);
                    border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.8);
                }
            `}</style>
        </>
    );
}

// Property Card Component
function PropertyCard({ 
    property, 
    isFavorite, 
    onToggleFavorite, 
    onViewDetails,
    index 
}: { 
    property: Property; 
    isFavorite: boolean; 
    onToggleFavorite: (id: number, e: React.MouseEvent) => void;
    onViewDetails: () => void;
    index: number;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="flex-none w-[350px] group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onViewDetails}
            style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
        >
            <div className={`
                relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-700
                transition-all duration-500 transform
                ${isHovered ? 'scale-105 shadow-2xl shadow-indigo-500/20 border-indigo-500/50 -translate-y-2' : 'shadow-xl'}
            `}>
                {/* Image Container */}
                <div className="relative h-[250px] overflow-hidden">
                    <Image
                        src={property.image_url || '/placeholder.jpg'}
                        alt={property.title}
                        fill
                        className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 brightness-75' : 'scale-100'}`}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-80' : 'opacity-60'}`} />
                    
                    {/* Favorite Button */}
                    <button
                        onClick={(e) => onToggleFavorite(property.id, e)}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-10
                            ${isFavorite 
                                ? 'bg-red-500 text-white scale-110' 
                                : 'bg-gray-900/70 text-gray-300 hover:bg-red-500 hover:text-white hover:scale-110'
                            }`}
                    >
                        <Heart 
                            size={20} 
                            fill={isFavorite ? 'currentColor' : 'none'}
                            className="transition-all duration-300"
                        />
                    </button>

                    {/* Gender Badge */}
                    {property.gender_preference && property.gender_preference !== 'any' && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-purple-600/90 backdrop-blur-md rounded-full text-xs font-bold text-white border border-purple-400/30">
                            {property.gender_preference === 'male' ? '♂ Male Only' : '♀ Female Only'}
                        </div>
                    )}

                    {/* Price Tag */}
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
                    <h3 className={`text-xl font-bold text-white mb-2 transition-colors duration-300 line-clamp-1 ${isHovered ? 'text-indigo-400' : ''}`}>
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

                        <div className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                            isHovered 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-700/50 text-gray-300'
                        }`}>
                            View Details →
                        </div>
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`} style={{
                    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
                }} />
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

// Property Detail Modal Component
function PropertyDetailModal({
    property,
    isFavorite,
    onClose,
    onToggleFavorite
}: {
    property: Property;
    isFavorite: boolean;
    onClose: () => void;
    onToggleFavorite: (id: number, e: React.MouseEvent) => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl animate-scaleIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
                >
                    <X size={20} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image Section */}
                    <div className="relative h-[400px] md:h-full">
                        <Image
                            src={property.image_url || '/placeholder.jpg'}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                        
                        {/* Favorite Button in Modal */}
                        <button
                            onClick={(e) => onToggleFavorite(property.id, e)}
                            className={`absolute top-4 left-4 w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300
                                ${isFavorite 
                                    ? 'bg-red-500 text-white scale-110' 
                                    : 'bg-gray-900/70 text-gray-300 hover:bg-red-500 hover:text-white hover:scale-110'
                                }`}
                        >
                            <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 overflow-y-auto max-h-[600px]">
                        <h2 className="text-3xl font-bold text-white mb-2">{property.title}</h2>
                        
                        <div className="flex items-center text-gray-400 mb-4">
                            <MapPin size={18} className="mr-2 text-indigo-400" />
                            <span>{property.location}</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-6">
                            <div className="px-4 py-2 bg-indigo-600 rounded-xl">
                                <span className="text-2xl font-bold text-white">RM {property.price_per_month}</span>
                                <span className="text-sm text-indigo-200 ml-1">/month</span>
                            </div>
                            {property.gender_preference && property.gender_preference !== 'any' && (
                                <div className="px-4 py-2 bg-purple-600 rounded-xl text-white font-semibold">
                                    {property.gender_preference === 'male' ? '♂ Male Only' : '♀ Female Only'}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                                    <Bed size={18} />
                                    <span className="text-sm font-medium text-gray-400">Rooms</span>
                                </div>
                                <p className="text-xl font-bold text-white">{property.number_of_rooms}</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                <div className="flex items-center space-x-2 text-green-400 mb-1">
                                    <Home size={18} />
                                    <span className="text-sm font-medium text-gray-400">Status</span>
                                </div>
                                <p className="text-xl font-bold text-white">Available</p>
                            </div>
                        </div>

                        {property.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                                <p className="text-gray-300 leading-relaxed">{property.description}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                            <Link
                                href={`/properties/${property.id}`}
                                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center"
                            >
                                View Full Details
                            </Link>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}