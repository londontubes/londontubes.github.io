'use client'

import { useState } from 'react'
import styles from './FAQ.module.css'

interface FAQItem {
  question: string
  answer: string
  keywords?: string[]
}

const faqData: FAQItem[] = [
  {
    question: 'How many tube lines are there in London?',
    answer: 'There are 11 London Underground lines: Bakerloo, Central, Circle, District, Hammersmith & City, Jubilee, Metropolitan, Northern, Piccadilly, Victoria, and Waterloo & City. Additionally, the DLR (Docklands Light Railway) serves East London with 6 branches.',
    keywords: ['tube lines', 'underground lines', 'how many lines'],
  },
  {
    question: 'What is the nearest tube station to my location?',
    answer: 'Use our interactive map to find the nearest tube station. Click on any location on the map, or search for universities to see nearby stations within walking distance. The map shows all 270+ London Underground and DLR stations with real-time filtering.',
    keywords: ['nearest station', 'closest tube', 'tube near me'],
  },
  {
    question: 'How do I use the London tube map line filter?',
    answer: 'Click on any line button (e.g., Central, Northern, Piccadilly) to filter the map and show only that line\'s stations and route. You can select multiple lines to compare routes. Click again to deselect. This helps plan journeys and avoid crowded lines.',
    keywords: ['line filter', 'how to use', 'filter lines'],
  },
  {
    question: 'Which tube lines serve London universities?',
    answer: 'Visit our Universities Filter page to see all major London universities and their nearest tube stations. UCL is near Euston Square (Circle/Hammersmith & City/Metropolitan), Imperial College near South Kensington (Circle/District/Piccadilly), LSE near Holborn (Central/Piccadilly), and King\'s College near Temple (Circle/District).',
    keywords: ['university stations', 'student travel', 'uni tube'],
  },
  {
    question: 'Is the London tube map free to use?',
    answer: 'Yes! This interactive London tube map is completely free to use. No registration or payment required. Access the full London Underground, DLR, and Overground network map with real-time filtering, university locations, and station information.',
    keywords: ['free tube map', 'cost', 'price'],
  },
  {
    question: 'What is the difference between the tube and DLR?',
    answer: 'The London Underground (tube) is the traditional metro system with 11 lines serving central and Greater London. The DLR (Docklands Light Railway) is an automated light metro serving East London, Canary Wharf, and London City Airport. Both accept Oyster cards and contactless payment.',
    keywords: ['dlr vs tube', 'difference', 'what is dlr'],
  },
  {
    question: 'How do I get from Heathrow to central London by tube?',
    answer: 'Take the Piccadilly line directly from Heathrow Terminals 2&3 or Terminal 5 to central London. Journey time is approximately 45-60 minutes to Leicester Square or King\'s Cross. Use our line filter to view the complete Piccadilly line route.',
    keywords: ['heathrow tube', 'airport to london', 'heathrow underground'],
  },
  {
    question: 'What are the London tube zones?',
    answer: 'London Underground operates across 9 fare zones. Zone 1 covers central London (Westminster, City, West End), while zones 2-9 extend to Greater London suburbs and airports. Heathrow is in Zone 6. Our map shows all stations across all zones.',
    keywords: ['tube zones', 'zone map', 'fare zones'],
  },
  {
    question: 'Can I see night tube services on this map?',
    answer: 'Our map shows all London Underground lines. Night Tube services run on Friday and Saturday nights on the Central, Jubilee, Northern, Piccadilly, and Victoria lines. Use the line filter to view these specific routes for weekend night travel planning.',
    keywords: ['night tube', 'weekend service', '24 hour tube'],
  },
  {
    question: 'How do I plan a journey on the London tube?',
    answer: 'Use our interactive map to visualize your route. Filter by specific lines to see connections, click stations to view details, and check university locations if traveling for education. For real-time journey planning with times, use TfL Journey Planner alongside our visual map.',
    keywords: ['journey planner', 'route planning', 'how to travel'],
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className={styles.faqSection} itemScope itemType="https://schema.org/FAQPage">
      <div className={styles.container}>
        <h2 className={styles.heading}>Frequently Asked Questions About London Tube Map</h2>
        <p className={styles.subtitle}>
          Everything you need to know about using the London Underground network map
        </p>
        
        <div className={styles.faqList}>
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                className={styles.question}
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                itemProp="name"
              >
                <span>{faq.question}</span>
                <span className={styles.icon} aria-hidden="true">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              {openIndex === index && (
                <div
                  className={styles.answer}
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p itemProp="text">{faq.answer}</p>
                </div>
              )}
            </div>
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
