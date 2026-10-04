import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'
import { useFillRole, useMaterialColor, useThemedHex, useWhiteFills } from '../../../kit/theme'
import { WAREHOUSE_ID, useYard } from '../sim/yard'
import { Matte } from '../../../kit/clay'
import { Pallet } from './Pallet'
import { RoundCyl, SoftBox, scaleSoft } from '../../../kit/clay'
import { ribTexture, roofLogo, signTexture } from './textures'

const DOOR_XS = [-10.5, -3.5, 3.5, 10.5]
const OVER = 0.55

type HallProps = { W: number; D: number; H: number; RISE: number; doors: number[]; logo?: boolean; units?: number[] }

export function Warehouse() {
  const select = useYard((s) => s.select)
  return (
    <group
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        select(WAREHOUSE_ID)
      }}
    >
      <group position={[0, 0, -11]}>
        <Hall W={32} D={14} H={5.2} RISE={1.9} doors={DOOR_XS} logo units={[-11, -7.4, 8.6, 12.2]} />
      </group>
      <group position={[-4, 0, -26.5]}>
        <Hall W={26} D={12} H={6.6} RISE={1.7} doors={[]} units={[-6, 6]} />
      </group>
      <group position={[-21.2, 0, -10.6]}>
        <Annex />
      </group>
    </group>
  )
}

function Hall({ W, D, H, RISE, doors, logo: showLogo = false, units = [] }: HallProps) {
  const PITCH = Math.atan(RISE / (D / 2))
  const wall = useMaterialColor('base')
  const roofRole = useFillRole('accent3')
  const roof = useMaterialColor(roofRole)
  const whiteFills = useWhiteFills()
  const wallRib = whiteFills ? 'rgba(80,70,55,0.10)' : 'rgba(120,138,178,0.16)'
  const roofRib = whiteFills ? 'rgba(80,70,55,0.10)' : 'rgba(12,30,110,0.28)'
  const front = useMemo(() => ribTexture(wall, wallRib, W / 0.5, `front${W}`), [wall, wallRib, W])
  const side = useMemo(() => ribTexture(wall, wallRib, D / 0.5, `side${D}`), [wall, wallRib, D])
  const roofTex = useMemo(() => ribTexture(roof, roofRib, (W + OVER * 2) / 0.42, `roof${W}`), [roof, roofRib, W])
  const gable = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-D / 2 + 0.05, 0)
    shape.lineTo(D / 2 - 0.05, 0)
    shape.lineTo(0, RISE)
    shape.closePath()
    return new ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: scaleSoft(0.06),
      bevelSize: scaleSoft(0.06),
      bevelSegments: 3,
    })
  }, [D, RISE])
  const slabLen = (D / 2 + OVER) / Math.cos(PITCH)
  const logo = useMemo(() => roofLogo(), [])

  return (
    <group>
      {/* apron slab in front of the docks */}
      <SoftBox size={[W + 4, 0.12, 3.2]} r={0.05} color="#f2f5fb" position={[0, 0.06, D / 2 + 1.5]} cast={false} />
      {/* walls */}
      <SoftBox size={[W, H, D]} r={0.22} material="base" position={[0, H / 2, 0]} />
      <mesh position={[0, H / 2 + 0.2, D / 2 + 0.006]} receiveShadow>
        <planeGeometry args={[W - 0.5, H - 0.6]} />
        <meshLambertMaterial map={front} />
      </mesh>
      <mesh position={[W / 2 + 0.006, H / 2 + 0.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[D - 0.5, H - 0.6]} />
        <meshLambertMaterial map={side} />
      </mesh>
      <mesh position={[-W / 2 - 0.006, H / 2 + 0.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[D - 0.5, H - 0.6]} />
        <meshLambertMaterial map={side} />
      </mesh>
      {/* blue base skirt + corner trims + eave band */}
      <SoftBox size={[W + 0.12, 0.34, D + 0.12]} r={0.12} material="accent1" position={[0, 0.17, 0]} />
      {[
        [-W / 2, -D / 2],
        [W / 2, -D / 2],
        [-W / 2, D / 2],
        [W / 2, D / 2],
      ].map(([x, z]) => (
        <SoftBox key={`${x}:${z}`} size={[0.5, H + 0.1, 0.5]} r={0.18} material="accent1" position={[x, H / 2, z]} />
      ))}
      <SoftBox size={[W + 0.3, 0.32, D + 0.3]} r={0.14} material="accent1" position={[0, H - 0.1, 0]} />
      {/* gable ends */}
      <mesh geometry={gable} position={[W / 2 - 0.2, H, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <Matte material="base" />
      </mesh>
      <mesh geometry={gable} position={[-W / 2 - 0.1, H, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <Matte material="base" />
      </mesh>
      {/* roof slopes */}
      {[1, -1].map((dir) => (
        <group
          key={dir}
          position={[0, H + RISE - (D / 4 + OVER / 2) * Math.tan(PITCH) + 0.2, (dir * (D / 2 + OVER)) / 2]}
          rotation={[dir * PITCH, 0, 0]}
        >
          <SoftBox size={[W + OVER * 2, 0.36, slabLen]} r={0.16} material={roofRole} />
          <mesh position={[0, 0.181, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[W + OVER * 2 - 0.32, slabLen - 0.32]} />
            <meshLambertMaterial map={roofTex} />
          </mesh>
        </group>
      ))}
      <SoftBox
        size={[W + OVER * 2 + 0.1, 0.34, 0.9]}
        r={0.16}
        material={whiteFills ? 'accent1' : undefined}
        unsafeColor={whiteFills ? undefined : '#2556d6'}
        position={[0, H + RISE + 0.24, 0]}
      />
      {/* roof roundel */}
      {showLogo ? (
      <group position={[2, H + RISE - 2.6 * Math.tan(PITCH) + 0.42, 2.6]} rotation={[PITCH, 0, 0]}>
        <RoundCyl radius={1.15} height={0.12} fillet={0.05} color="#f8fafc" cast={false} />
        <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.7, 1.7]} />
          <meshLambertMaterial map={logo} transparent depthWrite={false} />
        </mesh>
      </group>
      ) : null}
      {/* roof units */}
      {units.map((x) => (
        <group key={x} position={[x, H + RISE - 4.2 * Math.tan(PITCH) + 0.5, -4.2]} rotation={[-PITCH, 0, 0]}>
          <SoftBox size={[1.7, 0.6, 1.2]} r={0.16} color="#eef2f8" />
          <RoundCyl radius={0.36} height={0.06} fillet={0.02} color="#9aa6bd" position={[0, 0.31, 0]} cast={false} />
        </group>
      ))}

      {doors.map((x, index) => (
        <Dock key={x} x={x} index={index} z={D / 2} />
      ))}
    </group>
  )
}

function Dock({ x, index, z }: { x: number; index: number; z: number }) {
  const sign = useMemo(() => signTexture(`D${index + 1}`), [index])
  return (
    <group position={[x, 0, z]}>
      {/* interior: light recess with a soft top shade for depth */}
      <SoftBox size={[2.6, 3.0, 0.1]} r={0.04} color="#c9d2e6" position={[0, 1.85, 0.02]} cast={false} />
      <SoftBox size={[2.56, 0.5, 0.12]} r={0.04} color="#8f9cba" position={[0, 3.12, 0.04]} cast={false} />
      <SoftBox size={[2.56, 0.2, 0.12]} r={0.04} color="#aab5cf" position={[0, 2.78, 0.05]} cast={false} />
      <group position={[0, 0.38, 0.45]} scale={0.9}>
        <Pallet stacks={index % 2 === 0 ? 2 : 3} seed={index} />
      </group>
      {/* chunky blue frame */}
      <SoftBox size={[0.44, 3.62, 0.5]} r={0.16} material="accent1" position={[-1.52, 1.86, 0.14]} />
      <SoftBox size={[0.44, 3.62, 0.5]} r={0.16} material="accent1" position={[1.52, 1.86, 0.14]} />
      <SoftBox size={[3.48, 0.46, 0.5]} r={0.16} material="accent1" position={[0, 3.56, 0.14]} />
      {/* dock bumpers + leveler */}
      <SoftBox size={[0.26, 0.4, 0.2]} r={0.08} color="#2a3247" position={[-1.12, 0.6, 0.42]} />
      <SoftBox size={[0.26, 0.4, 0.2]} r={0.08} color="#2a3247" position={[1.12, 0.6, 0.42]} />
      <SoftBox size={[2.5, 0.3, 0.8]} r={0.1} color="#d6ddea" position={[0, 0.27, 0.42]} />
      {/* sign plate */}
      <mesh position={[-1.0, 4.18, 0.03]}>
        <planeGeometry args={[0.62, 0.46]} />
        <meshLambertMaterial map={sign} />
      </mesh>
    </group>
  )
}

function Annex() {
  const bodyRole = useFillRole('accent1')
  const roofRole = useFillRole('accent3')
  const accent = useMaterialColor(bodyRole)
  const whiteFills = useWhiteFills()
  const cap = useThemedHex('#4a7cf0', 'accent1')
  const w = 9
  const d = 9
  const h = 3.8
  const ribInk = whiteFills ? 'rgba(80,70,55,0.10)' : 'rgba(10,25,90,0.3)'
  const ribs = useMemo(() => ribTexture(accent, ribInk, w / 0.45, 'annex'), [accent, ribInk])
  const ribsSide = useMemo(() => ribTexture(accent, ribInk, d / 0.45, 'annex-side'), [accent, ribInk])
  return (
    <group>
      <SoftBox size={[w, h, d]} r={0.2} material={bodyRole} position={[0, h / 2, 0]} />
      <mesh position={[0, h / 2 + 0.1, d / 2 + 0.006]}>
        <planeGeometry args={[w - 0.5, h - 0.5]} />
        <meshLambertMaterial map={ribs} />
      </mesh>
      <mesh position={[w / 2 + 0.006, h / 2 + 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d - 0.5, h - 0.5]} />
        <meshLambertMaterial map={ribsSide} />
      </mesh>
      <mesh position={[-w / 2 - 0.006, h / 2 + 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d - 0.5, h - 0.5]} />
        <meshLambertMaterial map={ribsSide} />
      </mesh>
      <SoftBox size={[w + 0.6, 0.42, d + 0.6]} r={0.18} material={roofRole} position={[0, h + 0.18, 0]} />
      <SoftBox size={[w - 1.2, 0.2, d - 1.2]} r={0.08} color={cap} position={[0, h + 0.46, 0]} />
      {/* white roll-up door */}
      <SoftBox size={[2.4, 2.6, 0.16]} r={0.06} color="#f1f5f9" position={[1.6, 1.3, d / 2 + 0.06]} />
      <SoftBox size={[2.8, 0.3, 0.3]} r={0.1} color="#f8fafc" position={[1.6, 2.72, d / 2 + 0.1]} />
      <SoftBox size={[0.9, 1.9, 0.14]} r={0.06} color="#f8fafc" position={[-2.4, 0.95, d / 2 + 0.06]} />
      <SoftBox size={[1.4, 0.5, 1]} r={0.16} color="#eef2f8" position={[-2, h + 0.8, -1.5]} />
    </group>
  )
}
