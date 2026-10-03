import { Leva, button, useControls } from 'leva'
import { useEffect } from 'react'
import { lookDefaults, useLook } from '../look'

export function LevaLook() {
  const lighting = useControls('Lighting', {
    aoIntensity: { value: lookDefaults.aoIntensity, min: 0, max: 10, step: 0.05, label: 'AO strength' },
    aoRadius: { value: lookDefaults.aoRadius, min: 1, max: 80, step: 0.5, label: 'AO radius' },
    aoColor: { value: lookDefaults.aoColor, label: 'AO color' },
    sunAzimuth: { value: lookDefaults.sunAzimuth, min: 0, max: 360, step: 1, label: 'Sun angle' },
    sunElevation: { value: lookDefaults.sunElevation, min: 8, max: 85, step: 1, label: 'Sun height' },
    sunIntensity: { value: lookDefaults.sunIntensity, min: 0, max: 3, step: 0.02, label: 'Sun intensity' },
    shadowSoftness: { value: lookDefaults.shadowSoftness, min: 1, max: 40, step: 0.5, label: 'Sun softness' },
    sunColor: { value: lookDefaults.sunColor, label: 'Sun color' },
    skyColor: { value: lookDefaults.skyColor, label: 'Sky color' },
    groundBounce: { value: lookDefaults.groundBounce, label: 'Sky ground' },
    skyIntensity: { value: lookDefaults.skyIntensity, min: 0, max: 2.4, step: 0.02, label: 'Sky intensity' },
  })

  const camera = useControls('Camera', {
    cameraZoom: { value: lookDefaults.cameraZoom, min: 12, max: 52, step: 0.2, label: 'Zoom' },
    cameraAzimuth: { value: lookDefaults.cameraAzimuth, min: 20, max: 70, step: 0.5, label: 'Angle around' },
    cameraElevation: { value: lookDefaults.cameraElevation, min: 18, max: 58, step: 0.5, label: 'Angle down' },
  })

  const palette = useControls('Palette', {
    ground: { value: lookDefaults.ground, label: 'Ground' },
    wall: { value: lookDefaults.wall, label: 'Walls' },
    roof: { value: lookDefaults.roof, label: 'Roof / blue' },
    yellow: { value: lookDefaults.yellow, label: 'Safety yellow' },
    cardboard: { value: lookDefaults.cardboard, label: 'Cardboard' },
    tree: { value: lookDefaults.tree, label: 'Trees' },
    tire: { value: lookDefaults.tire, label: 'Tires' },
  })

  useControls({
    'Reset look': button(() => {
      useLook.getState().setLook({ ...lookDefaults })
    }),
  })

  useEffect(() => {
    useLook.getState().setLook({
      ...lighting,
      ...camera,
      ...palette,
    })
  }, [lighting, camera, palette])

  return (
    <div id="yard-leva" className="pointer-events-auto fixed bottom-4 left-4 z-40 w-[280px] max-w-[calc(100vw-1.5rem)]">
      <Leva
        fill
        collapsed={true}
        titleBar={{ title: 'Look', filter: false }}
        hideCopyButton
        theme={{
          sizes: { rootWidth: '280px' },
          colors: {
            elevation1: 'rgba(255,255,255,0.9)',
            elevation2: 'rgba(248,250,252,0.96)',
            elevation3: '#eef2f7',
            accent2: '#1d4ed8',
            highlight1: '#334155',
            highlight2: '#64748b',
            highlight3: '#0f172a',
          },
        }}
      />
    </div>
  )
}
