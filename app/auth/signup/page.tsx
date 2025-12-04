import { signup } from './actions'
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden px-4">
      
      {/* 1. Background Effects (Matches Landing Page) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px]" />
      </div>

      {/* 2. Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-4xl mb-2 hover:scale-110 transition-transform duration-300">
            🏠
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">HusseinRent</span>
          </h1>
          <p className="text-indigo-200 mt-2 text-sm">
            Find your perfect room or ideal tenant today.
          </p>
        </div>

        <form className="space-y-5">
          
          {/* Full Name */}
          <div className="group">
            <label className="block text-xs font-medium text-indigo-300 mb-1 uppercase tracking-wider ml-1">Full Name</label>
            <input 
              name="fullName" 
              type="text" 
              required 
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300" 
              placeholder="Ali bin Abu" 
            />
          </div>

          {/* Role Selection */}
          <div className="group">
            <label className="block text-xs font-medium text-indigo-300 mb-1 uppercase tracking-wider ml-1">I am a...</label>
            <div className="relative">
              <select 
                name="role" 
                defaultValue=""
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer" 
                required
              >
                <option value="student" className="bg-gray-900">Student (Looking for a room)</option>
                <option value="landlord" className="bg-gray-900">Landlord (Renting out a room)</option>
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div className="group">
            <label className="block text-xs font-medium text-indigo-300 mb-1 uppercase tracking-wider ml-1">Gender</label>
            <div className="relative">
              <select 
                name="gender" 
                defaultValue=""
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer" 
                required
              >
                <option value="" disabled className="bg-gray-900">Select your gender</option>
                <option value="male" className="bg-gray-900">Male</option>
                <option value="female" className="bg-gray-900">Female</option>
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-indigo-300 mb-1 uppercase tracking-wider ml-1">Phone</label>
              <input 
                name="phone" 
                type="tel" 
                required 
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300" 
                placeholder="012-3456789" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-indigo-300 mb-1 uppercase tracking-wider ml-1">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300" 
                placeholder="student@uthm..." 
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-indigo-300 mb-1 uppercase tracking-wider ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300" 
              placeholder="••••••••" 
            />
          </div>

          {/* Action Button */}
          <button 
            formAction={signup}
            className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Create Account
          </button>
        </form> 

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}