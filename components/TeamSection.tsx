"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Member = {
  id: number;
  name: string;
  role: string;
  imageSrc: string;
  tier?: string;
};


export default function TeamSection({
  manager,
  developers,
  members
}: {
  manager: Member[];
  developers: Member[];
  members: Member[];
}) {

  // -----------------------------
  // MemberCard COMPONENT
  // -----------------------------
  const MemberCard = ({
    member,
    isManager = false,
    index
  }: {
    member: Member;
    isManager?: boolean;
    index: number;
  }) => {

    const cardVariants = {
      initial: { opacity: 0, y: 50, rotateX: -10 },
      animate: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.17, 0.67, 0.83, 0.67] as const
        }
      }
    };

    return (
      <motion.div
        className={`group flex flex-col items-center p-4 rounded-3xl transition duration-500 transform 
        border border-white/5 bg-gray-800/50 hover:bg-gray-800/80 cursor-pointer text-center relative overflow-hidden
        ${isManager ? "w-full max-w-sm p-8 shadow-2xl shadow-indigo-500/10" : "w-full p-6 shadow-xl shadow-gray-900/50"}`}
        variants={cardVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.3 } }}
      >
        <span
          className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-bl-xl rounded-tr-3xl 
          ${isManager ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/50" : "bg-white/10 text-gray-300 backdrop-blur-sm"}`}
        >
          {member.role}
        </span>

        <div
          className={`relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full mb-4 shadow-xl 
          ${isManager ? "ring-4 ring-indigo-500/50" : "ring-2 ring-white/10"} 
          group-hover:ring-8 group-hover:ring-indigo-500/50 transition-all duration-500`}
        >
          <Image
            src={member.imageSrc || "/images/default-avatar.jpg"}
            alt={member.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110 rounded-full"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        <h3 className="text-2xl md:text-3xl font-extrabold text-white transition duration-300 group-hover:text-indigo-400 mt-2 tracking-tight">
          {member.name}
        </h3>
      </motion.div>
    );
  };
  // -----------------------------
  // END MemberCard
  // -----------------------------

  return (
    <section className="relative bg-gray-900 py-24 px-4 overflow-hidden border-t border-white/5">

      <div className="absolute inset-0 bg-gray-950 opacity-90"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">

        <motion.div
          className="text-center mb-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tighter">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Core Team</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The dedicated engineers and project leads building the future of UTHM rentals.
          </p>
        </motion.div>

        {/* Management */}
        <div className="mb-20 pt-8 border-t border-indigo-500/30">
          <h3 className="text-center text-2xl font-bold text-indigo-400 mb-10 uppercase tracking-widest">
            🚀 Project Management
          </h3>
          <div className="flex justify-center">
            {manager.map((member, index) => (
              <MemberCard key={member.id} member={member} isManager={true} index={index} />
            ))}
          </div>
        </div>

        {/* Developers */}
        <div className="mb-20 pt-8 border-t border-indigo-500/30">
          <h3 className="text-center text-2xl font-bold text-white mb-10 uppercase tracking-widest">
            💻 Programmer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {developers.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="pt-8 border-t border-indigo-500/30">
          <h3 className="text-center text-2xl font-bold text-white mb-10 uppercase tracking-widest">
            👥 Project Contributors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10 max-w-5xl mx-auto">
            {members.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
