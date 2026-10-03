let element: HTMLDivElement | null = null

export function setLabelElement(node: HTMLDivElement | null) {
  element = node
}

export function writeLabel(x: number, y: number, text: string, visible: boolean) {
  if (!element) return
  element.style.opacity = visible ? '1' : '0'
  element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -120%)`
  if (visible && element.textContent !== text) element.textContent = text
}
