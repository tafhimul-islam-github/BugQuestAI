import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api, PanelNotificationItem } from '../api/client';
import { BrandLogo } from './BrandLogo';
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
  GraduationCap,
  Bell,
  CheckCheck,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<PanelNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserDropdownOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userDropdownOpen && !notifOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (userDropdownOpen && !userDropdownRef.current?.contains(target)) {
        setUserDropdownOpen(false);
      }

      if (notifOpen && !notificationRef.current?.contains(target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [userDropdownOpen, notifOpen]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    api.notifications
      .list()
      .then((res) => {
        if (!cancelled) {
          setNotifications(res.notifications);
          setUnreadCount(res.unread_count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, location.pathname]);

  const handleMarkRead = async (item: PanelNotificationItem) => {
    if (!item.read_at) {
      await api.notifications.markRead(item.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
  };

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl text-slate-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none">
              <BrandLogo size="md" />
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
                  BugQuest
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold tracking-wider text-blue-600 bg-blue-50 border border-blue-200/80 rounded-lg shadow-xs">
                  AI
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation with Shared-Element Pill */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.authOnly && !user) return null;
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                    active ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-blue-50 border border-blue-200/80 shadow-xs -z-10"
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {user?.role === 'educator' && (
              <Link
                to="/educator"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  location.pathname.startsWith('/educator')
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-teal-700 hover:bg-teal-50/70'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Educator Portal
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-amber-700 hover:bg-amber-50/70'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* User Status & Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {user && (
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setUserDropdownOpen(false);
                  }}
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  className="relative p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-600 transition-all shadow-xs cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => handleMarkRead(item)}
                              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                                !item.read_at ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</p>
                                {!item.read_at && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />}
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{item.message}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifOpen(false);
                  }}
                  aria-expanded={userDropdownOpen}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all shadow-xs cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                    >
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </span>
                  </div>
                  <span className="max-w-[120px] truncate font-semibold text-slate-800">{user.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-blue-100 text-blue-700 border border-blue-200/80 capitalize">
                            {user.role}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">
                            {user.target_role || 'Developer'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1.5 px-1.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors"
                        >
                          <Compass className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/skills"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors"
                        >
                          <BarChart3 className="w-4 h-4 text-slate-400" />
                          Skill Analytics
                        </Link>
                        <Link
                          to="/reports"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors"
                        >
                          <Award className="w-4 h-4 text-amber-500" />
                          Workforce Dossier
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Account Settings
                        </Link>
                      </div>

                      <div className="pt-1 px-1.5 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-blue-sm transition-all duration-200"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
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
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue-600" />
                    {link.name}
                  </Link>
                );
              })}

              {user?.role === 'educator' && (
                <Link
                  to="/educator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-teal-700 hover:bg-teal-50"
                >
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  Educator Portal
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-50"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Admin Console
                </Link>
              )}

              {user ? (
                <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                  <div className="px-3.5 py-2">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm"
                  >
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
