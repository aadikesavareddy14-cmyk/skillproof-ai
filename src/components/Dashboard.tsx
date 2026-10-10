import { useState } from 'react';
import { Sidebar, type DashboardPage } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { OverviewPage } from '@/components/dashboard/pages/OverviewPage';
import { SkillProfilePage } from '@/components/dashboard/pages/SkillProfilePage';
import { JobMatchesPage } from '@/components/dashboard/pages/JobMatchesPage';
import { InternshipsPage } from '@/components/dashboard/pages/InternshipsPage';
import { VerificationPage } from '@/components/dashboard/pages/VerificationPage';
import { RoadmapPage } from '@/components/dashboard/pages/RoadmapPage';
import { SettingsPage } from '@/components/dashboard/pages/SettingsPage';

interface DashboardProps {
  onSignOut: () => void;
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const [page, setPage] = useState<DashboardPage>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return <OverviewPage onNavigate={setPage} />;
      case 'profile':
        return <SkillProfilePage onNavigate={setPage} />;
      case 'jobs':
        return <JobMatchesPage onNavigate={setPage} />;
      case 'internships':
        return <InternshipsPage onNavigate={setPage} />;
      case 'verification':
        return <VerificationPage />;
      case 'roadmap':
        return <RoadmapPage onNavigate={setPage} />;
      case 'settings':
        return <SettingsPage onSignOut={onSignOut} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex">
      <Sidebar
        active={page}
        onNavigate={setPage}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar page={page} onMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div key={page} className="animate-fade-slide">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
