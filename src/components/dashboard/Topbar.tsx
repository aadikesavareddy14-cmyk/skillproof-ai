import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

interface TopbarProps {
  page: DashboardPage;
  onMobileMenu: () => void;
}

const pageTitles: Record<DashboardPage, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Your verified skill profile at a glance' },
  profile: { title: 'Skill Profile', subtitle: 'Your verified skills and knowledge graph' },
  jobs: { title: 'Jobs', subtitle: 'Full-time roles matched to your verified skills' },
  internships: { title: 'Internships', subtitle: 'Internship opportunities matched to your skills' },
  verification: { title: 'Verification', subtitle: 'Evidence sources and confidence breakdown' },
  roadmap: { title: 'Roadmap', subtitle: 'Your personalized learning path' },
  settings: { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

export function Topbar({ page, onMobileMenu }: TopbarProps) {
  const { profile } = useAuth();
  const { title, subtitle } = pageTitles[page];

  const displayName = profile.name ?? profile.email ?? 'User';
  const initials = profile.name
    ? profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : (profile.email?.slice(0, 2).toUpperCase() ?? 'SP');

  return (
    <header className="sticky top-0 z-30 glass border-b border-zinc-800/50">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenu}
            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-600">Dashboard</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-200 font-medium">{title}</span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-500">
            <Search className="w-4 h-4" />
            <span className="text-xs">Search skills, jobs...</span>
          </div>
          <button className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-zinc-950" />
          </button>
          <div className="flex items-center gap-2.5">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full border border-zinc-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-xs font-semibold text-white">
                {initials}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-zinc-300 max-w-[120px] truncate">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
