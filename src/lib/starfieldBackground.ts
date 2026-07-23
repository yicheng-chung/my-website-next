import type { CSSProperties } from 'react'

// Layered low-opacity blobs standing in for nebula clouds, plus fine star dust —
// self-contained CSS so there's no dependency on an external image asset.
// Shared between the Questions starfield itself and anywhere else on the site
// that wants to echo that same visual (e.g. the home page's nav card).
export const NEBULA: CSSProperties = {
  backgroundImage: [
    'radial-gradient(600px 500px at 15% 10%, rgba(242,163,65,0.35), transparent 60%)',
    'radial-gradient(700px 600px at 85% 30%, rgba(111,159,156,0.28), transparent 60%)',
    'radial-gradient(650px 550px at 30% 80%, rgba(143,110,169,0.22), transparent 60%)',
    'radial-gradient(500px 500px at 75% 90%, rgba(246,180,94,0.25), transparent 60%)',
  ].join(', '),
  backgroundRepeat: 'no-repeat',
}

export const FAR_DUST: CSSProperties = {
  backgroundImage: [
    'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.35), transparent)',
    'radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.25), transparent)',
    'radial-gradient(1.5px 1.5px at 80% 10%, rgba(255,255,255,0.3), transparent)',
    'radial-gradient(1px 1px at 30% 85%, rgba(255,255,255,0.2), transparent)',
  ].join(', '),
  backgroundSize: '260px 260px',
  backgroundRepeat: 'repeat',
}

export const NEAR_DUST: CSSProperties = {
  backgroundImage: [
    'radial-gradient(2px 2px at 25% 40%, rgba(246,180,94,0.5), transparent)',
    'radial-gradient(1.5px 1.5px at 75% 60%, rgba(255,255,255,0.4), transparent)',
    'radial-gradient(2px 2px at 50% 15%, rgba(255,255,255,0.35), transparent)',
  ].join(', '),
  backgroundSize: '380px 380px',
  backgroundRepeat: 'repeat',
}
