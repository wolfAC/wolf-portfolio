import type { ElementType } from 'react'
import { m } from 'framer-motion'
import { cn } from '../../lib/cn'

interface AnimatedHeadingProps {
  /** One entry per line. A single-line heading still passes a 1-item array. */
  lines: string[]
  as?: ElementType
  className?: string
}

/** Staggered word-reveal for page h1s. */
export function AnimatedHeading({ lines, as, className }: AnimatedHeadingProps) {
  // Cast needed for this call site only: TS can't resolve JSX prop types for
  // a bare `ElementType`-typed value, collapsing them to `never` (a known
  // TS/@types limitation with this exact as-prop pattern).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = (as || 'h1') as any

  return (
    <Tag className={cn('spotlight-text text-display', className)}>
      {lines.map((line, lineIndex) => {
        const words = line.split(' ')
        return (
          <span key={line} className="block">
            {words.flatMap((word, wordIndex) => {
              const delay = lineIndex * 0.15 + wordIndex * 0.03
              const span = (
                <m.span
                  key={`w-${wordIndex}`}
                  className="inline-block"
                  initial={{ opacity: 0, y: '0.4em' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </m.span>
              )
              return wordIndex < words.length - 1 ? [span, ' '] : [span]
            })}
          </span>
        )
      })}

      {/* Decorative cursor-spotlight duplicate — plain/non-animated (the
       * word-stagger above only needs to play once), hidden from assistive
       * tech, masked invisible by default (see .spotlight-overlay in
       * index.css). */}
      <span aria-hidden="true" className="spotlight-overlay pointer-events-none">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    </Tag>
  )
}
