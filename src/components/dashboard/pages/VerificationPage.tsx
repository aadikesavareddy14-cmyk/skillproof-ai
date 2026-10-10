import { useEffect, useState } from 'react';
import { FileText, FolderOpen, Brain, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { Badge } from '@/components/dashboard/Badge';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { evidenceSources, verificationBreakdown, overallConfidence } from '@/lib/mockData';

const sourceIcons: Record<string, typeof FileText> = {
  file: FileText,
  folder: FolderOpen,
  brain: Brain,
};

export function VerificationPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-slide">
      {/* Evidence sources */}
      <div>
        <h3 className="text-base font-semibold text-zinc-200 mb-4">Evidence Sources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {evidenceSources.map((source) => {
            const Icon = sourceIcons[source.icon] ?? FileText;
            return (
              <Card key={source.source} gradient className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  {source.verified && (
                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  )}
                </div>
                <div className="text-2xl font-bold tabular-nums text-white mb-1">
                  {source.items}
                </div>
                <div className="text-sm text-zinc-500">{source.source}</div>
                <div className="mt-3">
                  <Badge variant={source.verified ? 'success' : 'neutral'} size="sm">
                    {source.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Overall confidence + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card hover={false} gradient className="p-8 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-zinc-400 mb-6">Overall Confidence</h3>
          <ProgressRing
            value={overallConfidence}
            size={160}
            strokeWidth={10}
            label={`${overallConfidence}%`}
            sublabel="Verified"
            gradientId="verification-ring"
          />
        </Card>

        <Card hover={false} className="p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-zinc-200 mb-6">Confidence Breakdown by Skill</h3>
          <div className="space-y-4">
            {verificationBreakdown.map((item) => (
              <div key={item.skill} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <span className="text-sm font-medium text-zinc-200 w-28 shrink-0">{item.skill}</span>
                <div className="flex-1 flex items-center gap-3 flex-wrap">
                  {item.resumeMentions > 0 && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <FileText className="w-3.5 h-3.5 text-teal-400" /> {item.resumeMentions} resume citations
                    </span>
                  )}
                  {item.projects > 0 && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <FolderOpen className="w-3.5 h-3.5" /> {item.projects} projects
                    </span>
                  )}
                  {item.assessment !== null && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Brain className="w-3.5 h-3.5" /> {item.assessment}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-20 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bar-fill ${
                        item.confidence >= 85 ? 'bg-gradient-to-r from-teal-500 to-blue-500'
                        : item.confidence >= 70 ? 'bg-gradient-to-r from-amber-500 to-blue-500'
                        : 'bg-gradient-to-r from-red-500 to-amber-500'
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-zinc-300 w-10 text-right">
                    {item.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
