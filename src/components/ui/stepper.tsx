import type { ReactNode } from 'react'
import { cn } from 'cn'

export type StepperStep = {
  label: string
  time?: string
  icon?: ReactNode
}

function Stepper({
  steps,
  current,
  done = false,
  className,
}: {
  steps: readonly StepperStep[]
  current: number
  done?: boolean
  className?: string
}) {
  return (
    <ol className={cn('m-0 mt-[11px] flex list-none p-0', className)}>
      {steps.map((step, i) => {
        const state = done || i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li
            key={step.label}
            className="relative flex flex-1 flex-col items-center leading-[1.25]"
            data-state={state}
          >
            {i > 0 ? (
              <span
                className={cn(
                  'absolute top-[17px] right-1/2 mt-[-1.5px] h-[3px] w-full rounded-[2px] bg-[#e2e8f0]',
                  (i <= current || done) && 'bg-[#2f5fe6]',
                )}
              />
            ) : null}
            <span
              className={cn(
                'relative z-[1] grid size-[34px] place-items-center rounded-full bg-[#2f63e6] text-white shadow-[0_0_0_3px_#fff,0_3px_8px_rgba(37,99,235,0.25)]',
                state === 'current' &&
                  'my-[-3px] size-10 shadow-[0_0_0_3px_#fff,0_0_0_6px_#c9d7fb,0_4px_12px_rgba(37,99,235,0.3)]',
                state === 'todo' && 'bg-[#e5e9f0] text-[#64748b] shadow-[0_0_0_3px_#fff]',
              )}
            >
              {step.icon}
            </span>
            <span className="mt-[13px] text-[length:calc(14.1px*var(--fs))] font-medium whitespace-nowrap text-ink-2">
              {step.label}
            </span>
            {step.time ? (
              <span className="text-[length:calc(12.6px*var(--fs))] text-muted-foreground tabular-nums">
                {step.time}
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper }
