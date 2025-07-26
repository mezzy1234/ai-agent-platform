'use client';

import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

interface Execution {
  id: string;
  agent_id: string;
  status: string;
  result: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const userId = session.user?.id;
      const { data, error } = await supabase
        .from('executions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setExecutions(data as unknown as Execution[]);
      }
      setLoading(false);
    };
    fetchExecutions();
  }, [router]);

  return (
    <div>
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8 mt-4">
        <h1 className="text-2xl font-bold mb-4">Your Executions</h1>
        {loading ? (
          <p>Loading...</p>
        ) : executions.length === 0 ? (
          <p className="text-gray-600">No executions found. Subscribe to an agent and start automating!</p>
        ) : (
          <ul className="space-y-3">
            {executions.map((exec) => (
              <li key={exec.id} className="bg-white rounded-lg shadow p-4">
                <p className="font-semibold">Agent: {exec.agent_id}</p>
                <p className="text-sm text-gray-700">Status: {exec.status}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
