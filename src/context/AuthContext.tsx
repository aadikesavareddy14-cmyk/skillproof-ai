import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'email' | null;
  githubUsername: string | null;
  githubConnected: boolean;
  resumeUploaded: boolean;
  resumeFileName: string | null;
}

interface ConnectGithubResult {
  error: string | null;
  mismatch?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile;
  loading: boolean;
  isNewUser: boolean;
  githubEmailMismatch: string | null;
  dismissGithubMismatch: () => void;
  uploadResume: (fileName: string, fileSize: number) => Promise<void>;
  connectGithub: (username: string, force?: boolean) => Promise<ConnectGithubResult>;
  disconnectGithub: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  linkGoogle: () => Promise<{ error: string | null }>;
  unlinkGoogle: () => Promise<{ error: string | null }>;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractProfile(
  user: User | null,
  githubConnected: boolean,
  githubUsername: string | null,
  resumeUploaded: boolean,
  resumeFileName: string | null,
): UserProfile {
  if (!user) return { name: null, email: null, avatarUrl: null, provider: null, githubUsername: null, githubConnected: false, resumeUploaded: false, resumeFileName: null };

  const meta = user.user_metadata ?? {};
  const provider = user.app_metadata?.provider as 'google' | 'email' | undefined;

  return {
    name: meta.full_name ?? meta.name ?? null,
    email: user.email ?? null,
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    provider: provider === 'google' ? 'google' : 'email',
    githubUsername,
    githubConnected,
    resumeUploaded,
    resumeFileName,
  };
}

async function validateGithubUsername(username: string): Promise<{ valid: boolean; email: string | null }> {
  try {
    const { data } = await supabase.functions.invoke('validate-github-username', {
      method: 'GET',
      body: { username },
    });
    if (data && data.valid) {
      return { valid: true, email: data.email ?? null };
    }
    return { valid: false, email: null };
  } catch {
    return { valid: false, email: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [githubEmailMismatch, setGithubEmailMismatch] = useState<string | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession) {
          const createdAt = newSession.user?.created_at;
          if (createdAt) {
            const ageMs = Date.now() - new Date(createdAt).getTime();
            setIsNewUser(ageMs < 60_000);
          }
          await loadProfileState(newSession.user.id);
        }

        if (event === 'SIGNED_OUT') {
          setIsNewUser(false);
          setGithubConnected(false);
          setGithubUsername(null);
          setResumeUploaded(false);
          setResumeFileName(null);
        }
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadProfileState(userId: string) {
    const { data } = await supabase
      .from('profile_state')
      .select('resume_uploaded, resume_file_name, github_connected, github_username')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setResumeUploaded(data.resume_uploaded ?? false);
      setResumeFileName(data.resume_file_name ?? null);
      setGithubConnected(data.github_connected ?? false);
      setGithubUsername(data.github_username ?? null);
    }
  }

  async function upsertProfileState(updates: Record<string, unknown>) {
    if (!session?.user?.id) return;
    await supabase
      .from('profile_state')
      .upsert({
        id: session.user.id,
        user_id: session.user.id,
        updated_at: new Date().toISOString(),
        ...updates,
      });
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { full_name: name } } : undefined,
    });
    if (!error && data.user) {
      setIsNewUser(true);
    }
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    return { error: error?.message ?? null };
  };

  const linkGoogle = async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    return { error: error?.message ?? null };
  };

  const unlinkGoogle = async () => {
    const { data: identities } = await supabase.auth.getUserIdentities();
    const googleIdentity = identities?.identities?.find((id) => id.provider === 'google');
    if (!googleIdentity) return { error: 'No Google account linked' };
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    return { error: error?.message ?? null };
  };

  const uploadResume = async (fileName: string, fileSize: number) => {
    setResumeUploaded(true);
    setResumeFileName(fileName);
    await upsertProfileState({
      resume_uploaded: true,
      resume_file_name: fileName,
      resume_file_size: fileSize,
    });
  };

  const connectGithub = async (username: string, force = false): Promise<ConnectGithubResult> => {
    if (!username.trim()) return { error: 'GitHub username is required' };

    const isOAuth = username === 'oauth-user';
    let resolvedUsername = username.trim();
    let githubEmail: string | null = null;

    if (!isOAuth) {
      const { valid, email } = await validateGithubUsername(username.trim());
      if (!valid) {
        return { error: "We couldn't find that GitHub username — check the spelling" };
      }
      resolvedUsername = username.trim();
      githubEmail = email;
    } else {
      resolvedUsername = 'github-user';
    }

    if (!force && githubEmail) {
      const userEmail = session?.user?.email;
      if (userEmail && githubEmail !== userEmail) {
        setGithubEmailMismatch(githubEmail);
        return { error: null, mismatch: true };
      }
    }

    setGithubConnected(true);
    setGithubUsername(resolvedUsername);
    setGithubEmailMismatch(null);
    await upsertProfileState({
      github_connected: true,
      github_username: resolvedUsername,
      github_email: githubEmail,
      github_connection_method: isOAuth ? 'oauth' : 'manual',
    });
    return { error: null };
  };

  const disconnectGithub = async () => {
    setGithubConnected(false);
    setGithubUsername(null);
    await upsertProfileState({
      github_connected: false,
      github_username: null,
      github_email: null,
      github_connection_method: null,
    });
  };

  const dismissGithubMismatch = () => {
    setGithubEmailMismatch(null);
  };

  const completeOnboarding = async () => {
    setIsNewUser(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsNewUser(false);
    setGithubConnected(false);
    setGithubUsername(null);
    setResumeUploaded(false);
    setResumeFileName(null);
  };

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile: extractProfile(user, githubConnected, githubUsername, resumeUploaded, resumeFileName),
        loading,
        isNewUser,
        githubEmailMismatch,
        dismissGithubMismatch,
        uploadResume,
        connectGithub,
        disconnectGithub,
        signUp,
        signIn,
        signInWithGoogle,
        linkGoogle,
        unlinkGoogle,
        completeOnboarding,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
