import { logout } from '../actions/auth';
import Link from 'next/link';
import { Sparkles, LogOut, LayoutDashboard, Settings, Video } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex bg-dot-pattern">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed h-full z-10 shadow-sm">
        <div className="p-6">
           <Link href="/dashboard" className="flex items-center gap-2 mb-10 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">MarketPilot</span>
           </Link>

           <nav className="space-y-1">
             <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
               <LayoutDashboard className="w-5 h-5" /> Workspaces
             </Link>
             <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
               <Video className="w-5 h-5" /> Library
             </Link>
             <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
               <Settings className="w-5 h-5" /> Settings
             </Link>
           </nav>
        </div>

        <div className="p-6 border-t border-slate-100">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 border border-indigo-200">
                JD
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">Jane Doe</p>
                <p className="text-slate-500">Pro Creator</p>
              </div>
           </div>
           <form action={logout}>
             <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
               <LogOut className="w-4 h-4" /> Sign out
             </button>
           </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 relative min-h-screen pb-12">
        <header className="md:hidden flex justify-between items-center p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600">MarketPilot</Link>
          <form action={logout}>
             <button className="text-sm font-medium text-slate-600">Sign out</button>
          </form>
        </header>
        
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
