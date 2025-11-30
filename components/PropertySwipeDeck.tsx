// src/components/PropertySwipeDeck.tsx
"use client";

import { useState, useCallback } from "react";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    animate
} from "framer-motion";
import { X, Heart, MapPin, Bed, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Property shape (matches your Supabase table)
interface Property {
    id: number;
    title: string;
    location: string;
    price_per_month: number;
    number_of_rooms?: number;
    image_url: string | null;
}

// Swiping thresholds and animation configs
const SWIPE_THRESHOLD = 120;
const SPRING = { type: "spring", stiffness: 500, damping: 30 };
const SNAP_SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 0.5 };

export default function PropertySwipeDeck({
    initialProperties
}: {
    initialProperties: Property[];
}) {
    const [cards, setCards] = useState<Property[]>(initialProperties);
    const [likedCards, setLikedCards] = useState<Set<number>>(new Set());

    // Motion values for front card
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);

    const heartScale = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1.2]);
    const xScale = useTransform(x, [0, -SWIPE_THRESHOLD], [0, 1.2]);

    // Remove card with animation
    const removeCard = useCallback(
        (id: number, action: "like" | "nope") => {
            const exitX = action === "like" ? 500 : -500;

            // FIXED: animate() replaces x.start()
            animate(x, exitX, { duration: 0.3 }).then(() => {
                setCards(prev => prev.filter(card => card.id !== id));
                x.set(0);
            });

            if (action === "like") {
                setLikedCards(prev => new Set(prev).add(id));
                console.log("Liked:", id);
            } else {
                console.log("Passed:", id);
            }
        },
        [x]
    );

    // Handle drag/swipe release
    const handleDragEnd = useCallback(
        (event: any, info: any) => {
            if (cards.length === 0) return;
            const current = cards[0].id;

            if (info.offset.x > SWIPE_THRESHOLD) {
                removeCard(current, "like");
            } else if (info.offset.x < -SWIPE_THRESHOLD) {
                removeCard(current, "nope");
            } else {
                // FIXED: animate() replaces x.start()
animate(x, 0 as any, SNAP_SPRING as any);
            }
        },
        [cards, removeCard, x]
    );

    // Trigger swipe from button
    const triggerAction = (action: "like" | "nope") => {
        if (cards.length === 0) return;
        x.set(action === "like" ? SWIPE_THRESHOLD + 1 : -(SWIPE_THRESHOLD + 1));
        removeCard(cards[0].id, action);
    };

    // Empty state screen
    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 animate-fade-in">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    You've seen them all!
                </h2>
                <p className="text-gray-400 mb-6">
                    {likedCards.size > 0
                        ? `You liked ${likedCards.size} properties. Check your favorites!`
                        : "Check back later for new listings."}
                </p>

                <button
                    onClick={() => {
                        setCards(initialProperties);
                        setLikedCards(new Set());
                    }}
                    className="px-6 py-3 bg-indigo-600 border border-indigo-500/30 rounded-full text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/30"
                >
                    Reset Deck
                </button>
            </div>
        );
    }

    // Main swipe deck
    return (
        <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col items-center justify-center select-none">
            {/* Counter */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 text-base font-medium text-gray-300 z-50">
                <span>
                    <b className="text-white">{cards.length}</b> properties left
                </span>
                <span>
                    ♥️ <b className="text-pink-400">{likedCards.size}</b> saved
                </span>
            </div>

            {/* Cards */}
            <div className="relative w-full h-full pt-10">
                <AnimatePresence initial={false} mode="popLayout">
                    {cards.slice(0, 3).map((property, index) => {
                        const isFront = index === 0;

                        const scaleFactor = 1 - index * 0.08;
                        const yOffset = index * 12;

                        return (
                            <motion.div
                                key={property.id}
                                layout
                                style={{
                                    zIndex: cards.length - index,
                                    x: isFront ? x : 0,
                                    rotate: isFront ? rotate : 0,
                                    scale: isFront ? 1 : scaleFactor,
                                    y: isFront ? 0 : yOffset
                                }}
                                drag={isFront ? "x" : false}
                                dragConstraints={{
                                    left: -SWIPE_THRESHOLD,
                                    right: SWIPE_THRESHOLD
                                }}
                                dragElastic={0.5}
                                onDragEnd={isFront ? handleDragEnd : undefined}
                                initial={{ scale: 0.9, opacity: 0, y: 50 }}
animate={{
    scale: scaleFactor,
    opacity: 1,
    y: yOffset,
    transition: { ...SPRING, delay: index * 0.05 }
} as any}

                                exit={{
                                    x: x.get() < 0 ? -500 : 500,
                                    opacity: 0,
                                    scale: 0.8,
                                    transition: { duration: 0.3 }
                                }}
                                className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing origin-top"
                            >
                                {/* IMAGE */}
                                <div className="relative h-3/5 w-full bg-gray-800 overflow-hidden">
                                    {/* Swipe Indicators */}
                                    {isFront && (
                                        <>
                                            <motion.div
                                                style={{
                                                    scale: heartScale,
                                                    opacity: heartScale
                                                }}
                                                className="absolute top-6 right-6 z-20 bg-green-500 rounded-xl p-3 shadow-lg transform rotate-[-15deg]"
                                            >
                                                <Heart className="w-8 h-8 text-white fill-white" />
                                            </motion.div>

                                            <motion.div
                                                style={{
                                                    scale: xScale,
                                                    opacity: xScale
                                                }}
                                                className="absolute top-6 left-6 z-20 bg-red-500 rounded-xl p-3 shadow-lg transform rotate-[15deg]"
                                            >
                                                <X className="w-8 h-8 text-white" />
                                            </motion.div>
                                        </>
                                    )}

                                    {property.image_url ? (
                                        <Image
                                            src={property.image_url}
                                            alt={property.title}
                                            fill
                                            className="object-cover pointer-events-none"
                                            sizes="100%"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-900">
                                            <span className="text-5xl mb-2">📸</span>
                                            <span className="text-lg text-gray-400">
                                                Image Not Available
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
                                </div>

                                {/* CONTENT */}
                                <div className="absolute bottom-0 w-full p-6 pb-8">
                                    <h2 className="text-3xl font-extrabold text-white mb-1 line-clamp-1">
                                        {property.title}
                                    </h2>

                                    <div className="flex items-center text-gray-400 mb-4">
                                        <MapPin className="w-4 h-4 mr-1 text-indigo-400" />
                                        <span className="text-sm truncate">
                                            {property.location}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        {property.number_of_rooms !== undefined && (
                                            <div className="flex items-center space-x-2 bg-indigo-600/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-indigo-500/30">
                                                <Bed className="w-5 h-5 text-indigo-400" />
                                                <span className="text-white font-bold text-lg">
                                                    {property.number_of_rooms}
                                                    <span className="text-xs font-normal text-indigo-300 ml-1">
                                                        Rooms
                                                    </span>
                                                </span>
                                            </div>
                                        )}

                                        <div className="text-right">
                                            <span className="text-3xl font-extrabold text-emerald-400 flex items-baseline">
                                                <span className="text-base mr-1 font-semibold">RM</span>
                                                {property.price_per_month}
                                            </span>
                                            <span className="text-xs text-gray-400">/month</span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/properties/${property.id}`}
                                        onPointerDown={e => e.stopPropagation()}
                                        onClick={e =>
                                            isFront ? e.stopPropagation() : e.preventDefault()
                                        }
                                        className="flex items-center justify-center w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white font-semibold transition border border-white/10 hover:border-white/20"
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

            {/* Buttons */}
            <div className="mt-8 flex items-center justify-center space-x-12">
                <button
                    onClick={() => triggerAction("nope")}
                    disabled={cards.length === 0}
                    className="w-20 h-20 bg-gray-800 rounded-full border-4 border-red-500/20 text-red-500 flex items-center justify-center shadow-2xl shadow-red-900/30 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                    <X className="w-10 h-10" />
                </button>

                <button
                    onClick={() => triggerAction("like")}
                    disabled={cards.length === 0}
                    className="w-20 h-20 bg-gray-800 rounded-full border-4 border-green-500/20 text-green-500 flex items-center justify-center shadow-2xl shadow-green-900/30 hover:bg-green-500 hover:text-white hover:border-green-500 hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                    <Heart className="w-10 h-10 fill-current" />
                </button>
            </div>
        </div>
    );
}
