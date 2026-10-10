import { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck,
  Briefcase,
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { Badge } from '@/components/dashboard/Badge';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { LockedState } from '@/components/dashboard/LockedState';
import { useAuth } from '@/context/AuthContext';
import { computeScores } from '@/lib/scoringService';
import { recentActivity } from '@/lib/mockData';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

interface OverviewPageProps {
  onNavigate: (page: DashboardPage) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const ctx = useMemo(
    () => ({ resumeUploaded: profile.resumeUploaded, githubConnected: profile.githubConnected }),
    [profile.resumeUploaded, profile.githubConnected],
  );
  const bothConnected = ctx.resumeUploaded && ctx.githubConnected;
  const scoringResult = useMemo(() => computeScores(ctx), [ctx]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!bothConnected) {
    return (
      <div className="animate-fade-slide">
        <LockedState
          resumeUploaded={ctx.resumeUploaded}
          githubConnected={ctx.githubConnected}

          title="Your profile is locked"
          message="Upload your resume and connect GitHub to unlock your verified skill score, job matches, and learning roadmap."
        />
      </div>
    );
  }

  const stats = scoringResult.ready
    ? [
        { key: 'skills', label: 'Skills Verified', icon: ShieldCheck, value: scoringResult.skills.length, trend: 'Verified score', color: 'text-blue-500' },
        { key: 'jobs', label: 'Job Matches', icon: Briefcase, value: scoringResult.jobMatches.length, trend: 'Based on real scores', color: 'text-teal-500' },
        { key: 'confidence', label: 'Avg Confidence', icon: TrendingUp, value: `${scoringResult.overallConfidence}%`, trend: 'Cross-referenced', color: 'text-amber-500' },
        { key: 'roadmap', label: 'Roadmap Steps', icon: FileCheck, value: scoringResult.roadmapSteps.length, trend: 'Personalized', color: 'text-violet-400' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-slide">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Card key={stat.key} gradient className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-zinc-500 mb-3">{stat.label}</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <ArrowUpRight className="w-3.5 h-3.5 text-teal-500" />
              {stat.trend}
            </div>
          </Card>
        ))}
      </div>

      {/* Confidence ring + top skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card hover={false} gradient className="p-8 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-zinc-400 mb-6">Overall Confidence</h3>
          <ProgressRing
            value={scoringResult.overallConfidence}
            size={160}
            strokeWidth={10}
            label={`${scoringResult.overallConfidence}%`}
            sublabel="Verified"
          />
          <p className="text-xs text-zinc-500 mt-6 text-center max-w-xs">
            Grounded in GitHub activity, resume evidence, and external skill benchmarks
          </p>
        </Card>

        <Card hover={false} className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-zinc-200">Top Verified Skills</h3>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-5">
            {scoringResult.skills.slice(0, 5).map((skill, i) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">{skill.name}</span>
                    <Badge variant="neutral" size="sm">{skill.level}</Badge>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-zinc-300">
                    {skill.confidence}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 bar-fill"
                    style={{ width: '0%', animation: `bar-grow 1s ease ${i * 0.15}s forwards` }}
                    ref={(el) => {
                      if (el) setTimeout(() => { el.style.width = `${skill.confidence}%`; }, 100);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Job matches preview + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-zinc-200">Top Job Matches</h3>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {scoringResult.jobMatches.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-200">{job.title}</span>
                    <Badge
                      variant={job.matchType === 'strong' ? 'success' : job.matchType === 'moderate' ? 'warning' : 'error'}
                      size="sm"
                    >
                      {job.matchType === 'strong' ? 'Strong match' : job.matchType === 'moderate' ? 'Moderate' : 'Weak'}
                    </Badge>
                  </div>
                  <span className="text-xs text-zinc-500">{job.company} · {job.location}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums text-white">{job.fitScore}%</div>
                  <div className="text-xs text-zinc-500">fit</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <h3 className="text-base font-semibold text-zinc-200 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 leading-snug">{activity.action}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
