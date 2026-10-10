import { useState } from 'react';
import { Star, GitCommit, ChevronDown, ChevronUp, FileCode2, CheckCircle2, XCircle, Package, FolderTree, FileText } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { githubRepos, languageBreakdown, commitActivity, githubSummary, type GitHubRepo } from '@/lib/githubData';

const readmeQualityBadge: Record<GitHubRepo['readmeQuality'], { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  'well-documented': { variant: 'success', label: 'Well-documented' },
  basic: { variant: 'warning', label: 'Basic' },
  minimal: { variant: 'error', label: 'Minimal' },
  none: { variant: 'error', label: 'No README' },
};

function RepoCard({ repo }: { repo: GitHubRepo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-zinc-100">{repo.name}</span>
            <Badge variant="neutral" size="sm">{repo.language}</Badge>
          </div>
          <p className="text-xs text-zinc-500 line-clamp-1">{repo.description ?? 'No description'}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" /> {repo.stars}
            </span>
            <span>{repo.lastUpdated}</span>
            <Badge variant={readmeQualityBadge[repo.readmeQuality].variant} size="sm">
              {readmeQualityBadge[repo.readmeQuality].label}
            </Badge>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-zinc-800/50 space-y-4">
          {/* Technologies */}
          <div>
            <p className="text-xs font-medium text-zinc-400 mb-2">Technologies detected</p>
            <div className="flex flex-wrap gap-2">
              {repo.technologies.map((tech) => (
                <span key={tech} className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Complexity signals */}
          <div>
            <p className="text-xs font-medium text-zinc-400 mb-2">Project complexity signals</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {repo.hasTests ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> : <XCircle className="w-3.5 h-3.5 text-zinc-600" />}
                <span>{repo.hasTests ? 'Has tests' : 'No tests'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {repo.hasCI ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> : <XCircle className="w-3.5 h-3.5 text-zinc-600" />}
                <span>{repo.hasCI ? 'CI/CD configured' : 'No CI/CD'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Package className="w-3.5 h-3.5 text-zinc-500" />
                <span>{repo.dependencyCount} dependencies</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <FolderTree className="w-3.5 h-3.5 text-zinc-500" />
                <span>{repo.folderDepth} levels deep</span>
              </div>
            </div>
          </div>

          {/* README quality note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <FileText className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">{repo.readmeNote}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export function GitHubInsights() {
  const maxCommits = Math.max(...commitActivity.map((w) => w.count));

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileCode2 className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-zinc-500">Repositories</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{githubSummary.totalRepos}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-zinc-500">Total Stars</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{githubSummary.totalStars}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitCommit className="w-4 h-4 text-teal-500" />
            <span className="text-xs text-zinc-500">Commits (year)</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{githubSummary.totalCommits}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500">Languages</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">{githubSummary.languagesUsed}</div>
        </Card>
      </div>

      {/* Languages breakdown */}
      <Card hover={false} className="p-6">
        <h3 className="text-base font-semibold text-zinc-200 mb-4">Languages Breakdown</h3>
        <div className="flex h-3 rounded-full overflow-hidden mb-4">
          {languageBreakdown.map((lang) => (
            <div
              key={lang.name}
              className="h-full transition-all"
              style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
              title={`${lang.name}: ${lang.percentage}%`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {languageBreakdown.map((lang) => (
            <div key={lang.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
              <span className="text-xs text-zinc-400">{lang.name}</span>
              <span className="text-xs text-zinc-600 tabular-nums ml-auto">{lang.percentage}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Commit activity heatmap */}
      <Card hover={false} className="p-6">
        <h3 className="text-base font-semibold text-zinc-200 mb-1">Commit Activity</h3>
        <p className="text-xs text-zinc-500 mb-5">Contributions over the past 52 weeks</p>
        <div className="flex items-end gap-[3px] h-24">
          {commitActivity.map((week) => {
            const intensity = week.count / maxCommits;
            return (
              <div
                key={week.week}
                className="flex-1 rounded-sm transition-all hover:scale-110 cursor-default group relative"
                style={{
                  backgroundColor: intensity > 0.75
                    ? 'rgb(20, 184, 166)'
                    : intensity > 0.5
                    ? 'rgb(13, 148, 136)'
                    : intensity > 0.25
                    ? 'rgb(9, 107, 100)'
                    : intensity > 0
                    ? 'rgb(6, 78, 70)'
                    : '#27272a',
                }}
                title={`${week.week}: ${week.count} commits`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-zinc-600">
          <span>52 weeks ago</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: i > 0.75 ? 'rgb(20, 184, 166)' : i > 0.5 ? 'rgb(13, 148, 136)' : i > 0.25 ? 'rgb(9, 107, 100)' : i > 0 ? 'rgb(6, 78, 70)' : '#27272a',
                }}
              />
            ))}
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </Card>

      {/* Repositories list */}
      <div>
        <h3 className="text-base font-semibold text-zinc-200 mb-4">Repositories</h3>
        <div className="space-y-3">
          {githubRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  );
}
