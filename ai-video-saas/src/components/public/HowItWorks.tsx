'use client';

import { motion } from 'framer-motion';
import { Upload, Cpu, Smartphone } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "1. Connect Brand & Assets",
      desc: "Upload your raw footage, logos, and brand guidelines into a secure workspace.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      icon: Cpu,
      title: "2. Hybrid AI Directors",
      desc: "Our specialized AI engines assemble the timeline, color grade, and mix audio.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      icon: Smartphone,
      title: "3. Multi-Platform Export",
      desc: "Instantly render 4K video optimized for TikTok, YouTube, and Instagram.",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];

  return (
    <div className="py-24 px-4 bg-slate-900 border-t border-b border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How MarketPilot Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">A seamless pipeline from raw assets to cinematic campaigns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
           {/* Connecting Line (hidden on mobile) */}
           <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/50 to-purple-500/20 z-0" />

           {steps.map((step, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.5, delay: i * 0.2 }}
               className="relative z-10 flex flex-col items-center text-center"
             >
               <div className={`w-24 h-24 rounded-2xl ${step.bg} ${step.border} border flex items-center justify-center mb-6 shadow-xl backdrop-blur-sm relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon className={`w-10 h-10 ${step.color} group-hover:scale-110 transition-transform`} />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
               <p className="text-slate-400 leading-relaxed text-sm">{step.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
