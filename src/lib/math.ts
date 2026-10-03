export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

export function lerpAngle(a: number, b: number, t: number) {
  let delta = b - a
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  return a + delta * t
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}

export function dampAngle(current: number, target: number, lambda: number, dt: number) {
  return lerpAngle(current, target, 1 - Math.exp(-lambda * dt))
}

export function length2(x: number, z: number) {
  return Math.hypot(x, z)
}
