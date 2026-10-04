import { ChevronDown, LocateFixed, Plus, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { listScenes } from '@/kit/scene'
import { listThemes } from '@/kit/theme'

const SWATCHES: { name: string; value: string; varName: string }[] = [
  { name: 'Background', value: '#e9eef8', varName: '--background' },
  { name: 'Ink', value: '#0f172a', varName: '--ink' },
  { name: 'Muted', value: '#64748b', varName: '--muted' },
  { name: 'Primary', value: '#2563eb', varName: '--primary' },
  { name: 'Deep blue', value: '#1d4ed8', varName: '--blue-deep' },
  { name: 'Glass', value: 'rgba(255,255,255,0.9)', varName: '--glass-bg' },
  { name: 'Success', value: '#15803d', varName: '--success' },
  { name: 'Warning', value: '#c2620a', varName: '--warning' },
  { name: 'Clay road', value: '#c4d0f2', varName: '--clay-road' },
  { name: 'Clay yellow', value: '#f2c14e', varName: '--clay-yellow' },
  { name: 'Cardboard', value: '#e0b17a', varName: '--clay-cardboard' },
  { name: 'Tree', value: '#72d39c', varName: '--clay-tree' },
]

export default function Showcase() {
  const themes = listThemes()
  const scenes = listScenes()

  return (
    <TooltipProvider>
      <div data-showcase className="min-h-full bg-background text-foreground" style={{ letterSpacing: 'var(--track)' }}>
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-[color:var(--topbar-border)] bg-[color:var(--topbar-bg)] px-6 py-4 shadow-[var(--topbar-shadow)] backdrop-blur-[22px] backdrop-saturate-130">
          <div>
            <p className="text-[11px] font-bold tracking-[0.06em] text-blue-deep uppercase">Mokei</p>
            <h1 className="text-xl font-bold tracking-tight">UI kit</h1>
          </div>
          <p className="hidden max-w-md text-sm text-muted-foreground sm:block">
            Glass + clay tokens on shadcn. The Yardline playground is unchanged at the root.
          </p>
          <a
            href="#/"
            className="ml-auto inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Open Yardline
          </a>
        </header>

        <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
          <section className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Themes</CardTitle>
                <CardDescription>Token sets applied via data-theme. Quarry plugs in as another file.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <Badge key={theme.id} variant="info">
                    {theme.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scenes</CardTitle>
                <CardDescription>3D worlds registered beside the theme. Warehouse is first.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {scenes.map((scene) => (
                  <Badge key={scene.id} variant="secondary">
                    {scene.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Tokens</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {SWATCHES.map((swatch) => (
                <div key={swatch.varName} className="glass-panel rounded-xl p-3">
                  <span className="mb-2 block h-10 rounded-lg ring-1 ring-foreground/10" style={{ background: swatch.value }} />
                  <p className="text-xs font-semibold">{swatch.name}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{swatch.varName}</p>
                </div>
              ))}
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
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Avatar + menu</h2>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-4 pt-1">
                <Avatar size="lg">
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
                    <DropdownMenuLabel>Sites</DropdownMenuLabel>
                    <DropdownMenuItem>Northpoint Hub</DropdownMenuItem>
                    <DropdownMenuItem>East Gate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Manage sites</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
              <CardFooter>
                HUD rebuild in a later slice will compose these instead of the measured CSS classes.
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>
    </TooltipProvider>
  )
}
