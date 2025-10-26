const DEPTS = [
  { id: "Tech", color: "#2563EB", tint: "#DBEAFE" },
  { id: "HR", color: "#10B981", tint: "#D1FAE5" },
  { id: "Sales", color: "#F59E0B", tint: "#FEF3C7" },
  { id: "Ops", color: "#64748B", tint: "#E2E8F0" },
  { id: "Finance", color: "#9333EA", tint: "#F3E8FF" },
  { id: "Marketing", color: "#EF4444", tint: "#FEE2E2" },
];

export default function Legend() {
  return (
    <aside className="border border-slate-200 rounded-xl p-4 shadow-sm sticky top-[88px] bg-white">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Legend</h3>
      <ul className="space-y-2">
        {DEPTS.map((d) => (
          <li key={d.id} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-slate-600">{d.id}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t pt-3">
        <p className="text-xs text-slate-500">Each employee node shows a circular headshot, bold name, and a tenure badge (Years in org). Colors indicate departments. Boxes softly group each department under its VP.</p>
      </div>
    </aside>
  );
}
