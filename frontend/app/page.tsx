import NavBar from '../components/NavBar';
import AgentCard, { AgentProps } from '../components/AgentCard';

const agents: AgentProps[] = [
  {
    id: 'quote-bot',
    name: 'AI Quote Reply Bot',
    description: 'Automatically reply to quotes using AI',
    price: 49,
  },
  {
    id: 'scheduler',
    name: 'Auto Scheduler',
    description: 'Schedule meetings automatically based on availability',
    price: 99,
  },
  {
    id: 'lead-filter',
    name: 'Lead Filter & CRM Updater',
    description: 'Filter inbound leads and update your CRM with AI',
    price: 79,
  },
];

export default function HomePage() {
  return (
    <div>
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Agent Marketplace</h1>
        <p className="mb-6 text-gray-700">Choose from a growing collection of automation agents. Connect your credentials and flip the switch to start automating your business.</p>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </main>
    </div>
  );
}
