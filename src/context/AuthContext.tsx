import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { formatAuthError, type OAuthProvider } from '@/lib/authErrors';
import { getAppUrl } from '@/lib/config';

export type AuthProviderType = 'google' | 'linkedin_oidc' | 'email';

export interface UserProfile {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  provider: AuthProviderType | null;
  resumeUploaded: boolean;
  resumeFileName: string | null;
  resumeScore: number;
  resumePreviousScore: number | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile;
  identities: string[];
  loading: boolean;
  isNewUser: boolean;
  setIsNewUser: (val: boolean) => void;
  uploadResume: (fileName: string, fileSize: number, score?: number, previousScore?: number | null) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  linkOAuth: (provider: OAuthProvider) => Promise<{ error: string | null }>;
  unlinkOAuth: (provider: OAuthProvider) => Promise<{ error: string | null }>;
  linkGoogle: () => Promise<{ error: string | null }>;
  unlinkGoogle: () => Promise<{ error: string | null }>;
  refreshIdentities: () => Promise<void>;
  ensureProfileRow: (user: User) => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractProfile(
  user: User | null,
  resumeUploaded: boolean,
  resumeFileName: string | null,
  resumeScore: number,
  resumePreviousScore: number | null,
): UserProfile {
  if (!user) {
    return {
      name: null,
      email: null,
      avatarUrl: null,
      provider: null,
      resumeUploaded: false,
      resumeFileName: null,
      resumeScore: 0,
      resumePreviousScore: null,
    };
  }

  const meta = user.user_metadata ?? {};
  const rawProvider = user.app_metadata?.provider as string | undefined;

  let provider: AuthProviderType = 'email';
  if (rawProvider === 'google') provider = 'google';
  else if (rawProvider === 'linkedin_oidc' || rawProvider === 'linkedin') provider = 'linkedin_oidc';

  const googleIdentity = user.identities?.find((id) => id.provider === 'google');
  const googleData = (googleIdentity?.identity_data ?? {}) as Record<string, unknown>;

  const resolvedName =
    meta.full_name ??
    meta.name ??
    (googleData.full_name as string) ??
    (googleData.name as string) ??
    (meta.given_name ? `${meta.given_name} ${meta.family_name ?? ''}`.trim() : null) ??
    (googleData.given_name ? `${googleData.given_name} ${googleData.family_name ?? ''}`.trim() : null);

  const resolvedAvatar =
    meta.avatar_url ??
    meta.picture ??
    (googleData.avatar_url as string) ??
    (googleData.picture as string) ??
    null;

  return {
    name: resolvedName,
    email: user.email ?? null,
    avatarUrl: resolvedAvatar,
    provider,
    resumeUploaded,
    resumeFileName,
    resumeScore,
    resumePreviousScore,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [identities, setIdentities] = useState<string[]>([]);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeScore, setResumeScore] = useState<number>(0);
  const [resumePreviousScore, setResumePreviousScore] = useState<number | null>(null);

  const refreshIdentities = async () => {
    try {
      const { data, error } = await supabase.auth.getUserIdentities();
      if (!error && data?.identities) {
        setIdentities(data.identities.map((id) => id.provider));
      }
    } catch (err) {
      console.debug('[refreshIdentities Error]:', err);
    }
  };

  /**
   * Checks if user has a profile_state row.
   * If not (first-time sign-in), creates it automatically with provider data.
   * Returns true if user is first-time (needs onboarding), false otherwise.
   */
  const ensureProfileRow = async (targetUser: User): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profile_state')
        .select('id, resume_uploaded, resume_file_name, resume_score, resume_score_previous')
        .eq('user_id', targetUser.id)
        .maybeSingle();

      if (error) {
        console.error('[ensureProfileRow lookup error]:', error);
      }

      if (data) {
        setResumeUploaded(data.resume_uploaded ?? false);
        setResumeFileName(data.resume_file_name ?? null);
        setResumeScore(data.resume_score ?? 0);
        setResumePreviousScore(data.resume_score_previous ?? null);
        return false;
      }

      // First-time sign-in: create profile row automatically
      const newRow = {
        id: targetUser.id,
        user_id: targetUser.id,
        resume_uploaded: false,
        resume_file_name: null,
        resume_score: 0,
        resume_score_previous: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await supabase.from('profile_state').upsert(newRow);
      if (upsertErr) {
        console.error('[ensureProfileRow upsert error]:', upsertErr);
      }

      return true;
    } catch (err) {
      console.error('[ensureProfileRow exception]:', err);
      return false;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const isNew = await ensureProfileRow(data.session.user);
        setIsNewUser(isNew);
        await refreshIdentities();
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          const isNew = await ensureProfileRow(newSession.user);
          setIsNewUser(isNew);
          await refreshIdentities();
        }

        if (event === 'SIGNED_OUT') {
          setIsNewUser(false);
          setResumeUploaded(false);
          setResumeFileName(null);
          setResumeScore(0);
          setResumePreviousScore(null);
          setIdentities([]);
        }
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
    if (error) {
      const formatted = formatAuthError(error);
      return { error: formatted.userMessage };
    }
    if (data.user) {
      await ensureProfileRow(data.user);
      setIsNewUser(true);
      await refreshIdentities();
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const formatted = formatAuthError(error);
      return { error: formatted.userMessage };
    }
    if (data.user) {
      const isNew = await ensureProfileRow(data.user);
      setIsNewUser(isNew);
      await refreshIdentities();
    }
    return { error: null };
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      console.log(`[Google OAuth] Calling signInWithOAuth with redirectTo: '${redirectTo}'`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) {
        console.error('[signInWithGoogle Error]:', error);
        const formatted = formatAuthError(error, 'google');
        return { error: formatted.userMessage || 'Something went wrong signing in with Google — please try again' };
      }

      if (data?.url) {
        window.location.assign(data.url);
      }

      return { error: null };
    } catch (err) {
      console.error('[signInWithGoogle Exception]:', err);
      const formatted = formatAuthError(err, 'google');
      return { error: formatted.userMessage || 'Something went wrong signing in with Google — please try again' };
    }
  };

  const linkOAuth = async (provider: OAuthProvider): Promise<{ error: string | null }> => {
    try {
      const callbackUrl = `${getAppUrl()}/auth/callback`;
      console.log(`[OAuth] Calling supabase.auth.linkIdentity() with provider: '${provider}', redirectTo: '${callbackUrl}'`);

      const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: callbackUrl,
          scopes: provider === 'google' ? 'openid email profile' : undefined,
          queryParams: provider === 'google' ? { prompt: 'consent', access_type: 'offline' } : undefined,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error(`[linkOAuth Error ${provider}]:`, error);
        const formatted = formatAuthError(error, provider);
        return { error: formatted.userMessage };
      }

      if (data?.url) {
        window.location.assign(data.url);
        return { error: null };
      }

      return { error: null };
    } catch (err) {
      console.error(`[linkOAuth Exception ${provider}]:`, err);
      const formatted = formatAuthError(err, provider);
      return { error: formatted.userMessage };
    }
  };

  const unlinkOAuth = async (provider: OAuthProvider): Promise<{ error: string | null }> => {
    try {
      const { data: idData, error: idErr } = await supabase.auth.getUserIdentities();
      if (idErr) {
        console.error(`[unlinkOAuth fetch Error]:`, idErr);
        const formatted = formatAuthError(idErr, provider);
        return { error: formatted.userMessage };
      }

      const identityList = idData?.identities ?? [];
      const target = identityList.find((id) =>
        id.provider === provider ||
        (provider === 'linkedin_oidc' && id.provider === 'linkedin')
      );

      if (!target) {
        const label = provider === 'linkedin_oidc' ? 'LinkedIn' : 'Google';
        return { error: `No linked ${label} account found.` };
      }

      if (identityList.length <= 1) {
        return { error: 'You cannot disconnect your only connected account.' };
      }

      const { error } = await supabase.auth.unlinkIdentity(target);
      if (error) {
        console.error(`[unlinkOAuth Error]:`, error);
        const formatted = formatAuthError(error, provider);
        return { error: formatted.userMessage };
      }

      await refreshIdentities();
      return { error: null };
    } catch (err) {
      console.error(`[unlinkOAuth Exception]:`, err);
      const formatted = formatAuthError(err, provider);
      return { error: formatted.userMessage };
    }
  };

  const linkGoogle = async () => linkOAuth('google');
  const unlinkGoogle = async () => unlinkOAuth('google');

  const uploadResume = async (
    fileName: string,
    fileSize: number,
    score = 84,
    previousScore: number | null = null,
  ) => {
    setResumeUploaded(true);
    setResumeFileName(fileName);
    setResumeScore(score);
    setResumePreviousScore(previousScore);
    await upsertProfileState({
      resume_uploaded: true,
      resume_file_name: fileName,
      resume_file_size: fileSize,
      resume_score: score,
      resume_score_previous: previousScore,
      resume_analyzed_at: new Date().toISOString(),
    });
  };

  const completeOnboarding = async () => {
    setIsNewUser(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsNewUser(false);
    setResumeUploaded(false);
    setResumeFileName(null);
    setResumeScore(0);
    setResumePreviousScore(null);
    setIdentities([]);
  };

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile: extractProfile(user, resumeUploaded, resumeFileName, resumeScore, resumePreviousScore),
        identities,
        loading,
        isNewUser,
        setIsNewUser,
        uploadResume,
        signUp,
        signIn,
        signInWithGoogle,
        linkOAuth,
        unlinkOAuth,
        linkGoogle,
        unlinkGoogle,
        refreshIdentities,
        ensureProfileRow,
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
