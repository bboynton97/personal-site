/**
 * Returns the full URL for an asset.
 * In production, assets are served from the public bucket.
 * In development, assets are served locally from /public.
 */
export function assetUrl(path: string): string {
  const bucketUrl = import.meta.env.VITE_BUCKET_URL

  // Remove leading slash if present for consistent joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  if (bucketUrl) {
    // Production: use public bucket URL
    return `${bucketUrl.replace(/\/$/, '')}/${cleanPath}`
  }

  // Development: use local path
  return `/${cleanPath}`
}
