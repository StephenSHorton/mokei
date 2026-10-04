export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function lerp(a, b, t) {
    return a + (b - a) * t;
}
export function easeInOutCubic(t) {
    const x = clamp(t, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}
export function lerpAngle(a, b, t) {
    let delta = b - a;
    while (delta > Math.PI)
        delta -= Math.PI * 2;
    while (delta < -Math.PI)
        delta += Math.PI * 2;
    return a + delta * t;
}
export function damp(current, target, lambda, dt) {
    return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
export function dampAngle(current, target, lambda, dt) {
    return lerpAngle(current, target, 1 - Math.exp(-lambda * dt));
}
export function length2(x, z) {
    return Math.hypot(x, z);
}
//# sourceMappingURL=math.js.map