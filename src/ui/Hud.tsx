import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLook } from '../look'
import { trucksOnSite, useYard, WAREHOUSE_ID } from '../sim/yard'

export function Hud() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-slate-700">
      <TopBar />
      <KpiRow />
      <CameraStack />
      <Inspector />
      <BottomTrack />
      <UnitList />
    </div>
  )
}

function TopBar() {
  const [now, setNow] = useState(() => formatClock(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setNow(formatClock(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="pointer-events-auto mx-auto flex h-14 w-full items-center gap-3 border-b border-white/70 bg-white/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white shadow-sm">
          <CubeIcon />
        </span>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-slate-900">Yardline</p>
        </div>
      </div>
      <label className="relative mx-auto hidden min-w-0 max-w-md flex-1 md:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        <input
          className="h-9 w-full rounded-full border border-slate-200/80 bg-slate-50/80 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
          placeholder="Search sites, trucks, forklifts, pallets..."
        />
      </label>
      <div className="ml-auto flex items-center gap-3 text-sm">
        <span className="hidden rounded-full bg-slate-50 px-3 py-1.5 text-slate-600 ring-1 ring-slate-200/80 sm:inline">
          WH-01 · Northpoint Cross-Dock
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live {now}
        </span>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
            JH
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-800">Jordan Hale</p>
            <p className="text-[10px] text-slate-500">Yard lead</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function KpiRow() {
  const stock = useYard((s) => s.stockOnHand)
  const onTime = useYard((s) => s.onTime)
  const units = useYard((s) => s.units)
  const trucks = trucksOnSite(units)

  return (
    <div className="pointer-events-none absolute left-4 top-20 flex flex-wrap gap-2.5">
      <Kpi icon={<BoxIcon />} label="Stock on hand" value={stock.toLocaleString()} delta="+20" unit="pallets · WH-01" />
      <Kpi icon={<TruckIcon />} label="Trucks on site" value={String(trucks)} delta="+1" unit={`${trucks} inbound · WH-01`} />
      <Kpi icon={<ClockIcon />} label="On-time delivery" value={`${onTime.toFixed(1)}%`} delta="+0.4%" unit="last 30 days · WH-01" />
    </div>
  )
}

function Kpi({
  icon,
  label,
  value,
  delta,
  unit,
}: {
  icon: ReactNode
  label: string
  value: string
  delta: string
  unit: string
}) {
  return (
    <div className="glass pointer-events-auto min-w-[168px] rounded-2xl px-3.5 py-3">
      <div className="mb-2 flex items-center gap-2 text-slate-400">{icon}</div>
      <p className="hud-label">{label}</p>
      <div className="mt-0.5 flex items-end gap-2">
        <p className="text-[28px] font-semibold leading-none tracking-tight text-slate-900">{value}</p>
        <span className="mb-0.5 text-[11px] font-semibold text-emerald-500">{delta}</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{unit}</p>
    </div>
  )
}

function CameraStack() {
  const zoomBy = useLook((s) => s.zoomBy)
  const resetView = useLook((s) => s.resetView)
  return (
    <div className="pointer-events-auto absolute right-4 top-20 flex flex-col gap-2">
      <CamBtn label="Zoom in" onClick={() => zoomBy(2.2)}>
        +
      </CamBtn>
      <CamBtn label="Reset camera" onClick={resetView}>
        <HomeIcon />
      </CamBtn>
      <CamBtn label="Zoom out" onClick={() => zoomBy(-2.2)}>
        −
      </CamBtn>
    </div>
  )
}

function CamBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="glass grid h-10 w-10 place-items-center rounded-full text-lg font-medium text-slate-600 transition hover:bg-white"
    >
      {children}
    </button>
  )
}

function Inspector() {
  const selectedId = useYard((s) => s.selectedId)
  const units = useYard((s) => s.units)
  const select = useYard((s) => s.select)
  const unit = selectedId && selectedId !== WAREHOUSE_ID ? units[selectedId] : null
  const warehouse = selectedId === WAREHOUSE_ID

  if (!unit && !warehouse) return null

  return (
    <aside className="glass-strong pointer-events-auto absolute right-4 top-52 hidden w-[300px] rounded-2xl p-4 lg:block">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="hud-label">{warehouse ? 'Cold store · WH-01' : unit?.kind === 'truck' ? 'Box truck' : 'Forklift'}</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {warehouse ? 'Northpoint Cross-Dock' : unit?.code}
          </h2>
          <p className="text-sm text-slate-500">
            {warehouse ? '7 Harbor Way, Northpoint' : unit?.title}
          </p>
        </div>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
          onClick={() => select(null)}
          aria-label="Close inspector"
        >
          ×
        </button>
      </div>
      {warehouse ? <WarehouseStats /> : unit ? <UnitStats unit={unit} /> : null}
    </aside>
  )
}

function UnitStats({
  unit,
}: {
  unit: {
    kind: string
    task: string
    battery: number
    speed: number
    movesToday: number
    carryingId: string | null
  }
}) {
  return (
    <div className="space-y-2.5 text-sm">
      <Row label="Task" value={unit.task} />
      {unit.kind === 'forklift' ? (
        <div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-400">Battery</span>
            <span className="font-medium text-slate-800">{Math.round(unit.battery)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${unit.battery}%` }} />
          </div>
        </div>
      ) : null}
      <Row label="Speed" value={`${unit.speed.toFixed(1)} km/h`} />
      <Row label="Moves today" value={String(unit.movesToday)} />
      <Row label="Carrying" value={unit.carryingId ? unit.carryingId.toUpperCase() : 'Empty'} />
      <Row label="Site" value="Northpoint Cross-Dock" />
    </div>
  )
}

function WarehouseStats() {
  const stock = useYard((s) => s.stockOnHand)
  const units = useYard((s) => s.units)
  const docked = Object.values(units).filter((unit) => unit.kind === 'truck' && unit.z < 0).length
  return (
    <div className="space-y-2.5 text-sm">
      <Row label="Status" value="Operational" />
      <Row label="Docked / arriving" value={`${docked} docked · 1 arriving`} />
      <div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-slate-400">Stock on hand</span>
          <span className="font-medium text-slate-800">{stock.toLocaleString()} / 1,400</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (stock / 1400) * 100)}%` }} />
        </div>
      </div>
      <Row label="Truck bays" value="4 / 4 busy" />
      <Row label="Outbound today" value="31 trucks" />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  )
}

function BottomTrack() {
  const units = useYard((s) => s.units)
  const truck = units['trk-18']
  const steps = useMemo(
    () => ['Order confirmed', 'Picked', 'Loaded', 'In transit', 'Unloading'],
    [],
  )

  return (
    <div className="glass pointer-events-auto absolute bottom-4 left-1/2 hidden w-[min(720px,calc(100vw-24rem))] -translate-x-1/2 rounded-2xl px-5 py-3 xl:block">
      <div className="mb-2 flex items-center justify-between text-xs">
        <p className="font-semibold text-slate-800">Shipment tracking</p>
        <p className="text-slate-400">{truck?.code} · Yardline Freight</p>
      </div>
      <div className="relative mb-2 flex justify-between">
        <div className="absolute top-[7px] right-2 left-2 h-px bg-slate-200" />
        <div className="absolute top-[7px] left-2 h-px w-[78%] bg-blue-500" />
        {steps.map((step, index) => (
          <div key={step} className="relative z-10 flex flex-1 flex-col items-center">
            <span className={`h-2 w-2 rounded-full ${index < 4 ? 'bg-blue-600' : 'bg-slate-300'}`} />
            <span className="mt-2 text-[10px] font-medium text-slate-500">{step}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>SHP-44012 · To Northpoint Cross-Dock</span>
        <span>{truck?.task ?? 'In yard'}</span>
      </div>
    </div>
  )
}

function UnitList() {
  const units = useYard((s) => s.units)
  const selectedId = useYard((s) => s.selectedId)
  const select = useYard((s) => s.select)
  const rows = Object.values(units)
    .filter((unit) => unit.kind === 'truck' || unit.kind === 'forklift')
    .slice(0, 4)

  return (
    <div className="glass pointer-events-auto absolute right-4 bottom-4 hidden w-[300px] rounded-2xl p-3 md:block">
      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Docks 4/4</span>
        <span>Forklifts 2/2</span>
        <span>Trucks {trucksOnSite(units)}</span>
      </div>
      <ul className="space-y-1.5">
        {rows.map((unit) => (
          <li key={unit.id}>
            <button
              type="button"
              onClick={() => select(unit.id)}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                selectedId === unit.id ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50'
              }`}
            >
              <span className="font-semibold">{unit.code}</span>
              <span className="truncate pl-3 text-slate-500">{unit.task}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.6 14 5v6L8 14.4 2 11V5L8 1.6Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 14.4V8M14 5 8 8 2 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.2 10.2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2 14 5v6L8 14 2 11V5L8 2Z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 10V5h8v5H2Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 7h3l1 2v1h-4V7Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.5" cy="11.2" r="1.1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="11.2" r="1.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5.2V8l2 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8 8 3.2 13.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 7.5V13h8V7.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
