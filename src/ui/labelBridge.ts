// Labels are written straight to the DOM from the render loop so the yard
// sim never re-renders React every frame.
type LabelKey = 'unit' | 'pallet'

const elements: Partial<Record<LabelKey, HTMLDivElement | null>> = {}
const last: Partial<Record<LabelKey, string>> = {}

export function setLabelElement(key: LabelKey, node: HTMLDivElement | null) {
  elements[key] = node
}

export function writeLabel(key: LabelKey, x: number, y: number, html: string, visible: boolean) {
  const element = elements[key]
  if (!element) return
  element.style.opacity = visible ? '1' : '0'
  element.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%) scale(var(--label-scale, 1))`
  if (visible && last[key] !== html) {
    element.innerHTML = html
    last[key] = html
  }
}

let labelScale = 1
export function setLabelScale(scale: number) {
  labelScale = scale
  for (const element of Object.values(elements)) {
    if (element) element.style.setProperty('--label-scale', String(scale))
  }
}
export function getLabelScale() {
  return labelScale
}
