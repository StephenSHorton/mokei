import { OrthographicCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import {
  ChevronDown,
  Forklift,
  ListIcon,
  LocateFixed,
  MapIcon,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Truck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Stepper } from '@/components/ui/stepper'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Lights, RoleCart, SceneCanvas, applyLook, useLook } from '@/kit/clay'
import { REGISTRY_BASE, registryAddCommand, registryCatalog } from '@/kit/registry-catalog'
import { activateScene, getScene, listScenes, type SceneDefinition } from '@/kit/scene'
import '@/kit/scene/yardline'
import '@/kit/scene/blank'
import { applyTheme, listThemes, useMaterialColor, type ThemeDefinition } from '@/kit/theme'
import '@/kit/theme/yardline'
import '@/kit/theme/blank'
import '@/kit/theme/quarry'

const SWATCHES: { name: string; varName: string }[] = [
  { name: 'Background', varName: '--background' },
  { name: 'Ink', varName: '--ink' },
  { name: 'Primary', varName: '--primary' },
  { name: 'Warning', varName: '--warning' },
  { name: 'Warning ink', varName: '--warning-foreground' },
  { name: 'Base', varName: '--mokei-base' },
  { name: 'Accent 1', varName: '--mokei-accent-1' },
  { name: 'Accent 2', varName: '--mokei-accent-2' },
  { name: 'Accent 3', varName: '--mokei-accent-3' },
  { name: 'Detail dark', varName: '--mokei-detail-dark' },
  { name: 'Detail light', varName: '--mokei-detail-light' },
  { name: 'Ground', varName: '--mokei-ground' },
]

const BAYS: Record<string, string> = {
  'bay-1': 'Bay 1',
  'bay-2': 'Bay 2',
  'bay-3': 'Bay 3',
  'bay-4': 'Bay 4',
  'bay-5': 'Bay 5',
  'bay-6': 'Bay 6 · maintenance',
}

const SORTS: Record<string, string> = {
  eta: 'ETA',
  dock: 'Dock',
  carrier: 'Carrier',
  status: 'Status',
}

function AimOrigin() {
  const camera = useThree((s) => s.camera)
  camera.position.set(3.6, 2.6, 3.6)
  camera.lookAt(0, 0.4, 0)
  camera.updateProjectionMatrix()
  return null
}

function RoleCartPreview() {
  const base = useMaterialColor('base')
  return (
    <div className="h-[240px] overflow-hidden rounded-xl ring-1 ring-foreground/10" style={{ background: base }}>
      <SceneCanvas quality="high">
        <color attach="background" args={[base]} />
        <OrthographicCamera makeDefault position={[3.6, 2.6, 3.6]} zoom={92} near={-40} far={80} />
        <AimOrigin />
        <Lights />
        <RoleCart />
      </SceneCanvas>
    </div>
  )
}

function ScenePreview({ scene }: { scene: SceneDefinition }) {
  const ground = useLook((s) => s.ground)
  return (
    <div className="h-[280px] overflow-hidden rounded-xl ring-1 ring-foreground/10" style={{ background: ground }}>
      <SceneCanvas quality="high">
        <color attach="background" args={[ground]} />
        <scene.World />
      </SceneCanvas>
    </div>
  )
}

export default function Showcase() {
  const themes = listThemes()
  const scenes = listScenes()
  const [themeId, setThemeId] = useState(themes.find((t) => t.id === 'yardline')?.id ?? themes[0]?.id ?? 'yardline')
  const [sceneId, setSceneId] = useState(scenes.find((s) => s.id === 'yardline')?.id ?? scenes[0]?.id ?? 'yardline')
  const scene = useMemo(() => getScene(sceneId), [sceneId])

  function pickTheme(theme: ThemeDefinition) {
    setThemeId(theme.id)
    applyTheme(theme)
    const m = theme.materials
    applyLook({
      wall: m.base,
      accent: m.accent1,
      yellow: m.accent2 ?? m.accent1,
      roof: theme.whiteFills ? m.base : (m.accent3 ?? m.accent1),
      tire: m.detail.dark,
      ground: m.ground,
    })
  }

  function pickScene(next: SceneDefinition) {
    setSceneId(next.id)
    activateScene(next)
    setThemeId(next.themeId)
  }

  return (
    <TooltipProvider>
      <div
        data-showcase
        className="min-h-full bg-background text-foreground"
        style={{
          letterSpacing: 'var(--track)',
          backgroundImage:
            'radial-gradient(ellipse 80% 45% at 85% -10%, color-mix(in srgb, var(--clay-road) 55%, transparent), transparent), radial-gradient(ellipse 55% 40% at 0% 100%, color-mix(in srgb, var(--clay-grass) 40%, transparent), transparent)',
        }}
      >
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-[color:var(--topbar-border)] bg-[color:var(--topbar-bg)] px-6 py-4 shadow-[var(--topbar-shadow)] backdrop-blur-[22px] backdrop-saturate-130">
          <div>
            <p className="text-[11px] font-bold tracking-[0.06em] text-blue-deep uppercase">Mokei</p>
            <h1 className="text-xl font-bold tracking-tight">UI kit</h1>
          </div>
          <p className="hidden max-w-md text-sm text-muted-foreground sm:block">
            Glass + clay tokens on shadcn. Switch the scene below, or open it on the playground with ?scene=.
          </p>
          <a
            href={sceneId === 'yardline' ? '#/' : `?scene=${sceneId}#/`}
            className="ml-auto inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Open {scene?.name ?? 'playground'}
          </a>
        </header>

        <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
          <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Theme + scene switcher</CardTitle>
                <CardDescription>
                  Themes set <code>data-theme</code>. Scenes swap the World, camera defaults, and optional HUD.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Theme</p>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <Button
                        key={theme.id}
                        size="sm"
                        variant={themeId === theme.id ? 'default' : 'outline'}
                        onClick={() => pickTheme(theme)}
                      >
                        {theme.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Scene</p>
                  <div className="flex flex-wrap gap-2">
                    {scenes.map((item) => (
                      <Button
                        key={item.id}
                        size="sm"
                        variant={sceneId === item.id ? 'secondary' : 'outline'}
                        onClick={() => pickScene(item)}
                      >
                        {item.name}
                      </Button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{scene?.description}</p>
                  <a className="mt-1 inline-block text-sm text-primary underline-offset-4 hover:underline" href={`?scene=${sceneId}#/`}>
                    Playground ?scene={sceneId}
                  </a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Live scene</CardTitle>
                <CardDescription>Same World the playground mounts. Blank proves a second scene can drop in.</CardDescription>
              </CardHeader>
              <CardContent>{scene ? <ScenePreview key={`${scene.id}-${themeId}`} scene={scene} /> : null}</CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Registry</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Hosted at{' '}
              <a className="text-primary underline-offset-4 hover:underline" href="https://stephenshorton.github.io/mokei/r/registry.json">
                /r/registry.json
              </a>
              . Adding a component also pulls the theme.
            </p>
            <Card>
              <CardContent className="divide-y divide-border pt-1">
                {registryCatalog.map((item) => (
                  <div key={item.name} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <code className="shrink-0 text-[11px] text-ink-2">{registryAddCommand(item.name)}</code>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Namespace:{' '}
                <span className="font-mono">@mokei → {`${REGISTRY_BASE}/r/{name}.json`}</span>
              </CardFooter>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Material roles</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              White is the primary material. Accents are named and capped at three. Switch to Quarry to see Rock’s locked palette — azurite, signal yellow (warning only), slate — on a white cart. Sandstone stays on the ground role.
            </p>
            <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SWATCHES.map((swatch) => (
                  <div key={swatch.varName} className="glass-panel rounded-xl p-3">
                    <span className="mb-2 block h-10 rounded-lg ring-1 ring-foreground/10" style={{ background: `var(${swatch.varName})` }} />
                    <p className="text-xs font-semibold">{swatch.name}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">{swatch.varName}</p>
                  </div>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Role cart</CardTitle>
                  <CardDescription>
                    {themeId === 'quarry'
                      ? 'Warm white body, azurite trim, slate bumper, signal lamp, near-black wheels.'
                      : 'Same roles as SoftBox / Wheel. The cart recolors with the active theme.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RoleCartPreview />
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Buttons</h2>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 pt-1">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon" />}>
                    <Plus className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>Zoom in</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon" />}>
                    <LocateFixed className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>Locate unit</TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Input + kbd + label</h2>
            <Card>
              <CardContent className="flex max-w-md flex-col gap-2 pt-1">
                <Label htmlFor="showcase-search">Search the yard</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-2" />
                  <Input id="showcase-search" className="pr-10 pl-8" placeholder="Search sites, trucks, forklifts…" />
                  <Kbd className="absolute top-1/2 right-2 -translate-y-1/2">/</Kbd>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Badges</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Operational</Badge>
              <Badge variant="warning">Low stock</Badge>
              <Badge variant="info">Docking</Badge>
              <Badge variant="slate">Available</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Alert</Badge>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Tabs + progress + separator</h2>
            <Card>
              <CardHeader>
                <CardTitle>Northpoint Hub</CardTitle>
                <CardDescription>WH-01 · the same status language as the HUD</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="docks">
                  <TabsList>
                    <TabsTrigger value="docks">Docks</TabsTrigger>
                    <TabsTrigger value="forklifts">Forklifts</TabsTrigger>
                    <TabsTrigger value="trucks">Trucks</TabsTrigger>
                  </TabsList>
                  <TabsContent value="docks" className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">Bay 3 · unloading</p>
                    <Progress value={33}>
                      <ProgressLabel>Cargo</ProgressLabel>
                      <ProgressValue />
                    </Progress>
                  </TabsContent>
                  <TabsContent value="forklifts" className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">FL-10 · picking pallet</p>
                    <Progress value={85}>
                      <ProgressLabel>Battery</ProgressLabel>
                      <ProgressValue />
                    </Progress>
                  </TabsContent>
                  <TabsContent value="trucks" className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">3 trucks on site</p>
                    <Progress value={72}>
                      <ProgressLabel>On-time</ProgressLabel>
                      <ProgressValue />
                    </Progress>
                  </TabsContent>
                </Tabs>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">Separator matches the inspector hairline rules.</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Stepper</h2>
            <Card>
              <CardContent className="pt-1">
                <Stepper
                  current={4}
                  steps={[
                    { label: 'Order Confirmed', time: '06:49' },
                    { label: 'Picked', time: '08:20' },
                    { label: 'Loaded', time: '09:12' },
                    { label: 'In Transit', time: '09:38' },
                    { label: 'Unloading 2/6', time: 'ETA 09:57' },
                  ]}
                />
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Avatar + menu</h2>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-4 pt-1">
                <Avatar size="lg">
                  <AvatarImage src={`${import.meta.env.BASE_URL}jordan-hale.svg`} alt="Jordan Hale" />
                  <AvatarFallback>JH</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Jordan Hale</p>
                  <p className="text-sm text-muted-foreground">Yard Lead</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" />}>
                    WH-01
                    <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Sites</DropdownMenuLabel>
                      <DropdownMenuItem>Northpoint Hub</DropdownMenuItem>
                      <DropdownMenuItem>East Gate</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Manage sites</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
              <CardFooter>
                The Yardline playground HUD now composes these kit pieces.
              </CardFooter>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Select</h2>
            <Card>
              <CardContent className="flex flex-wrap items-end gap-4 pt-1">
                <div className="flex flex-col gap-2">
                  <Label>Assign to bay</Label>
                  <Select items={BAYS} defaultValue="bay-3">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Inbound</SelectLabel>
                        <SelectItem value="bay-1">Bay 1</SelectItem>
                        <SelectItem value="bay-2">Bay 2</SelectItem>
                        <SelectItem value="bay-3">Bay 3</SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Outbound</SelectLabel>
                        <SelectItem value="bay-4">Bay 4</SelectItem>
                        <SelectItem value="bay-5">Bay 5</SelectItem>
                        <SelectItem value="bay-6" disabled>
                          Bay 6 · maintenance
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Sort (sm)</Label>
                  <Select items={SORTS} defaultValue={null}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Sort by…" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SORTS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Toggle group</h2>
            <Card>
              <CardContent className="flex flex-col gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <ToggleGroup defaultValue={['all']}>
                    <ToggleGroupItem value="all">All</ToggleGroupItem>
                    <ToggleGroupItem value="moving">Moving</ToggleGroupItem>
                    <ToggleGroupItem value="idle">Idle</ToggleGroupItem>
                    <ToggleGroupItem value="charging">Charging</ToggleGroupItem>
                  </ToggleGroup>
                  <ToggleGroup size="sm" defaultValue={['map']} aria-label="View">
                    <ToggleGroupItem value="map" aria-label="Map">
                      <MapIcon />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List">
                      <ListIcon />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Filter chips · multiple</p>
                  <ToggleGroup variant="chips" multiple defaultValue={['forklifts', 'trucks']}>
                    <ToggleGroupItem value="forklifts">
                      <Forklift />
                      Forklifts
                    </ToggleGroupItem>
                    <ToggleGroupItem value="trucks">
                      <Truck />
                      Trucks
                    </ToggleGroupItem>
                    <ToggleGroupItem value="pallets">
                      <Package />
                      Pallets
                    </ToggleGroupItem>
                    <ToggleGroupItem value="alerts">Alerts</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-tight">Radio group</h2>
              <Card className="h-[calc(100%-2rem)]">
                <CardContent className="flex flex-col gap-4 pt-1">
                  <RadioGroup defaultValue="fastest" aria-label="Route">
                    <Label className="font-normal">
                      <RadioGroupItem value="fastest" />
                      Fastest route
                    </Label>
                    <Label className="font-normal">
                      <RadioGroupItem value="fewest" />
                      Fewest crossings
                    </Label>
                    <Label className="font-normal">
                      <RadioGroupItem value="manual" disabled />
                      Manual (needs supervisor)
                    </Label>
                  </RadioGroup>
                  <Separator />
                  <RadioGroup variant="chips" defaultValue="shift-a" aria-label="Shift">
                    <RadioGroupItem value="shift-a">Shift A</RadioGroupItem>
                    <RadioGroupItem value="shift-b">Shift B</RadioGroupItem>
                    <RadioGroupItem value="night">Night</RadioGroupItem>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-tight">Switch</h2>
              <Card className="h-[calc(100%-2rem)]">
                <CardContent className="flex flex-col gap-4 pt-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label htmlFor="showcase-auto-dock">Auto-dock</Label>
                      <p className="mt-1 text-sm text-muted-foreground">Assign the next free bay on arrival.</p>
                    </div>
                    <Switch id="showcase-auto-dock" defaultChecked />
                  </div>
                  <Separator />
                  <Label className="font-normal">
                    <Switch size="sm" />
                    Show routes on the map
                  </Label>
                  <Label className="font-normal">
                    <Switch size="sm" disabled defaultChecked />
                    Night lighting (locked)
                  </Label>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Textarea</h2>
            <Card>
              <CardContent className="grid gap-4 pt-1 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="showcase-note">Shift note</Label>
                  <Textarea id="showcase-note" placeholder="Bay 3 door sticks at half height…" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="showcase-auto-note">Auto height</Label>
                  <Textarea
                    id="showcase-auto-note"
                    autoSize
                    className="max-h-40"
                    defaultValue={'FL-10 picked 14 pallets.\nTruck 2 left at 09:38.'}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Dialog + popover</h2>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 pt-1">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" />}>Rename site</DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rename site</DialogTitle>
                      <DialogDescription>Shown in the site menu and on shipment labels.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="showcase-site-name">Site name</Label>
                      <Input id="showcase-site-name" defaultValue="Northpoint Hub" />
                    </div>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                      <DialogClose render={<Button />}>Save</DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="destructive" />}>Recall FL-10</AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Recall FL-10?</AlertDialogTitle>
                      <AlertDialogDescription>
                        It drops its current pallet at the nearest rack and returns to charging.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogClose render={<Button variant="outline" />}>Keep working</AlertDialogClose>
                      <AlertDialogClose render={<Button variant="destructive" />}>Recall</AlertDialogClose>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Popover>
                  <PopoverTrigger render={<Button variant="outline" />}>
                    Bay 3
                    <ChevronDown className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent arrow align="start">
                    <PopoverHeader>
                      <PopoverTitle>Bay 3 · unloading</PopoverTitle>
                      <PopoverDescription>Truck 2 · 4 of 6 pallets off</PopoverDescription>
                    </PopoverHeader>
                    <Progress value={66}>
                      <ProgressLabel>Cargo</ProgressLabel>
                      <ProgressValue />
                    </Progress>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="Map filters" />}>
                    <SlidersHorizontal className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-60">
                    <PopoverTitle>Map layers</PopoverTitle>
                    <Label className="font-normal">
                      <Switch size="sm" defaultChecked />
                      Routes
                    </Label>
                    <Label className="font-normal">
                      <Switch size="sm" />
                      Heatmap
                    </Label>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </TooltipProvider>
  )
}
