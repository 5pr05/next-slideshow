"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase'; 
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter(); 

    const handleLogin = async (e: React.FormEvent) => { 
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful!");
            
            const dataLayerName = 'dataLayer';
            if (typeof window !== 'undefined') {
                const win = window as any; 
                if (!Array.isArray(win[dataLayerName])) {
                    win[dataLayerName] = [];
                }
                win[dataLayerName].push({ event: 'login_success' });
            }

            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert("Login error: Check email or password");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            
            <div className="max-w-md w-full bg-zinc-900 p-8 rounded-xl">
                
                <h1 className="text-3xl font-bold text-center text-gray-300 mb-8">
                    Sign In
                </h1>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="name@company.com" 
                            required
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-zinc-900 focus:border-transparent transition duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••" 
                            required
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-gray-300 placeholder-gray-400 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-zinc-600 hover:bg-zinc-700 text-gray-300 font-semibold py-3 px-4 rounded-lg shadow-lg transition duration-200 transform hover:scale-[1.02]"
                    >
                        Sign In
                    </button>
                    <p className="mt-8 text-center text-sm text-gray-400">
                        <Link href="/register" className="text-zinc-300 hover:text-white underline transition-colors">Create account</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}