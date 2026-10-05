//demo only, hardcoded data for tenant dashboard

import Tenant from "./Tenant";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const DEMO_TENANT_DATA = {
  dashboard: {
    stats: [["Total Visits (7 days)", "2,616", "12.5% from last week"], ["Active Promotions", "3", null, "Running this month"], ["Total Interactions", "2,704", "8.3% from last week"]],
    visits: { data: [245, 315, 290, 455, 380, 500, 435], max: 600, ticks: [0, 150, 300, 450, 600], labels: ["Apr 1", "Apr 2", "Apr 3", "Apr 4", "Apr 5", "Apr 6", "Apr 7"] },
  },
  profile: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    paymentOptions: ["Cash", "GCash", "Maya", "Credit/Debit Card", "Bank Transfer"],
    initialPayments: ["Cash", "GCash"],
    initialFacilities: ["Fitting room"],
    initialNotes: [["warn", "The restroom near our store is under maintenance"]],
    openFrom: "09:00",
    openTo: "21:00",
    floor: "2",
    unit: "201-205",
    categories: {
      "Fashion & Apparel": ["Fitting room", "Gift wrapping", "Alterations", "Returns and exchanges", "Wheelchair accessible", "Online order pickup"],
      "Food & Beverage": ["Dine-in", "Take-out", "Delivery", "Reservations", "Kid-friendly", "Halal options", "Vegetarian options", "Free Wi-Fi"],
      "Electronics & Gadgets": ["Warranty service", "Setup and installation help", "Trade-in", "Product demo", "Repair service", "Online order pickup"],
      "Health & Beauty": ["Pharmacist on duty", "Walk-ins welcome", "Appointment recommended", "Product testers", "Senior/PWD discount", "Gift sets"],
      "Groceries & Supermarket": ["Shopping carts", "Bagging service", "Home delivery", "Senior/PWD discount", "Bring-your-own-bag discount", "Online order pickup"],
      "Services (salon, spa, repair)": ["Walk-ins welcome", "Appointment required", "Online booking", "Waiting area", "Free Wi-Fi", "Senior/PWD discount"],
      Other: ["Restroom nearby", "Wheelchair accessible", "Free Wi-Fi", "Online order pickup", "Senior/PWD discount"],
    },
    noteTypes: {
      warn: { label: "Notice", Icon: AlertTriangle, color: "text-orange-400" },
      ok: { label: "Available", Icon: CheckCircle2, color: "text-green-500" },
      no: { label: "Unavailable", Icon: XCircle, color: "text-red-500" },
    },
  },
  analytics: {
    rangeOptions: ["Last 7 days", "Last 14 days", "Last 30 days"],
    pLabels: ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM", "7 PM", "9 PM"],
    stats: [["Total Visits", "8,469", "15.3% vs last period"], ["Avg. Daily Visits", "282", "8.7% vs last period"], ["Peak Hour", "5 PM", null, "312 avg visits"]],
    visits: { data: [235, 290, 312, 278, 455, 395, 500], max: 600, ticks: [0, 150, 300, 450, 600], labels: ["Mar 25", "Mar 27", "Mar 29", "Mar 31", "Apr 2", "Apr 4", "Apr 6"] },
    peak: { data: [45, 122, 188, 235, 312, 265, 95], max: 320, ticks: [0, 80, 160, 240, 320] },
    performance: { max: 6000, ticks: [0, 1500, 3000, 4500, 6000] },
    age: [["18-24", 23, "#5094fb"], ["25-34", 35, "#4b5563"], ["35-44", 22, "#9ca3af"], ["45-54", 12, "#d1d5db"], ["55+", 8, "#e5e7eb"]],
    gender: [["Female", 58, "#5094fb"], ["Male", 38, "#6b7280"], ["Other", 4, "#d1d5db"]],
    perf: [["Spring Collection", 3245, 1245], ["Weekend Sale", 2134, 892], ["New Arrivals", 1567, 567], ["Winter Clearance", 4532, 1876]],
  },
};

const DEMO_PROFILE = {
  demo: true,
  role: "tenant",
  name: "Uniqlo",
  store_name: "Uniqlo",
  subtitle: "Tenant Account",
  userId: "tenant",
  userName: "Uniqlo",
  userEmail: "uniqlo@email.com",
  tenant_name: "Uniqlo",
  tenant_type: "retail",
  tenant_contact_person: "John Doe",
  tenant_contact_num: "09123456789",
  tenant_email: "uniqlo@email.com",
  tenant_status: "active",
  store_id: 4,
  store_unit_count: 1,
  store_contact_person: "John Doe",
  store_contact_num: "09123456789",
  store_email: "uniqlo@email.com",
  store_status: "active",
  store_type: "store",
  store_description: "Uniqlo clothing and lifestyle store at SM Seaside City Cebu.",
  logo: "/uniqlo-logo.svg",
};

const DEMO_PROMOTIONS = [
  { id: 1, title: "LifeWear Essentials Sale", desc: "Save up to 30% on selected everyday essentials.", start: "2026-10-01", end: "2026-10-31", image: null, views: 4280, clicks: 1680, active: true },
  { id: 2, title: "Heattech Collection", desc: "Discover comfortable layers for cooler days.", start: "2026-10-05", end: "2026-11-15", image: null, views: 3150, clicks: 1125, active: true },
  { id: 3, title: "Kids Weekend Picks", desc: "New arrivals for kids with family-friendly prices.", start: "2026-10-10", end: "2026-10-25", image: null, views: 2190, clicks: 780, active: true },
  { id: 4, title: "End of Season Clearance", desc: "Final markdowns on selected seasonal pieces.", start: "2026-09-01", end: "2026-09-30", image: null, views: 5620, clicks: 2410, active: false },
];

export default function TenantApp({ onLogout }) {
  return <Tenant onLogout={onLogout} profile={DEMO_PROFILE} promotions={DEMO_PROMOTIONS} data={DEMO_TENANT_DATA} />;
}
