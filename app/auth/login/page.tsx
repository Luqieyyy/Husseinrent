import { login } from './actions'
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden px-4">
      
      {/* 1. Background Effects */}
      <div className="absolute inset-0 z-0">
         {/* Different gradient position for Login to distinguish it */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px]" />
      </div>

      {/* 2. Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-4xl mb-2 hover:scale-110 transition-transform duration-300">
             🔐
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Sign in to manage your rentals
          </p>
        </div>

        <form className="space-y-6">
          
          {/* Email */}
          <div className="group">
            <label className="block text-xs font-medium text-indigo-300 mb-1 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
                <input 
                  id="email"
                  name="email" 
                  type="email" 
                  required 
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  placeholder="student@uthm.edu.my"
                />
                {/* Icon inside input */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">📧</span>
                </div>
            </div>
          </div>

          {/* Password */}
          <div className="group">
            <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-xs font-medium text-indigo-300 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
                <input 
                  id="password"
                  name="password" 
                  type="password" 
                  required 
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  placeholder="••••••••"
                />
                 {/* Icon inside input */}
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">🔑</span>
                </div>
            </div>
          </div>

          <button 
            formAction={login}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Sign In
          </button>
          
          <p className="text-center text-sm text-gray-400 mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}