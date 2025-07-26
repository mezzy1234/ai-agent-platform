'use client';

import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div>
      <NavBar />
      <div className="flex justify-center items-center mt-24 px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
          <h1 className="text-xl font-semibold mb-4">Sign In or Register</h1>
          {errorMsg && <p className="text-red-500 text-sm mb-3">{errorMsg}</p>}
          <input
            type="email"
            className="w-full border p-2 mb-3 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full border p-2 mb-4 rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded mb-2 hover:bg-blue-700 text-sm"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUp}
            className="w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 text-sm"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
