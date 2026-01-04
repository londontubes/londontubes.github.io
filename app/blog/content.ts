export interface TutorialStep {
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

export interface BlogQuestion {
  slug: string
  question: string
  shortAnswer: string
  body: string[]
  tutorialSteps?: TutorialStep[]
}

export const blogQuestions: BlogQuestion[] = [
  {
    slug: 'london-where-to-visit',
    question: 'Where to visit in London',
    shortAnswer:
      'Start with the Thames, then mix historic neighbourhoods like Bloomsbury with creative hubs such as Shoreditch and the South Bank.',
    body: [
      'If this is your first time in London, anchor your plans around the Thames. You can cover a huge amount of the skyline just by walking the river between Westminster, the South Bank, and Tower Bridge.',
      'For daytime wandering, Bloomsbury gives you leafy garden squares, independent bookshops, and the British Museum. In the evening, head east to Shoreditch for street art, food markets, and late-night bars.',
      'The key is to group areas that are close together on the Tube map so you spend more time exploring and less time changing lines.',
    ],
  },
  {
    slug: 'where-is-london-located',
    question: 'Where is London located',
    shortAnswer:
      'London sits in south‑east England on the River Thames, around 80 km (50 miles) inland from the North Sea.',
    body: [
      'London is in the south‑east of England and forms the capital of both England and the United Kingdom.',
      'The city spreads out from the River Thames and is surrounded by a ring road known as the M25. When people talk about "Greater London" they usually mean the area inside this ring.',
      'On a map, London is roughly at 51.5° north, 0.1° west. That means you are in a temperate, maritime climate with fairly mild winters and changeable weather year‑round.',
    ],
  },
  {
    slug: 'london-which-country',
    question: 'London which country',
    shortAnswer:
      'London is the capital city of the United Kingdom and is also the largest city in England.',
    body: [
      'London is part of the United Kingdom of Great Britain and Northern Ireland. Politically, it is both the capital of the UK and the capital of the country of England.',
      'It is home to the UK Parliament, government departments, and many national institutions such as the Supreme Court and the Bank of England.',
      'On a local level, the city is divided into 32 boroughs plus the historic City of London, each with its own local council.',
    ],
  },
  {
    slug: 'london-what-to-see',
    question: 'London what to see',
    shortAnswer:
      'Blend big icons like Westminster and Tower Bridge with free viewpoints such as Sky Garden and Tate Modern.',
    body: [
      'The classic first‑time highlights are Westminster (Big Ben, Parliament and Westminster Abbey), Buckingham Palace, the London Eye, Tower Bridge and the Tower of London.',
      'For modern skyline views that do not require expensive tickets, book a free slot at Sky Garden or head to the viewing level at Tate Modern.',
      'Outside the centre, neighbourhoods like Greenwich, Hampstead and Notting Hill give you more local streets, parks, and markets to explore.',
    ],
  },
  {
    slug: 'london-what-to-visit',
    question: 'London what to visit',
    shortAnswer:
      'Group your days: one for museums in South Kensington, one for the river and Westminster, and one for markets and canals.',
    body: [
      'To make the most of your time, build days around areas that sit on the same Tube lines.',
      'One classic day is South Kensington: the Natural History Museum, Science Museum and Victoria & Albert Museum sit almost next to each other and are all free to enter.',
      'Another day can focus on the river, starting in Westminster and walking the South Bank, then ending near Tower Bridge. A third day might be markets and canals around Camden, King’s Cross and Shoreditch.',
    ],
  },
  {
    slug: 'what-happen-in-london',
    question: "What's on in London",
    shortAnswer:
      'There is always something on: theatre in the West End, football and concerts, food markets, exhibitions and seasonal festivals.',
    body: [
      'London runs on a constant cycle of events. Any given week you will find new art exhibitions, West End theatre premieres, sports fixtures and one‑off festivals.',
      'For culture and nightlife, look to areas like Soho, the South Bank and Shoreditch. For big music and sports events, venues such as Wembley, the O2 and Tottenham Hotspur Stadium are the main hubs.',
      'Local listings sites and the "What’s on" pages for major museums are the easiest way to see what is happening during your trip.',
    ],
  },
  {
    slug: 'where-to-eat-in-london',
    question: 'Where to eat in London',
    shortAnswer:
      'Try markets like Borough and Spitalfields for casual food, then explore Soho, Shoreditch and Brixton for restaurants and bars.',
    body: [
      'London’s food scene is incredibly diverse. For a quick introduction, start with markets such as Borough Market, Old Spitalfields Market or the street food stalls at Camden and Maltby Street.',
      'In the evening, Soho is packed with small restaurants, from tapas bars to noodle shops. Shoreditch and Brixton both offer a mix of independent spots, food halls and late‑night bars.',
      'If you have dietary requirements, you will find good vegetarian, vegan and gluten‑free options in almost every central neighbourhood.',
    ],
  },
  {
    slug: 'what-to-do-in-london',
    question: 'What to do in London',
    shortAnswer:
      'Mix museums, parks and neighbourhood walks with a show or live music in the evening.',
    body: [
      'A balanced London day might start with a museum or gallery, move into a park in the afternoon, and end with a theatre performance or live music.',
      'Parks like Hyde Park, Regent’s Park and Hampstead Heath are all easy to reach on the Tube and give you huge green spaces inside the city.',
      'For evenings, consider a West End show, a comedy night, or a small gig in areas like Camden, Dalston or Peckham.',
    ],
  },
  {
    slug: 'london-weather-today',
    question: 'London weather today',
    shortAnswer:
      'Expect changeable conditions: carry a light waterproof and layers, and always check a live forecast on the day.',
    body: [
      'London has a temperate, maritime climate. Winters are usually cold and damp rather than extremely snowy, while summers are mild with occasional hot spells.',
      'Because the weather can change quickly, layers are your best friend. A light waterproof jacket and comfortable shoes will work in most seasons.',
      'For an accurate picture of today’s conditions, check a live forecast from a trusted weather app rather than relying on averages.',
    ],
  },
  {
    slug: 'where-to-live-london-student',
    question: 'Where to live in London as students',
    shortAnswer:
      'Use the London universities tube map to compare student-friendly areas like Camden, Kentish Town, Earl’s Court, Hammersmith and Mile End by real walking and tube time to campus.',
    body: [
      'Working out where to live as a London student is really a question of journey time. Rent, nightlife and vibe all matter, but if your commute is awkward you will feel it every single day.',
      'A simple way to start is with the universities filter on our London Tube Map. Pick your university, set a realistic walking time, then add a short tube-time layer. The green stations show where you can reasonably walk from campus; the purple stations show areas that are a quick ride away on the same tube lines.',
      'As you move the sliders, look for clusters of green and purple stations. Those clusters usually correspond to neighbourhoods that work well for students because they balance rent with a straightforward journey.',
      'For UCL, SOAS and other Bloomsbury universities, popular areas include Camden, Kentish Town, Tufnell Park and Finsbury Park, as well as parts of Islington and Holloway. These are all tied together by the Northern, Piccadilly and Victoria lines plus strong bus routes.',
      'Imperial College students often look at Earl’s Court, West Kensington, Fulham and Hammersmith. Staying on or near the District, Piccadilly or Circle lines keeps the daily trip to South Kensington simple even if you move a zone or two out to save on rent.',
      'For LSE and King’s College London in central London, students spread out along the Northern, Jubilee, Bakerloo, Central and District lines — think Waterloo, London Bridge, Elephant & Castle, Bermondsey, Clerkenwell and Mile End. The map helps you see which of these areas gives you a direct route with minimal changes.',
      'Once you have a shortlist from the map, cross-check it against your budget, the kind of flatshare or halls you want, and how late you will typically travel. Night Tube routes and last-train times can be just as important as the morning commute when you are balancing study, work and a social life.',
      'There is no single “best” student area in London, but by combining the university tube map with your own needs, you can quickly narrow the city down to a handful of neighbourhoods that make everyday life manageable and enjoyable.',
    ],
  },
]

export function getBlogQuestion(slug: string) {
  return blogQuestions.find((q) => q.slug === slug)
}
