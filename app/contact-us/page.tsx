import type { Metadata } from 'next'
import ContactForm from './ContactForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Contact us',
  description:
    'Send feedback or improvement suggestions to the London Tube Map team. Choose a topic, explain your idea, and help us make the map better for everyone.',
}

export default function ContactUsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.kicker}>Contact us</p>
        <h1 className={styles.heading}>Share feedback or ideas</h1>
        <p className={styles.summary}>
          Tell us what is working, what is missing, or how we could make the London Tube Map more useful.
          Choose the type of message below, describe your idea in up to 500 words, and we will review
          it as soon as possible.
        </p>
      </div>
      <section className={styles.formShell} aria-label="Contact form">
        <ContactForm />
      </section>
    </main>
  )
}
