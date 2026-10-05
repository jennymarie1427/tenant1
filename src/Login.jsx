import { useState } from "react";
import { signIn } from "./lib/appData";

// onLogin receives the role: "super_admin" | "mall_admin" | "tenant"
export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!user.trim() || !pass) return setError("Enter your email or username and password.");
    try {
      const session = await signIn(user.trim(), pass);
      onLogin(session);
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    }
  };

  const input = "w-full rounded-2xl border border-sky-200 bg-sky-50/80 px-6 py-5 text-gray-800 outline-none placeholder:text-gray-500 focus:border-sky-400";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-400 via-sky-200 to-white to-70% p-8">
      <div className="grid w-full max-w-6xl items-center gap-16 md:grid-cols-2">
        <div className="flex flex-col items-center">
          <img src="/navar-logo.png" alt="NavAR" className="w-95" />
          <p className="mt-6 text-3xl text-neutral-600">Shop Smart. Move Smarter.</p>
        </div>

        <form onSubmit={submit} className="max-w-md">
          <h1 className="text-6xl font-bold text-neutral-800">Welcome!</h1>
          <p className="mb-10 mt-1 text-xl text-neutral-600">Please enter your sign in details</p>
          <input className={`${input} mb-4`} placeholder="Email address or username" value={user} onChange={(e) => { setUser(e.target.value); setError(""); }} />
          <input className={input} type="password" placeholder="Password" value={pass} onChange={(e) => { setPass(e.target.value); setError(""); }} />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button className="mt-4 w-full rounded-2xl bg-sky-500 py-5 text-sm font-medium tracking-wide text-white shadow-md hover:bg-sky-600">LOGIN</button>
          {/* <p className="mt-4 text-xs text-neutral-500">Demo: use "super", "mall" or anything else (tenant) in the username.</p> */}
        </form>
      </div>
    </div>
  );
}