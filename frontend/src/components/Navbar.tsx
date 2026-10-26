import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Terminal, 
  Compass, 
  BarChart3, 
  Award, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Challenges', path: '/challenges', icon: Terminal },
    { name: 'Dashboard', path: '/dashboard', icon: Compass, authOnly: true },
    { name: 'Skills & Evidence', path: '/skills', icon: BarChart3, authOnly: true },
    { name: 'Learning Path', path: '/recommendations', icon: Sparkles, authOnly: true },
    { name: 'Readiness Dossier', path: '/reports', icon: Award, authOnly: true },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-obsidian-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-transparent border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400 group-hover:scale-105 group-hover:shadow-glow-sm transition-all duration-300">
                  <Terminal className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-obsidian-950 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-base text-white tracking-tight">
                  <span>BugQuest</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    AI
                  </span>
                </div>
              </div>
            </Link>

            {/* Sandbox Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Isolated Sandbox Online</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authOnly && !user) return null;
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                    active
                      ? 'text-white bg-white/[0.08] border border-white/[0.12] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}
            
            {user?.role === 'admin' && (
              <Link
                to="/admin/challenges"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/admin/challenges')
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-white/[0.04]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* User Status & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-obsidian-850/80 hover:border-white/[0.16] hover:bg-obsidian-800 text-xs font-medium text-slate-200 transition-all shadow-sm"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl bg-obsidian-850 border border-white/[0.1] shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-fade-in">
                    <div className="px-3.5 py-2.5 border-b border-white/[0.06]">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {user.role}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {user.target_role || 'Developer'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-slate-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/skills"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                        Skill Analytics
                      </Link>
                      <Link
                        to="/reports"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        Workforce Readiness
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        Account Settings
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-white/[0.06]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-glow-sm transition-all duration-200 hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-obsidian-900/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            if (link.authOnly && !user) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                {link.name}
              </Link>
            );
          })}

          {user ? (
            <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-2">
              <div className="px-3.5 py-2">
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 mt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
