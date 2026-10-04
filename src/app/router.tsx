import { useEffect, useState, type ReactNode } from 'react'
import { getHashPath } from './hash'

export function HashRouter({ playground, showcase }: { playground: ReactNode; showcase: ReactNode }) {
  const [path, setPath] = useState(getHashPath)
  const isUi = path === '/ui' || path.startsWith('/ui/')

  useEffect(() => {
    const sync = () => setPath(getHashPath())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.app = isUi ? 'showcase' : 'playground'
    document.title = isUi ? 'Mokei — UI' : 'Yardline — clay-diorama yard'
  }, [isUi])

  return isUi ? showcase : playground
}
