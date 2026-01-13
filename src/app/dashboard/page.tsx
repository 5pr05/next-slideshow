"use client";

import React, { useEffect, useState, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase'; 

interface Slideshow {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp | null;
  images?: string[]; 
}

export default function Dashboard() {
  const [slides, setSlides] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateWithImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newTitle || !selectedFiles || selectedFiles.length === 0) {
        alert("Please enter a title and select at least one image.");
        return;
    }

    setIsUploading(true);

    try {
      const docRef = await addDoc(collection(db, "slideshows"), {
        title: newTitle,
        author: auth.currentUser.displayName || "User",
        authorEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
        images: [] 
      });

      const slideshowId = docRef.id;
      const imageUrls: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const storageRef = ref(storage, `slideshows/${slideshowId}/${file.name}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      await updateDoc(doc(db, "slideshows", slideshowId), {
        images: imageUrls
      });

      setNewTitle("");
      setSelectedFiles(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      setIsModalOpen(false);

    } catch (error) {
      console.error("Error creating slideshow:", error);
      alert("Failed to create slideshow. See console for details.");
    } finally {
      setIsUploading(false);
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
    uniqueAuthors: new Set(slides.map(s => s.authorEmail)).size
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading data...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 pt-24 px-4 sm:px-6 lg:px-8 relative">
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">New Slideshow</h2>
            
            <form onSubmit={handleCreateWithImages} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                    <input 
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="E.g., Q4 Report"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        required
                        disabled={isUploading}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Slides (Images)</label>
                    <input 
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/jpg"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFiles(e.target.files)}
                        className="block w-full text-sm text-zinc-400
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-zinc-800 file:text-white
                          hover:file:bg-zinc-700
                          cursor-pointer"
                        required
                        disabled={isUploading}
                    />
                    <p className="text-xs text-zinc-500 mt-2">Select multiple images (PNG, JPG).</p>
                </div>

                <div className="flex gap-4 pt-2">
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        disabled={isUploading}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isUploading}
                        className="flex-1 bg-white text-black hover:bg-zinc-200 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                        {isUploading ? (
                           <>
                             <span className="animate-spin h-4 w-4 mr-2 border-2 border-black border-t-transparent rounded-full"></span>
                             Uploading...
                           </>
                        ) : "Create & Upload"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin dashboard</h1>
          <p className="text-zinc-400 mt-1">Firebase Firestore data</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 bg-white text-black hover:bg-zinc-200 font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-white/10"
        >
          + Create Slideshow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        <StatsCard title="Total Slideshows" value={stats.total.toString()} change="Total in database" color="text-emerald-400" />
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
                  <th className="px-6 py-3 text-right">Slides</th>
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
                    <td className="px-6 py-4 text-right font-mono text-zinc-300">
                      {slide.images?.length || 0} 
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