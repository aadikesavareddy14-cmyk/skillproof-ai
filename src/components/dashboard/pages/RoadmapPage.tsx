import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { Badge } from '@/components/dashboard/Badge';
import { LockedState } from '@/components/dashboard/LockedState';
import { useAuth } from '@/context/AuthContext';
import { roadmapSteps } from '@/lib/mockData';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

interface RoadmapPageProps {
  onNavigate: (page: DashboardPage) => void;
}

export function RoadmapPage({ onNavigate }: RoadmapPageProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!profile.resumeUploaded) {
    return (
      <LockedState
        resumeUploaded={false}
        title="Your learning roadmap is locked"
        message="Upload your resume so we can generate a personalized roadmap based on your verified skill gaps."
      />
    );
  }

  const completedCount = roadmapSteps.filter((s) => s.status === 'completed').length;
  const totalCount = roadmapSteps.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8 animate-fade-slide">
      {/* Progress summary */}
      <Card hover={false} gradient className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-200">Learning Roadmap Progress</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {completedCount} of {totalCount} steps completed
            </p>
          </div>
          <span className="text-2xl font-bold tabular-nums text-white">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/50 via-zinc-700 to-zinc-800" />

        <div className="space-y-5">
          {roadmapSteps.map((step, i) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in-progress';
            const isUpcoming = step.status === 'upcoming';

            return (
              <div
                key={step.id}
                className="relative pl-16"
                style={{ animation: `fade-slide 0.4s ease ${i * 0.1}s both` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    isCompleted
                      ? 'bg-teal-500/10 border-teal-500/30'
                      : isInProgress
                      ? 'bg-blue-500/10 border-blue-500/30 animate-pulse-glow'
                      : 'bg-zinc-800/50 border-zinc-700/50'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-500" />
                    ) : isInProgress ? (
                      <Circle className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <Card className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-zinc-100">{step.title}</h4>
                        {isInProgress && (
                          <Badge variant="info" size="sm">In progress</Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="success" size="sm">Completed</Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800/50">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <BookOpen className="w-3.5 h-3.5" /> {step.skill}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="w-3.5 h-3.5" /> {step.duration}
                    </span>
                    <span className="text-xs text-zinc-500">{step.resources} resources</span>
                    {isUpcoming && (
                      <button className="press-scale ml-auto flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                        Start now <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
