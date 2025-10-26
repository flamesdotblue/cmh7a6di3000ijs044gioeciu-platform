import { useEffect, useMemo, useRef, useState } from "react";

const DEPT_COLORS = {
  Tech: { primary: "#2563EB", tint: "#DBEAFE" },
  HR: { primary: "#10B981", tint: "#D1FAE5" },
  Sales: { primary: "#F59E0B", tint: "#FEF3C7" },
  Ops: { primary: "#64748B", tint: "#E2E8F0" },
  Finance: { primary: "#9333EA", tint: "#F3E8FF" },
  Marketing: { primary: "#EF4444", tint: "#FEE2E2" },
};

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeName(i) {
  const firsts = [
    "Alex","Taylor","Jordan","Morgan","Casey","Riley","Avery","Jamie","Cameron","Drew",
    "Skyler","Reese","Logan","Quinn","Harper","Finley","Elliot","Sage","Noah","Maya",
    "Olivia","Liam","Emma","Noelle","Ethan","Milo","Zoe","Aria","Kai","Ivy",
  ];
  const lasts = [
    "Kim","Patel","Garcia","Smith","Johnson","Lee","Martinez","Brown","Davis","Lopez",
    "Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","White","Harris","Clark",
    "Lewis","Robinson","Walker","Perez","Hall","Young","Allen","Sanchez","Wright","King",
  ];
  return `${randChoice(firsts)} ${randChoice(lasts)}` + (i % 17 === 0 ? ` ${i}` : "");
}

function createOrgData() {
  // Structure: CEO -> 6 VPs (each dept) -> 3 Directors -> 3 Managers each -> 6 ICs each
  const departments = ["Tech", "HR", "Sales", "Ops", "Finance", "Marketing"];
  const root = {
    id: "ceo",
    name: "Pat Morgan",
    title: "Chief Executive Officer",
    dept: "Executive",
    years: 9,
    photo: avatarUrl(1),
    children: [],
    collapsed: false,
  };
  departments.forEach((dept, dIdx) => {
    const vp = node(`${dept}-vp`, `${dept} VP`, dept, 6 + (dIdx % 5), 2 + dIdx);
    vp.title = `VP of ${dept}`;
    for (let i = 0; i < 3; i++) {
      const dir = node(`${dept}-dir-${i}`, makeName(i + dIdx * 10), dept, 3 + ((i + dIdx) % 8), 50 + i + dIdx);
      dir.title = `Director, ${dept}`;
      for (let j = 0; j < 3; j++) {
        const mgr = node(`${dept}-mgr-${i}-${j}`, makeName(j + i * 3 + dIdx * 10), dept, 2 + ((j + i) % 10), 100 + j + i + dIdx);
        mgr.title = `Manager, ${dept}`;
        for (let k = 0; k < 6; k++) {
          const ic = node(`${dept}-ic-${i}-${j}-${k}`, makeName(k + j * 6 + i * 18 + dIdx * 10), dept, (k % 8), 200 + k + j + i + dIdx);
          ic.title = `Associate, ${dept}`;
          mgr.children.push(ic);
        }
        dir.children.push(mgr);
      }
      vp.children.push(dir);
    }
    root.children.push(vp);
  });
  return root;
}

function node(id, name, dept, years, imgSeed) {
  return {
    id,
    name,
    dept,
    years,
    title: "",
    photo: avatarUrl(imgSeed),
    children: [],
    collapsed: false,
  };
}

function avatarUrl(seed) {
  const n = (seed % 70) + 1; // pravatar has a bunch of images
  return `https://i.pravatar.cc/96?img=${n}`;
}

function flatten(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    out.push(n);
    if (n.children) {
      for (let i = n.children.length - 1; i >= 0; i--) {
        stack.push(n.children[i]);
      }
    }
  }
  return out;
}

function computeLayout(root, options = {}) {
  const gapX = options.gapX ?? 260;
  const gapY = options.gapY ?? 110;

  let nextY = 0;
  const minMax = { minY: Infinity, maxY: -Infinity, maxX: 0 };

  function firstWalk(node, depth = 0) {
    node.x = depth * gapX;
    if (!node.children || node.children.length === 0 || node.collapsed) {
      node.y = nextY;
      nextY += gapY;
    } else {
      node.children.forEach((c) => firstWalk(c, depth + 1));
      const ys = node.children.map((c) => c.y);
      node.y = ys.reduce((a, b) => a + b, 0) / ys.length;
    }
    minMax.minY = Math.min(minMax.minY, node.y);
    minMax.maxY = Math.max(minMax.maxY, node.y);
    minMax.maxX = Math.max(minMax.maxX, node.x);
  }

  firstWalk(root, 0);

  // Normalize Y so top is 0
  const offsetY = -minMax.minY + 40; // padding
  const offsetX = 40;
  const nodes = [];
  const links = [];

  function collect(node) {
    nodes.push({ ...node, drawX: node.x + offsetX, drawY: node.y + offsetY });
    if (node.children && !node.collapsed) {
      node.children.forEach((c) => {
        links.push({
          source: { x: node.x + offsetX + 120, y: node.y + offsetY },
          target: { x: c.x + offsetX - 120, y: c.y + offsetY },
          dept: c.dept ?? node.dept,
        });
        collect(c);
      });
    }
  }
  collect(root);

  return {
    nodes,
    links,
    width: minMax.maxX + offsetX + 300,
    height: minMax.maxY - minMax.minY + offsetY + 200,
  };
}

function getSubtreeBounds(node) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function walk(n) {
    minX = Math.min(minX, n.drawX);
    minY = Math.min(minY, n.drawY);
    maxX = Math.max(maxX, n.drawX);
    maxY = Math.max(maxY, n.drawY);
    if (n.children && !n.collapsed) n.children.forEach(walk);
  }
  walk(node);
  return { minX: minX - 120, minY: minY - 70, maxX: maxX + 180, maxY: maxY + 70 };
}

function NodeCard({ n, onToggle, highlight }) {
  const deptColor = DEPT_COLORS[n.dept]?.primary || "#334155";
  return (
    <g transform={`translate(${n.drawX - 100}, ${n.drawY - 40})`} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggle(n); }}>
      <rect x={0} y={0} width={200} height={80} rx={12} ry={12} fill="#ffffff" stroke={highlight ? deptColor : "#CBD5E1"} strokeWidth={highlight ? 2 : 1} />
      <rect x={0} y={0} width={6} height={80} rx={12} fill={deptColor} />
      <image href={n.photo} x={16} y={16} width={48} height={48} clipPath={`url(#clip-${n.id})`} preserveAspectRatio="xMidYMid slice" loading="lazy" />
      <circle cx={40} cy={40} r={24} fill="none" stroke="#E5E7EB" />
      <text x={76} y={35} fontSize={14} fontWeight={700} fill="#0F172A">{n.name}</text>
      <g transform="translate(76, 44)">
        <rect x={0} y={0} rx={8} ry={8} height={20} width={68} fill={`${deptColor}20`} />
        <text x={8} y={14} fontSize={12} fill="#334155">{n.years} Years</text>
      </g>
      {n.title && (
        <text x={76} y={64} fontSize={11} fill="#64748B">{n.title}</text>
      )}
      {/* Collapse indicator */}
      {n.children && n.children.length > 0 && (
        <g transform="translate(180, 10)">
          <rect width={14} height={14} rx={3} fill={n.collapsed ? deptColor : "#E2E8F0"} />
          <text x={7} y={11} textAnchor="middle" fontSize={12} fill={n.collapsed ? "#fff" : "#475569"}>{n.collapsed ? "+" : "−"}</text>
        </g>
      )}
    </g>
  );
}

export default function OrgChart({ filters }) {
  const containerRef = useRef(null);
  const [root, setRoot] = useState(() => createOrgData());
  const [transform, setTransform] = useState({ x: 40, y: 40, k: 0.8 });
  const [focusedId, setFocusedId] = useState(null);

  const layout = useMemo(() => computeLayout(structuredClone(root)), [root]);

  const nodesById = useMemo(() => {
    const map = new Map();
    function visit(n) {
      map.set(n.id, n);
      if (n.children) n.children.forEach(visit);
    }
    visit(root);
    return map;
  }, [root]);

  const filtered = useMemo(() => {
    const q = (filters.query || "").trim().toLowerCase();
    const dept = filters.dept;
    const minYears = filters.minYears || 0;

    const byId = new Map();
    flatten(root).forEach((n) => byId.set(n.id, n));

    return layout.nodes.map((n) => {
      const full = byId.get(n.id) || n;
      const matchesDept = dept === "All" || full.dept === dept || full.dept === "Executive";
      const matchesYears = (full.years ?? 0) >= minYears;
      const matchesQuery = q.length === 0 || full.name.toLowerCase().includes(q);
      return { ...n, matches: matchesDept && matchesYears && matchesQuery };
    });
  }, [layout, root, filters]);

  const links = useMemo(() => layout.links, [layout]);

  useEffect(() => {
    function onWheel(e) {
      e.preventDefault();
      const { x, y, k } = transform;
      const scaleBy = 1.08;
      const mouse = getMousePosition(e);
      const point = screenToWorld(mouse, transform);
      const direction = e.deltaY > 0 ? 1 : -1;
      const newK = clamp(0.3, 2.5, direction > 0 ? k / scaleBy : k * scaleBy);
      const newScreen = worldToScreen(point, { x, y, k: newK });
      const dx = mouse.x - newScreen.x;
      const dy = mouse.y - newScreen.y;
      setTransform({ x: x + dx, y: y + dy, k: newK });
    }
    const el = containerRef.current;
    el?.addEventListener("wheel", onWheel, { passive: false });
    return () => el?.removeEventListener("wheel", onWheel);
  }, [transform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let isPanning = false;
    let last = { x: 0, y: 0 };
    function down(e) { isPanning = true; last = { x: e.clientX, y: e.clientY }; }
    function move(e) {
      if (!isPanning) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    }
    function up() { isPanning = false; }
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  function handleToggle(n) {
    // toggle collapse for node in root structure by id
    function toggleById(node) {
      if (node.id === n.id) {
        node.collapsed = !node.collapsed;
      } else if (node.children) {
        node.children.forEach(toggleById);
      }
    }
    setRoot((r) => {
      const copy = structuredClone(r);
      toggleById(copy);
      return copy;
    });
  }

  function fitToNode(n) {
    const bbox = { x: n.drawX, y: n.drawY, w: 240, h: 160 };
    const el = containerRef.current;
    if (!el) return;
    const padding = 80;
    const kx = (el.clientWidth - padding) / bbox.w;
    const ky = (el.clientHeight - padding) / bbox.h;
    const k = clamp(0.5, 2.2, Math.min(kx, ky));
    const world = { x: bbox.x, y: bbox.y };
    const screen = { x: el.clientWidth / 2, y: el.clientHeight / 2 };
    const tx = screen.x - world.x * k;
    const ty = screen.y - world.y * k;
    setTransform({ x: tx, y: ty, k });
  }

  useEffect(() => {
    if (!filters.query) return;
    const n = filtered.find((n) => n.matches);
    if (n) {
      setFocusedId(n.id);
      fitToNode(n);
    }
  }, [filters.query]);

  // Compute department cluster boxes for each VP subtree
  const vpClusters = useMemo(() => {
    const map = new Map();
    const all = new Map(layout.nodes.map((n) => [n.id, n]));
    // VP nodes are children of root (CEO)
    root.children.forEach((vp) => {
      const layoutNode = all.get(vp.id);
      if (!layoutNode) return;
      // Build a temp structure that mirrors collapsed state
      function clone(n) {
        const ln = all.get(n.id);
        return {
          ...n,
          drawX: ln?.drawX ?? 0,
          drawY: ln?.drawY ?? 0,
          children: (n.children && !n.collapsed) ? n.children.map(clone) : [],
        };
      }
      const localRoot = clone(vp);
      const b = getSubtreeBounds(localRoot);
      map.set(vp.id, { dept: vp.dept, bounds: b });
    });
    return map;
  }, [layout, root]);

  return (
    <div ref={containerRef} className="relative h-[70vh] md:h-[78vh]">
      <svg width="100%" height="100%" className="block bg-white">
        <defs>
          {layout.nodes.map((n) => (
            <clipPath key={`clip-${n.id}`} id={`clip-${n.id}`}>
              <circle cx={40} cy={40} r={24} />
            </clipPath>
          ))}
        </defs>
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* Department clusters */}
          {[...vpClusters.entries()].map(([id, { dept, bounds }]) => {
            const c = DEPT_COLORS[dept] || { primary: "#94A3B8", tint: "#F1F5F9" };
            const w = bounds.maxX - bounds.minX;
            const h = bounds.maxY - bounds.minY;
            return (
              <g key={`cluster-${id}`}>
                <rect x={bounds.minX} y={bounds.minY} width={w} height={h} rx={16} fill={c.tint} stroke={c.primary} strokeOpacity={0.25} strokeWidth={1} />
                <text x={bounds.minX + 12} y={bounds.minY + 24} fontSize={12} fontWeight={600} fill={c.primary}>{dept}</text>
              </g>
            );
          })}

          {/* Links */}
          {links.map((l, i) => (
            <path key={i} d={linkPath(l.source, l.target)} fill="none" stroke="#CBD5E1" strokeWidth={1} />
          ))}

          {/* Nodes */}
          {filtered.map((n) => (
            <NodeCard key={n.id} n={n} onToggle={(node) => { setFocusedId(node.id); handleToggle(node); }} highlight={focusedId === n.id || n.matches} />
          ))}
        </g>
      </svg>
    </div>
  );
}

function linkPath(a, b) {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

function clamp(min, max, v) { return Math.max(min, Math.min(max, v)); }

function getMousePosition(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function screenToWorld(p, t) { return { x: (p.x - t.x) / t.k, y: (p.y - t.y) / t.k }; }
function worldToScreen(p, t) { return { x: p.x * t.k + t.x, y: p.y * t.k + t.y }; }
