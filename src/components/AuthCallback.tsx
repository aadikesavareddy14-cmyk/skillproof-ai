import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatAuthError } from '@/lib/authErrors';
import { SkillProofLogo } from '@/components/SkillProofLogo';

interface AuthCallbackProps {
  onSuccess: (isNewUser: boolean) => void;
  onError: (errorMessage: string | null) => void;
}

export function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  const { ensureProfileRow, refreshIdentities } = useAuth();
  const [statusText, setStatusText] = useState('Verifying your Google credentials...');

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      try {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        // Parse hash params if available (e.g. from direct Google OAuth flow or implicit flow)
        let hashParams = new URLSearchParams();
        if (window.location.hash) {
          hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        }

        // 1. Check for error parameters in query or hash
        const errorParam = searchParams.get('error') || searchParams.get('error_code') || hashParams.get('error') || hashParams.get('error_code');
        const errorDesc = searchParams.get('error_description') || searchParams.get('msg') || hashParams.get('error_description') || hashParams.get('msg');

        if (errorParam || errorDesc) {
          console.warn('[OAuth Callback] Received error from auth provider:', { errorParam, errorDesc });

          // Handle user cancellation specifically as required
          if (
            errorParam === 'access_denied' ||
            (errorDesc && errorDesc.toLowerCase().includes('denied')) ||
            (errorDesc && errorDesc.toLowerCase().includes('cancel'))
          ) {
            onError('Google sign-in was cancelled. Please try again or sign in with email.');
            return;
          }

          const formatted = formatAuthError({
            error: errorParam,
            error_description: errorDesc,
          }, 'google');

          onError(formatted.userMessage ?? 'Authentication failed. Please try again.');
          return;
        }

        // 2. Direct Google OAuth flow (id_token returned in hash)
        const idToken = hashParams.get('id_token');
        const accessToken = hashParams.get('access_token');
        const returnedState = hashParams.get('state');

        if (idToken) {
          setStatusText('Validating Google ID token...');
          const expectedState = sessionStorage.getItem('oauth_state_google');
          const expectedNonce = sessionStorage.getItem('oauth_nonce_google');

          // Clean up stored state tokens
          sessionStorage.removeItem('oauth_state_google');
          sessionStorage.removeItem('oauth_nonce_google');

          if (expectedState && returnedState && expectedState !== returnedState) {
            console.error('[Google OAuth] State mismatch - potential CSRF detected');
            onError('Security verification failed: OAuth state mismatch. Please try signing in again.');
            return;
          }

          // Securely exchange ID token for a Supabase JWT session
          const { data: idTokenData, error: idTokenErr } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
            access_token: accessToken ?? undefined,
            nonce: expectedNonce ?? undefined,
          });

          if (idTokenErr) {
            console.error('[Google OAuth] signInWithIdToken Error:', idTokenErr);
            const formatted = formatAuthError(idTokenErr, 'google');
            onError(formatted.userMessage);
            return;
          }

          if (idTokenData?.user && active) {
            setStatusText('Securing your profile...');
            const isNew = await ensureProfileRow(idTokenData.user);
            await refreshIdentities();
            onSuccess(isNew);
            return;
          }
        }

        // 3. Authorization code exchange (PKCE / Code flow)
        const code = searchParams.get('code');
        if (code) {
          setStatusText('Exchanging authorization code...');
          const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.error('[OAuth Callback] exchangeCodeForSession Error:', exchangeErr);
            const formatted = formatAuthError(exchangeErr, 'google');
            onError(formatted.userMessage);
            return;
          }

          if (exchangeData?.user && active) {
            setStatusText('Loading your profile...');
            const isNew = await ensureProfileRow(exchangeData.user);
            await refreshIdentities();
            onSuccess(isNew);
            return;
          }
        }

        // 4. Retrieve current active session (if already persisted or detected from URL)
        setStatusText('Finalizing secure session...');
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.error('[OAuth Callback] getSession Error:', sessionErr);
          const formatted = formatAuthError(sessionErr, 'google');
          onError(formatted.userMessage);
          return;
        }

        let targetUser: import('@supabase/supabase-js').User | null = session?.user ?? null;
        if (!targetUser) {
          const { data: authData } = await supabase.auth.getUser();
          targetUser = authData?.user ?? null;
        }

        if (!targetUser) {
          onError('Authentication could not be completed. Please try signing in again.');
          return;
        }

        if (active) {
          setStatusText('Preparing your verified profile...');
          const isNew = await ensureProfileRow(targetUser);
          await refreshIdentities();
          onSuccess(isNew);
        }
      } catch (err) {
        console.error('[OAuth Callback] Exception:', err);
        const formatted = formatAuthError(err, 'google');
        onError(formatted.userMessage);
      }
    }

    handleCallback();

    return () => {
      active = false;
    };
  }, [ensureProfileRow, refreshIdentities, onSuccess, onError]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
      <SkillProofLogo variant="full" size="auth" animated />
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>{statusText}</span>
        </div>
        <p className="text-xs text-zinc-600">Please wait while Google authenticates your account...</p>
      </div>
    </div>
  );
}
