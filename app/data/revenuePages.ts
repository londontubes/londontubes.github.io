import type { RevenueIntentSegment } from '@/app/lib/revenue'

export interface RevenuePageLink {
  href: string
  label: string
  description: string
}

export interface RevenuePageSection {
  title: string
  paragraphs: string[]
}

export interface RevenueAreaHighlight {
  areaName: string
  summary: string
}

export interface RevenueLandingPageDefinition {
  slug: string
  title: string
  description: string
  heroKicker: string
  heroSummary: string
  intentSegment: RevenueIntentSegment
  searchStationName: string
  universityId?: string
  mapHref: string
  adPlacement: string
  areaHighlights: RevenueAreaHighlight[]
  sections: RevenuePageSection[]
  relatedLinks: RevenuePageLink[]
}

export const revenueLandingPages: RevenueLandingPageDefinition[] = [
  {
    slug: 'best-london-student-areas',
    title: 'Best Areas to Live in London for Students: Tube Commute Guide',
    description:
      'Find the best areas to live in London for students by balancing tube commute time, rent, and direct links into UCL, Imperial, LSE, and other university housing searches.',
    heroKicker: 'Student accommodation hub',
    heroSummary:
      'If you are asking where students should live in London, start with commute speed rather than postcode prestige. This guide narrows the city down to neighbourhoods and station clusters that work for rent, tube time, and daily campus life.',
    intentSegment: 'student-housing',
    searchStationName: 'King\'s Cross St Pancras Underground Station',
    mapHref: '/universities/',
    adPlacement: 'landing-general',
    areaHighlights: [
      { areaName: 'Camden and Kentish Town', summary: 'Strong for UCL, SOAS, and central universities thanks to direct Northern line links and a large flatshare market.' },
      { areaName: 'Hammersmith and Fulham', summary: 'Useful for Imperial and west-London commutes, with more inventory than Zone 1.' },
      { areaName: 'Stratford and Mile End', summary: 'Good value for east-London campuses and students who still want fast access into central London.' },
    ],
    sections: [
      {
        title: 'How to find the best London student areas quickly',
        paragraphs: [
          'Start with the commute, not the postcode. Pick a realistic daily time budget, then use the universities map to see which stations and line corridors keep you inside it for UCL, Imperial, LSE, King\'s, QMUL, and the other major London universities.',
          'Once you have a cluster of workable stations, move into property search immediately so you are comparing real student rooms and rental supply instead of idealised neighbourhood lists.',
        ],
      },
      {
        title: 'What makes an area good for student living in London',
        paragraphs: [
          'The best student areas are the ones that keep your daily trip simple, your rent realistic, and your fallback transport options strong. These pages combine commute guidance with live property and student-room links so you can move from research into listings without rebuilding the search yourself.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/student-accommodation/ucl-student-accommodation/', label: 'UCL student accommodation', description: 'Find UCL-friendly areas and direct room or flat searches.' },
      { href: '/student-accommodation/imperial-student-accommodation/', label: 'Imperial student accommodation', description: 'See west-London commute options for South Kensington.' },
      { href: '/blog/where-to-live-london-student/', label: 'Read the full student areas guide', description: 'Long-form guidance for narrowing down student neighbourhoods.' },
    ],
  },
  {
    slug: 'ucl-student-accommodation',
    title: 'Where to Live Near UCL: Best Student Accommodation Areas and Tube Links',
    description:
      'Find where to live near UCL with the best student accommodation areas, realistic tube routes, and direct shortcuts into verified rooms and private rental listings.',
    heroKicker: 'For UCL students',
    heroSummary:
      'If you are searching for where to live near UCL, Bloomsbury gives you flexibility but not always value. The strongest student accommodation options usually sit one or two stops out along Northern, Victoria, and Piccadilly corridors.',
    intentSegment: 'student-housing',
    searchStationName: 'Euston Square Underground Station',
    universityId: 'UCL',
    mapHref: '/universities/',
    adPlacement: 'landing-ucl',
    areaHighlights: [
      { areaName: 'Camden Town', summary: 'Fast route into Bloomsbury with strong student demand and lots of flatshare supply.' },
      { areaName: 'Kentish Town', summary: 'Often a better price-to-commute balance than staying right in Zone 1.' },
      { areaName: 'Finsbury Park', summary: 'Useful if you want a bigger transport hub and more options along the Victoria line.' },
    ],
    sections: [
      {
        title: 'Best areas to live near UCL without overpaying',
        paragraphs: [
          'The sweet spot for UCL is usually anywhere with direct or near-direct access to Euston, Warren Street, or Euston Square. Those stations fan out into Camden, Kentish Town, Tufnell Park, and Finsbury Park, which remain practical for lectures without forcing you into the most expensive central postcodes.',
        ],
      },
      {
        title: 'How to compare UCL accommodation fast',
        paragraphs: [
          'Use the university map first, then compare Amber for verified student inventory and the property portals for private rentals near the stations that already fit your commute. That keeps you close to genuine UCL-ready stock instead of generic London listings.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/universities/', label: 'Open the UCL commute map', description: 'Filter walk and tube time around UCL.' },
      { href: '/blog/where-to-live-london-student/', label: 'See broader student area advice', description: 'Compare UCL with other central universities.' },
    ],
  },
  {
    slug: 'imperial-student-accommodation',
    title: 'Where to Live Near Imperial College London: Best Areas Near South Kensington',
    description:
      'Find where to live near Imperial College London with the best areas around South Kensington, commute-focused tube routes, and direct housing search shortcuts.',
    heroKicker: 'For Imperial students',
    heroSummary:
      'If you are comparing where to live near Imperial College London, the real win is usually line choice rather than absolute distance. District and Piccadilly corridors tend to open up the best value around South Kensington.',
    intentSegment: 'student-housing',
    searchStationName: 'South Kensington Underground Station',
    universityId: 'IMPERIAL',
    mapHref: '/universities/',
    adPlacement: 'landing-imperial',
    areaHighlights: [
      { areaName: 'Earl\'s Court', summary: 'A classic compromise between commute speed and manageable rent.' },
      { areaName: 'West Kensington', summary: 'Often slightly calmer and better value while staying on the same corridor.' },
      { areaName: 'Hammersmith', summary: 'Excellent transport flexibility if you want more amenities and larger student stock.' },
    ],
    sections: [
      {
        title: 'Best areas to live near Imperial College London',
        paragraphs: [
          'Imperial\'s main campus is easy to reach if you stay disciplined about line choice. Earl\'s Court, West Kensington, Fulham, and Hammersmith are usually the first places worth checking because moving west along the same corridor often saves far more on rent than it costs in time.',
        ],
      },
      {
        title: 'How to compare Imperial accommodation properly',
        paragraphs: [
          'Check whether a flat leaves you with a direct ride or a forced change. In west London, one extra change can matter more to daily life than the difference between two adjacent postcodes, so route simplicity should beat superficial closeness.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/blog/where-to-live-near-imperial-college-london/', label: 'Read the Imperial area guide', description: 'Long-form breakdown of west-London student options.' },
      { href: '/universities/', label: 'Open the Imperial commute filter', description: 'See walk and tube-time coverage live on the map.' },
    ],
  },
  {
    slug: 'lse-student-accommodation',
    title: 'Where to Live Near LSE: Best Student Accommodation Areas for Holborn',
    description:
      'Find where to live near LSE with the best student accommodation areas for Holborn, strong Central and Jubilee line links, and direct rental shortcuts.',
    heroKicker: 'For LSE students',
    heroSummary:
      'If you are trying to decide where to live near LSE, proximity alone is not enough. The best LSE areas usually balance direct Central, Northern, or Jubilee line links with better rental stock than you will find right on top of Holborn.',
    intentSegment: 'student-housing',
    searchStationName: 'Holborn Underground Station',
    universityId: 'LSE',
    mapHref: '/universities/',
    adPlacement: 'landing-lse',
    areaHighlights: [
      { areaName: 'Elephant and Castle', summary: 'Popular for direct access into central London and a large student rental market.' },
      { areaName: 'Bermondsey', summary: 'Good Jubilee access and often better value than closer Zone 1 options.' },
      { areaName: 'Stratford', summary: 'A strong option if you want scale, new-build stock, and a predictable Central line trip.' },
    ],
    sections: [
      {
        title: 'Best areas to live near LSE without paying Zone 1 prices',
        paragraphs: [
          'LSE gives you a wider map than many universities because so many lines feed into Holborn and nearby stations. That makes Elephant and Castle, Bermondsey, Stratford, and parts of east London worth real attention because a slightly longer ride can unlock materially better rent.',
        ],
      },
      {
        title: 'When to use student rooms versus private rentals for LSE',
        paragraphs: [
          'Purpose-built student rooms can be a good fit if you need a fast move-in and less admin. Private rentals become more interesting once you already know which stations keep your daily LSE trip tight, because then you can search for value instead of guessing neighbourhoods.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/blog/where-to-live-near-lse-london/', label: 'Read the LSE guide', description: 'A deeper look at practical neighbourhoods around Holborn.' },
      { href: '/universities/', label: 'Open the LSE commute map', description: 'Compare LSE travel time by station cluster.' },
    ],
  },
  {
    slug: 'kings-college-student-accommodation',
    title: 'King\'s College London Accommodation: Best Areas for Strand and Waterloo',
    description:
      'Find King\'s College London accommodation ideas with commute-aware neighbourhoods for Strand, Waterloo, and south-London campuses.',
    heroKicker: 'For King\'s students',
    heroSummary:
      'King\'s works best when you search around campus patterns, not just one postcode. Waterloo, Elephant and Castle, and London Bridge often form the most practical core.',
    intentSegment: 'student-housing',
    searchStationName: 'Waterloo Underground Station',
    universityId: 'KINGS',
    mapHref: '/universities/',
    adPlacement: 'landing-kings',
    areaHighlights: [
      { areaName: 'Elephant and Castle', summary: 'One of the most practical bases for Strand and Waterloo commutes.' },
      { areaName: 'Bermondsey', summary: 'Offers a balance between rent and a short Jubilee line run into central London.' },
      { areaName: 'Camberwell and Denmark Hill', summary: 'Worth considering if your teaching is concentrated south of the river.' },
    ],
    sections: [
      {
        title: 'One university, multiple commute shapes',
        paragraphs: [
          'King\'s is spread across several campuses, so you need to bias your search towards the site you will use most. That single decision changes which line corridors deserve attention.',
        ],
      },
      {
        title: 'The fastest way to compare areas',
        paragraphs: [
          'Use the map to define a workable ring around your main campus, then jump to listing portals from the stations that stay inside it. That keeps your shortlist tied to your actual week.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/blog/where-to-live-near-kings-college-london/', label: 'Read the King\'s guide', description: 'More detail on campus-specific commute tradeoffs.' },
      { href: '/universities/', label: 'Open the King\'s commute map', description: 'Compare station access across King\'s campuses.' },
    ],
  },
  {
    slug: 'qmul-student-accommodation',
    title: 'QMUL Student Accommodation: Best Areas Near Mile End',
    description:
      'Find QMUL student accommodation with a Mile End commute in mind, including east-London rental shortcuts and student-room options.',
    heroKicker: 'For QMUL students',
    heroSummary:
      'QMUL gives you one of the strongest value maps in London because east-London rentals often stay reasonable while the Central and District lines keep the campus easy to reach.',
    intentSegment: 'student-housing',
    searchStationName: 'Mile End Underground Station',
    universityId: 'QMUL',
    mapHref: '/universities/',
    adPlacement: 'landing-qmul',
    areaHighlights: [
      { areaName: 'Bethnal Green', summary: 'Close to campus with strong high-street amenities and a short Central line hop.' },
      { areaName: 'Bow Road', summary: 'Useful if you want lower rents while staying near the District line.' },
      { areaName: 'Stratford', summary: 'Large stock, newer buildings, and quick Central line access back to Mile End.' },
    ],
    sections: [
      {
        title: 'Why east London is different',
        paragraphs: [
          'For QMUL, you often get more choice per pound than students searching west or central London. The key is keeping yourself close to Mile End or Whitechapel corridors so the extra space does not become a longer daily drag.',
        ],
      },
      {
        title: 'How to compare listings realistically',
        paragraphs: [
          'Be strict about travel time into Mile End in the morning. East-London options can look equally good on a map, but the most reliable ones are usually those with a simple Central or District line run.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/blog/where-to-live-near-queen-mary-university-london/', label: 'Read the QMUL guide', description: 'Detailed advice on Mile End, Bethnal Green, and Stratford.' },
      { href: '/universities/', label: 'Open the QMUL commute map', description: 'See east-London station coverage around QMUL.' },
    ],
  },
  {
    slug: 'city-university-student-accommodation',
    title: 'City, University of London Accommodation: Best Areas Around Angel and Islington',
    description:
      'Compare City, University of London accommodation areas around Angel, Barbican, and east-London routes, with direct listing shortcuts.',
    heroKicker: 'For City students',
    heroSummary:
      'City students usually do best by searching north and east of campus. That keeps you inside a lively part of London without overpaying for central addresses you do not need.',
    intentSegment: 'student-housing',
    searchStationName: 'Angel Underground Station',
    universityId: 'CITY',
    mapHref: '/universities/',
    adPlacement: 'landing-city',
    areaHighlights: [
      { areaName: 'Islington', summary: 'Best if you want walkability and can absorb the higher rent.' },
      { areaName: 'Dalston and Hackney', summary: 'Popular with students who value nightlife and slightly larger flatshare options.' },
      { areaName: 'Finsbury Park', summary: 'Good transport flexibility with a simpler budget than inner Islington.' },
    ],
    sections: [
      {
        title: 'How to think about the north-east arc',
        paragraphs: [
          'City sits in a useful position for both Islington and the eastern neighbourhoods. That means you can trade pure walkability for lower rents without drifting too far away from campus life.',
        ],
      },
      {
        title: 'Where the commute can become awkward',
        paragraphs: [
          'Some east-London areas look close but rely too heavily on buses or multi-step journeys. The best options keep you anchored to reliable rail or tube changes.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/blog/where-to-live-near-city-university-london/', label: 'Read the City guide', description: 'Neighbourhood advice for Islington, Hackney, and beyond.' },
      { href: '/universities/', label: 'Open the City commute map', description: 'Compare walk and tube-time around Northampton Square.' },
    ],
  },
  {
    slug: 'soas-student-accommodation',
    title: 'SOAS Student Accommodation: Best Areas for Bloomsbury Commutes',
    description:
      'Find SOAS student accommodation options with Bloomsbury commute logic, map-first area comparisons, and direct housing searches.',
    heroKicker: 'For SOAS students',
    heroSummary:
      'SOAS shares the central-university advantage, but the smartest value often comes from looking north and east rather than trying to stay immediately around Russell Square.',
    intentSegment: 'student-housing',
    searchStationName: 'Russell Square Underground Station',
    universityId: 'SOAS',
    mapHref: '/universities/',
    adPlacement: 'landing-soas',
    areaHighlights: [
      { areaName: 'Camden and Kentish Town', summary: 'Still among the strongest options for the Bloomsbury campus belt.' },
      { areaName: 'Archway and Tufnell Park', summary: 'Often a useful step down in rent without losing a straightforward journey.' },
      { areaName: 'Hackney and Dalston', summary: 'Good if you want east-London culture and accept a longer but still workable commute.' },
    ],
    sections: [
      {
        title: 'Why Bloomsbury rents can mislead',
        paragraphs: [
          'Living closest is not always the best outcome. For SOAS, a modest trip from north or east London can dramatically improve your room quality or flatshare budget.',
        ],
      },
      {
        title: 'How to keep the search focused',
        paragraphs: [
          'Use commute-time boundaries first, then compare private portals and student platforms from the stations that fit. That prevents your search from drifting into low-value central stock.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/blog/where-to-live-near-soas-university-of-london/', label: 'Read the SOAS guide', description: 'A deeper look at north and east-London options.' },
      { href: '/universities/', label: 'Open the SOAS commute map', description: 'Compare SOAS-friendly stations on the live map.' },
    ],
  },
  {
    slug: 'westminster-student-accommodation',
    title: 'University of Westminster Accommodation: Best Areas Near Marylebone',
    description:
      'Compare University of Westminster accommodation options near Marylebone, Baker Street, and westbound commuter corridors.',
    heroKicker: 'For Westminster students',
    heroSummary:
      'Westminster students can unlock a wide search area quickly because Marylebone sits near several powerful line corridors. The win usually comes from going north-west rather than staying central.',
    intentSegment: 'student-housing',
    searchStationName: 'Baker Street Underground Station',
    universityId: 'WESTMINSTER',
    mapHref: '/universities/',
    adPlacement: 'landing-westminster',
    areaHighlights: [
      { areaName: 'Kilburn and Queen\'s Park', summary: 'Popular Bakerloo corridor options with better value than inner Marylebone.' },
      { areaName: 'Paddington', summary: 'Useful if you want Elizabeth line access and a very short campus run.' },
      { areaName: 'Acton and Ealing', summary: 'Worth a look if you want more space and can accept a longer but still direct trip.' },
    ],
    sections: [
      {
        title: 'The north-west corridor advantage',
        paragraphs: [
          'Baker Street is one of the best-connected station clusters in the city. That gives Westminster students unusual flexibility when hunting for better value across the north-west corridor.',
        ],
      },
      {
        title: 'What to compare on the portals',
        paragraphs: [
          'Focus on smaller flats and flatshares near Bakerloo, Jubilee, and Metropolitan links first. Those are usually the listings that preserve the best balance between commute and rent.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/blog/where-to-live-near-university-of-westminster-london/', label: 'Read the Westminster guide', description: 'Detailed advice on Marylebone and north-west options.' },
      { href: '/universities/', label: 'Open the Westminster commute map', description: 'Compare Marylebone commute patterns on the map.' },
    ],
  },
  {
    slug: 'commuter-rentals-elizabeth-line',
    title: 'Commuter-Friendly Rentals on the Elizabeth Line',
    description:
      'Find commute-friendly rental areas on the Elizabeth line, with fast central access and direct property-search links from the London Tube Map.',
    heroKicker: 'For commuter renters',
    heroSummary:
      'If you are balancing central-London access against rent, the Elizabeth line can unlock neighbourhoods that feel far on paper but stay fast in practice.',
    intentSegment: 'commuter-rentals',
    searchStationName: 'Tottenham Court Road Underground Station',
    mapHref: '/',
    adPlacement: 'landing-elizabeth-line',
    areaHighlights: [
      { areaName: 'Acton Main Line and Ealing', summary: 'Useful west-London options if you want more space with a quick central run.' },
      { areaName: 'Stratford', summary: 'A transport powerhouse that still gives access to more inventory than Zone 1.' },
      { areaName: 'Woolwich and Abbey Wood', summary: 'Stronger value if you prioritise speed into central London over central postcode prestige.' },
    ],
    sections: [
      {
        title: 'Why the Elizabeth line changes the rent map',
        paragraphs: [
          'Fast east-west travel compresses the city. Areas that once felt impractical now compete directly with more expensive inner-London options because the actual ride into the centre is so predictable.',
        ],
      },
      {
        title: 'How to use this page',
        paragraphs: [
          'Start with the line-level map, then use the listing buttons to compare stock near stations that hold onto a direct Elizabeth line journey. The goal is to turn a transport advantage into a cheaper, more realistic rental shortlist.',
        ],
      },
    ],
    relatedLinks: [
      { href: '/', label: 'Open the main tube map', description: 'Filter the Elizabeth line and compare station positions.' },
      { href: '/blog/how-to-use-university-filter-flat-search/', label: 'See how map-led flat search works', description: 'A quick walkthrough of the property-search flow.' },
    ],
  },
]

export const featuredRevenueLandingPages = revenueLandingPages.slice(0, 4)

export function getRevenueLandingPage(slug: string) {
  return revenueLandingPages.find((page) => page.slug === slug)
}