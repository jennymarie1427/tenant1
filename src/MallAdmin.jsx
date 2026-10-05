//demo only, hardcoded data for mall admin dashboard

import { useEffect, useState } from "react";
import {
  LayoutDashboard, Store, FileText, Box, Handshake, Users, BarChart3,
  ChevronDown, Download, Calendar, Search, MapPin, Clock, TrendingUp, ArrowUp, ArrowDown, Bell, Building2, X,
} from "lucide-react";

/* helpers */

const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const today = () => new Date().toISOString().slice(0, 10);

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map(cell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, []);
  return mounted;
}

/* notifications */
function NotifItem({ n }) {
  return (
    <div className={`flex gap-4 px-5 py-4 ${n.unread ? "bg-blue-50" : "bg-white"}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
        <Building2 size={20} className="text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-gray-700"><b className="text-gray-900">{n.bold}</b> {n.text}</p>
        <p className={`mt-1 text-sm font-semibold ${n.unread ? "text-blue-600" : "text-gray-400"}`}>{n.t}</p>
      </div>
      <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${n.unread ? "bg-blue-600" : "border border-gray-200"}`} />
    </div>
  );
}

function NotifPanel({ items, onMarkAll, onClose }) {
  const [tab, setTab] = useState("All");
  const unread = items.filter((n) => n.unread).length;
  const shown = tab === "All" ? items : items.filter((n) => n.unread);
  const groups = [...new Set(shown.map((n) => n.g))];
  return (
    <div className="fixed inset-0 z-50 bg-sky-50">
      <button onClick={onClose} className="absolute right-8 top-8 text-gray-400"><X size={28} /></button>
      <div className="mx-auto h-full max-w-3xl overflow-y-auto border-x bg-slate-50 px-9 pt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold">Notifications</h2>
          <button onClick={onMarkAll} className="font-bold text-blue-600">Mark all as read</button>
        </div>
        <div className="mt-4 inline-flex rounded-lg border bg-white p-1 text-xs font-bold">
          {[["All", "All"], ["Unread", `Unread (${unread})`]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-md px-4 py-2 ${tab === k ? "bg-blue-600 text-white" : "text-gray-600"}`}>{l}</button>
          ))}
        </div>
        {shown.length === 0 && <p className="mt-10 text-center text-gray-400">You're all caught up.</p>}
        {groups.map((g) => (
          <div key={g} className="mt-8">
            <p className="mb-2 px-1 font-bold text-gray-600">{g}</p>
            <div className="divide-y overflow-hidden rounded-xl border">
              {shown.filter((n) => n.g === g).map((n, i) => <NotifItem key={i} n={n} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Notifications({ items: initial }) {
  const [items, setItems] = useState(initial);
  const [menu, setMenu] = useState(false);
  const [full, setFull] = useState(false);
  const unread = items.filter((n) => n.unread).length;
  const markAll = () => setItems(items.map((n) => ({ ...n, unread: false })));
  const preview = items.slice(0, 3);

  return (
    <>
      <div className="relative">
        <button onClick={() => setMenu(!menu)} className="relative text-gray-400" aria-label="Notifications">
          <Bell />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />}
        </button>
        {menu && (
          <div className="absolute right-0 top-10 z-40 w-80 overflow-hidden rounded-xl border bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 font-bold">
                Notifications {unread > 0 && <span className="rounded-full bg-blue-600 px-2 text-xs text-white">{unread}</span>}
              </span>
              <button onClick={markAll} className="text-xs font-bold text-blue-600">Mark all as read</button>
            </div>
            {preview.map((n, i) => (
              <div key={i} className={`flex gap-3 px-4 py-3 text-sm ${n.unread ? "bg-blue-50" : ""}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-blue-600" : "border"}`} />
                <div><b>{n.bold}</b> {n.text.split(".")[0]}.<p className="text-xs text-gray-400">{n.t}</p></div>
              </div>
            ))}
            <button onClick={() => { setMenu(false); setFull(true); }} className="w-full border-t bg-slate-50 py-3 font-bold text-blue-600">
              View All Notifications
            </button>
          </div>
        )}
      </div>
      {full && <NotifPanel items={items} onMarkAll={markAll} onClose={() => setFull(false)} />}
    </>
  );
}

/* data */
const NAV = [
  ["Dashboard", LayoutDashboard], ["Store Management", Store], ["Application", FileText],
  ["AR Development", Box], ["License", Handshake], ["Account Management", Users], ["Analytics", BarChart3],
];

const VISITS = [1250, 1400, 1580, 1420, 1680, 1880, 2100, 1950, 2250];
const VISIT_LABELS = ["Apr 1", "Apr 2", "Apr 3", "Apr 4", "Apr 5", "Apr 6", "Apr 7", "Apr 8", "Apr 9"];
const STORES = [["H&M", 175], ["McDonald's", 200], ["Uniqlo", 235], ["Watson's", 270], ["Nike Store", 300], ["Cafe Aroma", 350], ["TechZone", 395], ["Penshoppe", 460]];
const DESTS = [["1st Floor", 3250], ["2nd Floor", 2900], ["3rd Floor", 2450], ["Food Court", 2100], ["Cinema", 1850], ["Parking", 1650]];
const SESSION = [25, 32, 45, 52, 48, 58, 42, 28];
const SESSION_LABELS = ["10 AM", "12 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "10 PM"];
const USERS = [["New Users", 3840, "#2563eb"], ["Returning Users", 2456, "#10b981"], ["Frequent Users", 1234, "#f59e0b"]];

const NOTIFS = [
  { g: "Today", bold: "Your payment", text: "was confirmed. Your license is now active.", t: "2 minutes ago", unread: true },
  { g: "Today", bold: "Application update:", text: "revision requested on your store listing. Please review the notes.", t: "1 hour ago", unread: true },
  { g: "Today", bold: "Your license", text: "expires in 7 days. Please settle your renewal payment.", t: "3 hours ago", unread: true },
  { g: "Yesterday", bold: "Your AR map", text: "is ready for confirmation. You may now confirm it.", t: "Yesterday, 2:14 PM" },
  { g: "Yesterday", bold: "Your AR map", text: "was published and is now live. Contract period has started.", t: "Yesterday, 9:00 AM" },
];

/* chart helpers */
function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1},${c2},${p2}`;
  }
  return d;
}

function Frame({ ticks, max, height = "h-64", left = "w-10", children, xLabels, rotate }) {
  return (
    <div>
      <div className={`flex ${height}`}>
        <div className={`relative ${left} shrink-0 text-xs text-gray-500`}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-2 -translate-y-1/2" style={{ top: `${100 - (t / max) * 100}%` }}>{t}</span>
          ))}
        </div>
        <div className="relative flex-1 border-b border-l border-gray-300">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-dashed border-gray-200" style={{ top: `${100 - (t / max) * 100}%` }} />
          ))}
          {children}
        </div>
      </div>
      <div className={`flex ${rotate ? "h-14 items-start pt-2" : "pt-2"} text-xs text-gray-500`} style={{ marginLeft: left === "w-10" ? "2.5rem" : undefined }}>
        {xLabels.map((l) => (
          <span key={l} className={`flex-1 ${rotate ? "origin-top-right -rotate-45 whitespace-nowrap text-right" : "text-center"}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

const pos = (i, n, v, max) => [((i + 0.5) / n) * 100, 100 - (v / max) * 100];

/* cards */
function Panel({ title, sub, icon: I, className = "", children }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div><h3 className="font-semibold text-gray-900">{title}</h3><p className="text-xs text-gray-500">{sub}</p></div>
        <I size={20} className="text-gray-500" />
      </div>
      {children}
    </div>
  );
}

function Kpi({ icon: I, tint, value, label, change }) {
  const up = change >= 0;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}><I size={20} /></span>
        <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-500" : "text-red-500"}`}>
          {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(change)}%
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

/* charts */

const reveal = (on) => ({ clipPath: on ? "inset(-10% -3% -10% -3%)" : "inset(-10% 103% -10% -3%)" });

function AreaVisits() {
  const on = useMounted();
  const max = 2400, n = VISITS.length;
  const pts = VISITS.map((v, i) => [(i / (n - 1)) * 100, 100 - (v / max) * 100]);
  const line = smooth(pts);
  return (
    <Frame ticks={[0, 600, 1200, 1800, 2400]} max={max} xLabels={VISIT_LABELS}>
      <div className="absolute inset-0 transition-[clip-path] duration-[1400ms] ease-out" style={reveal(on)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L100,100 L0,100 Z`} fill="url(#visitFill)" />
          <path d={line} fill="none" stroke="#3b6ef0" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </Frame>
  );
}

function DotLine({ data, max, ticks, color, labels, rotate, height, smoothLine }) {
  const on = useMounted();
  const n = data.length;
  const pts = data.map((v, i) => pos(i, n, v, max));
  const d = smoothLine ? smooth(pts) : "M" + pts.map((p) => p.join(",")).join(" L");
  return (
    <Frame ticks={ticks} max={max} xLabels={labels} rotate={rotate} height={height}>
      <div className="absolute inset-0 transition-[clip-path] duration-[1400ms] ease-out" style={reveal(on)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <path d={d} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      {pts.map(([x, y], i) => (
        <span key={i} className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500"
          style={{ left: `${x}%`, top: `${y}%`, background: color, opacity: on ? 1 : 0, transitionDelay: `${(i / n) * 1200}ms` }} />
      ))}
    </Frame>
  );
}

function PurpleBars() {
  const on = useMounted();
  const max = 3400;
  return (
    <Frame ticks={[0, 850, 1700, 2550, 3400]} max={max} xLabels={DESTS.map((d) => d[0])} rotate height="h-56">
      <div className="absolute inset-0 flex items-end justify-around px-2">
        {DESTS.map(([l, v], i) => (
          <div key={l} title={`${l}: ${v}`} className="w-[11%] rounded-t-md bg-purple-600 transition-[height] duration-700 ease-out"
            style={{ height: on ? `${(v / max) * 100}%` : "0%", transitionDelay: `${i * 80}ms` }} />
        ))}
      </div>
    </Frame>
  );
}

function UserPie() {
  const on = useMounted();
  const total = USERS.reduce((s, u) => s + u[1], 0);
  const stops = USERS.reduce((result, [, value, color]) => {
    const start = result.total;
    const end = start + value;
    result.stops.push(`${color} ${(start / total) * 100}% ${(end / total) * 100}%`);
    return { total: end, stops: result.stops };
  }, { total: 0, stops: [] }).stops.join(", ");
  return (
    <>
      <div className="mx-auto my-4 h-44 w-44 rounded-full transition duration-700 ease-out"
        style={{ background: `conic-gradient(${stops})`, opacity: on ? 1 : 0, transform: on ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.6)" }} />
      <ul className="mt-6 space-y-2 text-sm">
        {USERS.map(([l, v, c]) => (
          <li key={l} className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            <span className="flex-1 text-gray-600">{l}</span>
            <span className="font-semibold">{v.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* page */
function MallAnalytics() {
  const on = useMounted();
  const [range, setRange] = useState("Last 7 Days");
  const exportCsv = () => downloadCsv(`south-town-centre-analytics-${today()}.csv`, [
    ["South Town Centre - Analytics Report"], ["Period", range], ["Exported", new Date().toLocaleString()], [],
    ["Summary"], ["Total User Visits", "16,450", "+12.5%"], ["Repeated Users", "3,690", "+8.2%"],
    ["Avg Session Duration", "42 min", "-3.1%"], ["Top Destination", "1st Floor", "+15.8%"], [],
    ["Daily Visits"], ["Date", "Visits"], ...VISIT_LABELS.map((l, i) => [l, VISITS[i]]), [],
    ["Most Searched Stores"], ["Store", "Searches"], ...STORES, [],
    ["Popular Destinations"], ["Destination", "Visitors"], ...DESTS, [],
    ["Session Duration by Hour"], ["Time", "Avg minutes"], ...SESSION_LABELS.map((l, i) => [l, SESSION[i]]), [],
    ["User Distribution"], ["Type", "Users"], ...USERS.map(([l, v]) => [l, v]),
  ]);
  return (
    <div className={`transition duration-500 ${on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-gray-500">Real-time insights into platform usage and visitor behavior</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={range} onChange={(e) => setRange(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-600 outline-none">
              {["Last 7 Days", "Last 14 Days", "Last 30 Days"].map((r) => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-gray-500" />
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-5">
        <Kpi icon={Users} tint="bg-blue-100 text-blue-500" value="16,450" label="Total User Visits" change={12.5} />
        <Kpi icon={TrendingUp} tint="bg-emerald-100 text-emerald-500" value="3,690" label="Repeated Users" change={8.2} />
        <Kpi icon={Clock} tint="bg-amber-100 text-amber-500" value="42 min" label="Avg Session Duration" change={-3.1} />
        <Kpi icon={MapPin} tint="bg-purple-100 text-purple-500" value="1st Floor" label="Top Destination" change={15.8} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-5">
        <Panel title="Total User Visits" sub="Daily visitor trends" icon={Calendar}><AreaVisits /></Panel>
        <Panel title="Most Searched Stores" sub="Top 8 store searches" icon={Search}>
          <DotLine data={STORES.map((s) => s[1])} max={600} ticks={[0, 150, 300, 450, 600]} color="#10b981" labels={STORES.map((s) => s[0])} rotate height="h-56" />
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Panel title="Popular Destinations" sub="By visitor count" icon={MapPin}><PurpleBars /></Panel>
        <Panel title="Session Duration" sub="Avg time by hour" icon={Clock}>
          <DotLine data={SESSION} max={60} ticks={[0, 15, 30, 45, 60]} color="#f59e0b" labels={SESSION_LABELS} height="h-56" smoothLine />
        </Panel>
        <Panel title="User Distribution" sub="By user type" icon={Users}><UserPie /></Panel>
      </div>
    </div>
  );
}

/* mall admin shell */
export default function MallAdmin({ onLogout, profile }) {
  const [page, setPage] = useState("Analytics");
  const [userMenu, setUserMenu] = useState(false);
  const Icon = NAV.find((n) => n[0] === page)?.[1] ?? LayoutDashboard;
  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-900">
      <aside className="sticky top-0 h-screen w-64 shrink-0 bg-sky-100/70 px-3 pt-4">
        <img src="/navar-logo.png" alt="NavAR" className="mb-8 ml-3 h-11 w-auto" />
        <p className="mb-2 px-3 text-sm text-gray-500">MENU</p>
        <nav className="space-y-1">
          {NAV.map(([name, I]) => (
            <button key={name} onClick={() => setPage(name)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${page === name ? "bg-sky-200/80 font-medium text-blue-700" : "text-gray-400 hover:bg-sky-100"}`}>
              <I size={18} /> {name}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex h-20 items-center justify-between border-b bg-white/60 px-8">
          <div className="flex items-center gap-3 text-xl text-gray-500"><Icon size={30} /> {page}</div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-3">
                <img src="/mall-logo.png" alt="" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-xl font-semibold uppercase tracking-wide text-slate-800" style={{ fontVariant: "small-caps" }}>{profile?.name}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {userMenu && (
                <div className="absolute right-0 top-12 z-40 w-40 overflow-hidden rounded-lg border bg-white text-sm font-medium shadow-lg">
                  <button onClick={() => onLogout?.()} className="w-full px-4 py-3 text-left hover:bg-slate-50">Logout</button>
                </div>
              )}
            </div>
            <Notifications items={NOTIFS} />
          </div>
        </header>
        <main className="px-8 py-7">
          {page === "Analytics" ? <MallAnalytics /> : <p className="text-gray-400">This page is not built yet.</p>}
        </main>
      </div>
    </div>
  );
}