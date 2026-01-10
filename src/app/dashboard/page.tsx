"use client";

import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useRouter } from 'next/navigation';

interface Slideshow {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  status: 'Published' | 'Draft';
  views: number;
  createdAt: Timestamp | null;
}

export default function Dashboard() {
  const [slides, setSlides] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "slideshows"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slidesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Slideshow[];
      
      setSlides(slidesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreate = async () => {
    if (!auth.currentUser) return;

    const title = prompt("Slideshow name:");
    if (!title) return;

    try {
      await addDoc(collection(db, "slideshows"), {
        title: title,
        author: auth.currentUser.displayName || "User",
        authorEmail: auth.currentUser.email,
        status: 'Draft',
        views: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete slideshow?")) return;
    try {
      await deleteDoc(doc(db, "slideshows", id));
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    total: slides.length,
    active: slides.filter(s => s.status === 'Published').length,
    views: slides.reduce((acc, curr) => acc + curr.views, 0),
    uniqueAuthors: new Set(slides.map(s => s.authorEmail)).size
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading data...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 pt-24 px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin dashboard</h1>
          <p className="text-zinc-400 mt-1">Firebase Firestore data</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="mt-4 md:mt-0 bg-white text-black hover:bg-zinc-200 font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-white/10"
        >
          + Create Slideshow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard title="Total Slideshows" value={stats.total.toString()} change="Total in database" color="text-emerald-400" />
        <StatsCard title="Published" value={stats.active.toString()} change="Status Published" color="text-blue-400" />
        <StatsCard title="Total Views" value={stats.views.toString()} change="Sum of all" color="text-purple-400" />
        <StatsCard title="Authors" value={stats.uniqueAuthors.toString()} change="Active users" color="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Slideshow List</h2>
            <span className="text-sm text-zinc-500">{slides.length} records</span>
          </div>
          
          <div className="overflow-x-auto">
            {slides.length === 0 ? (
               <div className="p-6 text-center text-zinc-500">
                  No data.
               </div>
            ) : (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/50 text-zinc-500 uppercase font-medium text-xs">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Views</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {slides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{slide.title}</div>
                      <div className="text-xs text-zinc-500">
                        {slide.authorEmail} • {formatDate(slide.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={slide.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-300">
                      {slide.views}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                         className="text-zinc-500 hover:text-red-400 transition-colors"
                         onClick={() => handleDelete(slide.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-white font-semibold mb-4">Database Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Connection</span>
                <span className="flex items-center text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">● Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Collection</span>
                <span className="text-xs text-zinc-500 font-mono">slideshows</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(timestamp: Timestamp | null) {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
}

function StatsCard({ title, value, change, color }: { title: string, value: string, change: string, color: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 shadow-sm">
      <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-white tracking-tight">{value}</p>
      <div className={`mt-2 text-xs font-medium ${color}`}>
        {change}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === 'Published';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${
        isPublished 
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
        : "bg-zinc-700/30 text-zinc-400 border-zinc-700"
    }`}>
      {status}
    </span>
  );
}