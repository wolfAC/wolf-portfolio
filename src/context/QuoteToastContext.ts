import { createContext, useContext } from 'react'

export interface QuoteToastContextValue {
  /** No-ops (renders nothing) when `trigger` has no entry in
   * `content/quotes.ts` — every call site can call this freely without
   * checking first. */
  showQuote: (trigger: string) => void
}

export const QuoteToastContext = createContext<QuoteToastContextValue | null>(null)

export function useQuoteToast(): QuoteToastContextValue {
  const context = useContext(QuoteToastContext)
  if (!context) {
    throw new Error('useQuoteToast must be used within a QuoteToastProvider')
  }
  return context
}
