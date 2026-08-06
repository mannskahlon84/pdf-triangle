import Link from 'next/link';
import { User, Building2, ArrowLeft } from 'lucide-react';

export default function UserTypeSelection({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workspaces
        </Link>
      </div>
      
      <div className="text-center mb-12">
         <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">What type of creator are you?</h1>
         <p className="text-lg text-slate-600">This helps MarketPilot configure the right AI Directors and branding tools for your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Individual */}
        <Link href={`/dashboard/${workspaceId}/campaign-builder/individual`} className="group flex flex-col items-center text-center p-10 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Individual Creator</h2>
            <p className="text-slate-600">Best for influencers, solo entrepreneurs, and individual content creators focused on personal branding.</p>
          </div>
        </Link>

        {/* Business */}
        <Link href={`/dashboard/${workspaceId}/industry`} className="group flex flex-col items-center text-center p-10 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <Building2 className="w-10 h-10 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Business / Agency</h2>
            <p className="text-slate-600">Best for brands, marketing agencies, and companies requiring industry-specific AI models and team tools.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
