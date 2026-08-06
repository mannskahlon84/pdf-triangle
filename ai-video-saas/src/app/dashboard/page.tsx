import Link from 'next/link';
import { Plus, Briefcase, Video, ArrowRight } from 'lucide-react';

export default function WorkspaceSelection() {
  return (
    <div className="py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">Welcome to MarketPilot</h1>
        <p className="text-lg text-slate-600 max-w-2xl">Select a workspace to enter your Studio, or create a new one to launch your next AI-directed campaign.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing Workspace */}
        <Link href="/dashboard/ws_123/user-type" className="group block h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0 group-hover:bg-indigo-100 transition-colors" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold border border-indigo-100">Business</span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Acme Corp</h2>
            <p className="text-slate-500 text-sm mb-6 flex-1">Industry: Technology • Configured with Hybrid AI Directors</p>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
               <div className="flex items-center gap-4 text-sm text-slate-600">
                 <div className="flex items-center gap-1.5"><Video className="w-4 h-4 text-slate-400" /> 12 Videos</div>
               </div>
               <div className="text-indigo-600 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                 Enter <ArrowRight className="w-4 h-4" />
               </div>
            </div>
          </div>
        </Link>

        {/* Create New Workspace */}
        <button className="group block h-full min-h-[250px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-indigo-300 group-hover:text-indigo-600 transition-all shadow-sm">
            <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-700">Create Workspace</h3>
          <p className="text-slate-500 text-sm">Launch a new brand or campaign</p>
        </button>
      </div>
    </div>
  );
}
