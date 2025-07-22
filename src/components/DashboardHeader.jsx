import React, { useEffect, useState } from 'react';

export default function DashboardHeader({ company, role, onSearch, resetSignal }) {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('project');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), context);
    }
  };

  // ✅ Reset input and dropdown when resetSignal changes
  useEffect(() => {
    if (resetSignal) {
      setQuery('');
      setContext('project');
    }
  }, [resetSignal]);

  return (
    <div className="bg-blue-200 dark:bg-zinc-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          <span className="font-medium">Company:</span> {company} &nbsp; | &nbsp;
          <span className="font-medium">Role:</span> {role}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Smart search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-3 py-1 rounded border text-sm border-y-white dark:bg-zinc-900 dark:text-white"
        />
        <select
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="px-2 py-1 rounded border text-sm border-y-white dark:bg-zinc-900 dark:text-white"
        >
          <option value="project">Project</option>
          <option value="folder">Folder</option>
          <option value="asset">Asset</option>
        </select>
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Search
        </button>
      </div>
    </div>
  );
}
