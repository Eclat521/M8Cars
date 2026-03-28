"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthPromptModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthPromptModal({ onClose, onSuccess }: AuthPromptModalProps) {
  const { refresh } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPostcode, setRegPostcode] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    if (res.ok) {
      await refresh();
      onSuccess();
    } else {
      const data = await res.json();
      setLoginError(data.error ?? "Login failed");
    }
    setLoginLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        postcode: regPostcode,
      }),
    });
    if (res.ok) {
      await refresh();
      onSuccess();
    } else {
      const data = await res.json();
      setRegError(data.error ?? "Registration failed");
    }
    setRegLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Save to favourites</h2>
        <p className="text-sm text-gray-500 mb-5">Sign in or create an account to save this vehicle.</p>

        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === "login" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === "register" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loginLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First name</label>
                <input
                  type="text"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last name</label>
                <input
                  type="text"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Postcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M8 8EP"
                value={regPostcode}
                onChange={(e) => setRegPostcode(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            {regError && <p className="text-sm text-red-600">{regError}</p>}
            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {regLoading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
