/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOG_API_URL: string
  readonly VITE_BUCKET_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
