import { useEffect, useState, useMemo } from 'react';
import { Network, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { Badge } from '@/components/dashboard/Badge';
import { ResumeAnalysis } from '@/components/dashboard/ResumeAnalysis';
import { LockedState, AnalyzingState } from '@/components/dashboard/LockedState';
import { useAuth } from '@/context/AuthContext';
import { computeScores, type ScoredSkill } from '@/lib/scoringService';
import { skillGraph } from '@/lib/mockData';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

type Tab = 'skills' | 'resume';

const tabs: { id: Tab; label: string; icon: typeof Network }[] = [
  { id: 'skills', label: 'Verified Skills', icon: Network },
  { id: 'resume', label: 'Resume Analysis', icon: FileText },
];

interface SkillProfilePageProps {
  onNavigate: (page: DashboardPage) => void;
}

export function SkillProfilePage({ onNavigate: _onNavigate }: SkillProfilePageProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('skills');
  const [analyzing, setAnalyzing] = useState(false);
  const [scoresReady, setScoresReady] = useState(false);

  const isUnlocked = profile.resumeUploaded;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isUnlocked && !scoresReady) {
      setAnalyzing(true);
      const timer = setTimeout(() => {
        setAnalyzing(false);
        setScoresReady(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (!isUnlocked) {
      setScoresReady(false);
      setAnalyzing(false);
    }
  }, [isUnlocked, scoresReady]);

  const scoringResult = useMemo(
    () =>
      computeScores({
        resumeUploaded: profile.resumeUploaded,
        previousScore: profile.resumePreviousScore,
        fileName: profile.resumeFileName ?? undefined,
      }),
    [profile.resumeUploaded, profile.resumePreviousScore, profile.resumeFileName],
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const showLocked = !isUnlocked;
  const showAnalyzing = isUnlocked && analyzing && !scoresReady;

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* Tab switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`press-scale flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fade-slide">
        {tab === 'skills' && (
          <>
            {showLocked && (
              <LockedState
                resumeUploaded={false}
                title="Your skill score is locked"
                message="Upload your resume to unlock your verified skill score, job matches, and learning roadmap."
              />
            )}

            {showAnalyzing && <AnalyzingState />}

            {scoresReady && scoringResult.ready && (
              <>
                {/* Skill Knowledge Graph */}
                <Card hover={false} gradient className="p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                      <Network className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-zinc-200">Skill Knowledge Graph</h3>
                      <p className="text-xs text-zinc-500">How your verified skills interconnect</p>
                    </div>
                  </div>

                  <div className="relative w-full h-[400px] rounded-xl bg-zinc-950/50 border border-zinc-800/50 overflow-hidden">
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      {skillGraph.edges.map((edge, i) => {
                        const from = skillGraph.nodes.find((n) => n.id === edge.from)!;
                        const to = skillGraph.nodes.find((n) => n.id === edge.to)!;
                        return (
                          <line
                            key={i}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke="#27272a"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              from="8"
                              to="0"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </line>
                        );
                      })}

                      {skillGraph.nodes.map((node) => (
                        <g key={node.id} className="node-glow cursor-pointer">
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.size}
                            fill={node.color}
                            fillOpacity="0.15"
                            stroke={node.color}
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.size * 0.5}
                            fill={node.color}
                            fillOpacity="0.3"
                          />
                          <text
                            x={node.x}
                            y={node.y + node.size + 14}
                            textAnchor="middle"
                            className="fill-zinc-400 text-[10px] font-medium select-none"
                          >
                            {node.label}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-zinc-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Core
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500" /> Backend
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Design
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Skill cards with resume evidence grounding */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {scoringResult.skills.map((skill, i) => (
                    <SkillCard key={skill.name} skill={skill} index={i} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'resume' && <ResumeAnalysis />}
      </div>
    </div>
  );
}

function SkillCard({ skill, index: _index }: { skill: ScoredSkill; index: number }) {
  const isListedOnly = skill.supportLevel === 'listed-only';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-semibold text-zinc-200">{skill.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="neutral" size="sm">
              {skill.level}
            </Badge>
            {skill.confidence >= 85 ? (
              <Badge variant="success" size="sm">
                High confidence
              </Badge>
            ) : skill.confidence >= 65 ? (
              <Badge variant="warning" size="sm">
                Medium confidence
              </Badge>
            ) : (
              <Badge variant="error" size="sm">
                Low confidence
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-white">{skill.confidence}%</div>
          <div className="text-xs text-zinc-500">confidence</div>
        </div>
      </div>

      <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full bar-fill ${
            skill.confidence >= 85
              ? 'bg-gradient-to-r from-blue-500 to-teal-400'
              : skill.confidence >= 65
              ? 'bg-gradient-to-r from-blue-500 to-amber-400'
              : 'bg-gradient-to-r from-amber-500 to-red-500'
          }`}
          style={{ width: `${skill.confidence}%` }}
        />
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
          {isListedOnly ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          )}
          <span className={isListedOnly ? 'text-amber-400' : 'text-zinc-300'}>
            {skill.supportLabel}
          </span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{skill.evidence}</p>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50">
        {skill.sources.map((source) => (
          <span
            key={source}
            className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400 border border-zinc-700/40"
          >
            {source}
          </span>
        ))}
      </div>
    </Card>
  );
}
