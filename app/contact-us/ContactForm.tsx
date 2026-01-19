'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
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
    if (words <= MAX_WORDS) {
      setDescription(value)
      setLimitReached(false)
      return
    }

    setLimitReached(true)
  }

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const trimmedDescription = description.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailPattern.test(trimmedEmail)
  const canSubmit =
    wordCount > 0 &&
    trimmedDescription.length > 0 &&
    trimmedName.length > 0 &&
    isEmailValid &&
    !limitReached

  const mailtoHref = useMemo(() => {
    const params = new URLSearchParams()
    const subject = `London Tube Map ${category === 'improvement' ? 'Improvement' : 'Feedback'}`
    params.set('subject', subject)

    const bodyLines = [
      `Name: ${trimmedName || 'N/A'}`,
      `Email: ${trimmedEmail || 'N/A'}`,
      `Category: ${category}`,
      '',
      trimmedDescription || 'No message provided.',
    ]

    params.set('body', bodyLines.join('\n'))
    return `mailto:londontubespropertyfinder@gmail.com?${params.toString()}`
  }, [category, trimmedName, trimmedEmail, trimmedDescription])

  const handleMailtoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!canSubmit) {
      event.preventDefault()
      return
    }

    trackEvent({
      action: 'contact_form_submit',
      category: 'contact',
      label: category,
    })
  }

  return (
    <form className={styles.form} aria-label="Contact form">
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
      <a
        className={`${styles.submitButton} ${!canSubmit ? styles.submitButtonDisabled : ''}`}
        href={canSubmit ? mailtoHref : undefined}
        role="button"
        aria-disabled={!canSubmit}
        tabIndex={canSubmit ? 0 : -1}
        onClick={handleMailtoClick}
      >
        Submit
      </a>
    </form>
  )
}
