'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Sparkles, Wand2, Settings2, FileVideo } from 'lucide-react';

export default function CampaignBuilder({ params }: { params: { workspaceId: string, type: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/marketpilot/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: params.workspaceId,
          type: params.type
        })
      });
      
      const data = await res.json();
      if (data.jobId) {
        router.push(`/dashboard/${params.workspaceId}/studio/${data.campaignId}?jobId=${data.jobId}`);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize mb-2">{params.type} Campaign Wizard</h1>
        <p className="text-slate-500">Configure your parameters. Our AI Directors will construct the narrative.</p>
      </div>

      <div className="flex gap-4 mb-8">
         <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'} transition-colors`} />
         <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'} transition-colors`} />
         <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'} transition-colors`} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full -z-0 opacity-50" />
        
        <div className="relative z-10">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Settings2 className="w-5 h-5 text-indigo-600"/> Campaign Details</h2>
              
              {params.type === 'hotel' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Hotel Name</label>
                    <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="e.g. The Grand Resort" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Location</label>
                    <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="e.g. Bali, Indonesia" />
                  </div>
                </div>
              )}
              
              <div className="pt-6">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">Continue to Assets</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><FileVideo className="w-5 h-5 text-indigo-600"/> Upload Raw Assets</h2>
              
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                 <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-indigo-300 transition-all shadow-sm">
                   <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                 </div>
                 <h3 className="text-lg font-semibold text-slate-900 mb-1">Drag and drop files</h3>
                 <p className="text-sm text-slate-500 mb-4">MP4, MOV, JPG, PNG up to 500MB</p>
                 <button type="button" className="text-indigo-600 text-sm font-medium bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">Browse Files</button>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">Back</button>
                <button type="button" onClick={() => setStep(3)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">Continue to AI Setup</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Wand2 className="w-5 h-5 text-indigo-600"/> AI Generation Settings</h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Visual Style Director</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <label className="border border-indigo-200 bg-indigo-50/50 p-4 rounded-xl cursor-pointer relative">
                       <input type="radio" name="style" className="absolute top-4 right-4" defaultChecked />
                       <span className="block font-bold text-indigo-900 mb-1">Cinematic AI</span>
                       <span className="block text-sm text-indigo-700/70">Premium grading, slow pans, dramatic cuts.</span>
                     </label>
                     <label className="border border-slate-200 bg-white p-4 rounded-xl cursor-pointer relative hover:border-slate-300">
                       <input type="radio" name="style" className="absolute top-4 right-4" />
                       <span className="block font-bold text-slate-900 mb-1">Hybrid AI (Standard)</span>
                       <span className="block text-sm text-slate-500">Fast-paced, vibrant, social-media ready.</span>
                     </label>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4 border-t border-slate-100">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">Back</button>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="flex-1 flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all focus:outline-none disabled:bg-indigo-400"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse flex items-center gap-2"><Sparkles className="w-5 h-5"/> Initializing Directors...</span>
                  ) : (
                    <>Generate Cinematic Campaign <Sparkles className="w-5 h-5"/></>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </form>
    </div>
  );
}
