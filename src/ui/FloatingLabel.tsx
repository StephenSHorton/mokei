import { useEffect, useRef } from 'react'
import { setLabelElement } from './labelBridge'

export function FloatingLabel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLabelElement(ref.current)
    return () => setLabelElement(null)
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute top-0 left-0 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-white/92 px-3 py-1 text-[12px] font-medium text-slate-700 opacity-0 shadow-[0_8px_20px_rgba(15,23,42,0.08)] ring-1 ring-white"
    />
  )
}
