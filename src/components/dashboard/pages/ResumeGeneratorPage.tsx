import { ResumeAnalysis } from '@/components/dashboard/ResumeAnalysis';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

interface ResumeGeneratorPageProps {
  onNavigate?: (page: DashboardPage) => void;
}

export function ResumeGeneratorPage({ onNavigate: _onNavigate }: ResumeGeneratorPageProps) {
  return <ResumeAnalysis />;
}
