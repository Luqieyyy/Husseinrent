'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Home, DollarSign, Users, Navigation, Maximize2, Minimize2, Filter } from 'lucide-react';
import Link from 'next/link';

interface Property {
    id: number;
    title: string;
    location: string;
    latitude?: number;
    longitude?: number;
    price_per_month: number;
    total_capacity?: number;
    image_url: string | null;
    number_of_rooms: number;
    gender_preference?: string;
}

interface PropertiesMapProps {
    properties: Property[];
}

export default function PropertiesMap({ properties }: PropertiesMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPOIs, setShowPOIs] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter properties that have coordinates
    const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude);

    useEffect(() => {
        // Load Google Maps script only once globally
        const loadGoogleMaps = () => {
            // Check if already loaded
            if (window.google && window.google.maps) {
                setIsLoaded(true);
                return;
            }

            // Check if script tag already exists
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
                // Script is loading, wait for it
                existingScript.addEventListener('load', () => setIsLoaded(true));
                return;
            }

            // Create new script tag with unique ID
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsLoaded(true);
            document.head.appendChild(script);
        };

        loadGoogleMaps();
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapRef.current || propertiesWithCoords.length === 0) return;

        // Initialize map centered on first property or UTHM
        const center = propertiesWithCoords[0] 
            ? { lat: propertiesWithCoords[0].latitude!, lng: propertiesWithCoords[0].longitude! }
            : { lat: 1.8546, lng: 103.0833 }; // UTHM Main Gate

        // Base map styles
        const baseStyles = [
            {
                featureType: "all",
                elementType: "geometry",
                stylers: [{ color: "#242f3e" }]
            },
            {
                featureType: "all",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#242f3e" }]
            },
            {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#746855" }]
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }]
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }]
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }]
            }
        ];

        // Conditional POI styles
        const styles = !showPOIs ? [
            ...baseStyles,
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }]
            }
        ] : [
            ...baseStyles,
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }]
            }
        ];

        const map = new google.maps.Map(mapRef.current, {
            zoom: 13,
            center: center,
            styles: styles,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        googleMapRef.current = map;

        // Create custom info window
        const infoWindow = new google.maps.InfoWindow();
        infoWindowRef.current = infoWindow;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add markers for each property
        propertiesWithCoords.forEach((property) => {
            const marker = new google.maps.Marker({
                position: { lat: property.latitude!, lng: property.longitude! },
                map: map,
                title: property.title,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#6366f1',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                },
                animation: google.maps.Animation.DROP,
            });

            // Create custom info window content
            const contentString = `
                <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
                    ${property.image_url ? `
                        <div style="margin-bottom: 12px; border-radius: 8px; overflow: hidden; height: 140px;">
                            <img src="${property.image_url}" 
                                 alt="${property.title}" 
                                 style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>
                    ` : ''}
                    
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1f2937;">
                        ${property.title}
                    </h3>
                    
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; color: #6b7280; font-size: 13px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>${property.location}</span>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 4px; color: #059669; font-size: 13px; font-weight: 600;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            RM ${property.total_capacity ? (property.price_per_month / property.total_capacity).toFixed(2) : property.price_per_month}/person
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; color: #6b7280; font-size: 13px;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            ${property.number_of_rooms} Rooms
                        </div>
                        ${property.gender_preference ? `
                            <div style="padding: 2px 8px; background: ${
                                property.gender_preference === 'female' ? '#fce7f3' : 
                                property.gender_preference === 'male' ? '#dbeafe' : '#f3f4f6'
                            }; color: ${
                                property.gender_preference === 'female' ? '#be185d' : 
                                property.gender_preference === 'male' ? '#1e40af' : '#374151'
                            }; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: capitalize;">
                                ${property.gender_preference}
                            </div>
                        ` : ''}
                    </div>
                    
                    <a href="/properties/${property.id}" 
                       style="display: block; width: 100%; padding: 8px 16px; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; text-align: center; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s;">
                        View Details →
                    </a>
                </div>
            `;

            marker.addListener('click', () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
        });

        // Adjust bounds to show all markers
        if (propertiesWithCoords.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            propertiesWithCoords.forEach(property => {
                bounds.extend({ lat: property.latitude!, lng: property.longitude! });
            });
            map.fitBounds(bounds);
        }

    }, [isLoaded, propertiesWithCoords, showPOIs]);

    const recenterMap = () => {
        if (googleMapRef.current && propertiesWithCoords.length > 0) {
            if (propertiesWithCoords.length === 1) {
                googleMapRef.current.setCenter({
                    lat: propertiesWithCoords[0].latitude!,
                    lng: propertiesWithCoords[0].longitude!
                });
                googleMapRef.current.setZoom(15);
            } else {
                const bounds = new google.maps.LatLngBounds();
                propertiesWithCoords.forEach(property => {
                    bounds.extend({ lat: property.latitude!, lng: property.longitude! });
                });
                googleMapRef.current.fitBounds(bounds);
            }
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (propertiesWithCoords.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center">
                <MapPin className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Properties with Locations</h3>
                <p className="text-gray-400">Properties will appear on the map once they have coordinates.</p>
            </div>
        );
    }

    return (
        <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
            isFullscreen ? 'fixed top-20 left-4 right-4 bottom-4 z-50' : 'relative'
        }`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <MapPin className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Property Locations</h3>
                        <p className="text-sm text-gray-400">{propertiesWithCoords.length} properties available</p>
                    </div>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={recenterMap}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-gray-300 hover:text-white"
                        title="Recenter Map"
                    >
                        <Navigation className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 border border-white/10 rounded-lg transition-all ${
                            showFilters ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                        }`}
                        title="Map Filters"
                    >
                        <Filter className="h-5 w-5" />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-gray-300 hover:text-white"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>

                    {/* Filter Dropdown */}
                    {showFilters && (
                        <div className="absolute top-12 right-0 bg-gray-900 border border-white/10 rounded-xl p-4 shadow-2xl z-10 min-w-[200px]">
                            <h4 className="text-sm font-bold text-white mb-3">Map Display</h4>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-300">Show POIs</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={showPOIs}
                                        onChange={(e) => setShowPOIs(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Toggle restaurants, hotels, etc.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div 
                ref={mapRef} 
                className={`w-full bg-gray-900 ${
                    isFullscreen ? 'h-[calc(100%-64px)]' : 'h-[500px] sm:h-[600px]'
                }`}
            >
                {!isLoaded && (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading map...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="px-6 py-3 bg-white/5 border-t border-white/10">
                <div className="flex items-center gap-6 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                        <span>Available Properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Click markers for details</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
