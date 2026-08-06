'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, Loader2, Video, Share2, Download, Film } from 'lucide-react';

export default function StudioPage({ params }: { params: { workspaceId: string, campaignId: string } }) {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [status, setStatus] = useState<string>('PENDING');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    
    // Polling mock
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/marketpilot/campaigns/status?jobId=${jobId}`);
        const data = await res.json();
        setStatus(data.status);
        
        // Mock progress advancement based on status (in reality we'd get this from backend)
        if (data.status === 'RUNNING') setProgress(p => Math.min(p + 10, 90));
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setProgress(100);
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <Film className="w-8 h-8 text-indigo-600" />
             AI Video Studio
          </h1>
          <p className="text-slate-500 mt-1">Campaign: <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{params.campaignId}</span></p>
        </div>
        
        {status === 'COMPLETED' && (
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 shadow-sm transition-all">
                <Download className="w-4 h-4" /> Download 4K
             </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Pipeline Tracker */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold border-b border-slate-100 pb-4 mb-6">Generation Pipeline</h2>
            
            <div className="space-y-4 relative">
              {/* Progress Line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100 -z-10" />
              <div 
                className="absolute left-[19px] top-6 w-0.5 bg-indigo-500 transition-all duration-1000 -z-10" 
                style={{ height: `${progress}%` }}
              />

              <PipelineStep name="Asset Resolution" active={status === 'RUNNING' && progress < 25} done={progress >= 25} stepNum={1} />
              <PipelineStep name="Creative Planning (AI Directors)" active={status === 'RUNNING' && progress >= 25 && progress < 50} done={progress >= 50} stepNum={2} />
              <PipelineStep name="Timeline Assembly" active={status === 'RUNNING' && progress >= 50 && progress < 75} done={progress >= 75} stepNum={3} />
              <PipelineStep name="FFmpeg Render" active={status === 'RUNNING' && progress >= 75 && progress < 100} done={status === 'COMPLETED'} stepNum={4} />
            </div>
          </div>
        </div>

        {/* Right Column: Video Preview & Publishing */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Main Video Player Area */}
          <div className="bg-slate-950 rounded-2xl aspect-video flex flex-col items-center justify-center text-slate-500 overflow-hidden shadow-2xl border border-slate-800 relative">
            {status === 'COMPLETED' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80')] bg-cover bg-center group cursor-pointer"
              >
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                 </div>
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <Video className="absolute inset-0 m-auto w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Generating Cinematic Video</h3>
                <p className="text-sm text-slate-400">Hybrid AI Directors are currently rendering the scene...</p>
              </div>
            )}
          </div>

          {/* Publishing Preparation UI */}
          {status === 'COMPLETED' && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }}
               className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
               <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                 <Share2 className="w-5 h-5 text-indigo-600" /> Publishing Preparation
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-4">
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Generated Caption (AI Optimized)</label>
                       <textarea className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" defaultValue="Experience luxury like never before. Welcome to our newest resort where dreams meet reality. ✨🌴 #LuxuryTravel #ResortLife #Cinematic"></textarea>
                     </div>
                     <div className="flex gap-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">#LuxuryTravel</span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">#ResortLife</span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">#Cinematic</span>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Export Formats</label>
                     <button className="w-full text-left px-4 py-3 bg-white border border-indigo-200 rounded-xl shadow-sm hover:border-indigo-500 flex items-center justify-between group">
                        <span className="font-medium text-slate-900">TikTok / Reels (9:16)</span>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                     </button>
                     <button className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 flex items-center justify-between group">
                        <span className="font-medium text-slate-900">YouTube (16:9)</span>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                     </button>
                     <button className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 flex items-center justify-between group">
                        <span className="font-medium text-slate-900">Instagram Square (1:1)</span>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                     </button>
                  </div>
               </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

function PipelineStep({ name, active, done, stepNum }: { name: string, active: boolean, done: boolean, stepNum: number }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${done ? 'bg-white border-transparent shadow-sm' : active ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-transparent border-transparent opacity-50'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10 transition-colors duration-500 ${done ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 text-slate-400 border-2 border-white'}`}>
        {done ? <CheckCircle2 className="w-5 h-5" /> : active ? <Loader2 className="w-5 h-5 animate-spin" /> : stepNum}
      </div>
      <div className="pt-2">
        <span className={`block font-semibold transition-colors duration-500 ${done ? 'text-slate-900' : active ? 'text-indigo-900' : 'text-slate-500'}`}>{name}</span>
        {active && <span className="text-xs font-medium text-indigo-600 mt-1 block animate-pulse">Processing...</span>}
      </div>
    </div>
  );
}
