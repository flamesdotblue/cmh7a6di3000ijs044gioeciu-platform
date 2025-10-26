import { useState, useMemo } from "react";
import Header from "./components/Header";
import Legend from "./components/Legend";
import Controls from "./components/Controls";
import OrgChart from "./components/OrgChart";

export default function App() {
  const [deptFilter, setDeptFilter] = useState("All");
  const [minYears, setMinYears] = useState(0);
  const [query, setQuery] = useState("");

  const filters = useMemo(() => ({ dept: deptFilter, minYears, query }), [deptFilter, minYears, query]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-inter">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <Controls
            deptFilter={deptFilter}
            setDeptFilter={setDeptFilter}
            minYears={minYears}
            setMinYears={setMinYears}
            query={query}
            setQuery={setQuery}
          />
          <div className="flex items-start gap-4">
            <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <OrgChart filters={filters} />
            </div>
            <div className="hidden lg:block w-80 shrink-0">
              <Legend />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
