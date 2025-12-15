"use client";

import { useState } from "react";
import PropertySwipeDeck from "@/components/PropertySwipeDeck";
import PropertyGrid from "@/components/PropertyGrid";
import PropertiesMap from "@/components/PropertiesMap";
import { MapPin, ArrowDown } from "lucide-react";

interface Property {
    id: number;
    title: string;
    location: string;
    latitude?: number;
    longitude?: number;
    price_per_month: number;
    total_capacity?: number;
    number_of_rooms: number;
    image_url: string | null;
    gender_preference?: string;
    description?: string;
    owner_id?: string;
}

export default function DashboardView({ properties }: { properties: Property[] }) {
    const [view, setView] = useState<'swipe' | 'grid'>('swipe');

    const scrollToMap = () => {
        const mapSection = document.getElementById('properties-map');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="w-full">
            {/* Header Section with Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Find Your Match 🏠
                    </h1>
                    <p className="text-sm sm:text-base text-gray-400 mt-1">
                        {view === 'swipe' ? "Swipe right to save properties you like." : "Browse all available rooms in a grid."}
                    </p>
                </div>

                {/* INTERACTIVE TOGGLE BUTTONS */}
                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button 
                        onClick={() => setView('swipe')}
                        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                            view === 'swipe' 
                            ? "bg-gray-700 text-white shadow-sm" 
                            : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Swipe
                    </button>
                    <button 
                        onClick={() => setView('grid')}
                        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                            view === 'grid' 
                            ? "bg-gray-700 text-white shadow-sm" 
                            : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Grid
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="mt-4 flex justify-center w-full min-h-[400px] sm:min-h-[500px]">
                {properties && properties.length > 0 ? (
                    view === 'swipe' ? (
                        <div className="w-full flex justify-center">
                            <PropertySwipeDeck initialProperties={properties} />
                        </div>
                    ) : (
                        <div className="w-full">
                            <PropertyGrid properties={properties} />
                        </div>
                    )
                ) : (
                    // Empty State
                    <div className="text-center mt-10 sm:mt-20 p-6 sm:p-10 border border-gray-800 rounded-2xl sm:rounded-3xl bg-gray-900/50 backdrop-blur-sm h-fit mx-4">
                        <div className="text-4xl sm:text-6xl mb-4 grayscale opacity-50">🏚️</div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No properties found</h3>
                        <p className="text-sm sm:text-base text-gray-500">We couldn't find any available rooms right now.</p>
                    </div>
                )}
            </div>

            {/* Scroll to Map CTA Button */}
            {properties && properties.length > 0 && (
                <div className="mt-8 mb-4 flex justify-center px-4">
                    <button
                        onClick={scrollToMap}
                        className="group flex items-center gap-3 px-6 py-4 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                    >
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-sm sm:text-base">Tired of scrolling? Check all properties on map</span>
                        <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce" />
                    </button>
                </div>
            )}

            {/* MAP SECTION - Shows all property locations */}
            {properties && properties.length > 0 && (
                <div id="properties-map" className="mt-12 sm:mt-16 mb-20">
                    <PropertiesMap properties={properties} />
                </div>
            )}
        </div>
    );
}