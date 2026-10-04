import {
  ArrowUp,
  ArrowUpRight,
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  House,
  LocateFixed,
  Minus,
  Package,
  Plus,
  RotateCcw,
  RotateCw,
  Search,
  Truck as TruckLine,
  X,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Stepper } from '@/components/ui/stepper'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLook } from '../../../kit/clay'
import { DOCKS, trucksOnSite, useYard, WAREHOUSE_ID, type Unit } from '../sim/yard'
import { FloatingLabels } from './FloatingLabel'
import {
  Avatar as UserMark,
  BoxArt,
  BrandCube,
  DockBoard,
  ForkliftArt,
  KpiClock,
  KpiCube,
  KpiTruck,
  TrackTruck,
  TruckArt,
  WarehouseArt,
} from './icons'
import { setLabelScale } from './labelBridge'
import { freezeClockLabel } from '../sim/freeze'

const SITE = { code: 'WH-01', name: 'Northpoint Hub', address: '7 Harbor Way, Elizabeth NJ', capacity: 1400 }

/** HUD is laid out at the 1728×995 reference size of the frames and scaled to fit. */
function useHudScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const update = () => {
      const s = Math.min(1, window.innerWidth / 1728, window.innerHeight / 995)
      const clamped = Math.max(0.62, s)
      setScale(clamped)
      setLabelScale(clamped)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return scale
}

export function Hud() {
  const scale = useHudScale()
  return (
    <TooltipProvider>
      <FloatingLabels />
      <div data-hud className="pointer-events-none absolute inset-0 z-[5] text-ink tracking-[var(--track)]" style={{ zoom: scale }}>
        <TopBar />
        <KpiRow />
        <CameraStack />
        <Inspector />
        <BottomTrack />
        <UnitBoard />
      </div>
    </TooltipProvider>
  )
}

/* ───────────────────────────── top bar ───────────────────────────── */

function TopBar() {
  const frozen = freezeClockLabel()
  const [now, setNow] = useState(() => frozen ?? formatClock(new Date()))
  const docked = useYard((s) => Object.values(s.units).filter((u) => u.kind === 'truck' && u.z < 1.2).length)
  const stock = useYard((s) => s.stockOnHand)
  useEffect(() => {
    if (frozen) return
    const id = window.setInterval(() => setNow(formatClock(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [frozen])

  return (
    <header className="pointer-events-auto absolute inset-x-0 top-0 flex h-20 items-center pr-[38px] pl-[60px]">
      <div className="flex w-[265px] shrink-0 items-center gap-[17px]">
        <span className="drop-shadow-[0_4px_6px_rgba(37,99,235,0.25)]">
          <BrandCube size={38} />
        </span>
        <span className="text-[length:calc(24px*var(--fs))] font-bold tracking-tight text-ink">Yardline</span>
      </div>
      <label className="relative flex h-[46px] w-[485px] shrink-0 items-center rounded-[12px] border border-[#dde3ee] bg-[rgba(255,255,255,0.9)] shadow-[0_1px_2px_rgba(30,41,90,0.04)]">
        <Search size={20} strokeWidth={2} className="pointer-events-none absolute left-[19px] text-ink-2" />
        <Input variant="hud" placeholder="Search sites, trucks, forklifts, pallets, shipments..." />
        <Kbd className="absolute top-1/2 right-[13px] grid size-[23px] -translate-y-1/2 place-items-center rounded-md border border-[#cdd5e1] bg-white p-0 text-[length:calc(12px*var(--fs))] font-medium text-muted-foreground">
          /
        </Kbd>
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="hud" size="hud-site" className="ml-[115px]" data-site-switcher="" />}
        >
          <span className="grid h-[34px] w-12 place-items-center rounded-lg bg-[linear-gradient(160deg,#4c86fa_0%,#2357e6_100%)] text-[length:calc(14px*var(--fs))] font-bold tracking-[-0.01em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            {SITE.code}
          </span>
          <span className="ml-3 flex min-w-0 flex-1 flex-col text-left leading-[1.2]">
            <b className="overflow-hidden text-[length:calc(15.6px*var(--fs))] font-bold tracking-[-0.015em] text-ellipsis whitespace-nowrap">
              {SITE.name}
            </b>
            <span className="text-[length:calc(13.7px*var(--fs))] text-muted-foreground">
              {Math.round((stock / SITE.capacity) * 100)}% full · {docked}/4 docked
            </span>
          </span>
          <ChevronRight size={18} strokeWidth={2} className="mx-3 ml-1.5 text-[#94a3b8]" />
          <span className="grid h-full w-10 place-items-center border-l border-[#dde3ee] text-ink-2">
            <ChevronDown size={19} strokeWidth={2.2} />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[295px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sites</DropdownMenuLabel>
            <DropdownMenuItem>
              {SITE.name}
              <span className="ml-auto text-muted-foreground">{SITE.code}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>East Gate</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Manage sites</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Badge variant="success" size="hud-live" className="ml-[18px]">
        <span className="mr-[9px] size-[9px] rounded-full bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]" />
        <b className="mr-[9px] font-semibold text-[#15803d]">Live</b>
        <span className="font-semibold text-ink">{now}</span>
      </Badge>
      <Button type="button" variant="hud-ghost" size="hud-bell" className="relative ml-8" aria-label="Notifications">
        <Bell size={23} strokeWidth={2} />
        <span className="absolute top-[3px] right-[3px] size-[9px] rounded-full bg-destructive shadow-[0_0_0_2px_#fff]" />
      </Button>
      <Separator orientation="vertical" className="mx-[18px] ml-5 h-[38px] w-px self-auto bg-[#dfe5ef]" />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="hud-ghost" className="h-auto flex-1 justify-start gap-0 rounded-none px-0 font-normal" />}>
          <Avatar className="size-[50px] overflow-hidden bg-white shadow-[0_2px_8px_rgba(30,41,90,0.16)] after:hidden">
            <AvatarFallback delay={0} className="bg-transparent">
              <UserMark />
            </AvatarFallback>
          </Avatar>
          <span className="ml-[19px] flex flex-col text-left leading-[1.25]">
            <b className="text-[length:calc(16.5px*var(--fs))] font-semibold tracking-[-0.015em]">Jordan Hale</b>
            <span className="text-[length:calc(14.8px*var(--fs))] text-muted-foreground">Yard Lead</span>
          </span>
          <ChevronDown size={20} strokeWidth={2} className="ml-auto text-ink-2" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Jordan Hale</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Shift notes</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

/* ───────────────────────────── KPI row ───────────────────────────── */

function KpiRow() {
  const stock = useYard((s) => s.stockOnHand)
  const onTime = useYard((s) => s.onTime)
  const units = useYard((s) => s.units)
  const trucks = trucksOnSite(units)
  return (
    <div className="absolute top-[94px] left-[37px] flex gap-[13px]">
      <Kpi icon={<KpiCube />} label="Stock on hand" value={stock.toLocaleString()} delta="+20" sub={`pallets · ${SITE.code}`} />
      <Kpi icon={<KpiTruck />} label="Trucks on site" value={String(trucks)} delta="+1" sub={`1 inbound · ${SITE.code}`} />
      <Kpi icon={<KpiClock />} label="On-time delivery" value={`${onTime.toFixed(1)}%`} delta="+0.4%" sub={`last 30 days · ${SITE.code}`} />
    </div>
  )
}

function Kpi({ icon, label, value, delta, sub }: { icon: ReactNode; label: string; value: string; delta: string; sub: string }) {
  return (
    <Card size="hud" className="pointer-events-auto flex h-[83px] w-[254px] flex-row items-center rounded-[14px] px-4">
      <span className="grid size-[52px] shrink-0 place-items-center rounded-[12px] bg-[#e9eefc]">{icon}</span>
      <div className="ml-[14px] leading-[1.2]">
        <p className="m-0 text-[length:calc(14.2px*var(--fs))] font-medium text-ink-2">{label}</p>
        <p className="my-px mb-0.5 flex items-center text-[length:calc(24px*var(--fs))] font-bold tracking-[-0.02em] text-ink tabular-nums">
          {value}
          <span className="ml-3 inline-flex items-center text-[length:calc(14.2px*var(--fs))] font-medium tracking-normal text-[#16a34a]">
            <span className="mr-1.5 grid size-5 place-items-center rounded-full bg-[#dcfce7]">
              <ArrowUp size={12} strokeWidth={2.6} />
            </span>
            {delta}
          </span>
        </p>
        <p className="m-0 text-[length:calc(14.2px*var(--fs))] text-muted-foreground">{sub}</p>
      </div>
    </Card>
  )
}

/* ─────────────────────────── camera stack ─────────────────────────── */

function CameraStack() {
  const zoomBy = useLook((s) => s.zoomBy)
  const rotateBy = useLook((s) => s.rotateBy)
  const resetView = useLook((s) => s.resetView)
  return (
    <Card size="hud" className="pointer-events-auto absolute top-[94px] right-[449px] flex w-[47px] flex-col items-center rounded-[14px] py-1.5">
      <CamBtn label="Zoom in" onClick={() => zoomBy(3)}>
        <Plus size={21} strokeWidth={2} />
      </CamBtn>
      <CamBtn label="Zoom out" onClick={() => zoomBy(-3)}>
        <Minus size={21} strokeWidth={2} />
      </CamBtn>
      <Separator className="my-[3px] h-px w-6 bg-[#e2e8f0]" />
      <CamBtn label="Rotate left" onClick={() => rotateBy(-15)}>
        <RotateCcw size={19} strokeWidth={2.1} />
      </CamBtn>
      <CamBtn label="Rotate right" onClick={() => rotateBy(15)}>
        <RotateCw size={19} strokeWidth={2.1} />
      </CamBtn>
      <Separator className="my-[3px] h-px w-6 bg-[#e2e8f0]" />
      <CamBtn label="Reset view" onClick={resetView}>
        <House size={19} strokeWidth={2.1} />
      </CamBtn>
    </Card>
  )
}

function CamBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="hud-cam" size="hud-cam" aria-label={label} onClick={onClick} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/* ───────────────────────────── inspector ───────────────────────────── */

function Inspector() {
  const selectedId = useYard((s) => s.selectedId)
  const units = useYard((s) => s.units)
  const select = useYard((s) => s.select)
  const unit = selectedId && selectedId !== WAREHOUSE_ID ? units[selectedId] : null
  const warehouse = selectedId === WAREHOUSE_ID
  if (!unit && !warehouse) return null

  const head = warehouse
    ? { eyebrow: `Cross-dock · ${SITE.code}`, title: SITE.name, sub: SITE.address, art: <WarehouseArt /> }
    : unit!.kind === 'forklift'
      ? { eyebrow: `Forklift · ${SITE.code}`, title: unit!.code, sub: forkliftMeta(unit!.id), art: <ForkliftArt /> }
      : { eyebrow: unit!.accent === 'teal' ? 'Nordline Freight' : 'Yardline Freight', title: unit!.code, sub: truckMeta(unit!.id), art: <TruckArt width={46} /> }

  return (
    <Card size="hud" className="pointer-events-auto absolute top-[94px] right-8 w-[403px] overflow-visible rounded-[16px] px-[19px] pt-4 pb-3">
      <div className="relative flex items-start gap-[13px]">
        <span className="grid size-[52px] shrink-0 place-items-center rounded-[12px] bg-[#e8edf9]">{head.art}</span>
        <div className="min-w-0 flex-1 leading-[1.2]">
          <p className="mt-px mb-px pr-[110px] text-[length:calc(11.8px*var(--fs))] font-bold tracking-[0.06em] text-blue-deep uppercase">
            {head.eyebrow}
          </p>
          <h2 className="m-0 overflow-hidden pr-[110px] text-[length:calc(18.6px*var(--fs))] font-bold tracking-[-0.02em] text-ellipsis whitespace-nowrap">
            {head.title}
          </h2>
          <p className="mt-0.5 mb-0 text-[length:calc(14.2px*var(--fs))] text-muted-foreground">{head.sub}</p>
        </div>
        <div className="absolute top-0 right-0 flex gap-[7px]">
          <Button type="button" variant="hud-icon" size="hud-icon" aria-label="Locate">
            <LocateFixed size={18} strokeWidth={2.1} />
          </Button>
          {warehouse ? null : (
            <>
              <Button type="button" variant="hud-icon" size="hud-icon" aria-label="Open">
                <ArrowUpRight size={19} strokeWidth={2.1} />
              </Button>
              <Button type="button" variant="hud-icon" size="hud-icon" aria-label="Close" onClick={() => select(null)}>
                <X size={18} strokeWidth={2.2} />
              </Button>
            </>
          )}
        </div>
      </div>
      <Separator className="my-3 mt-3 mb-[11px] bg-[#e3e8f0]" />
      {warehouse ? <WarehouseBody /> : unit!.kind === 'forklift' ? <ForkliftBody unit={unit!} /> : <TruckBody unit={unit!} />}
    </Card>
  )
}

function forkliftMeta(id: string) {
  return id === 'fl-10' ? 'Sam Haddad · Toyota 8FBE18' : 'Zoe Larsen · Linde E20'
}

function truckMeta(id: string) {
  const plates: Record<string, string> = {
    'trk-18': 'Sam Chen · ZBY-5648',
    'trk-12': 'Ava Ruiz · NRD-2210',
    'trk-22': 'Leo Park · YRD-8812',
    'trk-07': 'Mia Holt · NRD-4471',
  }
  return plates[id] ?? 'Driver assigned'
}

type Tone = 'green' | 'amber' | 'blue' | 'slate'

function statusFor(unit: Unit): { label: string; tone: Tone } {
  const task = unit.task.toLowerCase()
  if (unit.kind === 'forklift') {
    if (task.includes('collect') || task.includes('lift')) return { label: 'Picking pallet', tone: 'blue' }
    if (task.includes('stage') || task.includes('feed') || task.includes('build')) return { label: 'Loading truck', tone: 'green' }
    if (task.includes('hold') || task.includes('idle')) return { label: 'Idle', tone: 'slate' }
    return { label: 'Moving', tone: 'blue' }
  }
  if (task.includes('unloading')) return { label: 'Unloading', tone: 'green' }
  if (task.includes('loading')) return { label: 'Loading', tone: 'green' }
  if (task.includes('hold')) return { label: 'Waiting', tone: 'amber' }
  if (task.includes('back') || task.includes('align')) return { label: 'Docking', tone: 'blue' }
  return { label: 'En route', tone: 'blue' }
}

function badgeVariant(tone: Tone) {
  if (tone === 'green') return 'success' as const
  if (tone === 'amber') return 'warning' as const
  if (tone === 'blue') return 'info' as const
  return 'slate' as const
}

function Rows({ rows }: { rows: [string, ReactNode, boolean?][] }) {
  return (
    <dl className="m-0">
      {rows.map(([label, value, link], i) => (
        <div
          key={label}
          className={`flex h-[31px] items-center justify-between text-[length:calc(14.3px*var(--fs))] ${i === rows.length - 1 ? '' : 'border-b border-[#e6ebf2]'}`}
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={`m-0 font-semibold ${link ? 'text-blue-deep' : 'text-ink'}`}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ForkliftBody({ unit }: { unit: Unit }) {
  const status = statusFor(unit)
  return (
    <>
      <div className="flex items-center gap-3 text-[length:calc(14.2px*var(--fs))] text-muted-foreground">
        <Badge variant={badgeVariant(status.tone)} size="hud">
          {status.label}
        </Badge>
        <span>{unit.title}</span>
      </div>
      <div className="my-[15px] mb-1.5 flex items-center gap-6 text-[length:calc(14px*var(--fs))] whitespace-nowrap text-muted-foreground">
        <Progress value={unit.battery} tone="green" size="hud-battery" className="min-w-0 flex-1" />
        <span>Battery {Math.round(unit.battery)}%</span>
      </div>
      <Rows
        rows={[
          ['Carrying', unit.carryingId ? 'Pallet ' + unit.carryingId.toUpperCase() : 'Empty'],
          ['Moves today', String(unit.movesToday)],
          ['Speed', `${unit.speed.toFixed(1)} km/h`],
          ['Charger', unit.id === 'fl-10' ? 'C1' : 'C3', true],
          ['Site', SITE.name],
        ]}
      />
    </>
  )
}

function TruckBody({ unit }: { unit: Unit }) {
  const status = statusFor(unit)
  const bay = DOCKS.find((d) => Math.abs(d.x - unit.x) < 1.2)
  const progress = status.tone === 'green' ? 2 : 0
  return (
    <>
      <div className="flex items-center gap-3 text-[length:calc(14.2px*var(--fs))] text-muted-foreground">
        <Badge variant={badgeVariant(status.tone)} size="hud">
          {status.label}
        </Badge>
        <span>
          {SITE.code} · {bay ? bay.label : 'Yard'} · {progress}/6 pallets
        </span>
      </div>
      <div className="my-[15px] mb-1.5 flex items-center gap-6 text-[length:calc(14px*var(--fs))] whitespace-nowrap text-muted-foreground">
        <Progress value={(progress / 6) * 100} tone="green" size="hud-battery" className="min-w-0 flex-1" />
        <span>
          {progress}/6
        </span>
      </div>
      <Rows
        rows={[
          ['Shipment', '#SHP-44012', true],
          ['Customer', 'Oakridge Market'],
          ['Destination', `${SITE.code} ${SITE.name}`],
          ['Speed', `${unit.speed.toFixed(1)} km/h`],
          ['Bay', bay ? bay.label : '—'],
          ['Cargo', `${progress + 1}/7 pallets · 1.2 t`],
        ]}
      />
    </>
  )
}

function WarehouseBody() {
  const stock = useYard((s) => s.stockOnHand)
  const units = useYard((s) => s.units)
  const docked = Object.values(units).filter((u) => u.kind === 'truck' && u.z < 1.2).length
  const working = Object.values(units).filter((u) => u.kind === 'forklift' && u.speed > 0.1).length
  return (
    <>
      <div className="flex items-center gap-3 text-[length:calc(14.2px*var(--fs))] text-muted-foreground">
        <Badge variant="success" size="hud">
          Operational
        </Badge>
        <span>{docked} docked · 1 arriving · 3 staged</span>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-[9px]">
        <div className="rounded-[12px] bg-[rgba(233,239,248,0.85)] px-[11px] pt-2 pb-[9px] text-[length:calc(13.7px*var(--fs))] leading-[1.25] text-[#475569]">
          <p className="m-0">Stock on hand</p>
          <p className="mt-px mb-1.5 text-[length:calc(18.5px*var(--fs))] font-bold tracking-tight text-ink">
            {stock.toLocaleString()} <small className="text-[length:calc(14px*var(--fs))] font-medium tracking-normal text-[#475569]">/ {SITE.capacity.toLocaleString()}</small>
          </p>
          <Progress value={(stock / SITE.capacity) * 100} tone="blue" size="hud" />
        </div>
        <div className="rounded-[12px] bg-[rgba(233,239,248,0.85)] px-[11px] pt-2 pb-[9px] text-[length:calc(13.7px*var(--fs))] leading-[1.25] text-[#475569]">
          <p className="m-0">Truck bays</p>
          <p className="mt-px mb-1.5 text-[length:calc(18.5px*var(--fs))] font-bold tracking-tight text-ink">
            {docked} <small className="text-[length:calc(14px*var(--fs))] font-medium tracking-normal text-[#475569]">/ 4 busy</small>
          </p>
          <Progress value={(docked / 4) * 100} tone="green" size="hud" />
        </div>
        <div className="rounded-[12px] bg-[rgba(233,239,248,0.85)] px-[11px] pt-2 pb-[9px] text-[length:calc(13.7px*var(--fs))] leading-[1.25] text-[#475569]">
          <p className="m-0">Outbound today</p>
          <p className="mt-px mb-0 text-[length:calc(18.5px*var(--fs))] font-bold tracking-tight text-ink">
            31 <small className="text-[length:calc(14px*var(--fs))] font-medium tracking-normal text-[#475569]">trucks</small>
          </p>
        </div>
        <div className="rounded-[12px] bg-[rgba(233,239,248,0.85)] px-[11px] pt-2 pb-[9px] text-[length:calc(13.7px*var(--fs))] leading-[1.25] text-[#475569]">
          <p className="m-0">Put-aways today</p>
          <p className="mt-px mb-0 text-[length:calc(18.5px*var(--fs))] font-bold tracking-tight text-ink">
            18 <small className="text-[length:calc(14px*var(--fs))] font-medium tracking-normal text-[#475569]">pallets</small>
          </p>
        </div>
      </div>
      <div className="mt-[13px] mb-1 flex items-baseline justify-between text-[length:calc(13.7px*var(--fs))] text-muted-foreground">
        <b className="text-[length:calc(14.2px*var(--fs))] font-semibold text-ink">Inventory</b>
        <span>units</span>
      </div>
      <ul className="m-0 list-none p-0">
        {[
          ['Cardboard Box (M)', '1,906', 'tan', 'In Stock'],
          ['Safety Helmet', '334', 'tan', 'In Stock'],
          ['Nitrile Gloves', '95', 'blue', 'Low Stock'],
          ['Stretch Film', '208', 'white', 'In Stock'],
        ].map(([name, qty, tone, state]) => (
          <li key={name} className="flex h-[39px] items-center border-b border-[#e6ebf2] text-[length:calc(14.2px*var(--fs))]">
            <span className="grid w-8 place-items-center">
              <BoxArt tone={tone as 'tan' | 'blue' | 'white'} />
            </span>
            <span className="ml-4 flex-1 text-ink-2">{name}</span>
            <b className="mr-[14px] w-[70px] text-right font-semibold tabular-nums">{qty}</b>
            <Badge variant={state === 'In Stock' ? 'success' : 'warning'} size="hud" className="h-[27px] w-[92px] justify-center">
              {state}
            </Badge>
          </li>
        ))}
      </ul>
      <div>
        <div className="mt-[9px] mb-1 flex items-baseline justify-between text-[length:calc(13.7px*var(--fs))] text-muted-foreground">
          <b className="text-[length:calc(14.2px*var(--fs))] font-semibold text-ink">Forklift fleet</b>
          <span>{working}/2 working</span>
        </div>
        <div className="flex h-[26px] items-center gap-3 text-[length:calc(13.7px*var(--fs))] text-[#475569]">
          <b className="font-bold text-ink">FL-10</b>
          <span className="flex-1 text-right">{units['fl-10']?.title ?? 'Idle'}</span>
          <Progress value={units['fl-10']?.battery ?? 80} tone="green" size="hud" className="w-[52px]" />
          <span className="w-[34px] text-right">{Math.round(units['fl-10']?.battery ?? 80)}%</span>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────── shipment tracking ─────────────────────────── */

const STEPS = [
  { label: 'Order Confirmed', time: '06:49', icon: <FileText size={15} strokeWidth={2.1} /> },
  { label: 'Picked', time: '08:20', icon: <Box size={15} strokeWidth={2.1} /> },
  { label: 'Loaded', time: '09:12', icon: <Package size={15} strokeWidth={2.1} /> },
  { label: 'In Transit', time: '09:38', icon: <TruckLine size={15} strokeWidth={2.1} /> },
  { label: 'Unloading 2/6', time: 'ETA 09:57', icon: <Check size={15} strokeWidth={2.6} /> },
]

function BottomTrack() {
  const truck = useYard((s) => s.units['trk-18'])
  const task = truck?.task.toLowerCase() ?? ''
  const current = task.includes('unloading') ? 4 : task.includes('align') || task.includes('apron') || task.includes('inbound') ? 3 : 4
  const done = task.includes('pull') || task.includes('outbound') || task.includes('loop') || task.includes('re-enter')
  const pill = done ? 'Delivered' : current === 4 ? 'Unloading' : 'In transit'

  return (
    <Card size="hud" className="pointer-events-auto absolute bottom-[42px] left-[37px] flex h-[138px] w-[985px] flex-row items-center overflow-visible rounded-[16px] pr-[15px] pl-[22px]">
      <div className="min-w-0 flex-1 self-stretch pt-5">
        <div className="flex items-center justify-between pr-[22px]">
          <span className="flex items-center gap-[15px] text-[length:calc(17.5px*var(--fs))] font-bold tracking-[-0.015em]">
            <TrackTruck />
            Shipment Tracking
          </span>
          <span className="text-[length:calc(14.5px*var(--fs))] text-[#475569]">{truck?.code ?? 'TRK-18'} · Yardline Freight</span>
        </div>
        <Stepper steps={STEPS} current={current} done={done} />
      </div>
      <Button type="button" variant="hud-ship" size="hud-ship">
        <span className="grid w-[82px] shrink-0 place-items-center">
          <TruckArt width={78} />
        </span>
        <span className="ml-3 flex min-w-0 flex-1 flex-col items-start text-[length:calc(13.9px*var(--fs))] leading-[1.3] text-[#475569]">
          <b className="text-[length:calc(15.8px*var(--fs))] font-bold tracking-[-0.01em] text-ink">#SHP-44012</b>
          <span>To: Northpoint Hub</span>
          <Badge variant="success" size="hud-sm" className="my-1">
            {pill}
          </Badge>
          <span className="whitespace-nowrap">
            {SITE.code} · Bay 3 · 13 min left
          </span>
        </span>
        <ChevronRight size={20} strokeWidth={2.2} className="shrink-0 text-ink" />
      </Button>
    </Card>
  )
}

/* ─────────────────────────── docks / units board ─────────────────────────── */

type Tab = 'docks' | 'forklifts' | 'trucks'

function UnitBoard() {
  const units = useYard((s) => s.units)
  const select = useYard((s) => s.select)
  const selectedId = useYard((s) => s.selectedId)
  const [tab, setTab] = useState<Tab>('docks')
  const all = Object.values(units)
  const trucks = all.filter((u) => u.kind === 'truck')
  const forklifts = all.filter((u) => u.kind === 'forklift')
  const docked = trucks.filter((u) => u.z < 1.2)

  let rows: { id: string | null; name: string; sub: string; dot: string | null; text: string; pill: [Tone, string]; tail: ReactNode }[] = []
  if (tab === 'docks') {
    rows = DOCKS.map((dock) => {
      const t = trucks.find((u) => Math.abs(u.x - dock.x) < 1.2 && u.z < 6)
      if (!t) return { id: null, name: dock.label, sub: SITE.code, dot: null, text: 'No truck assigned', pill: ['slate', 'Available'], tail: null }
      const s = statusFor(t)
      return {
        id: t.id,
        name: dock.label,
        sub: SITE.code,
        dot: t.accent === 'teal' ? '#0f766e' : '#2563eb',
        text: `${t.code} · ${t.accent === 'teal' ? 'Nordline' : 'Yardline'}`,
        pill: [s.tone, s.label],
        tail: s.tone === 'green' ? <MiniProgress value={2} of={6} /> : <span className="pl-1">{t.speed > 0.1 ? '2 min' : 'docked'}</span>,
      }
    })
  } else {
    const list = tab === 'trucks' ? trucks : forklifts
    rows = list.map((u) => {
      const s = statusFor(u)
      return {
        id: u.id,
        name: u.code,
        sub: u.kind === 'truck' ? (u.accent === 'teal' ? 'Nordline' : 'Yardline') : SITE.code,
        dot: '#2563eb',
        text: u.task,
        pill: [s.tone, s.label],
        tail: u.kind === 'forklift' ? <MiniProgress value={Math.round(u.battery)} of={100} pct /> : <span className="pl-1">{u.speed > 0.1 ? '2 min' : 'docked'}</span>,
      }
    })
  }

  return (
    <Card size="hud" className="pointer-events-auto absolute right-7 bottom-[27px] block w-[522px] overflow-visible rounded-[16px] pt-[11px] pr-[18px] pb-2.5 pl-[21px]">
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="contents">
        <div className="flex items-center">
          <span className="grid w-[22px] place-items-center">
            <DockBoard />
          </span>
          <TabsList variant="hud" className="ml-[14px]">
            <TabsTrigger variant="hud" value="docks">
              Docks <span className="ml-[3px] font-medium text-[#94a3b8] group-data-active/tabs-trigger:font-semibold group-data-active/tabs-trigger:text-blue-deep">{`${docked.length}/4`}</span>
            </TabsTrigger>
            <TabsTrigger variant="hud" value="forklifts">
              Forklifts <span className="ml-[3px] font-medium text-[#94a3b8] group-data-active/tabs-trigger:font-semibold group-data-active/tabs-trigger:text-blue-deep">{`${forklifts.filter((f) => f.speed > 0.1).length}/${forklifts.length}`}</span>
            </TabsTrigger>
            <TabsTrigger variant="hud" value="trucks">
              Trucks <span className="ml-[3px] font-medium text-[#94a3b8] group-data-active/tabs-trigger:font-semibold group-data-active/tabs-trigger:text-blue-deep">{String(trucksOnSite(units))}</span>
            </TabsTrigger>
          </TabsList>
          <span className="ml-auto text-[length:calc(13.7px*var(--fs))] text-[#475569]">{SITE.name}</span>
        </div>
      </Tabs>
      <ul className="mt-1.5 mb-0 list-none p-0">
        {rows.map((row, i) => (
          <li key={row.name} className={i === 0 ? '' : 'border-t border-[#e3e8f0]'}>
            <Button
              type="button"
              variant="hud-row"
              size="hud-row"
              className="my-[3px]"
              data-selected={row.id && row.id === selectedId ? true : undefined}
              onClick={() => row.id && select(row.id)}
            >
              <span className="flex w-[88px] shrink-0 flex-col leading-[1.1]">
                <b className="text-[length:calc(14.2px*var(--fs))] font-bold text-ink">{row.name}</b>
                <span className="text-[length:calc(12.3px*var(--fs))] text-muted-foreground">{row.sub}</span>
              </span>
              <span className={`flex min-w-0 flex-1 items-center gap-[9px] overflow-hidden text-[length:calc(14.2px*var(--fs))] text-ellipsis whitespace-nowrap ${row.dot ? 'text-ink-2' : 'text-muted-foreground'}`}>
                {row.dot ? <i className="size-[7px] shrink-0 rounded-full" style={{ background: row.dot }} /> : null}
                {row.text}
              </span>
              <span className="w-[108px] shrink-0">
                <Badge variant={badgeVariant(row.pill[0])} size="hud" className="h-7">
                  {row.pill[1]}
                </Badge>
              </span>
              <span className="w-[66px] shrink-0 text-[length:calc(13.7px*var(--fs))] text-[#475569]">{row.tail}</span>
              <ChevronRight size={18} strokeWidth={2.2} className="ml-1 shrink-0 text-ink-2" />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function MiniProgress({ value, of, pct = false }: { value: number; of: number; pct?: boolean }) {
  return (
    <span className="flex flex-col gap-0.5 text-[length:calc(13.2px*var(--fs))] leading-[1.1]">
      <Progress value={(value / of) * 100} tone="green" size="hud-mini" />
      <span>{pct ? `${value}%` : `${value}/${of}`}</span>
    </span>
  )
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
