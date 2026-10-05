import { useEffect, useState } from "react";
import Login from "./Login";
import SuperAdmin from "./SuperAdmin";
import MallAdmin from "./MallAdmin";
import Tenant from "./Tenant";
import TenantApp from "./TenantApp"; 
import { getCurrentSession, loadAppData, signOut } from "./lib/appData";

const EMPTY_APP_DATA = { profiles: {}, promotions: [] };

export default function App() {
  const [session, setSession] = useState(null);
  const [appData, setAppData] = useState(null);
  const logout = async () => {
    await signOut();
    setSession(null);
  };

  useEffect(() => {
    getCurrentSession()
      .then((currentSession) => {
        if (!currentSession) {
          setAppData(EMPTY_APP_DATA);
          return null;
        }
        setSession(currentSession);
        if (currentSession.demo) {
          setAppData(EMPTY_APP_DATA);
          return null;
        }
        return loadAppData().then(setAppData);
      })
      .catch((error) => console.error("Unable to restore session and load data", error));
  }, []);

  if (!appData) return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading workspace...</div>;
  const login = async (session) => {
    if (session.demo) localStorage.setItem("navar_demo_role", session.role);
    setSession(session);
    setAppData(session.demo ? EMPTY_APP_DATA : await loadAppData());
  };
  if (!session) return <Login onLogin={login} />;
  if (session.role === "super_admin") return <SuperAdmin onLogout={logout} profile={appData.profiles.super_admin} />;
  if (session.role === "mall_admin") return <MallAdmin onLogout={logout} profile={appData.profiles.mall_admin} />;
  if (session.demo) return <TenantApp onLogout={logout} />;
  return <Tenant onLogout={logout} profile={appData.profiles.tenant} promotions={appData.promotions} />;
}