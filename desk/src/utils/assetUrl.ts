/**
 * Returns the full URL for an asset.
 * In production, assets are proxied via the API.
 * In development, assets are served locally from /public.
 */
export function assetUrl(path: string): string {
  const apiBase = import.meta.env.VITE_API_URL

  // Remove leading slash if present for consistent joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  if (apiBase) {
    // Production: use API proxy
    return `${apiBase.replace(/\/$/, '')}/api/assets/${cleanPath}`
  }

  // Development: use local path
  return `/${cleanPath}`
}
