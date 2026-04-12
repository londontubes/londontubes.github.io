export interface FAQItem {
  question: string
  answer: string
  keywords?: string[]
}

export const faqItems: FAQItem[] = [
  {
    question: 'How many tube lines are there in London?',
    answer:
      'There are 11 London Underground lines: Bakerloo, Central, Circle, District, Hammersmith & City, Jubilee, Metropolitan, Northern, Piccadilly, Victoria, and Waterloo & City. Additionally, the DLR (Docklands Light Railway) serves East London with 6 branches.',
    keywords: ['tube lines', 'underground lines', 'how many lines'],
  },
  {
    question: 'What is the nearest tube station to my location?',
    answer:
      'Use our interactive map to find the nearest tube station. Click on any location on the map, or search for universities to see nearby stations within walking distance. The map shows all 270+ London Underground and DLR stations with real-time filtering.',
    keywords: ['nearest station', 'closest tube', 'tube near me'],
  },
  {
    question: 'How do I use the London tube map line filter?',
    answer:
      "Click on any line button (e.g., Central, Northern, Piccadilly) to filter the map and show only that line's stations and route. You can select multiple lines to compare routes. Click again to deselect. This helps plan journeys and avoid crowded lines.",
    keywords: ['line filter', 'how to use', 'filter lines'],
  },
  {
    question: 'Which tube lines serve London universities?',
    answer:
      "Visit our Universities Filter page to see all major London universities and their nearest tube stations. UCL is near Euston Square (Circle/Hammersmith & City/Metropolitan), Imperial College near South Kensington (Circle/District/Piccadilly), LSE near Holborn (Central/Piccadilly), and King's College near Temple (Circle/District).",
    keywords: ['university stations', 'student travel', 'uni tube'],
  },
  {
    question: 'Where should I live as a London university student?',
    answer:
      "Use our Universities Filter map to explore student-friendly areas to live near your London university. Select your campus, adjust the green walking-time control, then add purple tube time to see which neighbourhoods and stations are within a short walk or single tube ride on the same lines. This makes it easier to compare areas like Camden, Kentish Town, Earl's Court, Hammersmith, Waterloo, London Bridge and Mile End by actual travel time to UCL, Imperial, LSE, King's and other universities.",
    keywords: [
      'where to live in london as students',
      'best areas to live near london universities',
      'ucl student areas',
      'imperial college student housing',
      'lse where to live',
      "kings college london student areas",
      'student neighbourhoods london',
    ],
  },
  {
    question: 'Can I search for flats near a tube station?',
    answer:
      'Yes. When you click a purple station on the map, the station info card includes both “Zoopla rental search” and, where available, “Rightmove rental search” buttons. These open pre-filtered rental searches centred on that station, focused on studio to 2-bedroom flats up to around £2,000 per month within roughly half a mile. It is a quick way to compare rental options that match the journey times you have already explored on the map.',
    keywords: [
      'flats near tube station',
      'zoopla rental search',
      'rightmove rental search',
      'rent near london station',
      'student flats london map',
      'london rental search zoopla',
    ],
  },
  {
    question: 'Is the London tube map free to use?',
    answer:
      'Yes! This interactive London tube map is completely free to use. No registration or payment required. Access the full London Underground, DLR, and Overground network map with real-time filtering, university locations, and station information.',
    keywords: ['free tube map', 'cost', 'price'],
  },
  {
    question: 'What is the difference between the tube and DLR?',
    answer:
      'The London Underground (tube) is the traditional metro system with 11 lines serving central and Greater London. The DLR (Docklands Light Railway) is an automated light metro serving East London, Canary Wharf, and London City Airport. Both accept Oyster cards and contactless payment.',
    keywords: ['dlr vs tube', 'difference', 'what is dlr'],
  },
  {
    question: 'How do I get from Heathrow to central London by tube?',
    answer:
      "Take the Piccadilly line directly from Heathrow Terminals 2&3 or Terminal 5 to central London. Journey time is approximately 45-60 minutes to Leicester Square or King's Cross. Use our line filter to view the complete Piccadilly line route.",
    keywords: ['heathrow tube', 'airport to london', 'heathrow underground'],
  },
  {
    question: 'What are the London tube zones?',
    answer:
      'London Underground operates across 9 fare zones. Zone 1 covers central London (Westminster, City, West End), while zones 2-9 extend to Greater London suburbs and airports. Heathrow is in Zone 6. Our map shows all stations across all zones.',
    keywords: ['tube zones', 'zone map', 'fare zones'],
  },
  {
    question: 'Can I see night tube services on this map?',
    answer:
      'Our map shows all London Underground lines. Night Tube services run on Friday and Saturday nights on the Central, Jubilee, Northern, Piccadilly, and Victoria lines. Use the line filter to view these specific routes for weekend night travel planning.',
    keywords: ['night tube', 'weekend service', '24 hour tube'],
  },
  {
    question: 'How do I plan a journey on the London tube?',
    answer:
      'Use our interactive map to visualize your route. Filter by specific lines to see connections, click stations to view details, and check university locations if traveling for education. For real-time journey planning with times, use TfL Journey Planner alongside our visual map.',
    keywords: ['journey planner', 'route planning', 'how to travel'],
  },
  {
    question: 'Where can I find a free London Tube map?',
    answer:
      'You can view and use the free interactive London Tube map right here at londontubes.co.uk. It shows all 11 Underground lines plus the DLR with real-time filtering — no download required. For a printable PDF version, Transport for London (TfL) offers the official static tube map at tfl.gov.uk.',
    keywords: ['free london tube map', 'download tube map', 'london underground map free'],
  },
  {
    question: 'Is this the official London Underground map?',
    answer:
      'This is an independent interactive version of the London Tube map built using TfL open data. It is not the official TfL map, but it includes all the same lines and stations. The advantage is live filtering, university proximity search, and mobile optimisation not available on the official static map.',
    keywords: ['official london tube map', 'tfl tube map', 'london underground official map'],
  },
  {
    question: 'What is the London Underground map called?',
    answer:
      'The London Underground map is officially called the "Tube map" and was first designed by Harry Beck in 1931. It is a schematic (not geographically accurate) diagram showing the connections between all 11 Underground lines, the DLR, Overground, and Elizabeth line. Our interactive London Tube map is based on TfL open data and updated for 2026.',
    keywords: ['london underground map name', 'harry beck tube map', 'what is tube map'],
  },
  {
    question: 'How do I get from one side of London to the other by tube?',
    answer:
      'For east–west journeys use the Central, District, or Elizabeth line. For north–south, the Northern and Victoria lines are fastest. The Circle line connects major stations in a loop. Use our interactive London Tube map to click a line and see exactly which stations it serves, then find your interchange point.',
    keywords: ['cross london by tube', 'tube route planner', 'london underground journey'],
  },
]
