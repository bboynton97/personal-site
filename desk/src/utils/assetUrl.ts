/**
 * Returns the full URL for an asset.
 * In production, assets are served from S3/CDN.
 * In development, assets are served locally from /public.
 */
export function assetUrl(path: string): string {
  const cdnBase = import.meta.env.VITE_ASSET_CDN_URL ?? `${import.meta.env.VITE_BUCKET_ENDPOINT}/${import.meta.env.VITE_BUCKET_NAME}`

  // Remove leading slash if present for consistent joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  if (cdnBase) {
    // Production: use CDN
    return `${cdnBase.replace(/\/$/, '')}/${cleanPath}`
  }

  // Development: use local path
  return `/${cleanPath}`
}

