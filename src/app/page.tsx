"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProtectedRoute from "./components/ProtectedRoute";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

interface Slideshow {
  id: string;
  title: string;
  images: string[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export default function Home() {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [activePresIndex, setActivePresIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "slideshows"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Slideshow[];
      
      setSlideshows(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  if (slideshows.length === 0) return <div className="h-screen flex items-center justify-center text-white">No presentations found.</div>;

  const currentPres = slideshows[activePresIndex];
  const currentImageSrc = currentPres.images?.[activeSlideIndex]; 
  const totalSlides = currentPres.images?.length || 0;

  function cycleSlides(newDirection: 1 | -1) {
    if (totalSlides === 0) return;
    setDirection(newDirection);
    setActiveSlideIndex((prev) => {
      if (newDirection === 1) {
        return prev >= totalSlides - 1 ? 0 : prev + 1;
      } else {
        return prev <= 0 ? totalSlides - 1 : prev - 1;
      }
    });
  }

  function cyclePresentation(dir: "next" | "prev") {
    setDirection(0);
    setActivePresIndex((prev) => {
      let newIndex = prev;
      if (dir === "next") {
        newIndex = prev >= slideshows.length - 1 ? 0 : prev + 1;
      } else {
        newIndex = prev <= 0 ? slideshows.length - 1 : prev - 1;
      }
      setActiveSlideIndex(0); 
      return newIndex;
    });
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen items-center justify-center gap-6 bg-zinc-950 text-white overflow-hidden">
        
        <div className="flex flex-col items-center gap-2 mb-4">
            <span className="text-zinc-400 text-sm uppercase tracking-wider">Current Presentation</span>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => cyclePresentation("prev")}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-2xl"
                >
                    &uarr;
                </button>
                
                <AnimatePresence mode="wait">
                  <motion.h1 
                    key={currentPres.id}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold text-center min-w-50"
                  >
                    {currentPres.title}
                  </motion.h1>
                </AnimatePresence>

                <button 
                    onClick={() => cyclePresentation("next")}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-2xl"
                >
                    &darr;
                </button>
            </div>
            <div className="text-xs text-zinc-500">
                Project {activePresIndex + 1} of {slideshows.length}
            </div>
        </div>

        <div className="relative w-200 h-125 rounded-3xl overflow-hidden shadow-2xl shadow-black border border-zinc-800 bg-zinc-900">
          <AnimatePresence initial={false} custom={direction}>
            {totalSlides > 0 ? (
               <motion.div
                 key={activeSlideIndex}
                 custom={direction}
                 variants={slideVariants}
                 initial="enter"
                 animate="center"
                 exit="exit"
                 transition={{
                   x: { type: "spring", stiffness: 300, damping: 30 },
                   opacity: { duration: 0.2 }
                 }}
                 className="absolute inset-0 w-full h-full"
               >
                 <Image
                   src={currentImageSrc} 
                   alt={`Slide ${activeSlideIndex}`}
                   fill
                   className="object-cover"
                   priority
                   unoptimized={true} 
                 />
               </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  No images in this presentation
              </div>
            )}
          </AnimatePresence>
         
          <div
            className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex justify-center items-center cursor-pointer z-10"
            onClick={() => cycleSlides(1)}
          >
            <span className="text-6xl select-none">›</span>
          </div>
          
          <div
            className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex justify-center items-center cursor-pointer z-10"
            onClick={() => cycleSlides(-1)}
          >
            <span className="text-6xl select-none">‹</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
            {currentPres.images?.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                        activeSlideIndex === idx ? "w-8 bg-white" : "w-2 bg-zinc-600"
                    }`}
                />
            ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}