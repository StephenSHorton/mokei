export function getHashPath() {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}
