export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  source: 'RemoteOK' | 'Adzuna' | 'GitHub Jobs' | 'Himalayas' | 'Wellfound';
  sourceUrl: string;
  fitScore: number;
  matchType: 'strong' | 'moderate' | 'weak';
  matchingSkills: string[];
  missingSkills: string[];
  posted: string;
  salary?: string;
}

export interface InternshipListing {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  source: 'Internshala' | 'Handshake' | 'WayUp' | 'LinkedIn' | 'Glassdoor';
  sourceUrl: string;
  fitScore: number;
  matchType: 'strong' | 'moderate' | 'weak';
  matchingSkills: string[];
  missingSkills: string[];
  posted: string;
  duration: string;
  isPaid: boolean;
}

export const jobListings: JobListing[] = [
  {
    id: 'j1',
    title: 'Senior Full-Stack Engineer',
    company: 'Vercel',
    location: 'Remote',
    remote: true,
    source: 'RemoteOK',
    sourceUrl: 'https://remoteok.com/remote-fullstack-jobs',
    fitScore: 94,
    matchType: 'strong',
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'Next.js'],
    missingSkills: ['GraphQL'],
    posted: '2 days ago',
    salary: '$160k–$220k',
  },
  {
    id: 'j2',
    title: 'Staff Software Engineer',
    company: 'Linear',
    location: 'San Francisco, CA',
    remote: false,
    source: 'Wellfound',
    sourceUrl: 'https://wellfound.com/jobs',
    fitScore: 88,
    matchType: 'strong',
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'System Design'],
    missingSkills: ['Rust'],
    posted: '5 days ago',
    salary: '$180k–$240k',
  },
  {
    id: 'j3',
    title: 'Backend Engineer',
    company: 'Stripe',
    location: 'Remote',
    remote: true,
    source: 'Himalayas',
    sourceUrl: 'https://himalayas.app/jobs',
    fitScore: 76,
    matchType: 'moderate',
    matchingSkills: ['Python', 'Node.js', 'SQL'],
    missingSkills: ['Go', 'Kubernetes'],
    posted: '1 week ago',
    salary: '$140k–$190k',
  },
  {
    id: 'j4',
    title: 'Platform Engineer',
    company: 'Supabase',
    location: 'Remote',
    remote: true,
    source: 'RemoteOK',
    sourceUrl: 'https://remoteok.com/remote-devops-jobs',
    fitScore: 71,
    matchType: 'moderate',
    matchingSkills: ['TypeScript', 'Node.js', 'Docker'],
    missingSkills: ['PostgreSQL Admin', 'Terraform'],
    posted: '1 week ago',
    salary: '$130k–$180k',
  },
  {
    id: 'j5',
    title: 'ML Infrastructure Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    remote: false,
    source: 'Adzuna',
    sourceUrl: 'https://adzuna.com/search',
    fitScore: 58,
    matchType: 'weak',
    matchingSkills: ['Python'],
    missingSkills: ['PyTorch', 'CUDA', 'Distributed Training'],
    posted: '3 days ago',
    salary: '$200k–$280k',
  },
  {
    id: 'j6',
    title: 'Frontend Engineer',
    company: 'Figma',
    location: 'Remote',
    remote: true,
    source: 'Himalayas',
    sourceUrl: 'https://himalayas.app/jobs',
    fitScore: 91,
    matchType: 'strong',
    matchingSkills: ['React', 'TypeScript', 'CSS'],
    missingSkills: ['WebGL'],
    posted: '4 days ago',
    salary: '$150k–$200k',
  },
  {
    id: 'j7',
    title: 'DevOps Engineer',
    company: 'Cloudflare',
    location: 'Remote',
    remote: true,
    source: 'RemoteOK',
    sourceUrl: 'https://remoteok.com/remote-devops-jobs',
    fitScore: 64,
    matchType: 'weak',
    matchingSkills: ['Docker', 'Node.js'],
    missingSkills: ['Terraform', 'Kubernetes', 'AWS'],
    posted: '6 days ago',
    salary: '$140k–$190k',
  },
];

export const internshipListings: InternshipListing[] = [
  {
    id: 'i1',
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    remote: false,
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/jobs/internships',
    fitScore: 89,
    matchType: 'strong',
    matchingSkills: ['Python', 'React', 'TypeScript', 'Data Structures'],
    missingSkills: ['C++'],
    posted: '1 day ago',
    duration: '12 weeks',
    isPaid: true,
  },
  {
    id: 'i2',
    title: 'Frontend Engineering Intern',
    company: 'Vercel',
    location: 'Remote',
    remote: true,
    source: 'Handshake',
    sourceUrl: 'https://joinhandshake.com/jobs',
    fitScore: 93,
    matchType: 'strong',
    matchingSkills: ['React', 'TypeScript', 'Next.js', 'CSS'],
    missingSkills: [],
    posted: '2 days ago',
    duration: '10 weeks',
    isPaid: true,
  },
  {
    id: 'i3',
    title: 'Backend Engineering Intern',
    company: 'Stripe',
    location: 'Remote',
    remote: true,
    source: 'WayUp',
    sourceUrl: 'https://wayup.com/jobs',
    fitScore: 82,
    matchType: 'strong',
    matchingSkills: ['Python', 'Node.js', 'SQL'],
    missingSkills: ['Go'],
    posted: '3 days ago',
    duration: '12 weeks',
    isPaid: true,
  },
  {
    id: 'i4',
    title: 'Full-Stack Developer Intern',
    company: 'Supabase',
    location: 'Remote',
    remote: true,
    source: 'Internshala',
    sourceUrl: 'https://internshala.com/jobs',
    fitScore: 85,
    matchType: 'strong',
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    missingSkills: ['Docker'],
    posted: '5 days ago',
    duration: '16 weeks',
    isPaid: true,
  },
  {
    id: 'i5',
    title: 'ML Research Intern',
    company: 'DeepMind',
    location: 'London, UK',
    remote: false,
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/jobs/internships',
    fitScore: 54,
    matchType: 'weak',
    matchingSkills: ['Python'],
    missingSkills: ['PyTorch', 'Research Methods', 'Linear Algebra'],
    posted: '1 week ago',
    duration: '12 weeks',
    isPaid: true,
  },
  {
    id: 'i6',
    title: 'DevOps Intern',
    company: 'Red Hat',
    location: 'Remote',
    remote: true,
    source: 'Glassdoor',
    sourceUrl: 'https://glassdoor.com/jobs',
    fitScore: 67,
    matchType: 'moderate',
    matchingSkills: ['Docker', 'Linux'],
    missingSkills: ['Kubernetes', 'Ansible'],
    posted: '4 days ago',
    duration: '10 weeks',
    isPaid: true,
  },
];
