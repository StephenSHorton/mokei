type MatteProps = {
  color: string
  emissive?: string
}

// Fully matte, no specular: Lambert keeps the clay look flat and soft.
export function Matte({ color, emissive }: MatteProps) {
  return <meshLambertMaterial color={color} emissive={emissive ?? '#000000'} />
}
