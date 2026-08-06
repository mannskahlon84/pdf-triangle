'use client';

import { logout } from '../actions/auth';
import { Shield, Activity, Users, Video, DollarSign, AlertTriangle, PlayCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OwnerDashboard() {
  
  const mockData = [
    { name: 'Mon', videos: 400, cost: 240 },
    { name: 'Tue', videos: 300, cost: 139 },
    { name: 'Wed', videos: 550, cost: 380 },
    { name: 'Thu', videos: 278, cost: 390 },
    { name: 'Fri', videos: 189, cost: 480 },
    { name: 'Sat', videos: 239, cost: 380 },
    { name: 'Sun', videos: 349, cost: 430 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Admin<span className="text-red-500">Pilot</span></h2>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium">
              <Activity className="w-5 h-5" /> Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition-colors">
              <Users className="w-5 h-5" /> Users & Workspaces
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition-colors">
              <PlayCircle className="w-5 h-5" /> Generation Jobs
            </a>
          </nav>
        </div>
        
        <div className="p-6">
          <form action={logout}>
            <button className="w-full py-3 text-slate-400 hover:text-white border border-slate-700/50 hover:bg-slate-800 rounded-xl font-medium transition-all">
              Secure Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto z-10">
        <header className="flex justify-between items-center mb-8">
           <div>
             <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
             <p className="text-slate-400 mt-1">Real-time metrics and system health.</p>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm font-medium">
             <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> All Systems Operational
           </div>
        </header>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard icon={<Users />} label="Total Users" value="1,248" trend="+12%" />
          <MetricCard icon={<Shield />} label="Active Subscriptions" value="892" trend="+5%" />
          <MetricCard icon={<Video />} label="Videos Generated" value="15,340" trend="+24%" />
          <MetricCard icon={<DollarSign />} label="API Cost (MTD)" value="$3,420" trend="-2%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
               <Activity className="w-5 h-5 text-indigo-400" /> Generation Activity (7 Days)
             </h3>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={mockData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                   <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                     itemStyle={{ color: '#e2e8f0' }}
                   />
                   <Line type="monotone" dataKey="videos" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} activeDot={{r: 6}} />
                   <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Failed Jobs List */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Requires Attention
            </h3>
            
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-slate-400">job_09{i}2</span>
                    <span className="text-xs text-slate-500">2h ago</span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Acme Corp</p>
                  <p className="text-sm text-red-400 mb-3 truncate">GCS Upload Timeout Exception...</p>
                  <button className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Retry Job
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend }: any) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-800/50 rounded-bl-full -z-10 group-hover:bg-slate-800 transition-colors" />
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <h4 className="text-3xl font-extrabold text-white">{value}</h4>
    </div>
  )
}
