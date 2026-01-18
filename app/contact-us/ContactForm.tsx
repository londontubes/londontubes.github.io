'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { trackEvent } from '@/app/lib/analytics'
import styles from './ContactForm.module.css'

const MAX_WORDS = 500

function countWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export default function ContactForm() {
  const [category, setCategory] = useState<'feedback' | 'improvement'>('feedback')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)

  const wordCount = useMemo(() => countWords(description), [description])

  useEffect(() => {
    trackEvent({
      action: 'contact_page_view',
      category: 'contact',
      label: 'visit',
    })
  }, [])

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    const words = countWords(value)
    if (words.length <= MAX_WORDS) {
      setDescription(value)
      setLimitReached(false)
      setStatusMessage(null)
      setStatusType(null)
      return
    }
    setLimitReached(true)
  }

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
    setStatusMessage(null)
    setStatusType(null)
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    setStatusMessage(null)
    setStatusType(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)
    setStatusType(null)

    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        category,
        description: description.trim(),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.message || 'Unable to send your message at this time.')
        }
        setStatusMessage('Thanks for sharing your thoughts—we will review them and follow up where appropriate.')
        setStatusType('success')
        setDescription('')
        setCategory('feedback')
        setName('')
        setEmail('')
        setLimitReached(false)
        trackEvent({
          action: 'contact_form_submit',
          category: 'contact',
          label: category,
        })
      })
      .catch((error) => {
        console.error('Contact form submission failed', error)
        setStatusMessage('Something went wrong while sending your message. Please try again later.')
        setStatusType('error')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailPattern.test(email.trim())
  const canSubmit =
    wordCount > 0 &&
    description.trim().length > 0 &&
    name.trim().length > 0 &&
    isEmailValid &&
    !limitReached &&
    !isSubmitting

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {statusMessage && (
        <p
          className={`${styles.statusMessage} ${
            statusType === 'error' ? styles.statusError : styles.statusSuccess
          }`}
          aria-live="polite"
        >
          {statusMessage}
        </p>
      )}
      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>
          Your name
        </label>
        <input
          id="contact-name"
          type="text"
          className={styles.input}
          value={name}
          onChange={handleNameChange}
          placeholder="How should we address you?"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-email" className={styles.label}>
          Your email
        </label>
        <input
          id="contact-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={handleEmailChange}
          placeholder="name@example.com"
          aria-invalid={email.length > 0 && !isEmailValid}
        />
        {email.length > 0 && !isEmailValid && (
          <span className={styles.helper} aria-live="polite">
            Please provide a valid email address so we can reply if needed.
          </span>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-category" className={styles.label}>
          I am submitting:
        </label>
        <select
          id="contact-category"
          className={styles.select}
          value={category}
          onChange={(event) => setCategory(event.target.value as 'feedback' | 'improvement')}
        >
          <option value="feedback">General feedback</option>
          <option value="improvement">Improvement suggestion</option>
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-description" className={styles.label}>
          Describe your idea
        </label>
        <textarea
          id="contact-description"
          className={styles.textarea}
          placeholder="Tell us what you like, what could be better, or an idea you want us to explore."
          value={description}
          onChange={handleDescriptionChange}
          aria-describedby="description-help"
          spellCheck="true"
        />
        <p id="description-help" className={`${styles.helper} ${limitReached ? styles.statusHint : ''}`}>
          Use up to {MAX_WORDS} words. We will handle your input carefully.
        </p>
        <p className={styles.wordCount} aria-live="polite">
          Word count: {wordCount} / {MAX_WORDS} {limitReached && '— maximum reached'}
        </p>
      </div>
      <button type="submit" className={styles.submitButton} disabled={!canSubmit}>
        Submit
      </button>
    </form>
  )
}
