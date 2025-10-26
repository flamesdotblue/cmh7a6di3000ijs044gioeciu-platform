export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">OC</div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Organization Chart</h1>
            <p className="text-sm text-slate-500">Interactive, zoomable org structure for ~400 employees</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-500">
          <span className="text-xs">Pan: drag • Zoom: scroll • Collapse: click node</span>
        </div>
      </div>
    </header>
  );
}
