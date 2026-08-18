import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { getQuote } from '../content/quotes'
import { Meta } from '../components/typography'
import { QuoteToastContext } from './QuoteToastContext'

const VISIBLE_MS = 4000

/** One small generic toast, reused by every trigger point (per spec:
 * "Quote display component itself is generic/reusable... so any trigger
 * point can reuse it rather than building bespoke UI each time"). Fixed
 * bottom-center, clear of the Debug/Sound toggles in the two bottom
 * corners. */
export function QuoteToastProvider({ children }: { children: ReactNode }) {
  const [activeQuote, setActiveQuote] = useState<string | null>(null)
  const timeoutRef = useRef<number>(0)

  const showQuote = useCallback((trigger: string) => {
    const quote = getQuote(trigger)
    if (!quote) return
    setActiveQuote(quote)
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setActiveQuote(null), VISIBLE_MS)
  }, [])

  const value = useMemo(() => ({ showQuote }), [showQuote])

  return (
    <QuoteToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-gutter"
      >
        <AnimatePresence>
          {activeQuote ? (
            <m.div
              key={activeQuote}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="border border-cyan bg-bg-elevated px-4 py-2"
            >
              <Meta as="p" className="text-cyan">
                {activeQuote}
              </Meta>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
    </QuoteToastContext.Provider>
  )
}
