import styles from './FAQ.module.css'
import { faqItems } from '../../data/faqData'

export function FAQ() {
  return (
    <section className={styles.faqSection} itemScope itemType="https://schema.org/FAQPage">
      <div className={styles.container}>
        <h2 className={styles.heading}>Frequently Asked Questions About London Tube Map</h2>
        <p className={styles.subtitle}>
          Everything you need to know about using the London Underground network map
        </p>
        
        <div className={styles.faqList}>
          {faqItems.map((faq) => (
            <details
              key={faq.question}
              className={styles.faqItem}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <summary className={styles.question} itemProp="name">
                <span>{faq.question}</span>
                <span className={styles.icon} aria-hidden="true">
                  +
                </span>
              </summary>

              <div
                className={styles.answer}
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p itemProp="text">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className={styles.additionalInfo}>
          <h3>Need More Information?</h3>
          <p>
            For official TfL information, visit{' '}
            <a href="https://tfl.gov.uk" target="_blank" rel="noopener noreferrer">
              tfl.gov.uk
            </a>
            . Our interactive London tube map provides a visual, filterable experience for exploring
            the Underground, DLR, and university transit connections.
          </p>
        </div>
      </div>
    </section>
  )
}

export default FAQ
