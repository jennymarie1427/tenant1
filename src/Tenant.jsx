import { useEffect, useState } from "react";
import {
  LayoutDashboard, Store, Tag, BarChart3, ChevronDown, ChevronUp, Settings, LogOut, Save,
  Eye, EyeOff, Power, Pencil, Trash2, Plus, Upload, Download, Check, X,
  ArrowUp, ArrowRight,
} from "lucide-react";
import { changePassword, updateTenantProfile } from "./lib/appData";

const BLUE = "bg-[#5094fb]";
const NAV = [["Dashboard", LayoutDashboard], ["Store Profile", Store], ["Promotions", Tag], ["Analytics", BarChart3]];

/* csv helper */

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

/* small shared bits */
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white ${className}`}>{children}</div>
);

const Btn = ({ children, onClick, ghost, className = "" }) => (
  <button onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 font-medium ${ghost ? "border border-gray-300 bg-white text-gray-900" : `${BLUE} text-white`} ${className}`}>
    {children}
  </button>
);

function Field({ label, className = "", type = "text", ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block font-medium">{label}</span>
      <input type={type} {...rest} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-blue-400" />
    </label>
  );
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <label className="relative mb-5 block">
      <span className="mb-2 block font-medium">{label}</span>
      <input type={show ? "text" : "password"} value={value} onChange={onChange} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-11 outline-none focus:border-blue-400" />
      <button type="button" onClick={() => setShow(!show)} className="absolute bottom-3 right-4 text-gray-400">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </label>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-[#5094fb]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

const Logo = ({ src = "/store-logo.png", size = "h-24 w-24" }) => (
  <img src={src} alt="Store logo" className={`${size} shrink-0 rounded-2xl object-cover`} />
);

function LogoButton({ setLogo, children }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium">
      {children}
      <input type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogo(URL.createObjectURL(f)); }} />
    </label>
  );
}

const TITLE_ICONS = { Dashboard: LayoutDashboard, "Store Profile": Store, Promotions: Tag, Analytics: BarChart3, "Profile Settings": Settings };

const Head = ({ title, sub, right }) => {
  const I = TITLE_ICONS[title];
  return (
    <div className="mb-6 flex items-start justify-between">
      <div className="flex items-start gap-4">
        {I && <I size={34} className="mt-0.5 text-[#5094fb]" />}
        <div><h1 className="text-3xl font-medium">{title}</h1>{sub && <p className="mt-2 text-gray-500">{sub}</p>}</div>
      </div>
      {right}
    </div>
  );
};

const SectionHeading = ({ children }) => <h3 className="mb-4 mt-8 text-xl">{children}</h3>;

/* charts */
function smooth(pts) {
  let d = `M${pts[0]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${[p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]},${[p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]},${p2}`;
  }
  return d;
}

function Frame({ ticks, max, labels, h = "h-64", children, legend }) {
  return (
    <div>
      <div className={`flex ${h}`}>
        <div className="relative w-12 shrink-0 text-sm text-gray-500">
          {ticks.map((t) => <span key={t} className="absolute right-2 -translate-y-1/2" style={{ top: `${100 - (t / max) * 100}%` }}>{t}</span>)}
        </div>
        <div className="relative flex-1 border-b border-l border-gray-400">
          {ticks.map((t) => <div key={t} className="absolute inset-x-0 border-t border-dashed border-gray-100" style={{ top: `${100 - (t / max) * 100}%` }} />)}
          {children}
        </div>
      </div>
      <div className="ml-12 flex pt-2 text-sm text-gray-500">{labels.map((l) => <span key={l} className="flex-1 text-center">{l}</span>)}</div>
      {legend}
    </div>
  );
}

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => { const id = setTimeout(() => setM(true), 30); return () => clearTimeout(id); }, []);
  return m;
}

const Tip = ({ children }) => (
  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block">
    {children}
  </span>
);

const Bar = ({ value, max, on, delay = 0, color = "bg-[#5094fb]", width = "w-4/5", tip }) => (
  <div className={`group relative ${width} rounded-t-md ${color} transition-[height] duration-700 ease-out`}
    style={{ height: on ? `${(value / max) * 100}%` : "0%", transitionDelay: `${delay}ms` }}>
    <Tip>{tip}</Tip>
  </div>
);

function LineDots({ data, max, ticks, labels, unit = "visits" }) {
  const on = useMounted();
  if (!data?.length) return <p className="py-10 text-center text-sm text-gray-400">No data available.</p>;
  const n = data.length;
  const pts = data.map((v, i) => [(i / (n - 1)) * 100, 100 - (v / max) * 100]);
  return (
    <Frame ticks={ticks} max={max} labels={labels}>
      <div className="absolute inset-0 transition-[clip-path] duration-[1200ms] ease-out"
        style={{ clipPath: on ? "inset(-10% -5% -10% -5%)" : "inset(-10% 105% -10% -5%)" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <path d={smooth(pts)} fill="none" stroke="#5094fb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      {pts.map(([x, y], i) => (
        <span key={i} className={`group absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}
          style={{ left: `${x}%`, top: `${y}%`, transitionDelay: `${(i / n) * 1000}ms` }}>
          <span className="h-2.5 w-2.5 rounded-full bg-[#5094fb] transition-transform group-hover:scale-150" />
          <Tip>{labels[i]}: {data[i].toLocaleString()} {unit}</Tip>
        </span>
      ))}
    </Frame>
  );
}

function Pie({ slices }) {
  const on = useMounted();
  const [hover, setHover] = useState(null);
  const total = slices.reduce((s, x) => s + x[1], 0);
  const stops = slices.reduce((result, [, value, color]) => {
    const start = result.total;
    const end = start + value;
    result.stops.push(`${color} ${(start / total) * 100}% ${(end / total) * 100}%`);
    return { total: end, stops: result.stops };
  }, { total: 0, stops: [] }).stops.join(",");

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) > r.width / 2) return setHover(null);
    const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    let sum = 0, idx = slices.length - 1;
    for (let i = 0; i < slices.length; i++) { sum += (slices[i][1] / total) * 360; if (deg < sum) { idx = i; break; } }
    setHover({ i: idx, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative h-44 w-44">
        <div onMouseMove={move} onMouseLeave={() => setHover(null)}
          className="h-full w-full rounded-full transition duration-700 ease-out"
          style={{ background: `conic-gradient(${stops})`, opacity: on ? 1 : 0, transform: on ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.6)" }} />
        {hover && (
          <span className="pointer-events-none absolute z-20 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg"
            style={{ left: hover.x + 12, top: hover.y - 12 }}>
            {slices[hover.i][0]}: {slices[hover.i][1]}%
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
        {slices.map(([l, v, c], i) => (
          <span key={l} className={`flex items-center gap-2 ${hover?.i === i ? "font-semibold" : ""}`}><i className="h-3 w-3 rounded-sm" style={{ background: c }} />{l}: {v}%</span>
        ))}
      </div>
    </div>
  );
}

const PromoImg = ({ src, size = "h-14 w-14" }) =>
  src ? <img src={src} alt="" className={`${size} shrink-0 rounded-lg object-cover`} />
      : <div className={`flex ${size} shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-sky-200 text-blue-400`}><Tag size={20} /></div>;

/* data */
/* pages */
function Dashboard({ promos, go, data }) {
  const active = promos.filter((p) => p.active);
  return (
    <>
      <Head title="Dashboard" />
      <div className="mb-6 grid grid-cols-3 gap-6">
        {data.stats.map(([l, v, up, note]) => (
          <Card key={l} className="p-6">
            <p className="text-gray-500">{l}</p><p className="my-1 text-4xl">{v}</p>
            {up ? <p className="flex items-center gap-1 text-sm text-green-600"><ArrowUp size={14} />{up}</p> : <p className="text-sm text-gray-500">{note}</p>}
          </Card>
        ))}
      </div>
      <Card className="mb-6 p-6">
        <h3 className="mb-6 text-xl">Customer Visits (Last 7 Days)</h3>
        <LineDots data={data.visits.data} max={data.visits.max} ticks={data.visits.ticks} labels={data.visits.labels} />
      </Card>
      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl">Active Promotions</h3>
          <button onClick={() => go("Promotions")} className="flex items-center gap-1 text-sm">View All <ArrowRight size={14} /></button>
        </div>
        <div className="space-y-4">
          {active.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between rounded-xl border border-gray-200 px-4 py-4 ${i % 2 ? "bg-slate-50" : ""}`}>
              <div className="flex items-center gap-4"><PromoImg src={p.image} /><div><p className="text-lg">{p.title}</p><p className="text-sm text-gray-500">{p.start} - {p.end}</p></div></div>
              <div className="text-right"><p className="text-sm text-gray-500">Clicks</p><p className="text-xl">{p.clicks.toLocaleString()}</p></div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function Chip({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${on ? "border-[#5094fb] bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-slate-50"}`}>
      {on && <Check size={14} />}{children}
    </button>
  );
}

function ChipPicker({ options, setOptions, selected, setSelected, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const toggle = (o) => setSelected(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);
  const remove = (o) => { setOptions(options.filter((x) => x !== o)); setSelected(selected.filter((x) => x !== o)); };
  const add = () => {
    const v = draft.trim();
    if (v && !options.some((o) => o.toLowerCase() === v.toLowerCase())) { setOptions([...options, v]); setSelected([...selected, v]); }
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => editing ? (
          <span key={o} className="flex items-center gap-2 rounded-full border border-dashed border-gray-300 bg-white py-2 pl-4 pr-2 text-sm text-gray-600">
            {o}
            <button type="button" onClick={() => remove(o)} className="rounded-full p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><X size={14} /></button>
          </span>
        ) : <Chip key={o} on={selected.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}
        {options.length === 0 && <p className="text-sm text-gray-400">Nothing here yet. Click Edit list to add options.</p>}
      </div>
      {editing && (
        <div className="mt-3 flex gap-3">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={placeholder}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-400" />
          <Btn onClick={add} className="!py-2 text-sm"><Plus size={14} />Add</Btn>
        </div>
      )}
      <button type="button" onClick={() => setEditing(!editing)} className="mt-3 text-sm font-medium text-blue-600">{editing ? "Done" : "Edit list"}</button>
    </div>
  );
}

function StoreProfile({ logo, setLogo, profile, data }) {
  const { days, categories, paymentOptions, initialPayments, initialFacilities, initialNotes, noteTypes } = data;
  // operating hours
  const [openDays, setOpenDays] = useState(days.slice(0, 6));
  const [from, setFrom] = useState(data.openFrom || "");
  const [to, setTo] = useState(data.openTo || "");
  const [custom, setCustom] = useState(false);
  const [perDay, setPerDay] = useState({});
  // additional info
  const [category, setCategory] = useState(Object.keys(categories)[0] || "");
  const [payOptions, setPayOptions] = useState(paymentOptions);
  const [pay, setPay] = useState(initialPayments);
  const [facOptions, setFacOptions] = useState(categories[Object.keys(categories)[0]] || []);
  const [fac, setFac] = useState(initialFacilities);
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState("warn");

  const flip = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const chosen = days.filter((d) => openDays.includes(d));
  const closed = days.filter((d) => !openDays.includes(d));
  const setOverride = (d, k, v) => setPerDay({ ...perDay, [d]: { from, to, ...perDay[d], [k]: v } });
  const changeCategory = (c) => {
    const custom = facOptions.filter((o) => !categories[category].includes(o));
    const next = [...categories[c], ...custom];
    setCategory(c); setFacOptions(next); setFac(fac.filter((f) => next.includes(f)));
  };
  const addNote = () => { if (draft.trim()) { setNotes([...notes, [kind, draft.trim()]]); setDraft(""); } };
  const timeBox = "rounded-md border border-gray-200 bg-white px-3 py-2";

  return (
    <div>
      <Head title="Store Profile" sub="Manage your store information and settings" />
      <Card className="p-6">
        <p className="mb-3 font-medium">Store Logo</p>
        <div className="flex items-center gap-6"><Logo src={logo} /><LogoButton setLogo={setLogo}><Upload size={16} />Upload New Logo</LogoButton></div>

        <SectionHeading>Basic Information</SectionHeading>
        <Field label="Store Name" defaultValue={profile?.store_name || profile?.tenant_name || profile?.name} className="mb-4" />
        <label className="mb-4 block"><span className="mb-2 block font-medium">Description</span>
          <textarea rows={4} defaultValue={profile?.store_description || ""}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-400" /></label>
        <label className="block"><span className="mb-2 block font-medium">Category</span>
          <select value={category} onChange={(e) => changeCategory(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5">
            {Object.keys(categories).map((c) => <option key={c}>{c}</option>)}
          </select></label>

        <SectionHeading>Location</SectionHeading>
        <div className="grid grid-cols-2 gap-4"><Field label="Floor" defaultValue={data.floor} /><Field label="Unit Number" defaultValue={data.unit} /></div>

        <SectionHeading>Contact Information</SectionHeading>
        <Field label="Phone" defaultValue={profile?.store_contact_num || profile?.tenant_contact_num} className="mb-4" />
        <Field label="Email" defaultValue={profile?.store_email || profile?.tenant_email || profile?.userEmail} className="mb-4" />
        <Field label="Website" defaultValue={profile?.store_website} />

        <SectionHeading>Operating Hours</SectionHeading>
        <p className="mb-2 text-sm font-medium">1. Which days are you open?</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {days.map((d) => <Chip key={d} on={openDays.includes(d)} onClick={() => flip(openDays, setOpenDays, d)}>{d.slice(0, 3)}</Chip>)}
        </div>
        <p className="mb-2 text-sm font-medium">2. What time do you open and close?</p>
        {chosen.length === 0 ? (
          <p className="text-sm text-gray-400">Pick at least one open day first.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-gray-500">Opens</span><input type="time" value={from} onChange={(e) => setFrom(e.target.value)} className={timeBox} />
              <span className="text-gray-500">Closes</span><input type="time" value={to} onChange={(e) => setTo(e.target.value)} className={timeBox} />
              <span className="text-gray-400">(for all open days)</span>
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm">
              <Toggle on={custom} onChange={setCustom} />Set different hours for specific days
            </label>
            {custom && (
              <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-4">
                {chosen.map((d) => {
                  const h = { from, to, ...perDay[d] };
                  return (
                    <div key={d} className="flex items-center gap-3 text-sm">
                      <span className="w-24">{d}</span>
                      <input type="time" value={h.from} onChange={(e) => setOverride(d, "from", e.target.value)} className={timeBox} />
                      <span className="text-gray-400">to</span>
                      <input type="time" value={h.to} onChange={(e) => setOverride(d, "to", e.target.value)} className={timeBox} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        <p className="mt-3 text-sm text-gray-500">{closed.length ? `Closed on ${closed.join(", ")}` : "Open every day"}</p>

        <SectionHeading>Payment Methods</SectionHeading>
        <p className="mb-3 text-sm text-gray-500">Tap all the payment options your store accepts. Use Edit list to add or remove options.</p>
        <ChipPicker options={payOptions} setOptions={setPayOptions} selected={pay} setSelected={setPay} placeholder="Add a payment option, like Apple Pay" />

        <SectionHeading>Services and Facilities</SectionHeading>
        <p className="mb-3 text-sm text-gray-500">These suggestions match your store category. Use Edit list to add your own or remove ones that don't apply.</p>
        <ChipPicker options={facOptions} setOptions={setFacOptions} selected={fac} setSelected={setFac} placeholder="Add a service, like Free alterations" />

        <SectionHeading>Other Notes for Visitors</SectionHeading>
        <p className="mb-3 text-sm text-gray-500">Short updates visitors can see. Example: Fitting room closed today.</p>
        <div className="mb-3 flex gap-3">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 text-sm">
            {Object.entries(noteTypes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Type a note and press Enter or click Add..." className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-400" />
          <Btn onClick={addNote} className="!py-2 text-sm"><Plus size={14} />Add Note</Btn>
        </div>
        <div className="space-y-3">
          {notes.map(([k, text], i) => {
            const { Icon, color } = noteTypes[k];
            return (
              <div key={i} className="group flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-4 text-sm">
                <Icon size={16} className={color} /><span className="flex-1">{text}</span>
                <button onClick={() => setNotes(notes.filter((_, j) => j !== i))} className="text-gray-400 opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
              </div>
            );
          })}
          {notes.length === 0 && <p className="text-sm text-gray-400">No notes yet.</p>}
        </div>

        <div className="mt-8 flex justify-end gap-3"><Btn ghost>Cancel</Btn><Btn><Save size={16} />Save Changes</Btn></div>
      </Card>
    </div>
  );
}

function PromoModal({ initial, onClose, onSave }) {
  const [f, setF] = useState(initial || { title: "", desc: "", image: null, start: "", end: "", notify: true });
  const set = (k, v) => setF({ ...f, [k]: v });
  const ok = f.title.trim() && f.start && f.end;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-5 text-2xl">{initial ? "Edit Promotion" : "Create New Promotion"}</h2>
        <Field label="Promotion Title *" placeholder="Enter promotion title" value={f.title} onChange={(e) => set("title", e.target.value)} className="mb-4" />
        <label className="mb-4 block"><span className="mb-2 block font-medium">Description</span>
          <textarea rows={3} placeholder="Enter promotion description" value={f.desc} onChange={(e) => set("desc", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-400" /></label>
        <div className="mb-4">
          <span className="mb-2 block font-medium">Promotion Image</span>
          <div className="flex items-center gap-4">
            <PromoImg src={f.image} size="h-16 w-16" />
            <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium">
              Upload Image
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) set("image", URL.createObjectURL(file)); }} />
            </label>
          </div>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-4">
          <Field label="Start Date *" type="date" value={f.start} onChange={(e) => set("start", e.target.value)} />
          <Field label="End Date *" type="date" value={f.end} onChange={(e) => set("end", e.target.value)} />
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <div><p className="font-medium">Notify Registered Users</p><p className="text-sm text-gray-500">Send email notification to all registered users about this promotion</p></div>
          <Toggle on={f.notify} onChange={(v) => set("notify", v)} />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Btn ghost onClick={onClose} className="!py-2.5">Cancel</Btn>
          <Btn onClick={() => ok && onSave(f)} className={`!py-2.5 ${ok ? "" : "opacity-50"}`}>{initial ? "Save Promotion" : "Create Promotion"}</Btn>
        </div>
      </div>
    </div>
  );
}

function Promotions({ promos, setPromos }) {
  const [modal, setModal] = useState(null); // null | "new" | promo
  const stat = [["Total Promotions", promos.length], ["Active", promos.filter((p) => p.active).length],
    ["Total Views", promos.reduce((s, p) => s + p.views, 0).toLocaleString()], ["Total Clicks", promos.reduce((s, p) => s + p.clicks, 0).toLocaleString()]];
  const save = (f) => {
    if (modal === "new") setPromos([{ ...f, id: Date.now(), views: 0, clicks: 0, active: true }, ...promos]);
    else setPromos(promos.map((p) => (p.id === modal.id ? { ...p, ...f } : p)));
    setModal(null);
  };
  return (
    <>
      <Head title="Promotions" sub="Create and manage your store promotions" right={<Btn onClick={() => setModal("new")}><Plus size={18} />Create Promotion</Btn>} />
      <div className="mb-6 grid grid-cols-4 gap-6">
        {stat.map(([l, v]) => <Card key={l} className="p-6"><p className="text-gray-500">{l}</p><p className="mt-1 text-4xl">{v}</p></Card>)}
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm"><tr>{["Promotion", "Duration", "Views", "Clicks", "Status", "Actions"].map((h, i) => <th key={h} className={`px-6 py-4 font-semibold ${i === 5 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="max-w-sm px-6 py-4"><div className="flex items-center gap-4"><PromoImg src={p.image} /><div><p className="font-medium">{p.title}</p><p className="text-sm text-gray-500">{p.desc}</p></div></div></td>
                <td className="px-6 py-4 text-sm">{p.start}<br />to {p.end}</td>
                <td className="px-6 py-4"><span className="flex items-center gap-2"><Eye size={15} className="text-gray-400" />{p.views.toLocaleString()}</span></td>
                <td className="px-6 py-4">{p.clicks.toLocaleString()}</td>
                <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-sm ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.active ? "active" : "inactive"}</span></td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-4">
                    <button title="Toggle" onClick={() => setPromos(promos.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)))}><Power size={16} /></button>
                    <button title="Edit" onClick={() => setModal(p)}><Pencil size={16} /></button>
                    <button title="Delete" onClick={() => setPromos(promos.filter((x) => x.id !== p.id))} className="text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {promos.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No promotions yet. Click Create Promotion to add one.</td></tr>}
          </tbody>
        </table>
      </Card>
      {modal && <PromoModal initial={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={save} />}
    </>
  );
}

function Analytics({ profile, data }) {
  const on = useMounted();
  const [range, setRange] = useState(data.rangeOptions[0] || "");
  const { pLabels, age, gender, perf } = data;

  const exportCsv = () => downloadCsv(`${profile?.name || "store"}-analytics-${today()}.csv`, [
    [`${profile?.name || "Store"} - Analytics Report`], ["Period", range], ["Exported", new Date().toLocaleString()], [],
    ["Summary"], [],
    ["Customer Visits Over Time"], ["Date", "Visits"], ...data.visits.labels.map((l, i) => [l, data.visits.data[i]]), [],
    ["Peak Visit Times"], ["Time", "Visits"], ...pLabels.map((l, i) => [l, data.peak.data[i]]), [],
    ["Age Distribution"], ["Age Group", "Percent"], ...age.map(([l, v]) => [l, `${v}%`]), [],
    ["Gender Distribution"], ["Gender", "Percent"], ...gender.map(([l, v]) => [l, `${v}%`]), [],
    ["Promotion Performance"], ["Promotion", "Views", "Clicks"], ...perf,
  ]);

  return (
    <>
      <Head title="Analytics" sub="Track your store performance and customer insights"
        right={<select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm">{data.rangeOptions.map((option) => <option key={option}>{option}</option>)}</select>} />
      <div className="mb-6 grid grid-cols-3 gap-6">
        {data.stats.map(([label, value, change, note]) => <Card key={label} className="p-6"><p className="text-sm text-gray-500">{label}</p><p className="my-1 text-4xl">{value}</p>{change ? <p className="flex items-center gap-1 text-sm text-green-600"><ArrowUp size={14} />{change}</p> : <p className="text-sm text-gray-500">{note}</p>}</Card>)}
      </div>
      <Card className="mb-6 p-6"><h3 className="mb-6 text-xl">Customer Visits Over Time</h3>
        <LineDots data={data.visits.data} max={data.visits.max} ticks={data.visits.ticks} labels={data.visits.labels} /></Card>
      <Card className="mb-6 p-6"><h3 className="mb-6 text-xl">Peak Visit Times</h3>
        <Frame ticks={data.peak.ticks} max={data.peak.max} labels={pLabels} h="h-64">
          <div className="absolute inset-0 flex">
            {data.peak.data.map((v, i) => (
              <div key={i} className="flex h-full flex-1 items-end justify-center">
                <Bar value={v} max={data.peak.max} on={on} delay={i * 80} tip={`${pLabels[i]}: ${v} visits`} />
              </div>
            ))}
          </div>
        </Frame></Card>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <Card className="p-6"><h3 className="text-xl">Age Distribution</h3><Pie slices={age} /></Card>
        <Card className="p-6"><h3 className="text-xl">Gender Distribution</h3><Pie slices={gender} /></Card>
      </div>
      <Card className="mb-6 p-6"><h3 className="mb-6 text-xl">Promotion Performance</h3>
        <Frame ticks={data.performance.ticks} max={data.performance.max} labels={perf.map((p) => p[0])} h="h-64"
          legend={<div className="mt-3 flex justify-center gap-5 text-sm"><span className="flex items-center gap-2 text-gray-400"><i className="h-3 w-3 bg-gray-300" />views</span><span className="flex items-center gap-2 text-[#5094fb]"><i className="h-3 w-3 bg-[#5094fb]" />clicks</span></div>}>
          <div className="absolute inset-0 flex">
            {perf.map(([n, v, c], i) => (
              <div key={n} className="flex h-full flex-1 items-end justify-center gap-1">
                <Bar value={v} max={data.performance.max} on={on} delay={i * 100} width="w-1/4" color="bg-gray-300" tip={`${n}: ${v.toLocaleString()} views`} />
                <Bar value={c} max={data.performance.max} on={on} delay={i * 100 + 50} width="w-1/4" tip={`${n}: ${c.toLocaleString()} clicks`} />
              </div>
            ))}
          </div>
        </Frame></Card>
      <Card className="flex items-center justify-between p-6">
        <p className="text-sm text-gray-500">Download all the data on this page as a CSV file.</p>
        <Btn onClick={exportCsv} className="!py-2 text-sm"><Download size={16} />Export</Btn>
      </Card>
    </>
  );
}

function ProfileSettings({ logo, profile }) {
  const [form, setForm] = useState(() => ({
    accountName: profile?.userName || "",
    accountEmail: profile?.userEmail || profile?.tenant_email || "",
    accountPhone: profile?.tenant_contact_num || "",
    contactName: profile?.tenant_contact_person || "",
    contactEmail: profile?.tenant_email || "",
    contactPhone: profile?.tenant_contact_num || "",
  }));
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setPhone = (value) => setForm((current) => ({ ...current, accountPhone: value, contactPhone: value }));
  const setPassword = (field, value) => setPasswords((current) => ({ ...current, [field]: value }));

  const saveProfile = async () => {
    setSaving(true); setMessage(""); setError("");
    try {
      await updateTenantProfile(profile, form);
      setMessage("Profile changes saved.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!passwords.current || !passwords.next) return setError("Enter your current and new password.");
    if (passwords.next !== passwords.confirm) return setError("New password and confirmation do not match.");
    if (passwords.next.length < 6) return setError("New password must be at least 6 characters.");
    setSavingPassword(true); setMessage(""); setError("");
    try {
      await changePassword(profile?.userEmail, passwords.current, passwords.next, profile?.demo);
      setPasswords({ current: "", next: "", confirm: "" });
      setMessage("Password changed successfully.");
    } catch (passwordError) {
      setError(passwordError.message || "Unable to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <Head title="Profile Settings" />
      {(message || error) && <p className={`mb-4 rounded-lg px-4 py-3 text-sm ${error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{error || message}</p>}
      <Card className="mb-6 flex items-center gap-6 p-6"><Logo src={logo} /><div className="flex-1"><p className="text-2xl">{profile?.store_name || profile?.tenant_name || profile?.name}</p><p className="mt-2 text-gray-500">{profile?.subtitle}</p></div></Card>
      <Card className="mb-6 p-6"><h3 className="mb-6 text-2xl">Account Information</h3>
        <Field label="Account Name" value={form.accountName} onChange={(e) => setField("accountName", e.target.value)} className="mb-5" />
        <div className="mb-5 grid grid-cols-2 gap-4"><Field label="Account Email" value={form.accountEmail} onChange={(e) => setField("accountEmail", e.target.value)} /><Field label="Account Phone" value={form.accountPhone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="flex justify-end"><Btn onClick={saveProfile}><Save size={16} />{saving ? "Saving..." : "Save Changes"}</Btn></div></Card>
      <Card className="mb-6 p-6"><h3 className="mb-6 text-2xl">Contact Person</h3>
        <div className="mb-5 grid grid-cols-2 gap-4"><Field label="Full Name" value={form.contactName} onChange={(e) => setField("contactName", e.target.value)} /><Field label="Position" defaultValue={profile?.tenant_contact_position} /></div>
        <div className="mb-5 grid grid-cols-2 gap-4"><Field label="Email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} /><Field label="Phone" value={form.contactPhone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="flex justify-end"><Btn onClick={saveProfile}><Save size={16} />{saving ? "Saving..." : "Save Changes"}</Btn></div></Card>
      <Card className="p-6"><h3 className="mb-6 text-2xl">Change Password</h3>
        <PasswordField label="Current Password" value={passwords.current} onChange={(e) => setPassword("current", e.target.value)} />
        <PasswordField label="New Password" value={passwords.next} onChange={(e) => setPassword("next", e.target.value)} />
        <PasswordField label="Confirm Password" value={passwords.confirm} onChange={(e) => setPassword("confirm", e.target.value)} />
        <div className="flex justify-end"><Btn onClick={savePassword}><Save size={16} />{savingPassword ? "Changing..." : "Change Password"}</Btn></div></Card>
    </div>
  );
}

/* shell */
export default function Tenant({ onLogout, profile, promotions, data }) {
  const tenantData = data || {
    dashboard: { stats: [], visits: { data: [], max: 0, ticks: [], labels: [] } },
    profile: { days: [], categories: {}, paymentOptions: [], initialPayments: [], initialFacilities: [], initialNotes: [], noteTypes: {}, openFrom: "", openTo: "", floor: "", unit: "" },
    analytics: { stats: [], pLabels: [], age: [], gender: [], perf: [], rangeOptions: [], visits: { data: [], max: 0, ticks: [], labels: [] }, peak: { data: [], max: 0, ticks: [] }, performance: { max: 0, ticks: [] } },
  };
  const [page, setPage] = useState("Dashboard");
  const [menu, setMenu] = useState(false);
  const [logo, setLogo] = useState(profile?.logo || "/uniqlo-logo.svg");
  const [promos, setPromos] = useState(promotions);

  const views = {
    Dashboard: <Dashboard promos={promos} go={setPage} data={tenantData.dashboard} />, "Store Profile": <StoreProfile logo={logo} setLogo={setLogo} profile={profile} data={tenantData.profile} />,
    Promotions: <Promotions promos={promos} setPromos={setPromos} />, Analytics: <Analytics profile={profile} data={tenantData.analytics} />, "Profile Settings": <ProfileSettings logo={logo} profile={profile} />,
  };
  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-900">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sky-100/70">
        <p className="border-b border-sky-200 px-6 py-5 text-xl font-semibold text-slate-500">Tenant Portal</p>
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map(([n, I]) => (
            <button key={n} onClick={() => setPage(n)} className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 ${page === n ? "bg-sky-200/70 text-blue-700" : "text-gray-500 hover:bg-sky-100"}`}>
              <I size={20} />{n}
            </button>
          ))}
        </nav>
        <div className="relative p-4">
          {menu && (
            <div className="absolute inset-x-4 bottom-[calc(100%-8px)] overflow-hidden rounded-lg border border-gray-200 bg-white text-sm font-medium shadow-lg">
              <button onClick={() => { setPage("Profile Settings"); setMenu(false); }} className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-slate-50"><Settings size={16} />Manage Profile</button>
              <button onClick={() => onLogout?.()} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50"><LogOut size={16} />Logout</button>
            </div>
          )}
          <button onClick={() => setMenu(!menu)} className="flex w-full items-center gap-3 text-left">
            <Logo src={logo} size="h-10 w-10" />
            <span className="flex-1"><b className="block text-sm">{profile?.name}</b><span className="text-xs text-gray-500">{profile?.subtitle}</span></span>
            {menu ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-8">
        {views[page]}
      </main>
    </div>
  );
}