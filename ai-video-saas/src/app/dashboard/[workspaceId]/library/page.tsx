import Link from 'next/link';
import { Film, Play, Search, Filter, MoreVertical } from 'lucide-react';

export default function GeneratedLibrary({ params }: { params: { workspaceId: string } }) {
  
  const mockVideos = [
    { id: 'vid_01', name: 'Summer Campaign Reel', style: 'Cinematic AI', date: 'Oct 12, 2026', status: 'COMPLETED' },
    { id: 'vid_02', name: 'Real Estate Tour', style: 'Hybrid AI', date: 'Oct 10, 2026', status: 'COMPLETED' },
    { id: 'vid_03', name: 'Product Launch Teaser', style: 'Cinematic AI', date: 'Oct 05, 2026', status: 'FAILED' },
    { id: 'vid_04', name: 'Instagram Story Ad', style: 'Hybrid AI', date: 'Oct 01, 2026', status: 'COMPLETED' },
  ];

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Generated Library</h1>
          <p className="text-slate-500">Manage and export your AI-generated videos.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search videos..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
           </div>
           <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50">
             <Filter className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockVideos.map(video => (
          <div key={video.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group">
            <div className="aspect-video bg-slate-900 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
               </div>
               {video.status === 'COMPLETED' ? (
                 <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/90 backdrop-blur text-white text-[10px] font-bold uppercase rounded-md">Ready</div>
               ) : (
                 <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold uppercase rounded-md">Failed</div>
               )}
            </div>
            
            <div className="p-4">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-slate-900 truncate pr-4" title={video.name}>{video.name}</h3>
                 <button className="text-slate-400 hover:text-slate-900"><MoreVertical className="w-4 h-4" /></button>
               </div>
               <div className="flex items-center gap-2 mb-4">
                 <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100">{video.style}</span>
               </div>
               <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-3">
                 <span>{video.date}</span>
                 <Link href={`/dashboard/${params.workspaceId}/studio/${video.id}`} className="font-medium text-indigo-600 hover:underline">View Studio</Link>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
