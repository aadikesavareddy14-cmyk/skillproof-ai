import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Map,
  Settings,
  ShieldCheck as Logo,
} from 'lucide-react';

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
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 glass border-r border-zinc-800/50 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-6 border-b border-zinc-800/30">
          <Logo className="w-7 h-7 text-blue-500" strokeWidth={2.2} />
          <span className="text-lg font-semibold tracking-tight">
            SkillProof<span className="text-blue-500"> AI</span>
          </span>
        </div>

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
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white bg-blue-600/8'
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
                  className={`w-4.5 h-4.5 relative z-10 transition-colors ${
                    isActive ? 'text-blue-500' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                  style={{ width: 18, height: 18 }}
                />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-zinc-800/30">
          <div className="rounded-xl bg-gradient-to-b from-blue-950/30 to-zinc-900/20 border border-zinc-800/50 p-4">
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
        </div>
      </aside>
    </>
  );
}
