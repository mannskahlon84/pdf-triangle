import { customerLogin } from '../actions/auth';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CustomerLogin() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl relative z-10 border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 mt-2 text-sm">Sign in to your workspace</p>
        </div>
        
        <form action={customerLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" 
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" 
            />
          </div>
          
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/25 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-400 rounded-full">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <form action={customerLogin}>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-200 bg-slate-800/50 hover:bg-slate-700 transition-all">
                Google SSO (Mock)
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Platform Administrator? <Link href="/owner-login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Owner Portal</Link>
        </p>
      </div>
    </div>
  );
}
