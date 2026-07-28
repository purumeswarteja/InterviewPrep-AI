import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  Mic,
  FileText,
  History,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  User as UserIcon,
  Flame
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn, getInitials } from "../../lib/utils";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/mock-interview", label: "AI Mock Interview", icon: Brain },
  { to: "/app/hr-interview", label: "HR Interview", icon: Mic },
  { to: "/app/voice-interview", label: "Voice Interview", icon: Mic },
  { to: "/app/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings }
];

export default function AppLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);

  // Load avatar from localStorage and keep in sync with profile page uploads
  useEffect(() => {
    if (!user?.id) return;
    const key = `profile_avatar_${user.id}`;
    const load = () => {
      const saved = localStorage.getItem(key);
      setAvatarSrc(saved || null);
    };
    load();
    window.addEventListener("storage", load);
    // Poll every 1.5s so same-tab uploads reflect immediately in topbar
    const iv = setInterval(load, 1500);
    return () => {
      window.removeEventListener("storage", load);
      clearInterval(iv);
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  /** Reusable avatar element */
  const AvatarDisplay = ({ size = "sm" }) => {
    const cls = size === "sm"
      ? "w-8 h-8 rounded-lg text-xs"
      : "w-9 h-9 rounded-lg text-sm";
    return (
      <div
        className={cn(
          cls,
          "bg-gradient-to-br from-brand-400 to-sky-500 flex items-center justify-center font-semibold text-white overflow-hidden flex-shrink-0"
        )}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          getInitials(profile?.full_name || user?.email)
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-ink-900 text-white flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-glow flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-base leading-tight">
              Interview Prep <em className="not-italic font-bold text-emerald-400">AI</em>
            </span>
          </Link>
        </div>


        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1",
                  isActive
                    ? "bg-gradient-to-r from-brand-500/20 to-transparent text-white border-l-2 border-brand-400"
                    : "text-ink-300 hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar bottom user widget */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
            <AvatarDisplay size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-ink-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink-900/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-ink-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3.5">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-ink-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {profile?.streak_count ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 text-accent-700 text-sm font-medium">
                  <Flame className="w-4 h-4" />
                  {profile.streak_count} day streak
                </div>
              ) : null}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications bell */}
              <div className="relative">
                <button
                  onClick={() => setBellOpen(!bellOpen)}
                  className="relative p-2 rounded-lg hover:bg-ink-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-ink-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-500" />
                </button>
                {bellOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 card-surface overflow-hidden animate-fade-down"
                    onMouseLeave={() => setBellOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                      <span className="font-semibold text-sm text-ink-900">Notifications</span>
                      <button
                        onClick={() => setBellOpen(false)}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-ink-100 flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-6 h-6 text-ink-400" />
                      </div>
                      <p className="text-sm font-medium text-ink-900">You're all caught up!</p>
                      <p className="text-xs text-ink-500 mt-1">No new notifications right now.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar dropdown button */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-ink-100"
                >
                  <AvatarDisplay size="sm" />
                  <ChevronDown className="w-4 h-4 text-ink-500" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 card-surface overflow-hidden"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <Link
                      to="/app/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50 text-sm"
                    >
                      <UserIcon className="w-4 h-4 text-ink-500" />
                      View Profile
                    </Link>
                    <Link
                      to="/app/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50 text-sm"
                    >
                      <Settings className="w-4 h-4 text-ink-500" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ink-50 text-sm text-red-600 border-t border-ink-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
