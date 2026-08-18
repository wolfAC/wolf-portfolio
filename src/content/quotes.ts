/** Movie-quote easter eggs — a single shared config so every trigger point
 * (console, voice, debug HUD, rage-click, 404, contact form, resume link)
 * calls the same `getQuote(trigger)` helper instead of each re-implementing
 * its own quote list.
 *
 * Values are intentionally left as `{{QUOTE_N}}` placeholders. Movie
 * dialogue is copyrighted — per the redesign spec, the exact wording has to
 * come from you (paraphrase or verbatim, your call), not be generated here.
 * Fill these in yourself; every trigger point below already calls
 * `getQuote()`, so typing real text into this one file is the only change
 * needed to bring the whole feature to life.
 *
 * Not every key here has a wired call site yet — `form-submit-error` (the
 * contact form is a `mailto:` link with no detectable failure state) and
 * `page-end`/`bankai` (deferred, see audit/plan-redesign-phase-3.md) are
 * kept as complete config entries for later, not invented call sites. */
export interface Quote {
  trigger: string
  text: string
}

export const quotes: Quote[] = [
  { trigger: 'load', text: '{{QUOTE_1}}' },
  { trigger: 'skills', text: '{{QUOTE_2}}' },
  { trigger: 'debug-rotate', text: '{{QUOTE_3}}' },
  { trigger: 'form-submit-success', text: '{{QUOTE_4}}' },
  { trigger: 'form-submit-error', text: '{{QUOTE_5}}' },
  { trigger: 'rage-click', text: '{{QUOTE_6}}' },
  { trigger: '404', text: '{{QUOTE_7}}' },
  { trigger: 'case-study-open', text: '{{QUOTE_8}}' },
  { trigger: 'debug-on', text: '{{QUOTE_9}}' },
  { trigger: 'voice-confirm', text: '{{QUOTE_10}}' },
  { trigger: 'page-end', text: '{{QUOTE_11}}' },
  { trigger: 'resume-download', text: '{{QUOTE_12}}' },
]

/** Returns `null` (not a placeholder, not a throw) for any trigger with no
 * entry — every call site treats that as "render nothing," per spec. */
export function getQuote(trigger: string): string | null {
  return quotes.find((quote) => quote.trigger === trigger)?.text ?? null
}
