'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Play, Sparkles, Settings2, Video, CheckCircle2, Share2, Film, Home, ArrowRight, Building2, UploadCloud } from 'lucide-react';

const steps = [
  { id: 'landing', duration: 3000 },
  { id: 'workspace', duration: 3000 },
  { id: 'industry', duration: 3000 },
  { id: 'campaign', duration: 4000 },
  { id: 'generation', duration: 5000 },
  { id: 'studio', duration: 5000 },
];

export default function ProductDemo() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runStep = () => {
      const step = steps[currentStepIndex];
      timeoutId = setTimeout(() => {
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
      }, step.duration);
    };

    runStep();

    return () => clearTimeout(timeoutId);
  }, [currentStepIndex]);

  const stepId = steps[currentStepIndex].id;

  return (
    <div className="relative w-full aspect-[16/10] max-w-4xl mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
      {/* Fake Browser Header */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2 shrink-0">
         <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-500/80" />
           <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
           <div className="w-3 h-3 rounded-full bg-green-500/80" />
         </div>
         <div className="mx-auto bg-slate-700/50 rounded-md px-3 py-1 text-xs text-slate-400 font-mono w-64 text-center">
           marketpilot.ai
         </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-slate-50 text-slate-900">
        <AnimatePresence mode="wait">
          {stepId === 'landing' && <LandingScreen key="landing" />}
          {stepId === 'workspace' && <WorkspaceScreen key="workspace" />}
          {stepId === 'industry' && <IndustryScreen key="industry" />}
          {stepId === 'campaign' && <CampaignScreen key="campaign" />}
          {stepId === 'generation' && <GenerationScreen key="generation" />}
          {stepId === 'studio' && <StudioScreen key="studio" />}
        </AnimatePresence>

        {/* Animated Mouse Cursor */}
        <AnimatedCursor stepId={stepId} />
      </div>
    </div>
  );
}

// --- Screens ---

function LandingScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950 text-white flex flex-col">
       <div className="p-4 border-b border-slate-800 flex justify-between items-center">
         <div className="font-bold text-indigo-400 text-sm">MarketPilot</div>
         <div className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full">Log In</div>
       </div>
       <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
         <h1 className="text-3xl font-extrabold text-white">Cinematic AI Video</h1>
         <p className="text-sm text-slate-400">Generate targeted campaigns at scale.</p>
         <div className="mt-4 px-6 py-2 bg-indigo-600 rounded-full text-sm font-bold shadow-lg shadow-indigo-600/30" id="landing-btn">
           Start Creating Free
         </div>
       </div>
    </motion.div>
  );
}

function WorkspaceScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-50 flex flex-col">
       <div className="p-6">
         <h2 className="text-xl font-bold mb-4 text-slate-900">Select Workspace</h2>
         <div className="grid grid-cols-2 gap-4">
           <div className="bg-white border border-indigo-200 p-4 rounded-xl shadow-sm relative overflow-hidden" id="workspace-card">
              <div className="font-bold text-slate-800 mb-1 text-sm">Acme Corp</div>
              <div className="text-xs text-indigo-600 font-medium">Business</div>
           </div>
           <div className="bg-slate-100 border border-slate-200 border-dashed p-4 rounded-xl flex items-center justify-center">
              <span className="text-slate-400 text-xs">+ New Workspace</span>
           </div>
         </div>
       </div>
    </motion.div>
  );
}

function IndustryScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-50 flex flex-col">
       <div className="p-6">
         <h2 className="text-xl font-bold mb-4 text-slate-900">Select Industry</h2>
         <div className="grid grid-cols-3 gap-4">
           <div className="bg-white border border-slate-200 p-4 rounded-xl text-center" id="industry-hotel">
              <Building2 className="w-6 h-6 mx-auto mb-2 text-slate-500" />
              <div className="font-bold text-slate-800 text-xs">Hotel & Resort</div>
           </div>
           <div className="bg-white border border-slate-200 p-4 rounded-xl text-center">
              <div className="w-6 h-6 bg-slate-200 rounded mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-xs">E-Commerce</div>
           </div>
           <div className="bg-white border border-slate-200 p-4 rounded-xl text-center">
              <div className="w-6 h-6 bg-slate-200 rounded mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-xs">Real Estate</div>
           </div>
         </div>
       </div>
    </motion.div>
  );
}

function CampaignScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-50 flex flex-col">
       <div className="p-6">
         <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-indigo-600" /> Hotel Campaign Wizard
         </h2>
         <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <div>
               <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
               <div className="h-8 w-full bg-slate-50 border border-slate-200 rounded" />
            </div>
            <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center flex flex-col items-center justify-center">
               <UploadCloud className="w-6 h-6 text-indigo-400 mb-1" />
               <span className="text-xs text-slate-500">Assets Uploaded (254MB)</span>
            </div>
            <div className="pt-2">
               <div className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold text-center shadow-sm" id="generate-btn">
                 Generate Cinematic Campaign
               </div>
            </div>
         </div>
       </div>
    </motion.div>
  );
}

function GenerationScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-50 flex p-6 gap-4">
       <div className="w-1/3 space-y-3">
         <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
         {[1, 2, 3, 4].map((i) => (
           <motion.div 
             key={i} 
             initial={{ opacity: 0, x: -10 }} 
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.8 }}
             className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg"
           >
             <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600">✓</div>
             <div className="h-2 w-16 bg-slate-300 rounded" />
           </motion.div>
         ))}
       </div>
       <div className="w-2/3 bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-800">
           <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin mb-4" />
           <span className="text-white text-sm font-medium">Hybrid AI Processing...</span>
       </div>
    </motion.div>
  );
}

function StudioScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-50 p-6 flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Studio</h2>
          <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</div>
       </div>
       <div className="flex gap-4 flex-1 h-full">
         <div className="w-2/3 bg-slate-900 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center" id="play-btn">
                 <Play className="w-5 h-5 text-white ml-1" />
               </div>
            </div>
         </div>
         <div className="w-1/3 space-y-3">
           <div className="bg-white p-3 border border-slate-200 rounded-xl h-full flex flex-col">
              <h3 className="text-xs font-bold mb-2">Publishing</h3>
              <div className="flex-1 text-[10px] text-slate-500 bg-slate-50 rounded p-2 border border-slate-100 mb-2">
                "Experience luxury like never before. Welcome to our newest resort. ✨🌴 #Luxury"
              </div>
              <div className="mt-auto space-y-2">
                 <div className="w-full py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-center" id="publish-btn">TikTok (9:16)</div>
                 <div className="w-full py-1.5 bg-indigo-600 text-white rounded text-xs font-medium text-center shadow-sm">Publish Campaign</div>
              </div>
           </div>
         </div>
       </div>
    </motion.div>
  );
}

// --- Cursor Animation ---

function AnimatedCursor({ stepId }: { stepId: string }) {
  // Define keyframes for each step to simulate real movement
  const cursorVariants = {
    landing: {
      x: [100, 350],
      y: [300, 220],
      scale: [1, 1, 0.9, 1],
      transition: { duration: 3, times: [0, 0.8, 0.9, 1], ease: "easeInOut" }
    },
    workspace: {
      x: [350, 150],
      y: [220, 100],
      scale: [1, 1, 0.9, 1],
      transition: { duration: 3, times: [0, 0.8, 0.9, 1], ease: "easeInOut" }
    },
    industry: {
      x: [150, 100],
      y: [100, 130],
      scale: [1, 1, 0.9, 1],
      transition: { duration: 3, times: [0, 0.8, 0.9, 1], ease: "easeInOut" }
    },
    campaign: {
      x: [100, 350],
      y: [130, 280],
      scale: [1, 1, 0.9, 1],
      transition: { duration: 4, times: [0, 0.8, 0.9, 1], ease: "easeInOut" }
    },
    generation: {
      x: 350,
      y: 280,
      opacity: 0, // hide cursor while generating
      transition: { duration: 5 }
    },
    studio: {
      opacity: 1,
      x: [350, 600, 600],
      y: [280, 220, 280],
      scale: [1, 1, 0.9, 1, 1, 0.9, 1],
      transition: { duration: 5, times: [0, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9], ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      variants={cursorVariants}
      animate={stepId}
      initial="landing"
      className="absolute top-0 left-0 z-50 pointer-events-none drop-shadow-xl"
      style={{ originX: 0, originY: 0 }}
    >
      <MousePointer2 className="w-6 h-6 text-slate-800 fill-white" />
      {/* Click ripple effect */}
      <motion.div 
        animate={{ 
           scale: [1, 2, 2], 
           opacity: [0, 0.5, 0],
        }}
        transition={{ 
           duration: 0.5, 
           repeat: Infinity, 
           repeatDelay: stepId === 'campaign' ? 3.5 : 2.5 
        }}
        className="absolute top-1 left-1 w-4 h-4 bg-indigo-500 rounded-full -z-10"
      />
    </motion.div>
  );
}
