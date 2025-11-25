// src/app/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from "framer-motion";
import AnimatedLogo from "@/components/AnimatedLogo";

export default async function Index() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const features = [
    {
      icon: "🔐",
      title: "More Secure",
      desc: "We verify every landlord manually. Fake listings are impossible here. Your safety is our code.",
      gradient: "from-indigo-500/10 via-transparent to-purple-500/10",
      borderColor: "border-indigo-500/30",
      bgColor: "bg-indigo-500/20",
      textColor: "group-hover:text-indigo-300",
      barColor: "bg-indigo-500",
      shadowColor: "hover:shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]",
      imageSrc: "/handshake.jpeg"
    },
    {
      icon: "🔗",
      title: "Direct Link",
      desc: "No middlemen. Chat directly with landlords using our encrypted messaging system.",
      gradient: "from-emerald-500/10 via-transparent to-teal-500/10",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/20",
      textColor: "group-hover:text-emerald-300",
      barColor: "bg-emerald-500",
      shadowColor: "hover:shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]",
      imageSrc: "/directlink.jpeg"
    },
    {
      icon: "💰",
      title: "Zero Hidden Fees",
      desc: "The price you see is the price you pay. We force transparency on every contract.",
      gradient: "from-rose-500/10 via-transparent to-orange-500/10",
      borderColor: "border-rose-500/30",
      bgColor: "bg-rose-500/20",
      textColor: "group-hover:text-rose-300",
      barColor: "bg-rose-500",
      shadowColor: "hover:shadow-[0_0_50px_-12px_rgba(244,63,94,0.5)]",
      imageSrc: "/zerohiddenfees.jpeg"
    },
    {
      icon: "🛡️",
      title: "Verified Users",
      desc: "Every user must verify their student or landlord status. We keep the community clean.",
      gradient: "from-blue-200/10 via-transparent to-cyan-200/10",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/20",
      textColor: "group-hover:text-blue-300",
      barColor: "bg-blue-500",
      shadowColor: "hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.5)]",
      imageSrc: "/verifiedusers2.jpeg"
    }
  ];

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(); 

    if (error || !profile) {
      return redirect('/dashboard/student'); 
    }
    if (profile.role === 'landlord') {
      redirect('/dashboard/landlord');
    } else {
      redirect('/dashboard/student');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden font-sans relative scroll-smooth">
       
       <style>{`
        html { scroll-behavior: smooth; }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-infinite-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      {/* ---------------------------------------------------- */}
      {/* Section 1: Hero (ID = home)                          */}
      {/* ---------------------------------------------------- */}
      <section id="home" className="relative h-screen w-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        <Image 
          src="/libraryUTHM.jpeg"
          alt="UTHM Library Background"
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-indigo-950/80 to-purple-900/80 z-10"></div>
        
        <div className="relative z-20 max-w-5xl mx-auto w-full px-4 pt-20">
<div className="relative z-20 max-w-5xl mx-auto w-full px-4 pt-20">
  <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
    
{/* --- ANIMATED LOGO START --- */}
    <AnimatedLogo />
{/* --- ANIMATED LOGO END --- */}

  </div>
</div>
          
          <p className="mt-2 md:mt-4 text-lg md:text-3xl text-indigo-200 font-light max-w-3xl mx-auto animate-fade-in-up delay-200">
            Your direct connection to quality rentals near campus. 
            <strong className="block text-indigo-100 mt-2 text-base md:text-2xl">Find, List, Settle. Effortlessly.</strong>
          </p>

          <main className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 mt-10 md:mt-16 animate-fade-in-up delay-400 justify-center">
            <Link 
              href="/auth/signup"
              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-indigo-500 text-white text-lg md:text-xl font-bold rounded-full shadow-2xl shadow-indigo-500/50 hover:bg-indigo-600 transition duration-500 transform hover:scale-105 active:scale-95 flex items-center justify-center group"
            >
              <span className="text-2xl md:text-3xl mr-3 group-hover:rotate-12 transition-transform duration-300">🔑</span>
              <span>Get Started</span>
            </Link>
            <Link 
              href="/auth/login"
              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-transparent border-2 border-indigo-300 text-indigo-200 text-lg md:text-xl font-bold rounded-full shadow-lg hover:bg-indigo-300 hover:text-gray-900 transition duration-500 transform hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              Already a Member? &rarr;
            </Link>
          </main>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Section 2: INFINITE SCROLL FEATURES                  */}
      {/* ---------------------------------------------------- */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gray-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto text-center mb-12 md:mb-20 px-4">
          <h2 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">HusseinRent?</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            We provide a middle service between the client and user for better user experience.
          </p>
        </div>

        <div className="relative w-full [perspective:2000px] [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex animate-infinite-scroll w-max space-x-6 md:space-x-12 px-4 py-12">
            {[...features, ...features].map((feature, index) => (
              <div 
                key={index} 
                className={`group relative flex-none w-[85vw] md:w-[500px] h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] transition-all duration-500 hover:-translate-y-6 hover:rotate-y-2 bg-[#111] border border-white/10 overflow-hidden ${feature.shadowColor}`}
              >
                {feature.imageSrc && (
                  <>
                    <Image 
                       src={feature.imageSrc}
                       alt={feature.title}
                       fill
                       className="object-cover object-center z-0 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 z-10 transition-colors duration-500 group-hover:bg-black/40"></div>
                  </>
                )}
                <div className={`absolute top-6 right-6 md:top-8 md:right-8 p-2 md:p-3 rounded-2xl ${feature.bgColor} border ${feature.borderColor} backdrop-blur-xl z-20`}>
                    <span className="text-xl md:text-2xl">{feature.icon}</span>
                </div>
                <div className="relative h-full flex flex-col justify-end items-center text-center p-6 md:p-10 z-20">
                  <h3 className={`text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 ${feature.textColor} transition-colors`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-lg text-gray-300 leading-relaxed group-hover:text-white transition-colors line-clamp-3 md:line-clamp-none">
                    {feature.desc}
                  </p>
                  <div className="mt-4 md:mt-8 w-full h-1 bg-gray-600/50 rounded-full overflow-hidden">
                    <div className={`w-1/3 h-full ${feature.barColor} group-hover:w-full transition-all duration-700 ease-out mx-auto`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Section 4: ABOUT US (ID = about)                     */}
      {/* ---------------------------------------------------- */}
      <section id="about" className="relative py-24 px-4 bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            
            {/* Left Column: Image/Visuals */}
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                 <Image 
                   src="/libraryUTHM.jpeg" 
                   alt="UTHM Campus Life" 
                   fill 
                   className="object-cover transition-transform duration-700 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                 <div className="absolute bottom-8 left-8 text-white">
                    <div className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">Our Roots</div>
                    <div className="text-3xl font-bold">Born at UTHM</div>
                 </div>
              </div>
            </div>

            {/* Right Column: Text Content */}
            <div className="w-full md:w-1/2 space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                Redefining Student <span className="text-indigo-500">Living.</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-400">
                <p>
                  HusseinRent isn&apos;t just a platform; it&apos;s a student-first initiative designed to solve the housing crisis at UTHM. We realized that finding a safe, affordable place to stay shouldn&apos;t be the hardest part of your semester.
                </p>
                <p>
                  Our mission is simple: <strong className="text-white">Eliminate the middleman.</strong> We connect verified students directly with trusted landlords, ensuring transparency, security, and zero hidden costs.
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                   <div className="text-3xl font-bold text-indigo-400">500+</div>
                   <div className="text-sm text-gray-500">Active Students</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                   <div className="text-3xl font-bold text-purple-400">100%</div>
                   <div className="text-sm text-gray-500">Verified Listings</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Section 5: CONTACT US (ID = contact)                 */}
      {/* ---------------------------------------------------- */}
      <section id="contact" className="relative py-24 px-4 bg-black text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-900/20 to-transparent pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-400 text-xl">Have questions? We&apos;re here to help you settle in.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/5 p-8 md:p-12 rounded-[2rem] border border-white/10 backdrop-blur-sm">
             
             {/* Contact Info */}
             <div className="space-y-8">
                <div>
                   <h3 className="text-2xl font-bold text-indigo-400 mb-2">Chat with us</h3>
                   <p className="text-gray-400 mb-4">Our friendly team is here to help.</p>
                   <a href="mailto:support@husseinrent.com" className="text-white text-lg font-medium hover:text-indigo-400 transition">support@husseinrent.com</a>
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-indigo-400 mb-2">Visit us</h3>
                   <p className="text-gray-400 mb-4">Come say hello at our office HQ.</p>
                   <p className="text-white text-lg font-medium">UTHM Campus, Parit Raja,<br/>Batu Pahat, Johor.</p>
                </div>
                <div className="flex space-x-4 pt-4">
                   {/* Social Icons Placeholder */}
                   {['twitter', 'github', 'linkedin'].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-500 transition cursor-pointer">
                        <span className="capitalize text-xs">{i[0]}</span>
                     </div>
                   ))}
                </div>
             </div>


             {/* Simple Form Visual */}
             <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">First name</label>
                      <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition text-white" placeholder="Ali" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Last name</label>
                      <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition text-white" placeholder="Bin Abu" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-400">Email</label>
                   <input type="email" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition text-white" placeholder="you@uthm.edu.my" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-400">Message</label>
                   <textarea rows={4} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition text-white" placeholder="How can we help you?"></textarea>
                </div>
                <button type="button" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg transition shadow-lg shadow-indigo-500/20">
                   Send Message
                </button>
             </form>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Section 3: Call to Action                            */}
      {/* ---------------------------------------------------- */}
      <section className="relative bg-black py-24 px-4 overflow-hidden border-t border-white/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight animate-fade-in">
            Are You a Landlord?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in delay-200">
            Reach a wide community of UTHM students. List your property and find ideal tenants today!
          </p>
          <Link 
            href="/dashboard/landlord/create" 
            className="inline-block bg-green-500 text-white text-lg md:text-xl font-bold py-3 md:py-4 px-8 md:px-10 rounded-full shadow-2xl shadow-green-500/40 hover:bg-green-600 transition duration-500 transform hover:scale-105 active:scale-95 animate-fade-in delay-300"
          >
            List Your Property <span className="ml-2">↗</span>
          </Link>
        </div>
      </section>
      {/* ---------------------------------------------------- */}
      {/* Footer                                               */}
      {/* ---------------------------------------------------- */}
      <footer className="bg-gray-950 py-12 px-4 text-center text-gray-400 text-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="mb-4">
            &copy; {new Date().getFullYear()} UTHM Housing Project. All rights reserved.
          </p>
          
          <div className="mb-4 space-y-2">
            <p>Designed with <span className="text-red-500">❤️</span> for the UTHM Community.</p>
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-wide opacity-50 mb-1">Developed by</span>
              <span className="font-bold text-indigo-400">LuqieyyDev</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
              <Link href="#" className="text-gray-400 hover:text-indigo-400 transition duration-200">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-400 transition duration-200">Terms of Service</Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-400 transition duration-200">Contact Us</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}