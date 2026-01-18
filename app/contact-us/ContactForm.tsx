'use client'

import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
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
  const [submitted, setSubmitted] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  const wordCount = useMemo(() => countWords(description), [description])

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    const words = countWords(value)
    if (words.length <= MAX_WORDS) {
      setDescription(value)
      setLimitReached(false)
      setSubmitted(false)
      return
    }
    setLimitReached(true)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setDescription('')
    setCategory('feedback')
    setLimitReached(false)
  }

  const canSubmit = wordCount > 0 && description.trim().length > 0

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {submitted && (
        <p className={`${styles.statusMessage} ${styles.statusSuccess}`} aria-live="polite">
          Thanks for sharing your thoughts—we will review them and follow up where appropriate.
        </p>
      )}
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
