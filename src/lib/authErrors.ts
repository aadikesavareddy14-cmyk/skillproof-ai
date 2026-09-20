export interface FormattedAuthError {
  isCancellation: boolean;
  userMessage: string | null;
}

export type OAuthProvider = 'google' | 'linkedin_oidc';

/**
 * Maps raw Supabase or OAuth error responses into human-readable messages.
 * Never surfaces raw JSON or internal codes to the user.
 * Logs technical details to the console for debugging.
 */
export function formatAuthError(
  rawError: unknown,
  provider?: OAuthProvider | string
): FormattedAuthError {
  if (!rawError) {
    return { isCancellation: false, userMessage: null };
  }

  // Log raw technical error for developer diagnostics
  console.error('[Auth Technical Error]:', provider ? `[${provider}]` : '', rawError);

  let rawStr = '';
  if (typeof rawError === 'string') {
    rawStr = rawError;
  } else if (typeof rawError === 'object' && rawError !== null) {
    const errObj = rawError as Record<string, unknown>;
    const pieces = [
      errObj.error_code,
      errObj.error,
      errObj.error_description,
      errObj.message,
      errObj.msg,
      JSON.stringify(errObj),
    ].filter(Boolean);
    rawStr = pieces.join(' ');
  }

  const lower = rawStr.toLowerCase();

  // Network or timeout errors
  if (
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('timeout') ||
    lower.includes('networkerror')
  ) {
    return {
      isCancellation: false,
      userMessage: 'Something went wrong connecting to the auth service. Please check your internet connection and try again.',
    };
  }

  // Common authentication credentials errors
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid_credentials') ||
    lower.includes('invalid email or password')
  ) {
    return {
      isCancellation: false,
      userMessage: 'Invalid email or password. Please check your credentials and try again.',
    };
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already registered') ||
    lower.includes('user_already_exists')
  ) {
    return {
      isCancellation: false,
      userMessage: 'An account with this email already exists. Please log in instead.',
    };
  }

  if (lower.includes('email not confirmed')) {
    return {
      isCancellation: false,
      userMessage: 'Please verify your email address before signing in.',
    };
  }

  // Generic fallback
  return {
    isCancellation: false,
    userMessage: 'Something went wrong signing you in. Please try again.',
  };
}
