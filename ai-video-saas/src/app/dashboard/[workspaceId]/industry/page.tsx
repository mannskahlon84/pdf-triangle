import Link from 'next/link';
import { ArrowLeft, Hotel, Utensils, Home, Users, ShoppingBag, Stethoscope } from 'lucide-react';

export default function IndustrySelection({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;

  const industries = [
    { id: 'hotel', icon: Hotel, name: 'Hotel & Resort', desc: 'Luxury, travel, and hospitality AI models' },
    { id: 'restaurant', icon: Utensils, name: 'Restaurant & Cafe', desc: 'Food styling and local promotion' },
    { id: 'real-estate', icon: Home, name: 'Real Estate', desc: 'Property tours and cinematic staging' },
    { id: 'recruitment', icon: Users, name: 'Recruitment', desc: 'Corporate culture and hiring' },
    { id: 'ecommerce', icon: ShoppingBag, name: 'E-commerce', desc: 'Product highlights and conversion' },
    { id: 'healthcare', icon: Stethoscope, name: 'Healthcare', desc: 'Trust, care, and professional services' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href={`/dashboard/${workspaceId}/user-type`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to User Type
        </Link>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Select Your Industry</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">This tailors the Campaign Builder and primes our Hybrid AI Directors with industry-specific visual knowledge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((ind) => {
          const Icon = ind.icon;
          return (
            <Link key={ind.id} href={`/dashboard/${workspaceId}/campaign-builder/${ind.id}`} className="group flex flex-col p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                <Icon className="w-7 h-7 text-slate-600 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{ind.name}</h3>
              <p className="text-sm text-slate-500">{ind.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
