'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Sparkles, Video, BarChart, Settings, Users } from 'lucide-react';
import ProductDemo from '../components/public/ProductDemo';
import HowItWorks from '../components/public/HowItWorks';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <header className="relative z-10 flex justify-between items-center p-6 lg:px-12 glass-panel border-b-0 border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            MarketPilot
          </h1>
        </div>
        <div className="space-x-6 flex items-center">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
          <Link href="/login" className="text-sm font-medium px-5 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 transition-all shadow-lg shadow-white/10">
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center text-center mt-20 lg:mt-32 px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>MarketPilot 2.0 is now live</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Cinematic AI Video <br className="hidden sm:block" /> 
            <span className="text-gradient">At Enterprise Scale</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Generate highly targeted, on-brand video campaigns. MarketPilot adapts instantly to your industry and brand identity using advanced Hybrid AI Directors.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/login" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-lg font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
              Start Creating Free
            </Link>
            <a href="#demo" className="px-8 py-4 glass-card hover:bg-white/10 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 group">
              <Play className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              Watch Demo
            </a>
          </motion.div>
        </motion.div>
      </main>
      
      <section id="demo" className="relative z-10 mt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
           <div className="text-center space-y-4">
             <h3 className="text-3xl lg:text-4xl font-bold">See MarketPilot in Action</h3>
             <p className="text-slate-400">Experience the future of video generation</p>
           </div>
           
           <ProductDemo />

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
             <FeatureCard icon={<BarChart />} title="Data-Driven" desc="Campaigns engineered for maximum engagement and ROI." />
             <FeatureCard icon={<Settings />} title="On-Brand AI" desc="Hybrid Directors enforce your specific visual identity rules." />
             <FeatureCard icon={<Users />} title="Multi-Tenant" desc="Secure workspaces for individuals, teams, and enterprises." />
           </div>
        </div>
      </section>

      <HowItWorks />

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-12 text-center text-slate-500">
         <p>© 2026 MarketPilot Inc. All rights reserved.</p>
         <div className="mt-4 flex justify-center gap-4">
           <Link href="/owner-login" className="hover:text-slate-300 text-sm">Owner Portal</Link>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl text-left border border-slate-800 hover:border-indigo-500/50 group">
      <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-2 text-slate-200">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
