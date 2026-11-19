import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, PanelNotificationItem } from '../api/client';
import { BrandLogo } from './BrandLogo';
import {
  Bell,
  CheckCheck,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';

export interface DashboardNavItem {
  id: string;
  label: string;
  section?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  to?: string;
}

interface DashboardShellProps {
  portalTitle: string;
  portalSubtitle: string;
  accent: 'amber' | 'teal';
  navItems: DashboardNavItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  pageTitle: string;
  pageDescription?: string;
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  portalTitle,
  portalSubtitle,
  accent,
  navItems,
  activeTab,
  onSelectTab,
  pageTitle,
  pageDescription,
  headerActions,
  sidebarFooter,
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<PanelNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
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
  }, [user, activeTab]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  const accentClasses =
    accent === 'amber'
      ? {
          logoBg: 'bg-amber-500 text-slate-950',
          badgePill: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          activeItem: 'bg-amber-500/15 text-white border-amber-400/40',
          activeIcon: 'text-amber-400',
          activeBadge: 'bg-amber-500 text-slate-950',
        }
      : {
          logoBg: 'bg-teal-500 text-slate-950',
          badgePill: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
          activeItem: 'bg-teal-500/15 text-white border-teal-400/40',
          activeIcon: 'text-teal-400',
          activeBadge: 'bg-teal-500 text-slate-950',
        };

  // Group nav items by section
  const sections = navItems.reduce<Array<{ name: string; items: DashboardNavItem[] }>>((acc, item) => {
    const secName = item.section || 'Workspace';
    let found = acc.find((s) => s.name === secName);
    if (!found) {
      found = { name: secName, items: [] };
      acc.push(found);
    }
    found.items.push(item);
    return acc;
  }, []);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/90 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo size="md" dark />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-white tracking-tight truncate">BugQuest AI</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{portalTitle}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label={portalTitle}>
        {sections.map((section) => (
          <div key={section.name} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-500 tracking-wide mb-2">
              {section.name}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const content = (
                <>
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? accentClasses.activeIcon : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums shrink-0 ${
                        isActive ? accentClasses.activeBadge : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              );

              if (item.to) {
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent transition-all duration-150 cursor-pointer"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    isActive
                      ? `${accentClasses.activeItem} font-semibold shadow-xs`
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border-transparent'
                  }`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Optional Footer Widget */}
      {sidebarFooter && (
        <div className="px-3 pb-3 shrink-0">{sidebarFooter}</div>
      )}

      {/* Bottom Utility Links */}
      <div className="p-3 border-t border-slate-800/90 space-y-1 shrink-0">
        <Link
          to="/challenges"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
        >
          <span>View Public Library</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f1f5f9] text-slate-900 font-sans">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen border-r border-slate-800">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Utility Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium truncate">{portalSubtitle}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="font-semibold text-slate-900 truncate">{pageTitle}</span>
              </div>
              {pageDescription && (
                <p className="hidden sm:block text-xs text-slate-500 truncate mt-0.5">{pageDescription}</p>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {headerActions}

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        You're all caught up.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleMarkRead(item)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                            !item.read_at ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</p>
                            {!item.read_at && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            {user && (
              <div className="hidden sm:flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-slate-900 max-w-[130px] truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
