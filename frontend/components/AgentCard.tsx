import Link from 'next/link';

export interface AgentProps {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function AgentCard({ agent }: { agent: AgentProps }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
      </div>
      <div className="mt-auto">
        <p className="font-bold text-gray-800">${agent.price}/mo</p>
        <Link href="/login" className="block mt-3">
          <button className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm">
            Subscribe
          </button>
        </Link>
      </div>
    </div>
  );
}
