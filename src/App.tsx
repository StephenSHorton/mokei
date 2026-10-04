import { useEffect, useMemo, useState } from 'react'
import { activateScene, resolveScene, sceneIdFromSearch } from './kit/scene'
import { SceneCanvas, useLook } from './kit/clay'
import { LevaLook } from './look/LevaLook'

export default function App() {
  const [sceneId, setSceneId] = useState(() => sceneIdFromSearch())
  const scene = useMemo(() => resolveScene(sceneId), [sceneId])
  const ground = useLook((s) => s.ground)
  const [showLook, setShowLook] = useState(() => location.search.includes('look'))

  useEffect(() => {
    const sync = () => setSceneId(sceneIdFromSearch())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  useEffect(() => {
    if (!scene) return
    activateScene(scene)
    document.title = `${scene.name} — clay-diorama`
  }, [scene])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'l' || event.key === 'L') setShowLook((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!scene) {
    return <div className="grid h-full place-items-center text-sm text-slate-500">No scene registered.</div>
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: ground }}>
      <SceneCanvas
        quality="high"
        onPointerMissed={() => scene.dispatch?.({ type: 'select', id: null })}
      >
        <color attach="background" args={[ground]} />
        <scene.World />
      </SceneCanvas>
      {scene.Hud ? <scene.Hud /> : null}
      <LevaLook hidden={!showLook} />
    </div>
  )
}
