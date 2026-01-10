"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function Header() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error(error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-400 hover:text-gray-300 transition-colors"
            >
              Slideshow
            </Link>
          </div>

          <nav>
            <ul className="flex space-x-8">
              {isAdmin && (
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded bg-zinc-600 hover:bg-zinc-700 text-gray-300 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
