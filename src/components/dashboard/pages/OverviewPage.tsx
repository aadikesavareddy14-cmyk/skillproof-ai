import { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Lightbulb,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { Badge } from '@/components/dashboard/Badge';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { LockedState } from '@/components/dashboard/LockedState';
import { useAuth } from '@/context/AuthContext';
import { computeScores } from '@/lib/scoringService';
import type { QualitativeScoreTier } from '@/lib/resumeData';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

interface OverviewPageProps {
  onNavigate: (page: DashboardPage) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const ctx = useMemo(
    () => ({
      resumeUploaded: profile.resumeUploaded,
      previousScore: profile.resumePreviousScore,
      fileName: profile.resumeFileName ?? undefined,
    }),
    [profile.resumeUploaded, profile.resumePreviousScore, profile.resumeFileName],
  );

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

  if (!profile.resumeUploaded) {
    return (
      <div className="animate-fade-slide">
        <LockedState
          resumeUploaded={false}
          title="Your skill profile is locked"
          message="Upload your resume to unlock your verified skill score, job matches, and learning roadmap."
        />
      </div>
    );
  }

  const qualitativeVariant: Record<QualitativeScoreTier, 'error' | 'warning' | 'success' | 'info'> = {
    'Needs Major Work': 'error',
    'Below Average': 'warning',
    Good: 'warning',
    Strong: 'info',
    Excellent: 'success',
  };

  const stats = [
    {
      key: 'score',
      label: 'Resume Score',
      icon: Sparkles,
      value: `${scoringResult.overallScore}/100`,
      trend: scoringResult.qualitativeLabel,
      color: 'text-blue-400',
    },
    {
      key: 'skills',
      label: 'Extracted Skills',
      icon: ShieldCheck,
      value: scoringResult.skills.length,
      trend: 'Evidence verified',
      color: 'text-teal-400',
    },
    {
      key: 'jobs',
      label: 'Job Matches',
      icon: Briefcase,
      value: scoringResult.jobMatches.length,
      trend: 'Matched on skills',
      color: 'text-amber-400',
    },
    {
      key: 'suggestions',
      label: 'Improvement Tips',
      icon: Lightbulb,
      value: scoringResult.suggestions.length,
      trend: 'Actionable steps',
      color: 'text-violet-400',
    },
  ];

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

      {/* Prominent Score Ring + Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overall Resume Score ring */}
        <Card hover={false} gradient className="p-8 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Overall Resume Score
            </h3>
          </div>

          <ProgressRing
            value={scoringResult.overallScore}
            size={160}
            strokeWidth={10}
            label={`${scoringResult.overallScore}`}
            sublabel="/ 100"
          />

          <div className="mt-5 flex items-center gap-2 flex-wrap justify-center">
            <Badge variant={qualitativeVariant[scoringResult.qualitativeLabel]} size="md">
              {scoringResult.qualitativeLabel}
            </Badge>

            {scoringResult.scoreDelta !== null && scoringResult.scoreDelta !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  scoringResult.scoreDelta > 0
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                {scoringResult.scoreDelta > 0 ? `+${scoringResult.scoreDelta}` : scoringResult.scoreDelta} pts since last upload
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 mt-4 max-w-xs leading-relaxed">
            Evaluated on 100-point rubric: Contact, Summary, Experience, Projects, Skills, Education, Formatting, and Keywords.
          </p>
        </Card>

        {/* 8-Category Rubric Breakdown */}
        <Card hover={false} className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <h3 className="text-base font-semibold text-zinc-200">100-Point Scoring Rubric Breakdown</h3>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Full analysis <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {scoringResult.rubricSections.map((sec) => {
              const pct = Math.round((sec.score / sec.maxScore) * 100);
              return (
                <div key={sec.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300 truncate">{sec.name}</span>
                    <span className="tabular-nums font-semibold text-zinc-200 shrink-0">
                      {sec.score}/{sec.maxScore} pts
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                          : pct >= 60
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-red-500 to-rose-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Skills Breakdown */}
      <Card hover={false} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-500" />
            <h3 className="text-base font-semibold text-zinc-200">Top Verified Skills</h3>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
          >
            View all skills <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scoringResult.skills.slice(0, 6).map((skill, i) => (
            <div
              key={skill.name}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200">{skill.name}</span>
                  <Badge variant="neutral" size="sm">
                    {skill.level}
                  </Badge>
                </div>
                <span className="text-sm font-bold tabular-nums text-zinc-200">
                  {skill.confidence}%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 bar-fill"
                  style={{ width: `${skill.confidence}%`, animation: `bar-grow 0.8s ease ${i * 0.1}s forwards` }}
                />
              </div>

              <p className="text-xs text-zinc-400 leading-snug">{skill.supportLabel}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Improvement Suggestions + Job Matches Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Actionable Improvement Suggestions */}
        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-zinc-200">Improvement Suggestions</h3>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
            >
              View details <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {scoringResult.suggestions.slice(0, 3).map((sug) => (
              <div
                key={sug.id}
                className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">{sug.title}</span>
                  <Badge variant="warning" size="sm">
                    {sug.impact}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{sug.suggestion}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Job Matches */}
        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-semibold text-zinc-200">Top Job Matches</h3>
            </div>
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
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors"
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
      </div>
    </div>
  );
}
