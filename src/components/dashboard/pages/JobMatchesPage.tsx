import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, Globe } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { Badge } from '@/components/dashboard/Badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LockedState } from '@/components/dashboard/LockedState';
import { useAuth } from '@/context/AuthContext';
import { jobListings, type JobListing } from '@/lib/jobsData';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

interface JobMatchesPageProps {
  onNavigate: (page: DashboardPage) => void;
}

type MatchFilter = 'all' | 'strong' | 'moderate' | 'weak';
type LocationFilter = 'all' | 'remote' | 'onsite';
type SortBy = 'best' | 'recent';

const sourceColors: Record<JobListing['source'], string> = {
  'RemoteOK': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Adzuna': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Dice': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Himalayas': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Wellfound': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

function JobCard({ job }: { job: JobListing }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-base font-semibold text-white">{job.title}</h3>
            <Badge
              variant={job.matchType === 'strong' ? 'success' : job.matchType === 'moderate' ? 'warning' : 'error'}
              size="sm"
            >
              {job.matchType === 'strong' ? 'Strong match' : job.matchType === 'moderate' ? 'Moderate' : 'Weak'}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-500 mb-2 flex-wrap">
            <span className="font-medium text-zinc-300">{job.company}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {job.posted}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sourceColors[job.source]}`}>
              {job.source}
            </span>
            {job.remote && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Globe className="w-3 h-3" /> Remote
              </span>
            )}
            {job.salary && <span className="text-xs text-zinc-500">{job.salary}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1 shrink-0">
          <div className={`text-2xl font-bold tabular-nums ${
            job.matchType === 'strong' ? 'text-teal-400' : job.matchType === 'moderate' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {job.fitScore}%
          </div>
          <div className="text-xs text-zinc-500">fit</div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-3">
          {job.matchingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Strong-match skills</p>
              <div className="flex flex-wrap gap-2">
                {job.matchingSkills.map((skill) => (
                  <Badge key={skill} variant="success" size="sm">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          {job.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Missing skills</p>
              <div className="flex flex-wrap gap-2">
                {job.missingSkills.map((skill) => (
                  <Badge key={skill} variant="error" size="sm">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press-scale inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            View original posting on {job.source}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </Card>
  );
}

export function JobMatchesPage({ onNavigate: _onNavigate }: JobMatchesPageProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('best');

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
        title="Job matches are locked"
        message="Upload your resume so we can match you to jobs using your verified skill scores — not just keywords."
      />
    );
  }

  let filtered = jobListings;
  if (matchFilter !== 'all') filtered = filtered.filter((j) => j.matchType === matchFilter);
  if (locationFilter === 'remote') filtered = filtered.filter((j) => j.remote);
  if (locationFilter === 'onsite') filtered = filtered.filter((j) => !j.remote);
  if (sortBy === 'best') filtered = [...filtered].sort((a, b) => b.fitScore - a.fitScore);

  return (
    <div className="space-y-5 animate-fade-slide">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'remote', 'onsite'] as LocationFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setLocationFilter(f)}
              className={`press-scale px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                locationFilter === f
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {f === 'all' ? 'All locations' : f === 'remote' ? 'Remote' : 'On-site'}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <div className="flex items-center gap-2">
          {(['all', 'strong', 'moderate', 'weak'] as MatchFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setMatchFilter(f)}
              className={`press-scale px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                matchFilter === f
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {f === 'all' ? 'All matches' : f}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <button
          onClick={() => setSortBy(sortBy === 'best' ? 'recent' : 'best')}
          className="press-scale px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-transparent transition-colors"
        >
          Sort: {sortBy === 'best' ? 'Best match' : 'Most recent'}
        </button>
      </div>

      {/* Job cards */}
      {filtered.length === 0 ? (
        <Card hover={false}>
          <EmptyState
            icon={Briefcase}
            title="No jobs match your filters"
            message="Try adjusting your filters or upload an updated resume to improve your matches."
            actionLabel="Reset filters"
            onAction={() => { setMatchFilter('all'); setLocationFilter('all'); }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
