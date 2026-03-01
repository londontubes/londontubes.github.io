import type { Metadata } from 'next'
import ContactForm from './ContactForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Contact us',
  description:
    'Send feedback or improvement suggestions to the London Tube Map team. Choose a topic, explain your idea, and help us make the map better for everyone.',
  alternates: {
    canonical: '/contact-us/',
  },
}

export default function ContactUsPage() {
  const mailtoHref =
    'mailto:londontubespropertyfinder@gmail.com?subject=London%20Tube%20Map%20Feedback&body=Name%3A%20%0AEmail%3A%20%0ACategory%3A%20%0A%0AMessage%3A%20'

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
      <section className={styles.directEmail}>
        <p>
          Want to launch your email client instead? Send your thoughts straight to our inbox.
        </p>
        <h4>
          <a
            className={styles.mailtoLink}
            href={mailtoHref}
          >
            londontubespropertyfinder@gmail.com
          </a>
        </h4>
        <p>
          If clicking the link doesn’t open an email app, copy the address and send us your message from
          whichever mail client you prefer.
        </p>
      </section>
    </main>
  )
}
