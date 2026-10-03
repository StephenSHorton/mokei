type MatteProps = {
  color: string
  roughness?: number
}

export function Matte({ color, roughness = 1 }: MatteProps) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      envMapIntensity={0}
    />
  )
}
