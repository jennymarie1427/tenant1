// demo only, hardcoded data for super admin dashboard

import { useEffect, useState } from "react";
import {
  LayoutDashboard, Building2, FileText, Box, Users, Handshake, BarChart3,
  Mail, Settings, ListChecks, ChevronDown, X, Calendar, Send, Bell,
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
  ["Dashboard", LayoutDashboard], ["Mall Management", Building2],
  ["Application Management", FileText], ["AR Development", Box],
  ["Account Management", Users], ["License Management", Handshake],
  ["Analytics", BarChart3], ["Email Logs", Mail],
  ["System Settings", Settings], ["Audit Logs", ListChecks],
];

const EMAILS = [
  { id: 1, type: "Payment Reminder", mall: "Gaisano Grand Mall", to: "admin@gaisano.ph", at: "March 12, 2026, 10:15 AM", status: "Failed", by: "System (automated)", subject: "[NavAR] Payment reminder", error: "Mailbox unavailable (recipient address rejected)", body: "Dear Gaisano Grand Mall Admin,\n\nThis is a reminder that your NavAR payment is due soon. Please submit your proof of payment.\n\n— The NavAR Team" },
  { id: 2, type: "Suspension Lifted", mall: "Ayala Malls Central Block", to: "admin@ayalachbc.ph", at: "March 10, 2026, 2:00 PM", status: "Delivered", by: "System (automated)", subject: "[NavAR] Your service has been restored", body: "Dear Ayala Malls Central Bloc Admin,\n\nYour NavAR service has been restored. AR navigation is now accessible to users again.\n\nContract End: August 1, 2026 (unchanged).\n\n— The NavAR Team" },
  { id: 3, type: "Contract Expiry Reminder", mall: "Pacific Mall Cebu", to: "admin@pacificmall.ph", at: "March 6, 2026, 8:00 AM", status: "Delivered", by: "System (automated)", subject: "[NavAR] Your contract expires soon", body: "Dear Pacific Mall Cebu Admin,\n\nYour contract will expire soon. Please settle your renewal payment.\n\n— The NavAR Team" },
  { id: 4, type: "Map Ready for Confirmation", mall: "SM Seaside City Cebu", to: "jdelacruz@smseaside.ph", at: "November 20, 2025, 8:00 AM", status: "Delivered", by: "Juan dela Cruz", subject: "[NavAR] Your AR map is ready", body: "Dear SM Seaside City Cebu Admin,\n\nYour AR map is ready for confirmation.\n\n— The NavAR Team" },
];

const AUDITS = [
  { at: "March 14, 2026 at 9:02 AM", admin: "Juan dela Cruz", module: "License Management", action: "Suspended Mall", title: "Suspended mall", target: "Parkmall Cebu", details: "Reason: Non-payment. Grace period ended Feb 22, 2026.\nReinstatement fee: ₱18,000." },
  { at: "March 13, 2026 at 2:30 PM", admin: "Bea Delicious", module: "Application Management", action: "Requested revision", title: "Requested revision", target: "SM City Consolacion Cebu", details: "Revision requested on submitted application." },
  { at: "February 20, 2026 at 8:05 AM", admin: "System (automated)", module: "License Management", action: "Entered grace period", title: "Entered grace period", target: "Robinsons Galleria Cebu", details: "Contract expired. Grace period started." },
];

const NOTIFS = [
  { g: "Today", bold: "Parkmall Cebu", text: "submitted proof of payment. Please verify and confirm in License Management.", t: "2 minutes ago", unread: true },
  { g: "Today", bold: "SM City Consolacion Cebu", text: "resubmitted their application after revision. Ready for your review.", t: "1 hour ago", unread: true },
  { g: "Today", bold: "Robinsons Galleria Cebu", text: "contract expires in 7 days. Consider following up on payment.", t: "3 hours ago", unread: true },
  { g: "Yesterday", bold: "Gaisano Grand Mall", text: "confirmed their AR map. You may now set the map to Live.", t: "Yesterday, 2:14 PM" },
  { g: "Yesterday", bold: "SM Seaside City Cebu", text: "AR map was published and is now live. Contract period has started.", t: "Yesterday, 9:00 AM" },
];

const MALLS = [
  ["SM Seaside City Cebu", "Cebu City", "Active", "13,849", "3,235", 3, "₱120,000", "Food Court"],
  ["Pacific Mall Cebu", "Mandaue City", "Active", "6,912", "1,662", 2, "₱80,000", "Cinema"],
  ["Gaisano Grand Mall", "Cebu City", "Active", "5,637", "1,301", -2, "₱75,000", "ATM"],
  ["Robinsons Galleria Cebu", "Cebu City", "Grace", "10,125", "2,389", -2, "₱150,000", "Supermarket"],
  ["Ayala Center Cebu", "Cebu City", "Active", "10,095", "2,448", 2, "₱110,000", "Food Hall"],
  ["SM City Consolacion Cebu", "Consolacion", "Active", "7,971", "1,901", -1, "₱100,000", "Food Court"],
];

const STORES = [
  ["SM Supermarket", "SM Seaside City Cebu", 1240], ["Ayala Food Hall", "Ayala Center Cebu", 1050],
  ["SM Supermarket", "SM City Consolacion Cebu", 890], ["Timezone", "SM Seaside City Cebu", 780],
  ["Coffee Bean & Tea Leaf", "Ayala Center Cebu", 640],
];

const DESTS = [["Food Court", 4820], ["Restroom", 3910], ["Cinema", 3540], ["Information Desk", 2760], ["ATM", 2480], ["Supermarket", 2200], ["Parking Entrance", 1980], ["Pharmacy", 1640]];
const PEAK = [120, 320, 520, 760, 920, 1060, 1000, 900, 1020, 1200, 1250, 1100, 700, 350, 150];
const MALL_BARS = [["SM Seaside", 13849, "#2563eb"], ["Pacific", 6912, "#16a34a"], ["Gaisano", 5637, "#d97706"], ["Galleria", 10125, "#7c3aed"], ["Ayala", 10095, "#0d9488"], ["Consol", 7971, "#dc2626"]];
const MONTHLY = [40, 44, 58, 60, 68, 66, 68, 66, 66, 70, 82, 85, 85];
const SESSIONS = [1500, 1600, 2600, 2650, 1700, 1550, 1600, 1500, 1700, 2800, 2600, 1650, 1600, 1600, 1550, 2750, 2600, 1600, 1650, 1600, 1600, 2800, 2700, 1600, 1650, 1600];

/* small pieces */
const tone = {
  blue: "border-blue-400 text-blue-600", green: "border-green-400 text-green-600",
  orange: "border-orange-400 text-orange-600", purple: "border-purple-400 text-purple-600",
};

function StatBox({ n, label, c }) {
  return (
    <div className={`rounded-md border bg-white px-6 py-4 ${tone[c]}`}>
      <div className="text-4xl font-bold">{n}</div>
      <div className="text-xl">{label}</div>
    </div>
  );
}

function PageTitle({ title, sub }) {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold text-black">{title}</h1>
      <p className="mt-1 font-mono text-sm text-gray-500">{sub}</p>
    </div>
  );
}

function Toolbar({ filters, count }) {
  return (
    <div className="flex items-center gap-3 p-5">
      <input className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500" placeholder="Search" />
      {filters.map((f) => (
        <select key={f} className="rounded-md border border-gray-300 px-3 py-2 text-xs">
          <option>{f}</option>
        </select>
      ))}
      <span className="whitespace-nowrap text-gray-400">{count} results</span>
    </div>
  );
}

function Modal({ children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-xl"} rounded-2xl bg-white shadow-xl`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>
);

/* pages */
const nowLabel = () =>
  new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).replace(" at ", ", ");

function EmailLogs() {
  const [emails, setEmails] = useState(EMAILS);
  const [openId, setOpenId] = useState(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [type, setType] = useState("All Email Types");

  const failed = emails.filter((e) => e.status === "Failed").length;
  const types = [...new Set(emails.map((e) => e.type))];
  const shown = emails.filter((e) =>
    (status === "All Statuses" || e.status === status) &&
    (type === "All Email Types" || e.type === type) &&
    `${e.type} ${e.mall} ${e.to}`.toLowerCase().includes(q.toLowerCase()));
  const current = emails.find((e) => e.id === openId);

  // Demo resend: marks the email as delivered. Replace the timeout with a call to your backend.
  const resend = (id) => {
    const target = emails.find((e) => e.id === id);
    setSending(true);
    setTimeout(() => {
      setEmails((list) => list.map((e) => (e.id === id ? { ...e, status: "Delivered", error: null, at: nowLabel(), by: "Juan dela Cruz (manual resend)" } : e)));
      setSending(false);
      setToast(`Email resent to ${target.to}`);
      setTimeout(() => setToast(""), 3000);
    }, 900);
  };

  const badge = "rounded-full px-3 py-1 ring-1";
  return (
    <>
      <PageTitle title="Email Logs" sub="All system-triggered and manually-sent emails · Failed emails can be resent" />
      <div className="mb-5 grid grid-cols-4 gap-4">
        <StatBox n="18" label="Total Sent" c="blue" />
        <StatBox n={String(18 - failed)} label="Delivered" c="green" />
        <StatBox n={String(failed)} label="Need Attention" c="orange" />
        <StatBox n="11" label="Automated triggers" c="purple" />
      </div>
      {failed > 0 && (
        <div className="mb-5 border-l-4 border-orange-500 bg-white px-4 py-3 text-sm font-semibold text-orange-500">
          {failed} email{failed > 1 ? "s" : ""} failed to deliver. Click the row to view details and resend
        </div>
      )}
      <div className="min-h-[28rem] rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center gap-3 p-5">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500" placeholder="Search" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-xs">
            <option>All Statuses</option><option>Delivered</option><option>Failed</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-xs">
            <option>All Email Types</option>{types.map((x) => <option key={x}>{x}</option>)}
          </select>
          <span className="whitespace-nowrap text-gray-400">{shown.length} results</span>
        </div>
        <table className="w-full text-left">
          <thead className="text-gray-500">
            <tr>{["Email type", "Mall", "Recipient", "Sent at", "Status"].map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.map((e) => (
              <tr key={e.id} onClick={() => setOpenId(e.id)} className="cursor-pointer hover:bg-blue-50/50">
                <td className="px-5 py-3">{e.type}</td><td className="px-5 py-3">{e.mall}</td>
                <td className="px-5 py-3">{e.to}</td><td className="px-5 py-3">{e.at}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.status === "Failed" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{e.status}</span>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No emails match your search.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm italic text-gray-400">Click any row to view the full email that was sent.</p>

      {current && (
        <Modal wide onClose={() => !sending && setOpenId(null)}>
          <div className="flex items-start justify-between border-b p-5">
            <div><h2 className="text-xl font-bold">Email Details</h2><p className="text-sm text-gray-400">{current.mall}</p></div>
            <button onClick={() => setOpenId(null)}><X className="text-gray-400" /></button>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className={`${badge} bg-blue-50 text-blue-700 ring-blue-200`}>{current.type}</span>
              <span className={`${badge} ${current.status === "Failed" ? "bg-red-50 text-red-600 ring-red-200" : "bg-green-50 text-green-700 ring-green-200"}`}>
                {current.status === "Failed" ? "✕ Failed" : "✓ Delivered"}
              </span>
              <span className={`${badge} bg-teal-50 text-teal-700 ring-teal-200`}>{current.by.startsWith("System") ? "System-triggered" : "Manually sent"}</span>
            </div>
            {current.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">Delivery failed: {current.error}</div>}
            <dl className="divide-y rounded-lg bg-gray-50 px-4 text-sm">
              {[["To", current.to], ["Mall", current.mall], ["Subject", current.subject], ["Sent At", current.at], ["Triggered By", current.by]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2"><dt className="text-gray-400">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
            </dl>
            <div>
              <p className="mb-2 text-xs font-bold text-gray-400">EMAIL BODY ({current.status === "Failed" ? "NOT DELIVERED" : "SENT"})</p>
              <pre className="whitespace-pre-wrap rounded-lg border bg-gray-50 p-4 font-sans text-gray-700">{current.body}</pre>
            </div>
          </div>
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-xs text-gray-400">Resending sends a new copy to {current.to}.</p>
            <div className="flex gap-2">
              <button onClick={() => setOpenId(null)} disabled={sending} className="rounded-md border px-5 py-2 font-medium">Close</button>
              <button onClick={() => resend(current.id)} disabled={sending}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 font-medium text-white disabled:opacity-60">
                <Send size={16} />{sending ? "Sending..." : "Resend Email"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {toast && <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-slate-800 px-5 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </>
  );
}

function AuditLogs() {
  const [open, setOpen] = useState(null);
  return (
    <>
      <PageTitle title="Audit Logs" sub="Record of all actions performed by super admins across the system." />
      <div className="mb-5 grid grid-cols-4 gap-4">
        <StatBox n="25" label="Total Actions" c="blue" />
        <StatBox n="8" label="This Week" c="green" />
        <StatBox n="3" label="Admins Active" c="orange" />
        <StatBox n="1" label="System Actions" c="purple" />
      </div>
      <div className="min-h-[28rem] rounded-2xl border border-gray-100 bg-white">
        <Toolbar filters={["All Modules", "All Admins"]} count={18} />
        <table className="w-full text-left">
          <thead className="border-y text-gray-500">
            <tr>{["Timestamp", "Admin", "Module", "Action"].map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}</tr>
          </thead>
          <tbody>
            {AUDITS.map((a) => (
              <tr key={a.at} onClick={() => setOpen(a)} className="cursor-pointer hover:bg-blue-50/50">
                <td className="px-5 py-3">{a.at}</td><td className="px-5 py-3">{a.admin}</td>
                <td className="px-5 py-3">{a.module}</td><td className="px-5 py-3">{a.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm italic text-gray-400">Click any row to view full details.</p>

      {open && (
        <Modal onClose={() => setOpen(null)}>
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 className="text-xl font-bold">{open.title}</h2>
              <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">{open.module}</span>
            </div>
            <button onClick={() => setOpen(null)}><X className="text-gray-400" /></button>
          </div>
          <div className="border-t px-6 py-4 text-sm">
            {[["When", open.at], ["Admin", open.admin], ["Module", open.module], ["Target", open.target]].map(([k, v]) => (
              <div key={k} className="flex border-b py-2 last:border-0"><span className="w-24 text-gray-400">{k}</span><span className="font-semibold">{v}</span></div>
            ))}
            <p className="mb-2 mt-4 text-xs font-bold text-gray-400">DETAILS</p>
            <pre className="whitespace-pre-wrap rounded-lg border bg-gray-50 p-4 font-sans text-gray-600">{open.details}</pre>
          </div>
          <div className="flex justify-end border-t p-4">
            <button onClick={() => setOpen(null)} className="rounded-md border px-5 py-2 font-medium">Close</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function LineChart({ data, h = 200 }) {
  const on = useMounted();
  const w = 900, max = 2800;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    // the line is revealed from left to right
    <div className="transition-[clip-path] duration-[1400ms] ease-out" style={{ clipPath: on ? "inset(-5% -2% -5% -2%)" : "inset(-5% 102% -5% -2%)" }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-52 w-full" preserveAspectRatio="none">
        {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2={w} y1={(h / 4) * i} y2={(h / 4) * i} stroke="#eee" strokeDasharray="4" />)}
        <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Bars({ values, colors, h = "h-44", highlight }) {
  const on = useMounted();
  const max = Math.max(...values);
  return (
    <div className={`flex ${h} items-end gap-2`}>
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t transition-[height] duration-700 ease-out"
          style={{ height: on ? `${(v / max) * 100}%` : "0%", transitionDelay: `${i * 50}ms`, background: colors?.[i] || (i === highlight ? "#f59e0b" : "#bfdbfe") }} />
      ))}
    </div>
  );
}

function Meter({ label, value, max, color = "bg-blue-600", sub, delay = 0 }) {
  const on = useMounted();
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm"><span>{label}</span><span className="font-mono text-gray-600">{value.toLocaleString()}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-gray-100"><div className={`h-full rounded-full ${color}`} style={{ width: on ? `${(value / max) * 100}%` : "0%", transition: "width 700ms ease-out", transitionDelay: `${delay}ms` }} /></div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function KPI({ label, value, note, color }) {
  return (
    <Card className="!p-5">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400">{note}</p>
    </Card>
  );
}

function Analytics() {
  const on = useMounted();
  const [range, setRange] = useState("30 days");
  const [metric, setMetric] = useState("Sessions");
  const exportCsv = () => downloadCsv(`navar-analytics-${today()}.csv`, [
    ["NavAR Analytics Report (Super Admin)"], ["Period", "Mar 13, 2025 - Mar 13, 2026"], ["Exported", new Date().toLocaleString()], [],
    ["Summary"], ["Sessions (last 7d)", "12,936"], ["Sessions (last 30d)", "54,589"], ["Active Malls", 5], ["Peak Hour", "5PM"],
    ["Annual Revenue", "₱635,000"], ["Top Mall (30d)", "SM Seaside City"], ["Top Destination", "Food Court"], ["Avg Session Duration", "4m 32s"], [],
    ["Mall Breakdown"], ["Mall", "City", "Status", "Sessions (30d)", "Last 7d", "vs Prev 7d", "Annual Fee", "Top Destination"],
    ...MALLS.map((m) => [m[0], m[1], m[2], m[3], m[4], `${m[5] > 0 ? "+" : ""}${m[5]}%`, m[6], m[7]]), [],
    ["Top Destinations"], ["Destination", "Navigations"], ...DESTS, [],
    ["User Type (30d)"], ["Type", "Users"], ["New Users", 10847], ["Returning Users", 5103], [],
    ["Top Stores by Navigation"], ["Store", "Mall", "Navigations"], ...STORES,
  ]);
  return (
    <div className={`transition duration-500 ${on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
      <div className="mb-6 flex items-start justify-between">
        <PageTitle title="Analytics" sub="Provides insights through data visualization, reports, and performance metrics to support decision-making." />
        <div className="flex flex-col items-end gap-3">
          <span className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs text-gray-500"><Calendar size={14} /> Mar 13, 2025 – Mar 13, 2026</span>
          <button onClick={exportCsv} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-bold text-white">Export</button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4">
        <KPI label="Sessions (last 7d)" value="12,936" note="Across all active malls" color="text-blue-600" />
        <KPI label="Sessions (last 30d)" value="54,589" note="Avg 10,918 per mall" color="text-teal-600" />
        <KPI label="Active malls" value="5" note="0 in setup" color="text-teal-600" />
        <KPI label="Peak hour" value="5PM" note="Highest navigation traffic" color="text-purple-600" />
        <KPI label="Annual revenue" value="₱635,000" note="Active contracts only" color="text-green-600" />
        <KPI label="Top mall (30d)" value="SM Seaside City" note="13,849 sessions" color="text-orange-600" />
        <KPI label="Top destination" value="Food Court" note="4,820 navigations" color="text-blue-600" />
        <KPI label="Avg session duration" value="4m 32s" note="Per navigation session" color="text-purple-600" />
      </div>

      <Card className="mb-4">
        <div className="mb-2 flex items-start justify-between">
          <div><h3 className="font-semibold">Sessions Over Time</h3><p className="text-xs text-gray-400">Total navigation sessions per day across all active malls</p></div>
          <div className="flex gap-2 text-xs">
            {["7 days", "14 days", "30 days"].map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-md border px-3 py-1 font-semibold ${range === r ? "border-blue-600 bg-blue-600 text-white" : "bg-white text-gray-600"}`}>{r}</button>
            ))}
          </div>
        </div>
        <LineChart key={range} data={range === "7 days" ? SESSIONS.slice(-7) : range === "14 days" ? SESSIONS.slice(-14) : SESSIONS} />
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <Card>
          <div className="mb-4 flex justify-between">
            <div><h3 className="font-semibold">Mall Performance</h3><p className="text-xs text-gray-400">Sessions last 30 days per mall</p></div>
            <div className="flex gap-1 text-xs">
              {["Sessions", "Revenue"].map((m) => (
                <button key={m} onClick={() => setMetric(m)} className={`h-7 rounded border px-3 font-semibold ${metric === m ? "bg-blue-600 text-white" : ""}`}>{m}</button>
              ))}
            </div>
          </div>
          <Bars values={MALL_BARS.map((m) => m[1])} colors={MALL_BARS.map((m) => m[2])} h="h-40" />
          <div className="mt-2 flex gap-2 text-center text-[10px] text-gray-400">{MALL_BARS.map((m) => <span key={m[0]} className="flex-1">{m[0]}</span>)}</div>
        </Card>
        <Card>
          <h3 className="font-semibold">Peak Hours</h3><p className="mb-4 text-xs text-gray-400">Average sessions by hour of day</p>
          <Bars values={PEAK} highlight={10} h="h-40" />
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">{["7AM", "9AM", "11AM", "1PM", "3PM", "5PM", "7PM", "9PM"].map((t) => <span key={t}>{t}</span>)}</div>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-[1.4fr_1fr_1.2fr] gap-4">
        <Card>
          <h3 className="text-center font-semibold">Top Destinations</h3>
          <p className="mb-4 text-center text-xs text-gray-400">Most navigated destination types (all malls)</p>
          {DESTS.map(([l, v], i) => <Meter key={l} label={l} value={v} max={4820} delay={i * 60} color={i < 3 ? (i ? "bg-teal-600" : "bg-blue-600") : "bg-blue-200"} />)}
        </Card>
        <Card>
          <h3 className="text-center font-semibold">User Type</h3>
          <p className="mb-4 text-center text-xs text-gray-400">First-time vs returning users (30d)</p>
          <Meter label="New Users" value={10847} max={15950} /><Meter label="Returning Users" value={5103} max={15950} color="bg-teal-600" />
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-center"><p className="text-xs text-gray-400">Total Unique Users (30d)</p><p className="font-mono text-2xl font-bold">15,950</p></div>
        </Card>
        <Card>
          <h3 className="text-center font-semibold">Monthly Revenue</h3>
          <p className="mb-4 text-center text-xs text-gray-400">Total confirmed payments received per month</p>
          <Bars values={MONTHLY} colors={MONTHLY.map(() => "#16a34a")} h="h-40" />
          <div className="mt-2 flex justify-between text-[10px] text-gray-400"><span>Apr '25</span><span>Jul '25</span><span>Oct '25</span><span>Jan '26</span></div>
        </Card>
      </div>

      <Card className="mb-4">
        <h3 className="text-center font-semibold">Mall Breakdown</h3>
        <p className="mb-4 text-center text-xs text-gray-400">Detailed performance per mall — last 30 days</p>
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>{["Mall", "City", "Status", "Sessions (30d)", "Last 7d", "vs prev 7d", "Annual fee", "Top destination"].map((h) => <th key={h} className="py-2 font-normal">{h}</th>)}</tr>
          </thead>
          <tbody>
            {MALLS.map((m) => (
              <tr key={m[0]} className="border-b last:border-0 even:bg-gray-50">
                <td className="py-3 font-medium">{m[0]}</td><td>{m[1]}</td>
                <td><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m[2] === "Active" ? "bg-green-50 text-green-600 ring-1 ring-green-200" : "bg-orange-50 text-orange-500 ring-1 ring-orange-200"}`}>{m[2]}</span></td>
                <td className="font-mono">{m[3]}</td><td className="font-mono">{m[4]}</td>
                <td><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m[5] > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{m[5] > 0 ? "↑" : "↓"} {Math.abs(m[5])}%</span></td>
                <td className="font-mono font-semibold text-green-600">{m[6]}</td><td>{m[7]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="text-center font-semibold">Top Stores by Navigation</h3>
        <p className="mb-4 text-center text-xs text-gray-400">Most navigated individual stores across all malls</p>
        {STORES.map(([n, m, v], i) => (
          <div key={i} className="flex items-center gap-4 border-b py-3 last:border-0">
            <span className="flex h-8 w-8 items-center justify-center rounded border border-blue-200 bg-blue-50 text-sm text-blue-600">{i + 1}</span>
            <div className="flex-1"><p className="font-medium">{n}</p><p className="text-xs text-gray-400">{m}</p></div>
            <div className="w-40"><p className="text-right font-mono text-sm text-blue-600">{v.toLocaleString()}</p><div className="h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-600" style={{ width: on ? `${(v / 1240) * 100}%` : "0%", transition: "width 700ms ease-out", transitionDelay: `${i * 80}ms` }} /></div></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* shell */
export default function SuperAdmin({ onLogout, profile }) {
  const [page, setPage] = useState("Analytics");
  const [userMenu, setUserMenu] = useState(false);
  const Icon = NAV.find((n) => n[0] === page)?.[1] ?? LayoutDashboard;
  const body = { Analytics: <Analytics />, "Email Logs": <EmailLogs />, "Audit Logs": <AuditLogs /> }[page]
    ?? <p className="text-gray-400">This page is not built yet.</p>;

  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-900">
      <aside className="sticky top-0 h-screen w-72 shrink-0 border-r bg-sky-100/70 px-5 pt-5">
        <img src="/navar-logo.png" alt="NavAR" className="mb-8 ml-2 h-11 w-auto" />
        <p className="mb-3 px-3 text-gray-500">MENU</p>
        <nav className="space-y-1">
          {NAV.map(([name, I]) => (
            <button key={name} onClick={() => setPage(name)}
              className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left ${page === name ? "bg-sky-200/70 text-blue-700" : "text-gray-500 hover:bg-sky-100"}`}>
              <I size={22} /> {name}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex h-24 items-center justify-between border-b bg-white/60 px-10">
          <div className="flex items-center gap-4 text-2xl text-gray-500"><Icon size={34} /> {page}</div>
          <div className="flex items-center gap-8">
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-3 font-medium">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xl">🍔</span>
                {profile?.name} <ChevronDown size={18} />
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
        <main className="px-10 py-8">{body}</main>
      </div>

    </div>
  );
}