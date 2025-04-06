'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [agents, setAgents] = useState([]);

  // Poll agent data every 5 seconds
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/agents');
        const newData = await res.json();
        console.log(newData)
        setAgents((prevAgents) => {
          // First time setup
          if (prevAgents.length === 0) {
            return newData.map(agent => ({
              ...agent,
              logs: agent.logs,
            }));
          }
        
          // For subsequent updates
          return prevAgents.map((prevAgent) => {
            const updatedAgent = newData.find((a) => a.id === prevAgent.id);
            if (!updatedAgent) return prevAgent;
        
            const existingLogs = prevAgent.logs;
            const newLogsFromServer = updatedAgent.logs;
            const trulyNewLogs = newLogsFromServer.slice(existingLogs.length);
        
            return {
              ...prevAgent,
              state: updatedAgent.state,
              last_updated: updatedAgent.last_updated,
              logs: [...existingLogs, ...trulyNewLogs],
            };
          });
        });
        
      } catch (err) {
        console.error('Failed to fetch agent data:', err);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 5001);
    return () => clearInterval(interval);
  }, []);


  return (
    <main className="p-6 font-sans max-w-screen-xl mx-auto">
      <header className="bg-blue-600 shadow-md sticky top-0 z-10 rounded-lg mb-4">
  <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between border-b border-blue-700 rounded-lg mb-4">
    <h1 className="text-2xl font-semibold text-white">Hiring Automation Dashboard</h1>
    <span className="text-sm text-white hidden sm:inline">AI Hiring Platform</span>
  </div>
</header>


      

      {/* Responsive 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {agents.map((agent) => (
    <div
      key={agent.id}
      className="bg-white text-gray-900 rounded-lg shadow-md p-4 flex flex-col h-[400px] border border-gray-200"
    >
      <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-2">
        <h2 className="text-lg font-semibold">{agent.name}</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStateBadge(agent.state)}`}>
          {capitalize(agent.state)}
        </span>
      </div>

      <div className="overflow-y-auto text-sm flex-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {agent.logs.map((log, idx) => (
          <div key={idx} className="whitespace-pre-wrap text-gray-700">
            <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>

    </main>
  );
}

function getStateBadge(state) {
  const lower = state.toLowerCase();
  if (lower.includes('idle')) return 'bg-gray-300';
  if (lower.includes('processing')) return 'bg-yellow-400';
  if (lower.includes('extracting') || lower.includes('matching')) return 'bg-blue-600';
  if (lower.includes('completed')) return 'bg-green-400';
  if (lower.includes('error')) return 'bg-red-400';
  return 'bg-gray-700';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
