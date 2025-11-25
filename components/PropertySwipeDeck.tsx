// src/components/PropertySwipeDeck.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, MapPin, Bed, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// 1. Updated Interface to match your Supabase DB exactly
interface Property {
  id: number;              // DB is int8
  title: string;
  location: string;
  price_per_month: number; // DB column is price_per_month
  number_of_rooms: number;
  image_url: string | null;
}

export default function PropertySwipeDeck({ initialProperties }: { initialProperties: Property[] }) {
  const [cards, setCards] = useState<Property[]>(initialProperties);

  // Motion values for the active card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]); // Rotate card based on X drag
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]); // Fade out on sides
  
  // Background color change indicator
  const heartScale = useTransform(x, [0, 100], [0, 1.2]);
  const xScale = useTransform(x, [0, -100], [0, 1.2]);

  const removeCard = (id: number, action: 'like' | 'nope') => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    x.set(0); // Reset motion value for next card
    
    if (action === 'like') {
      console.log(`User liked property ID: ${id}`);
      // TODO: Call Server Action to save to 'favorites' table
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (cards.length === 0) return;
    
    const threshold = 100; // Distance to trigger swipe
    if (info.offset.x > threshold) {
      removeCard(cards[0].id, 'like');
    } else if (info.offset.x < -threshold) {
      removeCard(cards[0].id, 'nope');
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 animate-fade-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">You've seen them all!</h2>
        <p className="text-gray-400 mb-6">Check back later for new listings.</p>
        <button 
          onClick={() => setCards(initialProperties)} 
          className="px-6 py-3 bg-gray-800 border border-gray-600 rounded-full text-white hover:bg-gray-700 transition"
        >
          Reset Deck
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col items-center justify-center select-none">
      
      {/* CARD STACK AREA */}
      <div className="relative w-full h-full">
        <AnimatePresence>
          {cards.slice(0, 2).map((property, index) => {
            const isFront = index === 0;
            
            return (
              <motion.div
                key={property.id}
                style={{
                  zIndex: cards.length - index,
                  x: isFront ? x : 0, // Only front card moves
                  rotate: isFront ? rotate : 0,
                  opacity: isFront ? 1 : 1 - index * 0.2, // Fade background cards
                  scale: isFront ? 1 : 1 - index * 0.05, // Shrink background cards
                  y: index * 10, // Stack effect visually
                }}
                drag={isFront ? "x" : false} // Only drag front card
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: isFront ? 1 : 0.95, opacity: 1, y: isFront ? 0 : 10 }}
                exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.2 } }}
                className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing origin-bottom"
              >
                {/* IMAGE AREA */}
                <div className="relative h-3/5 w-full bg-gray-700 overflow-hidden">
                  
                  {/* Indicators for Like/Nope overlay */}
                  {isFront && (
                    <>
                      <motion.div style={{ scale: heartScale }} className="absolute top-4 right-4 z-20 bg-green-500 rounded-full p-2 shadow-lg">
                        <Heart className="w-8 h-8 text-white fill-white" />
                      </motion.div>
                      <motion.div style={{ scale: xScale }} className="absolute top-4 left-4 z-20 bg-red-500 rounded-full p-2 shadow-lg">
                        <X className="w-8 h-8 text-white" />
                      </motion.div>
                    </>
                  )}
                  
                  {/* REAL IMAGE RENDERING */}
                  {property.image_url ? (
                     <Image 
                       src={property.image_url} 
                       alt={property.title}
                       fill
                       className="object-cover pointer-events-none"
                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                       priority={isFront}
                     />
                  ) : (
                    // Fallback if no image
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-600 to-gray-800">
                       <span className="text-4xl">🏠</span>
                    </div>
                  )}

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />
                </div>

                {/* CONTENT AREA */}
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent pt-12">
                  <h2 className="text-3xl font-bold text-white mb-1 shadow-black drop-shadow-md line-clamp-1">{property.title}</h2>
                  
                  <div className="flex items-center text-gray-300 mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-indigo-400" />
                    <span className="text-sm truncate">{property.location}</span>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-gray-700">
                        <Bed className="w-4 h-4 text-indigo-400" />
                        <span className="text-white font-bold">{property.number_of_rooms} <span className="text-xs font-normal text-gray-400">Rooms</span></span>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-extrabold text-emerald-400 flex items-center">
                            <span className="text-sm mr-1">RM</span>
                            {/* FIXED: Using correct DB column name */}
                            {property.price_per_month}
                        </span>
                    </div>
                  </div>

                  {/* Detail Button (Prevents drag propagation) */}
                  <Link 
                    href={`/properties/${property.id}`}
                    onPointerDown={(e) => e.stopPropagation()} 
                    className="flex items-center justify-center w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white font-semibold transition border border-white/10"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* CONTROL BUTTONS (Bottom) */}
      <div className="mt-8 flex items-center justify-center space-x-8">
        <button 
            onClick={() => cards.length > 0 && removeCard(cards[0].id, 'nope')}
            className="w-16 h-16 bg-gray-800 rounded-full border border-red-500/30 text-red-500 flex items-center justify-center shadow-lg shadow-red-900/10 hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-200"
        >
            <X className="w-8 h-8" />
        </button>

        <button 
            onClick={() => cards.length > 0 && removeCard(cards[0].id, 'like')}
            className="w-16 h-16 bg-gray-800 rounded-full border border-green-500/30 text-green-500 flex items-center justify-center shadow-lg shadow-green-900/10 hover:bg-green-500 hover:text-white hover:scale-110 transition-all duration-200"
        >
            <Heart className="w-8 h-8 fill-current" />
        </button>
      </div>
    </div>
  );
}