/** Public Pages origin for the shadcn registry. */
export const REGISTRY_BASE = 'https://stephenshorton.github.io/mokei'

export type RegistryCatalogItem = {
  name: string
  title: string
  description: string
  type: 'registry:theme' | 'registry:ui'
}

export const registryCatalog = [
  {
    name: 'theme',
    title: 'Mokei theme',
    description: 'Glass + clay CSS variables, Tailwind v4 preset, and glass-panel.',
    type: 'registry:theme',
  },
  { name: 'button', title: 'Button', description: 'Primary, outline, ghost, and icon buttons.', type: 'registry:ui' },
  { name: 'card', title: 'Card', description: 'Glass panel surface used by KPI and inspector cards.', type: 'registry:ui' },
  { name: 'badge', title: 'Badge', description: 'Pills including success, warning, info, and slate.', type: 'registry:ui' },
  { name: 'input', title: 'Input', description: 'Search-style field.', type: 'registry:ui' },
  { name: 'tabs', title: 'Tabs', description: 'Segmented control used by the docks board.', type: 'registry:ui' },
  { name: 'tooltip', title: 'Tooltip', description: 'Small hover hint.', type: 'registry:ui' },
  { name: 'progress', title: 'Progress', description: 'Battery and cargo bars.', type: 'registry:ui' },
  { name: 'separator', title: 'Separator', description: 'Hairline rule.', type: 'registry:ui' },
  { name: 'avatar', title: 'Avatar', description: 'User chip.', type: 'registry:ui' },
  { name: 'kbd', title: 'Kbd', description: 'Keyboard hint, as in the search field.', type: 'registry:ui' },
  { name: 'label', title: 'Label', description: 'Form label.', type: 'registry:ui' },
  { name: 'dropdown-menu', title: 'Dropdown menu', description: 'Site and user menus.', type: 'registry:ui' },
  { name: 'stepper', title: 'Stepper', description: 'Shipment tracking steps.', type: 'registry:ui' },
] as const satisfies readonly RegistryCatalogItem[]

export function registryItemUrl(name: string) {
  return `${REGISTRY_BASE}/r/${name}.json`
}

export function registryAddCommand(name: string) {
  return `npx shadcn@latest add ${registryItemUrl(name)}`
}
