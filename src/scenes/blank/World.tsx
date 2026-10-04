import { ClayCameraRig, ClayGround, Lights, PostFX, RoundCyl, SoftBox, useLook } from '../../kit/clay'
import { useBlank } from './state'

const NO_AO = typeof location !== 'undefined' && location.search.includes('noao')

export function World() {
  const grass = useLook((s) => s.grass)
  const cardboard = useLook((s) => s.cardboard)
  const tree = useLook((s) => s.tree)
  const shift = useBlank((s) => s.shift)
  const selected = useBlank((s) => s.selected)
  const dispatch = useBlank((s) => s.dispatch)

  return (
    <>
      <ClayCameraRig home={{ x: 0, z: 0.4 }} />
      <Lights />
      <ClayGround onMiss={() => dispatch({ type: 'select', id: null })} />
      <SoftBox size={[18, 0.06, 12]} r={0.04} unsafeColor={grass} position={[0, 0.03, -1]} cast={false} />
      <SoftBox
        size={[2.4, 1.1, 2.4]}
        r={0.18}
        material={selected === 'block-a' ? 'accent2' : undefined}
        unsafeColor={selected === 'block-a' ? undefined : cardboard}
        position={[-2.2 + shift, 0.55, 0.2]}
      />
      <SoftBox size={[1.6, 1.8, 1.6]} r={0.16} material="base" position={[2.1, 0.9, -0.8]} />
      <SoftBox size={[1.7, 0.28, 1.7]} r={0.08} material="accent1" position={[2.1, 1.94, -0.8]} />
      <RoundCyl radius={0.55} height={1.4} fillet={0.12} unsafeColor={tree} position={[0.1, 0.7, 2.2]} />
      {NO_AO ? null : <PostFX />}
    </>
  )
}
