import { useClayColor, type ClayColorProps } from '../theme/materials'

type MatteProps = ClayColorProps & {
  emissive?: string
}

// Fully matte, no specular: Lambert keeps the clay look flat and soft.
export function Matte({ color, material, unsafeColor, emissive }: MatteProps) {
  const resolved = useClayColor({ color, material, unsafeColor })
  return <meshLambertMaterial color={resolved} emissive={emissive ?? '#000000'} />
}
