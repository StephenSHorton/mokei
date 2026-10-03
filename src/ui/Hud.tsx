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
import { useLook } from '../look'
import { DOCKS, trucksOnSite, useYard, WAREHOUSE_ID, type Unit } from '../sim/yard'
import { FloatingLabels } from './FloatingLabel'
import {
  Avatar,
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
    <>
      <FloatingLabels />
      <div className="hud" style={{ zoom: scale }}>
        <TopBar />
        <KpiRow />
        <CameraStack />
        <Inspector />
        <BottomTrack />
        <UnitBoard />
      </div>
    </>
  )
}

/* ───────────────────────────── top bar ───────────────────────────── */

function TopBar() {
  const [now, setNow] = useState(() => formatClock(new Date()))
  const docked = useYard((s) => Object.values(s.units).filter((u) => u.kind === 'truck' && u.z < 1.2).length)
  const stock = useYard((s) => s.stockOnHand)
  useEffect(() => {
    const id = window.setInterval(() => setNow(formatClock(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="topbar pointer-events-auto">
      <div className="brand">
        <BrandCube size={38} />
        <span>Yardline</span>
      </div>
      <label className="search">
        <Search size={20} strokeWidth={2} className="search__icon" />
        <input placeholder="Search sites, trucks, forklifts, pallets, shipments..." />
        <kbd>/</kbd>
      </label>
      <button type="button" className="site">
        <span className="site__badge">{SITE.code}</span>
        <span className="site__text">
          <b>{SITE.name}</b>
          <span>
            {Math.round((stock / SITE.capacity) * 100)}% full · {docked}/4 docked
          </span>
        </span>
        <ChevronRight size={18} strokeWidth={2} className="site__chev" />
        <span className="site__menu">
          <ChevronDown size={19} strokeWidth={2.2} />
        </span>
      </button>
      <div className="live">
        <span className="live__dot" />
        <b>Live</b>
        <span className="live__time">{now}</span>
      </div>
      <button type="button" className="bell" aria-label="Notifications">
        <Bell size={23} strokeWidth={2} />
        <span />
      </button>
      <span className="topbar__rule" />
      <div className="user">
        <span className="user__avatar">
          <Avatar />
        </span>
        <span className="user__text">
          <b>Jordan Hale</b>
          <span>Yard Lead</span>
        </span>
        <ChevronDown size={20} strokeWidth={2} className="user__chev" />
      </div>
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
    <div className="kpis">
      <Kpi icon={<KpiCube />} label="Stock on hand" value={stock.toLocaleString()} delta="+20" sub={`pallets · ${SITE.code}`} />
      <Kpi icon={<KpiTruck />} label="Trucks on site" value={String(trucks)} delta="+1" sub={`1 inbound · ${SITE.code}`} />
      <Kpi icon={<KpiClock />} label="On-time delivery" value={`${onTime.toFixed(1)}%`} delta="+0.4%" sub={`last 30 days · ${SITE.code}`} />
    </div>
  )
}

function Kpi({ icon, label, value, delta, sub }: { icon: ReactNode; label: string; value: string; delta: string; sub: string }) {
  return (
    <div className="glass kpi pointer-events-auto">
      <span className="kpi__tile">{icon}</span>
      <div className="kpi__body">
        <p className="kpi__label">{label}</p>
        <p className="kpi__value">
          {value}
          <span className="delta">
            <span className="delta__chip">
              <ArrowUp size={12} strokeWidth={2.6} />
            </span>
            {delta}
          </span>
        </p>
        <p className="kpi__sub">{sub}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────── camera stack ─────────────────────────── */

function CameraStack() {
  const zoomBy = useLook((s) => s.zoomBy)
  const rotateBy = useLook((s) => s.rotateBy)
  const resetView = useLook((s) => s.resetView)
  return (
    <div className="glass camstack pointer-events-auto">
      <button type="button" aria-label="Zoom in" onClick={() => zoomBy(3)}>
        <Plus size={21} strokeWidth={2} />
      </button>
      <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-3)}>
        <Minus size={21} strokeWidth={2} />
      </button>
      <span className="camstack__rule" />
      <button type="button" aria-label="Rotate left" onClick={() => rotateBy(-15)}>
        <RotateCcw size={19} strokeWidth={2.1} />
      </button>
      <button type="button" aria-label="Rotate right" onClick={() => rotateBy(15)}>
        <RotateCw size={19} strokeWidth={2.1} />
      </button>
      <span className="camstack__rule" />
      <button type="button" aria-label="Reset view" onClick={resetView}>
        <House size={19} strokeWidth={2.1} />
      </button>
    </div>
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
    <aside className="glass inspector pointer-events-auto">
      <div className="insp-head">
        <span className="insp-head__thumb">{head.art}</span>
        <div className="insp-head__text">
          <p className="eyebrow">{head.eyebrow}</p>
          <h2>{head.title}</h2>
          <p className="insp-head__sub">{head.sub}</p>
        </div>
        <div className="insp-head__actions">
          <button type="button" className="icon-btn" aria-label="Locate">
            <LocateFixed size={18} strokeWidth={2.1} />
          </button>
          {warehouse ? null : (
            <>
              <button type="button" className="icon-btn" aria-label="Open">
                <ArrowUpRight size={19} strokeWidth={2.1} />
              </button>
              <button type="button" className="icon-btn" aria-label="Close" onClick={() => select(null)}>
                <X size={18} strokeWidth={2.2} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="insp-rule" />
      {warehouse ? <WarehouseBody /> : unit!.kind === 'forklift' ? <ForkliftBody unit={unit!} /> : <TruckBody unit={unit!} />}
    </aside>
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

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`pill pill--${tone}`}>{children}</span>
}

function Bar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' }) {
  return (
    <span className="bar">
      <span className={`bar__fill bar__fill--${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  )
}

function Rows({ rows }: { rows: [string, ReactNode, boolean?][] }) {
  return (
    <dl className="rows">
      {rows.map(([label, value, link]) => (
        <div key={label} className="rows__row">
          <dt>{label}</dt>
          <dd className={link ? 'is-link' : undefined}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ForkliftBody({ unit }: { unit: Unit }) {
  const status = statusFor(unit)
  return (
    <>
      <div className="insp-status">
        <Pill tone={status.tone}>{status.label}</Pill>
        <span>{unit.title}</span>
      </div>
      <div className="insp-battery">
        <Bar value={unit.battery} tone="green" />
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
      <div className="insp-status">
        <Pill tone={status.tone}>{status.label}</Pill>
        <span>
          {SITE.code} · {bay ? bay.label : 'Yard'} · {progress}/6 pallets
        </span>
      </div>
      <div className="insp-battery">
        <Bar value={(progress / 6) * 100} tone="green" />
        <span>{progress}/6</span>
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
      <div className="insp-status">
        <Pill tone="green">Operational</Pill>
        <span>{docked} docked · 1 arriving · 3 staged</span>
      </div>
      <div className="tiles">
        <div className="tile">
          <p>Stock on hand</p>
          <p className="tile__value">
            {stock.toLocaleString()} <small>/ {SITE.capacity.toLocaleString()}</small>
          </p>
          <Bar value={(stock / SITE.capacity) * 100} />
        </div>
        <div className="tile">
          <p>Truck bays</p>
          <p className="tile__value">
            {docked} <small>/ 4 busy</small>
          </p>
          <Bar value={(docked / 4) * 100} tone="green" />
        </div>
        <div className="tile">
          <p>Outbound today</p>
          <p className="tile__value">
            31 <small>trucks</small>
          </p>
        </div>
        <div className="tile">
          <p>Put-aways today</p>
          <p className="tile__value">
            18 <small>pallets</small>
          </p>
        </div>
      </div>
      <div className="inv-head">
        <b>Inventory</b>
        <span>units</span>
      </div>
      <ul className="inv">
        {[
          ['Cardboard Box (M)', '1,906', 'tan', 'In Stock'],
          ['Safety Helmet', '334', 'tan', 'In Stock'],
          ['Nitrile Gloves', '95', 'blue', 'Low Stock'],
          ['Stretch Film', '208', 'white', 'In Stock'],
        ].map(([name, qty, tone, state]) => (
          <li key={name}>
            <span className="inv__art">
              <BoxArt tone={tone as 'tan' | 'blue' | 'white'} />
            </span>
            <span className="inv__name">{name}</span>
            <b>{qty}</b>
            <Pill tone={state === 'In Stock' ? 'green' : 'amber'}>{state}</Pill>
          </li>
        ))}
      </ul>
      <div className="fleet">
        <div className="inv-head">
          <b>Forklift fleet</b>
          <span>{working}/2 working</span>
        </div>
        <div className="fleet__row">
          <b>FL-10</b>
          <span>{units['fl-10']?.title ?? 'Idle'}</span>
          <Bar value={units['fl-10']?.battery ?? 80} tone="green" />
          <span className="fleet__pct">{Math.round(units['fl-10']?.battery ?? 80)}%</span>
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

  return (
    <div className="glass track pointer-events-auto">
      <div className="track__main">
        <div className="track__head">
          <span className="track__title">
            <TrackTruck />
            Shipment Tracking
          </span>
          <span className="track__meta">{truck?.code ?? 'TRK-18'} · Yardline Freight</span>
        </div>
        <ol className="steps">
          {STEPS.map((step, i) => {
            const state = done || i < current ? 'done' : i === current ? 'current' : 'todo'
            return (
              <li key={step.label} className={`step step--${state}`}>
                {i > 0 ? <span className={`step__line ${i <= current || done ? 'is-on' : ''}`} /> : null}
                <span className="step__dot">{step.icon}</span>
                <span className="step__label">{step.label}</span>
                <span className="step__time">{step.time}</span>
              </li>
            )
          })}
        </ol>
      </div>
      <button type="button" className="shipcard">
        <span className="shipcard__art">
          <TruckArt width={78} />
        </span>
        <span className="shipcard__body">
          <b>#SHP-44012</b>
          <span>To: Northpoint Hub</span>
          <Pill tone="green">{done ? 'Delivered' : current === 4 ? 'Unloading' : 'In transit'}</Pill>
          <span className="shipcard__meta">{SITE.code} · Bay 3 · 13 min left</span>
        </span>
        <ChevronRight size={20} strokeWidth={2.2} className="shipcard__chev" />
      </button>
    </div>
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
        tail: s.tone === 'green' ? <Progress value={2} of={6} /> : <span className="board__eta">{t.speed > 0.1 ? '2 min' : 'docked'}</span>,
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
        tail: u.kind === 'forklift' ? <Progress value={Math.round(u.battery)} of={100} pct /> : <span className="board__eta">{u.speed > 0.1 ? '2 min' : 'docked'}</span>,
      }
    })
  }

  return (
    <div className="glass board pointer-events-auto">
      <div className="board__head">
        <span className="board__icon">
          <DockBoard />
        </span>
        <div className="tabs">
          <TabBtn active={tab === 'docks'} onClick={() => setTab('docks')} label="Docks" count={`${docked.length}/4`} />
          <TabBtn active={tab === 'forklifts'} onClick={() => setTab('forklifts')} label="Forklifts" count={`${forklifts.filter((f) => f.speed > 0.1).length}/${forklifts.length}`} />
          <TabBtn active={tab === 'trucks'} onClick={() => setTab('trucks')} label="Trucks" count={String(trucksOnSite(units))} />
        </div>
        <span className="board__site">{SITE.name}</span>
      </div>
      <ul className="board__rows">
        {rows.map((row) => (
          <li key={row.name}>
            <button
              type="button"
              className={row.id && row.id === selectedId ? 'is-selected' : undefined}
              onClick={() => row.id && select(row.id)}
            >
              <span className="board__name">
                <b>{row.name}</b>
                <span>{row.sub}</span>
              </span>
              <span className={`board__text ${row.dot ? '' : 'is-muted'}`}>
                {row.dot ? <i style={{ background: row.dot }} /> : null}
                {row.text}
              </span>
              <span className="board__pill">
                <Pill tone={row.pill[0]}>{row.pill[1]}</Pill>
              </span>
              <span className="board__tail">{row.tail}</span>
              <ChevronRight size={18} strokeWidth={2.2} className="board__chev" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TabBtn({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: string }) {
  return (
    <button type="button" className={`tab ${active ? 'is-active' : ''}`} onClick={onClick}>
      {label} <span>{count}</span>
    </button>
  )
}

function Progress({ value, of, pct = false }: { value: number; of: number; pct?: boolean }) {
  return (
    <span className="mini">
      <Bar value={(value / of) * 100} tone="green" />
      <span>{pct ? `${value}%` : `${value}/${of}`}</span>
    </span>
  )
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
