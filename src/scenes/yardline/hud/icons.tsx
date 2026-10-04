// Filled, slightly dimensional brand icons used in KPI tiles and thumbnails.
// Line icons come from lucide-react (the frames use lucide's 2px stroke set).

export function BrandCube({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <defs>
        <linearGradient id="bc-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d9cff" />
          <stop offset="1" stopColor="#3b6ff0" />
        </linearGradient>
        <linearGradient id="bc-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f62e6" />
          <stop offset="1" stopColor="#2450cf" />
        </linearGradient>
        <linearGradient id="bc-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f47c2" />
          <stop offset="1" stopColor="#1a3aa6" />
        </linearGradient>
      </defs>
      <path d="M18 2.5 32 9.6 18 16.8 4 9.6Z" fill="url(#bc-top)" strokeLinejoin="round" />
      <path d="M4 9.6 18 16.8V33.5L4 26.2Z" fill="url(#bc-left)" />
      <path d="M32 9.6 18 16.8V33.5L32 26.2Z" fill="url(#bc-right)" />
      <path d="M11 6 25 13.2V17" stroke="#dbe7ff" strokeWidth="2.1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function KpiCube() {
  return (
    <svg width="27" height="27" viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 3 31.5 10 18 17 4.5 10Z" fill="#5b8cff" />
      <path d="M4.5 10 18 17V33L4.5 26Z" fill="#2f63e6" />
      <path d="M31.5 10 18 17V33L31.5 26Z" fill="#1f47c2" />
      <path d="M11 6.6 24.6 13.6V17.6" stroke="#e0eaff" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function KpiTruck() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" aria-hidden="true">
      <rect x="1" y="3" width="17" height="13" rx="2.6" fill="#2f63e6" />
      <path d="M18.6 7h5.2c.9 0 1.7.5 2.1 1.2l2.4 4.2c.2.4.3.8.3 1.2V16c0 .6-.4 1-1 1h-9V7Z" fill="#3b6ff0" />
      <path d="M20.4 8.6h3.2l1.9 3.4h-5.1Z" fill="#dbe7ff" />
      <rect x="1" y="14.6" width="28" height="3" rx="1.5" fill="#1f47c2" />
      <circle cx="7" cy="18.6" r="3.3" fill="#1e3a8a" stroke="#fff" strokeWidth="1.6" />
      <circle cx="22.4" cy="18.6" r="3.3" fill="#1e3a8a" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}

export function KpiClock() {
  return (
    <svg width="27" height="27" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="12.5" fill="#2f63e6" />
      <circle cx="14" cy="14" r="9.6" fill="#5b8cff" />
      <path d="M14 8.4V14l3.6 2.4" stroke="#fff" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DockBoard() {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" aria-hidden="true">
      <rect x="1" y="1.5" width="20" height="17" rx="3.4" fill="#2f63e6" />
      <rect x="1" y="1.5" width="20" height="5" rx="2.5" fill="#5b8cff" />
      <rect x="4.5" y="9.4" width="13" height="2" rx="1" fill="#dbe7ff" />
      <rect x="4.5" y="13.4" width="13" height="2" rx="1" fill="#dbe7ff" />
    </svg>
  )
}

export function TrackTruck() {
  return (
    <svg width="27" height="21" viewBox="0 0 30 22" aria-hidden="true">
      <rect x="1" y="2" width="17" height="13" rx="2.6" fill="#2f63e6" />
      <path d="M18.6 6h5.2c.9 0 1.7.5 2.1 1.2l2.4 4.2c.2.4.3.8.3 1.2V15c0 .6-.4 1-1 1h-9V6Z" fill="#3b6ff0" />
      <path d="M20.4 7.6h3.2l1.9 3.4h-5.1Z" fill="#dbe7ff" />
      <circle cx="7" cy="17.6" r="3.1" fill="#1e3a8a" stroke="#fff" strokeWidth="1.6" />
      <circle cx="22.4" cy="17.6" r="3.1" fill="#1e3a8a" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}

/** Isometric box truck for the shipment card. */
export function TruckArt({ width = 80 }: { width?: number }) {
  return (
    <svg width={width} viewBox="0 0 120 84" aria-hidden="true">
      <ellipse cx="62" cy="72" rx="48" ry="8" fill="#1e3a8a" opacity="0.1" />
      {/* trailer */}
      <path d="M40 10 104 2 112 8 112 46 48 56 40 50Z" fill="#f8fafc" />
      <path d="M40 10 48 16 48 56 40 50Z" fill="#d6deec" />
      <path d="M40 10 104 2 112 8 48 16Z" fill="#ffffff" />
      <path d="M48 16 112 8 112 46 48 56Z" fill="#eef2f9" />
      <path d="M48 50 112 40 112 46 48 56Z" fill="#2f63e6" />
      <path d="M70 26l8-3.6 8 3.6-8 3.6Z" fill="#5b8cff" />
      <path d="M70 26l8 3.6v7.6l-8-3.6Z" fill="#2f63e6" />
      <path d="M86 26l-8 3.6v7.6l8-3.6Z" fill="#1f47c2" />
      {/* cab */}
      <path d="M12 30 34 27 44 33 44 60 22 64 12 58Z" fill="#2f63e6" />
      <path d="M12 30 22 36 22 64 12 58Z" fill="#1f47c2" />
      <path d="M12 30 34 27 44 33 22 36Z" fill="#5b8cff" />
      <path d="M14 36 21 40 21 50 14 46Z" fill="#1b2236" />
      <path d="M24 39 42 36 42 46 24 49Z" fill="#1b2236" />
      {/* wheels */}
      <ellipse cx="20" cy="62" rx="4.6" ry="5.6" fill="#1f2533" />
      <ellipse cx="36" cy="60" rx="4.6" ry="5.6" fill="#1f2533" />
      <ellipse cx="80" cy="54" rx="4.6" ry="5.6" fill="#1f2533" />
      <ellipse cx="94" cy="52" rx="4.6" ry="5.6" fill="#1f2533" />
    </svg>
  )
}

export function ForkliftArt() {
  return (
    <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="56" rx="22" ry="5" fill="#1e3a8a" opacity="0.1" />
      <path d="M14 38 34 30 50 38 30 46Z" fill="#3b6ff0" />
      <path d="M14 38 30 46 30 54 14 46Z" fill="#2f63e6" />
      <path d="M50 38 30 46 30 54 50 46Z" fill="#1f47c2" />
      <path d="M26 30 40 24 50 29 36 35Z" fill="#fcd34d" />
      <path d="M26 30 36 35 36 44 26 39Z" fill="#f59e0b" />
      <path d="M50 29 36 35 36 44 50 38Z" fill="#d97706" />
      <path d="M20 14 22 13 22 38 20 39Z" fill="#232838" />
      <path d="M38 8 40 7 40 30 38 31Z" fill="#232838" />
      <path d="M44 12 46 11 46 32 44 33Z" fill="#232838" />
      <path d="M20 14 40 6 46 9 26 17Z" fill="#363c4f" />
      <circle cx="32" cy="22" r="3.4" fill="#f97316" />
      <path d="M8 44 18 40 19 41 9 45Z M4 41 14 37 15 38 5 42Z" fill="#3b4256" />
      <path d="M8 26 10 25 10 44 8 45Z" fill="#232838" />
      <ellipse cx="22" cy="50" rx="3" ry="3.6" fill="#1f2533" />
      <ellipse cx="44" cy="44" rx="3" ry="3.6" fill="#1f2533" />
    </svg>
  )
}

export function WarehouseArt() {
  return (
    <svg width="48" height="40" viewBox="0 0 72 60" aria-hidden="true">
      <ellipse cx="36" cy="52" rx="32" ry="6" fill="#1e3a8a" opacity="0.08" />
      <path d="M6 28 38 16 66 26 34 38Z" fill="#5b8cff" />
      <path d="M6 28 34 38 34 52 6 42Z" fill="#2f63e6" />
      <path d="M66 26 34 38 34 52 66 40Z" fill="#f8fafc" />
      <path d="M6 28 22 14 54 3 38 16Z" fill="#3b6ff0" />
      <path d="M38 16 54 3 66 26Z" fill="#2556d6" opacity="0.6" />
      <path d="M40 40 47 37.4 47 47 40 49.6Z M52 35.6 59 33 59 42.6 52 45.2Z" fill="#2f63e6" />
      <path d="M41.5 41.4 45.5 39.9 45.5 46.4 41.5 47.9Z M53.5 37 57.5 35.5 57.5 42 53.5 43.5Z" fill="#e0b17a" />
    </svg>
  )
}

export function BoxArt({ tone = 'tan' }: { tone?: 'tan' | 'blue' | 'white' }) {
  const top = tone === 'blue' ? '#6d9cff' : tone === 'white' ? '#ffffff' : '#f0c896'
  const left = tone === 'blue' ? '#2f63e6' : tone === 'white' ? '#dfe5ef' : '#d9a873'
  const right = tone === 'blue' ? '#1f47c2' : tone === 'white' ? '#cbd5e1' : '#c38f5b'
  return (
    <svg width="26" height="26" viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 4 31 10.5 18 17 5 10.5Z" fill={top} />
      <path d="M5 10.5 18 17V32L5 25.5Z" fill={left} />
      <path d="M31 10.5 18 17V32L31 25.5Z" fill={right} />
      {tone === 'tan' ? <path d="M11.5 7.2 24.5 13.7V18" stroke="#f8dfb9" strokeWidth="2" fill="none" /> : null}
    </svg>
  )
}

export function Avatar() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6ecf8" />
          <stop offset="1" stopColor="#c9d5ec" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="22" fill="url(#av-bg)" />
      <path d="M7 44c1.4-8.4 7.6-12 15-12s13.6 3.6 15 12Z" fill="#1e3a8a" />
      <path d="M17.6 32.6 22 38l4.4-5.4Z" fill="#f8fafc" />
      <rect x="18.6" y="26" width="6.8" height="7" rx="2.6" fill="#b9825a" />
      <ellipse cx="22" cy="19.6" rx="7.6" ry="8.8" fill="#c68c62" />
      <path d="M14.4 20.6c.4 5.8 3.4 9.4 7.6 9.4s7.2-3.6 7.6-9.4c-1.2 2.4-3 3.4-7.6 3.4s-6.4-1-7.6-3.4Z" fill="#3b2a20" />
      <path d="M14 18.6c-.6-6.8 3.2-10.4 8-10.4s8.8 3.4 8 10.4c-1-3.6-2.8-5.4-8-5.4s-7 1.8-8 5.4Z" fill="#2a1e17" />
      <circle cx="19" cy="19.4" r="0.9" fill="#1f1611" />
      <circle cx="25" cy="19.4" r="0.9" fill="#1f1611" />
    </svg>
  )
}
