// Samples YOUR photo pixels -> particles. Photo at public/images/krrish.jpg.
// Missing photo -> abstract fallback in particle-engine.js (never a fake face).

export function sampleImageToPoints(img, W) {
  const aspect = img.height / img.width
  const H = Math.max(1, Math.floor(W * aspect))
  const off = document.createElement('canvas')
  off.width = W
  off.height = H
  const octx = off.getContext('2d', { willReadFrequently: true })
  octx.drawImage(img, 0, 0, W, H)
  return { data: octx.getImageData(0, 0, W, H).data, W, H }
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

export function useReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
