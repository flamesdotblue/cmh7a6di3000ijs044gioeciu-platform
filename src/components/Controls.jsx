const departments = ["All", "Tech", "HR", "Sales", "Ops", "Finance", "Marketing"];

export default function Controls({ deptFilter, setDeptFilter, minYears, setMinYears, query, setQuery }) {
  return (
    <div className="w-full border border-slate-200 rounded-xl p-3 md:p-4 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Search employee</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name (e.g., Alex Kim)"
            className="w-full h-9 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/40"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-56">
          <label className="block text-xs font-medium text-slate-600 mb-1">Minimum years in org: {minYears}</label>
          <input
            type="range"
            min="0"
            max="15"
            value={minYears}
            onChange={(e) => setMinYears(parseInt(e.target.value, 10))}
            className="w-full accent-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
