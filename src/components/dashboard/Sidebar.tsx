import { useState } from 'react';
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Map,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SkillProofLogo, SkillProofCube } from '@/components/SkillProofLogo';

export type DashboardPage = 'overview' | 'profile' | 'jobs' | 'internships' | 'verification' | 'roadmap' | 'settings';

interface SidebarProps {
  active: DashboardPage;
  onNavigate: (page: DashboardPage) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems: { id: DashboardPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Skill Profile', icon: User },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'internships', label: 'Internships', icon: GraduationCap },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ active, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen shrink-0 glass border-r border-zinc-800/50 flex flex-col transition-all duration-300 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Top of Sidebar with Smooth Crossfade */}
        <div
          className={`h-16 flex items-center border-b border-zinc-800/30 transition-all duration-300 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          <div className="relative flex items-center justify-center min-h-[40px] overflow-hidden">
            {/* Expanded State: Icon + Wordmark */}
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${
                collapsed
                  ? 'opacity-0 -translate-x-4 pointer-events-none absolute'
                  : 'opacity-100 translate-x-0 relative'
              }`}
            >
              <SkillProofLogo variant="lockup" size="navbar" />
            </div>

            {/* Collapsed State: Cube Icon Only */}
            <div
              className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
                collapsed
                  ? 'opacity-100 scale-100 relative'
                  : 'opacity-0 scale-75 pointer-events-none absolute'
              }`}
              title="SkillProof AI"
            >
              <SkillProofCube size={34} />
            </div>
          </div>

          {/* Desktop collapse/expand toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors ${
              collapsed ? 'mt-2' : ''
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onMobileClose();
                }}
                title={collapsed ? item.label : undefined}
                className={`group relative w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'text-white bg-blue-600/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-teal-500" />
                )}
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-blue-600/5" />
                )}
                <item.icon
                  className={`w-4.5 h-4.5 relative z-10 transition-colors shrink-0 ${
                    isActive ? 'text-blue-500' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                  style={{ width: 18, height: 18 }}
                />
                {!collapsed && (
                  <span className="relative z-10 truncate transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Widget */}
        <div className="px-3 py-4 border-t border-zinc-800/30">
          {collapsed ? (
            <div
              className="rounded-xl bg-gradient-to-b from-blue-950/30 to-zinc-900/20 border border-zinc-800/50 p-2 flex flex-col items-center cursor-pointer"
              onClick={() => setCollapsed(false)}
              title="Profile completeness: 82%"
            >
              <span className="text-[10px] font-bold text-blue-400 tabular-nums">82%</span>
            </div>
          ) : (
            <div className="rounded-xl bg-gradient-to-b from-blue-950/30 to-zinc-900/20 border border-zinc-800/50 p-4 transition-all duration-200">
              <p className="text-xs font-medium text-zinc-300 mb-1">Profile completeness</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 bar-fill"
                    style={{ width: '82%' }}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-300 tabular-nums">82%</span>
              </div>
              <p className="text-xs text-zinc-500">Connect more sources to boost your score</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
