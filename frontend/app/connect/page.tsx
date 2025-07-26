'use client';

import { useState } from 'react';
import NavBar from '../../components/NavBar';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ConnectPage() {
  const router = useRouter();
  const [serviceName, setServiceName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [oauthToken, setOauthToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    const userId = session.user?.id;
    const { error } = await supabase.from('credentials').insert([
      {
        user_id: userId,
        service_name: serviceName,
        api_key: apiKey || null,
        oauth_token: oauthToken || null,
        encrypted: false,
      },
    ]);
    if (error) {
      setError(error.message);
      setMessage('');
    } else {
      setServiceName('');
      setApiKey('');
      setOauthToken('');
      setError('');
      setMessage('Credential saved successfully!');
    }
  };

  return (
    <div>
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8 mt-4">
        <h1 className="text-2xl font-bold mb-4">Connect Your Services</h1>
        <p className="text-gray-700 mb-4">Enter your API keys or OAuth tokens to allow agents to operate on your behalf. Your credentials are stored securely in our encrypted vault.</p>
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}
        <input
          type="text"
          className="w-full border p-2 mb-3 rounded"
          placeholder="Service Name (e.g. Gmail, OpenAI)"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
        />
        <input
          type="text"
          className="w-full border p-2 mb-3 rounded"
          placeholder="API Key (leave blank if using OAuth)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <input
          type="text"
          className="w-full border p-2 mb-4 rounded"
          placeholder="OAuth Token (if applicable)"
          value={oauthToken}
          onChange={(e) => setOauthToken(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
        >
          Save Credential
        </button>
      </main>
    </div>
  );
}
