import { useEffect, useRef } from 'react'
import { setLabelElement } from './labelBridge'

/** Two pinned labels: the selected unit (blue) and the focused pallet (white). */
export function FloatingLabels() {
  const unit = useRef<HTMLDivElement>(null)
  const pallet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLabelElement('unit', unit.current)
    setLabelElement('pallet', pallet.current)
    return () => {
      setLabelElement('unit', null)
      setLabelElement('pallet', null)
    }
  }, [])

  return (
    <>
      <div ref={unit} className="pin-label pin-label--blue" />
      <div ref={pallet} className="pin-label pin-label--white" />
    </>
  )
}
