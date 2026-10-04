import { ClayCameraRig, ClayGround, Lights, PostFX, RoundCyl, SoftBox, useLook } from '../../kit/clay'
import { useBlank } from './state'

const NO_AO = typeof location !== 'undefined' && location.search.includes('noao')

export function World() {
  const grass = useLook((s) => s.grass)
  const cardboard = useLook((s) => s.cardboard)
  const yellow = useLook((s) => s.yellow)
  const wall = useLook((s) => s.wall)
  const roof = useLook((s) => s.roof)
  const tree = useLook((s) => s.tree)
  const shift = useBlank((s) => s.shift)
  const selected = useBlank((s) => s.selected)
  const dispatch = useBlank((s) => s.dispatch)

  return (
    <>
      <ClayCameraRig home={{ x: 0, z: 0.4 }} />
      <Lights />
      <ClayGround onMiss={() => dispatch({ type: 'select', id: null })} />
      <SoftBox size={[18, 0.06, 12]} r={0.04} color={grass} position={[0, 0.03, -1]} cast={false} />
      <SoftBox
        size={[2.4, 1.1, 2.4]}
        r={0.18}
        color={selected === 'block-a' ? yellow : cardboard}
        position={[-2.2 + shift, 0.55, 0.2]}
      />
      <SoftBox size={[1.6, 1.8, 1.6]} r={0.16} color={wall} position={[2.1, 0.9, -0.8]} />
      <SoftBox size={[1.7, 0.28, 1.7]} r={0.08} color={roof} position={[2.1, 1.94, -0.8]} />
      <RoundCyl radius={0.55} height={1.4} fillet={0.12} color={tree} position={[0.1, 0.7, 2.2]} />
      {NO_AO ? null : <PostFX />}
    </>
  )
}
