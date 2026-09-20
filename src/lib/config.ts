/**
 * Returns the base application URL for OAuth redirects.
 * Always dynamically uses window.location.origin in browser environments
 * to avoid hardcoding localhost or production URLs.
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
}
