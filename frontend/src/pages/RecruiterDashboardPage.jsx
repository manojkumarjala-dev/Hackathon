'use client';
import { useEffect, useState } from 'react';

const RecruiterDashboardPage= () => {
  const [jobs, setJobs] = useState([]);
  const [jobDesc, setJobDesc] = useState('');
  const handleSubmit = () => {
    if (!jobDesc.trim()) return;
  };
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/jobs');
        const data = await res.json();
        console.log(data)
        setJobs((prev) => {
            // Create a map for quick lookup of previous jobs by ID
            const prevMap = new Map(prev.map(job => [job.id, job]));
          
            // Build the new job list by merging previous logs (if exists)
            const mergedJobs = data.map((newJob) => {
              const prevJob = prevMap.get(newJob.id);
          
              if (!prevJob) {
                // New job, just use as is
                return newJob;
              }
          
              // Existing job: merge logs
              const newLogs = newJob.logs.slice(prevJob.logs.length);
              return {
                ...newJob,
                logs: [...prevJob.logs, ...newLogs],
              };
            });
          
            return mergedJobs;
          });
          
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 5001);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-6 font-sans max-w-screen-xl mx-auto">
      <header className="bg-green-600 shadow-md sticky top-0 z-10 rounded-lg mb-4">
  <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between border-b border-green-600 rounded-lg">
    <h1 className="text-2xl font-semibold text-white">Recruiter Dashboard</h1>
    <span className="text-sm text-white hidden sm:inline">AI Hiring Assistant</span>
  </div>
</header>

<textarea
        placeholder="Paste job description here..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        rows={4}
        className="w-full p-4 border border-gray-300 rounded-lg mb-4 shadow-md"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mb-8"
      >
        Submit Job to Agents
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white text-gray-900 rounded-lg shadow-md p-4 flex flex-col h-[400px] border border-gray-200"
          >
            <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-2">
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(job.status)}`}>
                {capitalize(job.status)}
              </span>
            </div>

            <div className="overflow-y-auto text-sm flex-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {job.logs.map((log, idx) => (
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

function getStatusBadge(status) {
  const lower = status.toLowerCase();
  if (lower.includes('queued')) return 'bg-gray-200 text-gray-700';
  if (lower.includes('processing')) return 'bg-yellow-100 text-yellow-800';
  if (lower.includes('completed')) return 'bg-green-100 text-green-700';
  if (lower.includes('error')) return 'bg-red-100 text-red-700';
  return 'bg-gray-300 text-gray-800';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default RecruiterDashboardPage;
