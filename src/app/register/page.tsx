"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "user",
                createdAt: new Date().toISOString()
            });
            
            console.log("Account created:", user);
            
            router.push('/dashboard'); 
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email.');
            } else {
                setError('Registration error. Please try again later.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            
            <div className="max-w-md w-full bg-zinc-900 p-8 rounded-xl">
                
                <h1 className="text-3xl font-bold text-center text-gray-300 mb-8">
                    Sign Up
                </h1>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
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
                            placeholder="Minimum 6 characters" 
                            required
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-gray-300 placeholder-gray-400 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-zinc-600 hover:bg-zinc-700 text-gray-300 font-semibold py-3 px-4 rounded-lg shadow-lg transition duration-200 transform hover:scale-[1.02]"
                    >
                        Create account
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-zinc-300 hover:text-white underline transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}