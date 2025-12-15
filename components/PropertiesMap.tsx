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

        // Create custom info window with styling to remove white background
        const infoWindow = new google.maps.InfoWindow({
            disableAutoPan: false,
            maxWidth: 320,
        });
        infoWindowRef.current = infoWindow;

        // Add custom CSS to override InfoWindow default styling
        const style = document.createElement('style');
        style.textContent = `
            .gm-style .gm-style-iw-c {
                padding: 0 !important;
                background: transparent !important;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8) !important;
                border-radius: 18px !important;
                overflow: visible !important;
            }
            .gm-style .gm-style-iw-d {
                overflow: visible !important;
                max-height: none !important;
            }
            .gm-style .gm-style-iw-tc {
                display: none !important;
            }
            .gm-style-iw.gm-style-iw-c {
                background: transparent !important;
            }
            .gm-style .gm-style-iw-t::after {
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
                box-shadow: -2px 2px 4px rgba(0,0,0,0.3) !important;
            }
            .gm-ui-hover-effect {
                top: 4px !important;
                right: 4px !important;
                width: 32px !important;
                height: 32px !important;
                background: rgba(239, 68, 68, 0.9) !important;
                border-radius: 50% !important;
                opacity: 1 !important;
            }
            .gm-ui-hover-effect:hover {
                background: rgba(239, 68, 68, 1) !important;
            }
            .gm-ui-hover-effect > span {
                background-color: #ffffff !important;
                width: 16px !important;
                height: 16px !important;
                margin: 8px !important;
            }
        `;
        if (!document.querySelector('#map-infowindow-styles')) {
            style.id = 'map-infowindow-styles';
            document.head.appendChild(style);
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add markers for each property with Airbnb-style price display
        propertiesWithCoords.forEach((property) => {
            // Calculate per-person price
            const pricePerPerson = property.total_capacity 
                ? Math.round(property.price_per_month / property.total_capacity)
                : property.price_per_month;

            // Create custom HTML marker overlay
            const priceTag = document.createElement('div');
            priceTag.style.cssText = `
                background: white;
                color: #1f2937;
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid #1f2937;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            priceTag.innerHTML = `RM ${pricePerPerson}`;
            
            // Add hover effect
            priceTag.addEventListener('mouseenter', () => {
                priceTag.style.transform = 'scale(1.1)';
                priceTag.style.zIndex = '1000';
            });
            priceTag.addEventListener('mouseleave', () => {
                priceTag.style.transform = 'scale(1)';
                priceTag.style.zIndex = '1';
            });

            // Create custom overlay
            class PriceMarker extends google.maps.OverlayView {
                position: google.maps.LatLng;
                div: HTMLElement;

                constructor(position: google.maps.LatLng, div: HTMLElement) {
                    super();
                    this.position = position;
                    this.div = div;
                }

                onAdd() {
                    const panes = this.getPanes();
                    panes?.overlayMouseTarget.appendChild(this.div);
                }

                draw() {
                    const projection = this.getProjection();
                    const point = projection.fromLatLngToDivPixel(this.position);
                    if (point) {
                        this.div.style.position = 'absolute';
                        this.div.style.left = (point.x - this.div.offsetWidth / 2) + 'px';
                        this.div.style.top = (point.y - this.div.offsetHeight / 2) + 'px';
                    }
                }

                onRemove() {
                    if (this.div.parentNode) {
                        this.div.parentNode.removeChild(this.div);
                    }
                }
            }

            const marker = new PriceMarker(
                new google.maps.LatLng(property.latitude!, property.longitude!),
                priceTag
            );
            marker.setMap(map);

            // Create custom info window content with modern dark design
            const contentString = `
                <div style="padding: 16px; max-width: 300px; font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                    ${property.image_url ? `
                        <div style="margin-bottom: 14px; border-radius: 12px; overflow: hidden; height: 160px; border: 2px solid rgba(99, 102, 241, 0.3);">
                            <img src="${property.image_url}" 
                                 alt="${property.title}" 
                                 style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>
                    ` : ''}
                    
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                        ${property.title}
                    </h3>
                    
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #9ca3af; font-size: 13px;">
                        <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span style="color: #d1d5db;">${property.location}</span>
                    </div>
                    
                    <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; font-size: 14px; font-weight: 700; color: #ffffff; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            RM ${property.total_capacity ? (property.price_per_month / property.total_capacity).toFixed(2) : property.price_per_month}/person
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(55, 65, 81, 0.6); border: 1px solid rgba(75, 85, 99, 0.5); border-radius: 8px; font-size: 12px; font-weight: 600; color: #d1d5db;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            ${property.number_of_rooms} Rooms
                        </div>
                        ${property.gender_preference && property.gender_preference !== 'any' ? `
                            <div style="padding: 6px 12px; background: ${
                                property.gender_preference === 'female' ? 'rgba(236, 72, 153, 0.2)' : 
                                property.gender_preference === 'male' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)'
                            }; color: ${
                                property.gender_preference === 'female' ? '#f9a8d4' : 
                                property.gender_preference === 'male' ? '#93c5fd' : '#d1d5db'
                            }; border: 1px solid ${
                                property.gender_preference === 'female' ? 'rgba(236, 72, 153, 0.4)' : 
                                property.gender_preference === 'male' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(107, 114, 128, 0.4)'
                            }; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: capitalize;">
                                ${property.gender_preference === 'male' ? '♂ Male' : property.gender_preference === 'female' ? '♀ Female' : property.gender_preference}
                            </div>
                        ` : ''}
                    </div>
                    
                    <a href="/properties/${property.id}" 
                       style="display: block; width: 100%; padding: 12px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-align: center; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4); border: 2px solid rgba(139, 92, 246, 0.3); transition: all 0.3s;">
                        View Details →
                    </a>
                </div>
            `;

            // Add click event to the price tag element
            priceTag.addEventListener('click', () => {
                infoWindow.setContent(contentString);
                infoWindow.setPosition({ lat: property.latitude!, lng: property.longitude! });
                infoWindow.open(map);
            });

            markersRef.current.push(marker as any);
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
