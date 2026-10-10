import { useEffect, useState } from 'react';
import { GraduationCap, MapPin, Clock, ExternalLink, Globe, DollarSign } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { CardSkeleton } from '@/components/dashboard/Skeleton';
import { Badge } from '@/components/dashboard/Badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LockedState } from '@/components/dashboard/LockedState';
import { useAuth } from '@/context/AuthContext';
import { internshipListings, type InternshipListing } from '@/lib/jobsData';
import type { DashboardPage } from '@/components/dashboard/Sidebar';

interface InternshipsPageProps {
  onNavigate: (page: DashboardPage) => void;
}

type MatchFilter = 'all' | 'strong' | 'moderate' | 'weak';
type LocationFilter = 'all' | 'remote' | 'onsite';
type SortBy = 'best' | 'recent';

const sourceColors: Record<InternshipListing['source'], string> = {
  'Internshala': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Handshake': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'WayUp': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'LinkedIn': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Glassdoor': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

function InternshipCard({ internship }: { internship: InternshipListing }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-base font-semibold text-white">{internship.title}</h3>
            <Badge
              variant={internship.matchType === 'strong' ? 'success' : internship.matchType === 'moderate' ? 'warning' : 'error'}
              size="sm"
            >
              {internship.matchType === 'strong' ? 'Strong match' : internship.matchType === 'moderate' ? 'Moderate' : 'Weak'}
            </Badge>
            <Badge variant="info" size="sm">
              <GraduationCap className="w-3 h-3" /> Internship
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-500 mb-2 flex-wrap">
            <span className="font-medium text-zinc-300">{internship.company}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {internship.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {internship.posted}
            </span>
            <span className="text-xs text-zinc-500">{internship.duration}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sourceColors[internship.source]}`}>
              {internship.source}
            </span>
            {internship.remote && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Globe className="w-3 h-3" /> Remote
              </span>
            )}
            {internship.isPaid && (
              <span className="flex items-center gap-1 text-xs text-teal-400">
                <DollarSign className="w-3 h-3" /> Paid
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1 shrink-0">
          <div className={`text-2xl font-bold tabular-nums ${
            internship.matchType === 'strong' ? 'text-teal-400' : internship.matchType === 'moderate' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {internship.fitScore}%
          </div>
          <div className="text-xs text-zinc-500">fit</div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-3">
          {internship.matchingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Strong-match skills</p>
              <div className="flex flex-wrap gap-2">
                {internship.matchingSkills.map((skill) => (
                  <Badge key={skill} variant="success" size="sm">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          {internship.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Missing skills</p>
              <div className="flex flex-wrap gap-2">
                {internship.missingSkills.map((skill) => (
                  <Badge key={skill} variant="error" size="sm">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          <a
            href={internship.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press-scale inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            View original posting on {internship.source}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </Card>
  );
}

export function InternshipsPage({ onNavigate }: InternshipsPageProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('best');

  const bothConnected = profile.resumeUploaded && profile.githubConnected;

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

  if (!bothConnected) {
    return (
      <LockedState
        resumeUploaded={profile.resumeUploaded}
        githubConnected={profile.githubConnected}

        title="Internship matches are locked"
        message="Upload your resume and connect GitHub so we can match you to internships using your verified skill scores."
      />
    );
  }

  let filtered = internshipListings;
  if (matchFilter !== 'all') filtered = filtered.filter((j) => j.matchType === matchFilter);
  if (locationFilter === 'remote') filtered = filtered.filter((j) => j.remote);
  if (locationFilter === 'onsite') filtered = filtered.filter((j) => !j.remote);
  if (sortBy === 'best') filtered = [...filtered].sort((a, b) => b.fitScore - a.fitScore);

  return (
    <div className="space-y-5 animate-fade-slide">
      {/* Section banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-teal-500/20 bg-teal-500/5">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-teal-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Internship Opportunities</h3>
          <p className="text-xs text-zinc-500">Curated internship listings matched to your verified skills</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'remote', 'onsite'] as LocationFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setLocationFilter(f)}
              className={`press-scale px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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

      {/* Internship cards */}
      {filtered.length === 0 ? (
        <Card hover={false}>
          <EmptyState
            icon={GraduationCap}
            title="No internships match your filters"
            message="Try adjusting your filters or connect more skill sources to improve your matches."
            actionLabel="Reset filters"
            onAction={() => { setMatchFilter('all'); setLocationFilter('all'); }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      )}
    </div>
  );
}
