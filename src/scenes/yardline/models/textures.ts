import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

const cache = new Map<string, CanvasTexture>()

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

/** Corrugated sheet: soft vertical ribs, tiles horizontally. */
export function ribTexture(base: string, rib: string, repeat: number, key = '') {
  const tex = make(`rib:${base}:${rib}:${key}`, 64, 8, (ctx) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, 64, 8)
    const g = ctx.createLinearGradient(0, 0, 64, 0)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(0.42, 'rgba(0,0,0,0)')
    g.addColorStop(0.5, rib)
    g.addColorStop(0.62, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 8)
  }).clone()
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.repeat.set(repeat, 1)
  tex.needsUpdate = true
  return tex
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function cube(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, light: string, mid: string, dark: string) {
  ctx.fillStyle = light
  ctx.beginPath()
  ctx.moveTo(cx, cy - s)
  ctx.lineTo(cx + s * 0.87, cy - s * 0.5)
  ctx.lineTo(cx, cy)
  ctx.lineTo(cx - s * 0.87, cy - s * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = mid
  ctx.beginPath()
  ctx.moveTo(cx - s * 0.87, cy - s * 0.5)
  ctx.lineTo(cx, cy)
  ctx.lineTo(cx, cy + s)
  ctx.lineTo(cx - s * 0.87, cy + s * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = dark
  ctx.beginPath()
  ctx.moveTo(cx + s * 0.87, cy - s * 0.5)
  ctx.lineTo(cx, cy)
  ctx.lineTo(cx, cy + s)
  ctx.lineTo(cx + s * 0.87, cy + s * 0.5)
  ctx.closePath()
  ctx.fill()
}

/** Trailer side decal: brand mark + wordmark, transparent background. */
export function brandDecal(variant: 'blue' | 'teal') {
  return make(`brand:${variant}`, 1024, 256, (ctx) => {
    ctx.clearRect(0, 0, 1024, 256)
    if (variant === 'blue') {
      cube(ctx, 150, 128, 70, '#5b8cff', '#2a5ae0', '#1d44b8')
      ctx.fillStyle = '#1e3a8a'
      ctx.font = '700 104px Inter, "Helvetica Neue", Arial, sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText('Yardline', 250, 116)
      ctx.fillStyle = '#64748b'
      ctx.font = '500 34px Inter, "Helvetica Neue", Arial, sans-serif'
      ctx.fillText('Freight · Northpoint', 256, 196)
    } else {
      ctx.fillStyle = '#0f766e'
      ctx.beginPath()
      ctx.moveTo(70, 190)
      ctx.lineTo(130, 80)
      ctx.lineTo(170, 150)
      ctx.lineTo(200, 100)
      ctx.lineTo(250, 190)
      ctx.closePath()
      ctx.fill()
      ctx.font = '700 100px Inter, "Helvetica Neue", Arial, sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText('Nordline', 280, 120)
      ctx.fillStyle = '#5b7f86'
      ctx.font = '500 32px Inter, "Helvetica Neue", Arial, sans-serif'
      ctx.fillText('Northbound & beyond', 286, 196)
    }
  })
}

/** Roof roundel: white disc with blue cube, used on the warehouse roof. */
export function roofLogo() {
  return make('roof-logo', 256, 256, (ctx) => {
    ctx.clearRect(0, 0, 256, 256)
    cube(ctx, 128, 132, 62, '#7aa5ff', '#2f63e6', '#1d47c4')
  })
}

/** Small sign plate text, e.g. dock numbers. */
export function signTexture(text: string, bg = '#1d4ed8', fg = '#ffffff') {
  return make(`sign:${text}:${bg}`, 128, 96, (ctx) => {
    ctx.fillStyle = bg
    roundRect(ctx, 0, 0, 128, 96, 18)
    ctx.fill()
    ctx.fillStyle = fg
    ctx.font = '700 54px Inter, "Helvetica Neue", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 64, 52)
  })
}

/** Container side lettering. */
export function containerText(text: string) {
  return make(`ctr:${text}`, 512, 128, (ctx) => {
    ctx.clearRect(0, 0, 512, 128)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = '800 84px Inter, "Helvetica Neue", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 256, 68)
  })
}

/** Chain-link fence mesh, transparent. */
export function fenceTexture(repeat: number) {
  const tex = make('fence', 64, 64, (ctx) => {
    ctx.clearRect(0, 0, 64, 64)
    ctx.strokeStyle = 'rgba(148,163,184,0.55)'
    ctx.lineWidth = 2
    for (let i = -64; i < 128; i += 16) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + 64, 64)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(i + 64, 0)
      ctx.lineTo(i, 64)
      ctx.stroke()
    }
  }).clone()
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.repeat.set(repeat, 2)
  tex.needsUpdate = true
  return tex
}

export function softShadowTexture(strength: number) {
  return make(`blob:${strength}`, 128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62)
    g.addColorStop(0, `rgba(40, 56, 110, ${strength})`)
    g.addColorStop(0.5, `rgba(40, 56, 110, ${strength * 0.45})`)
    g.addColorStop(1, 'rgba(40, 56, 110, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  })
}
