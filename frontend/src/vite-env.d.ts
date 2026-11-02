/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_API_URL?: string; readonly VITE_PROXY_TARGET?: string }
interface ImportMeta { readonly env: ImportMetaEnv }
interface Window { JitsiMeetExternalAPI: new (domain: string, options: Record<string, unknown>) => JitsiApi }
interface JitsiApi { dispose?: () => void; addListener: (event: string, cb: () => void) => void }
