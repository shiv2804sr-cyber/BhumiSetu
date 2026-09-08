import React, { useState } from "react";
import { useAuth, DEMO_USERS } from "../context/AuthContext";
import { ShieldCheck, X, Lock, Mail, Key, UserCheck } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, switchDemoRole, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey: string) => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoRole(roleKey);
      onClose();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-registry-ink/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-graticule-teal/40 shadow-xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-survey-paper p-5 border-b border-graticule-teal/30 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-tilled-earth" />
            <div>
              <h3 className="font-serif font-semibold text-registry-ink text-lg">Official Portal Login</h3>
              <p className="text-xs text-registry-ink/60">RFCTLARR Role-Based Authentication & Access Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-graticule-teal hover:text-registry-ink rounded-sm hover:bg-graticule-teal/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-alluvium-red/10 border border-alluvium-red/30 text-alluvium-red text-xs rounded-sm">
              {error}
            </div>
          )}

          {user && (
            <div className="p-3 bg-cultivated-green/10 border border-cultivated-green/30 text-xs rounded-sm flex items-center justify-between">
              <div>
                <span className="font-semibold text-cultivated-green">Currently Logged In: </span>
                <span className="text-registry-ink">{user.fullName} ({user.role})</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@nic.in / @gov.in"
                  className="w-full pl-9 pr-3 py-2 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-registry-ink text-white font-medium text-sm hover:bg-registry-ink/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              {loading ? "Authenticating..." : "Sign In with Credentials"}
            </button>
          </form>

          <div className="relative border-t border-graticule-teal/20 pt-4">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-3 text-[11px] uppercase tracking-wider text-registry-ink/50 font-mono">
              Quick Role Switch (Demo)
            </span>

            <p className="text-xs text-registry-ink/60 mb-3 mt-1 text-center">
              Instantly simulate different stakeholder roles and observe dynamic permissions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(DEMO_USERS).map(([roleKey, info]) => (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleDemoLogin(roleKey)}
                  className="p-2.5 text-left border border-graticule-teal/30 hover:border-tilled-earth hover:bg-graticule-teal/5 text-xs transition-colors rounded-xs flex items-center gap-2 group"
                >
                  <UserCheck className="w-3.5 h-3.5 text-graticule-teal group-hover:text-tilled-earth shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-registry-ink truncate">{info.title}</div>
                    <div className="text-[10px] text-registry-ink/60 font-mono truncate">{info.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
