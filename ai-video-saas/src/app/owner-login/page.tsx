import { ownerLogin } from '../actions/auth';
import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';

export default function OwnerLogin() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl relative z-10 border border-red-900/30">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20">
               <Shield className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Console</h2>
          <p className="text-slate-400 mt-2 text-sm">Secure Platform Access</p>
        </div>
        
        <form action={ownerLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Admin Email</label>
            <input 
              type="email" 
              placeholder="admin@marketpilot.ai" 
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Master Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner" 
            />
          </div>
          
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900">
            <Lock className="w-4 h-4" /> Authenticate
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          <Link href="/login" className="text-slate-400 hover:text-white font-medium transition-colors">&larr; Return to Customer Login</Link>
        </p>
      </div>
    </div>
  );
}
