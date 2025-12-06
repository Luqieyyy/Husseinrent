// src/components/DeveloperTeamSection.tsx

'use client'; // 👈 CRITICAL: This line tells Next.js this component runs on the client

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

// --- TYPE DEFINITION (Assuming it was defined elsewhere, or you can use a generic type) ---
type DeveloperMember = {
    id: number;
    name: string;
    role: string;
    imageSrc: string;
    tier: 'manager' | 'developer' | 'member';
};

// --- FRAMER MOTION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: 'easeOut' },
    },
};

// 2. MemberCard Component (Uses motion.div)
const MemberCard = ({ member, isManager = false }: { member: DeveloperMember, isManager?: boolean }) => {
    return (
        <motion.div
            variants={cardVariants}
            className={`group flex flex-col items-center p-4 rounded-xl transition duration-500 transform hover:scale-[1.03] hover:bg-white/5 border border-transparent hover:border-indigo-400/50 cursor-pointer text-center relative
                ${isManager ? 'w-full max-w-xs' : 'w-full'}
            `}
        >
            {/* Role Badge - New floating element */}
            <span className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-xl 
                ${isManager ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300'}`}>
                {member.role}
            </span>

            {/* Profile Picture Container */}
            <div className={`relative w-full aspect-square overflow-hidden rounded-xl mb-4 shadow-2xl 
                ${isManager ? 'p-1 border-4 border-indigo-500 ring-4 ring-indigo-500/30' : 'border-2 border-gray-700/50'} 
            `}>
                <Image
                    src={member.imageSrc || '/images/default-avatar.jpg'}
                    alt={member.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition duration-500 group-hover:opacity-80 rounded-xl"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />
            </div>
            
            {/* Text Info */}
            <h3 className="text-2xl font-bold text-white transition duration-300 group-hover:text-indigo-400 mt-2">
                {member.name}
            </h3>
        </motion.div>
    );
};


// 3. Main Export Component
export default function DeveloperTeamSection({ developerMembers }: { developerMembers: DeveloperMember[] }) {
    // Grouping logic for rendering (Moved from page.tsx)
    const manager = developerMembers.filter(m => m.tier === 'manager');
    const developers = developerMembers.filter(m => m.tier === 'developer');
    const members = developerMembers.filter(m => m.tier === 'member');
    
    return (
        <section className="relative bg-gray-900 py-24 px-4 overflow-hidden border-t border-white/5">
            {/* Background Grid */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(#4a4a4a_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Main Container */}
            <div className="relative z-10 max-w-7xl mx-auto"> 
                
                {/* Header - Now using motion.div for animation on scroll */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={headerVariants}
                    className="text-center mb-16 max-w-4xl mx-auto"
                >
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                        Meet Our Dedicated Team
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        The core engineers and support, structured by role for clarity and focus.
                    </p>
                </motion.div>

                {/* --- 1. MANAGEMENT TIER --- */}
                <div className="mb-16 pt-8 border-t border-indigo-500/30">
                    <h3 className="text-center text-3xl font-bold text-white mb-8">
                        🚀 Project Management
                    </h3>
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.8 }}
                        variants={containerVariants} // Use containerVariants here for a subtle lift/fade
                        className="flex justify-center"
                    >
                        {manager.map((member) => (
                            <MemberCard key={member.id} member={member} isManager={true} /> 
                        ))}
                    </motion.div>
                </div>
                
                {/* --- 2. CORE DEVELOPMENT & PROJECT SUPPORT TIER --- */}
                <div className="mb-16 pt-8 border-t border-indigo-500/30">
                    <h3 className="text-center text-3xl font-bold text-white mb-8">
                        💻 Core Development & Project Support
                    </h3>
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={containerVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 max-w-4xl mx-auto"
                    >
                        {developers.map((member) => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </motion.div>
                </div>

                {/* --- 3. TEAM MEMBERS TIER --- */}
                <div className="pt-8 border-t border-indigo-500/30">
                    <h3 className="text-center text-3xl font-bold text-white mb-8">
                        👥 Team Members
                    </h3>
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={containerVariants}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 max-w-6xl mx-auto"
                    >
                        {members.map((member) => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </motion.div>
                </div>

            </div>
        </section>
    );
}