import { useState, type FormEvent } from 'react'
import { Meta } from '../typography'
import { ArrowIcon } from '../ui/icons'
import { site } from '../../data/site'
import { useQuoteToast } from '../../context/QuoteToastContext'

const FIELD_CLASS =
  'w-full border-b border-border bg-transparent py-3 text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-accent'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const { showQuote } = useQuoteToast()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const subject = `Project inquiry from ${name}`
    const body = `${message}\n\n— ${name} (${email})`
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
    showQuote('form-submit-success')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 max-w-xl">
      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block">
          <Meta as="span" className="block">
            Name
          </Meta>
          <input
            required
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <Meta as="span" className="block">
            Email
          </Meta>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <label className="mt-8 block">
        <Meta as="span" className="block">
          Message
        </Meta>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${FIELD_CLASS} resize-none`}
        />
      </label>

      <button
        type="submit"
        className="group mt-8 inline-flex items-center gap-3 text-fg transition-colors hover:text-accent"
      >
        <Meta as="span">Send message</Meta>
        <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
      </button>

      {sent && (
        <Meta as="p" className="mt-4 text-accent">
          Opening your email client to send this to {site.email}…
        </Meta>
      )}
    </form>
  )
}
