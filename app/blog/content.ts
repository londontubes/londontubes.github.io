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
  ctaSlot?: 'student-housing' | 'heathrow-express'
  universityId?: string
}

export const blogQuestions: BlogQuestion[] = [
  {
    slug: 'london-where-to-visit',
    ctaSlot: 'heathrow-express',
    question: 'Where to visit in London',
    shortAnswer:
      'Start with the Thames, then mix historic neighbourhoods like Bloomsbury with creative hubs such as Shoreditch and the South Bank.',
    body: [
      'If this is your first time in London, anchor your plans around the Thames. You can cover a huge amount of the skyline just by walking the river between Westminster, the South Bank, and Tower Bridge.',
      'For daytime wandering, Bloomsbury gives you leafy garden squares, independent bookshops, and the British Museum. In the evening, head east to Shoreditch for street art, food markets, and late-night bars.',
      'The key is to group areas that are close together on the Tube map so you spend more time exploring and less time changing lines.',
      'Plan your route between attractions using our free interactive London Tube map at londontubes.co.uk — filter by line to see exactly which stations connect your chosen neighbourhoods.',
    ],
  },
  {
    slug: 'london-what-to-see',
    ctaSlot: 'heathrow-express',
    question: 'What to see in London',
    shortAnswer:
      'Blend big icons like Westminster and Tower Bridge with free viewpoints such as Sky Garden and Tate Modern.',
    body: [
      'The classic first‑time highlights are Westminster (Big Ben, Parliament and Westminster Abbey), Buckingham Palace, the London Eye, Tower Bridge and the Tower of London.',
      'For modern skyline views that do not require expensive tickets, book a free slot at Sky Garden or head to the viewing level at Tate Modern.',
      'Outside the centre, neighbourhoods like Greenwich, Hampstead and Notting Hill give you more local streets, parks, and markets to explore.',
      'Before you set out, use the London Underground map at londontubes.co.uk to check which tube lines and stations are closest to each attraction — it makes grouping your day much easier.',
    ],
  },
  {
    slug: 'london-what-to-visit',
    ctaSlot: 'heathrow-express',
    question: 'What to visit in London',
    shortAnswer:
      'Group your days: one for museums in South Kensington, one for the river and Westminster, and one for markets and canals.',
    body: [
      'To make the most of your time, build days around areas that sit on the same Tube lines.',
      'One classic day is South Kensington: the Natural History Museum, Science Museum and Victoria & Albert Museum sit almost next to each other and are all free to enter.',
      'Another day can focus on the river, starting in Westminster and walking the South Bank, then ending near Tower Bridge. A third day might be markets and canals around Camden, King’s Cross and Shoreditch.',
      'Our interactive London Tube map lets you click any line to highlight its route and stations — the easiest way to plan an area-grouped day in London.',
    ],
  },
  {
    slug: 'what-happen-in-london',
    ctaSlot: 'heathrow-express',
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
    ctaSlot: 'heathrow-express',
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
    ctaSlot: 'heathrow-express',
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
    ctaSlot: 'heathrow-express',
    question: 'Live weather forecast in London',
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
    ctaSlot: 'student-housing',
    universityId: 'UCL',
    question: 'Where to live in London as students',
    shortAnswer:
      'Use the London universities tube map to compare student-friendly areas like Camden, Kentish Town, Earl’s Court, Hammersmith and Mile End by real walking and tube time to campus.',
    body: [
      'Working out where to live as a London student is really a question of journey time. Rent, nightlife and vibe all matter, but if your commute is awkward you will feel it every single day.',
      'A simple way to start is with the universities filter on our London Tube Map. Pick your university, set a realistic walking time, then add a short tube-time layer. The green stations show where you can reasonably walk from campus; the purple stations show areas that are a quick ride away on the same tube lines.',
      'As you move the sliders, look for clusters of green and purple stations. Those clusters usually correspond to neighbourhoods that work well for students because they balance rent with a straightforward journey.',
      'When you click on a promising purple station, the station card includes a “Zoopla flat search” button and, for mapped stations, a matching “Rightmove flat search” button. These open rental searches centred on that station, already filtered for smaller flats within a sensible budget and walking radius so you can jump straight from journey times to real listings.',
      'For UCL, SOAS and other Bloomsbury universities, popular areas include Camden, Kentish Town, Tufnell Park and Finsbury Park, as well as parts of Islington and Holloway. These are all tied together by the Northern, Piccadilly and Victoria lines plus strong bus routes.',
      'Imperial College students often look at Earl’s Court, West Kensington, Fulham and Hammersmith. Staying on or near the District, Piccadilly or Circle lines keeps the daily trip to South Kensington simple even if you move a zone or two out to save on rent.',
      'For LSE and King’s College London in central London, students spread out along the Northern, Jubilee, Bakerloo, Central and District lines — think Waterloo, London Bridge, Elephant & Castle, Bermondsey, Clerkenwell and Mile End. The map helps you see which of these areas gives you a direct route with minimal changes.',
      'Once you have a shortlist from the map, cross-check it against your budget, the kind of flatshare or halls you want, and how late you will typically travel. Night Tube routes and last-train times can be just as important as the morning commute when you are balancing study, work and a social life.',
      'There is no single “best” student area in London, but by combining the university tube map with your own needs, you can quickly narrow the city down to a handful of neighbourhoods that make everyday life manageable and enjoyable.',
    ],
  },
  {
    slug: 'how-to-use-university-filter-flat-search',
    ctaSlot: 'student-housing',
    universityId: 'UCL',
    question: 'How to use the university filter for flat search',
    shortAnswer:
      'Open the Universities Filter, pick your campus, then use the green walking time and purple tube time sliders to find good areas and jump straight into Zoopla and Rightmove flat searches from promising stations.',
    body: [
      'The Universities Filter is designed to turn your campus into the centre of your search. Start by opening the Universities tab at the top of the map, then choose your university and, if needed, the specific campus you are based at.',
      'Next, set a realistic walking time using the green slider. Green stations show places where you can comfortably walk from your front door to campus each day without needing to get on a tube.',
      'After that, add some tube time using the purple slider. Purple stations mark areas that are a simple, fast ride away from your university on the same lines. Together, the green and purple rings give you a clear picture of where daily travel will actually feel easy.',
      'Once you see clusters of green and purple stations you like the look of, click on one of the purple stations. In the station card, use the “Zoopla flat search” and “Rightmove flat search” buttons to open pre-filtered rental searches centred on that station.',
      'From there you can adjust filters on either portal as needed, but the heavy lifting is already done: you are only looking at flats in neighbourhoods that match the real journey times you have just checked on the university map.',
    ],
  },
  {
    slug: 'where-to-live-near-imperial-college-london',
    ctaSlot: 'student-housing',
    universityId: 'IMPERIAL',
    question: 'Where to live near Imperial College London',
    shortAnswer:
      "Imperial students most commonly settle in Earl's Court, West Kensington, Fulham and Hammersmith — all within 10–20 minutes on the District or Piccadilly line from South Kensington campus.",
    body: [
      "Imperial College London's main campus sits in South Kensington, steps from the District and Circle line station of the same name. The practical implication is that your flat search should focus on the western District line corridor, where rents drop meaningfully once you move a zone or two out without adding much journey time.",
      "Earl's Court and West Kensington are the closest realistic options for students on a budget. Both are two stops from South Kensington on the District line — roughly five minutes door to door. Fulham Broadway and Parsons Green extend the same corridor and tend to attract students who want quieter streets and slightly larger flats.",
      'Hammersmith is worth considering if you want more amenities and a bigger choice of transport. From Hammersmith you have direct District and Piccadilly line services, and the journey to South Kensington takes around ten minutes. Putney and Acton Town are further out but remain on the same lines and offer noticeably lower rents for students willing to travel fifteen to twenty minutes.',
      'Use the Imperial filter on the London Tube universities map to see exactly which stations fall within your preferred walking and tube-time thresholds. Once you have a shortlist, each station card includes a student housing search link so you can move straight from journey times to real listings near Imperial.',
    ],
  },
  {
    slug: 'where-to-live-near-lse-london',
    ctaSlot: 'student-housing',
    universityId: 'LSE',
    question: 'Where to live near LSE',
    shortAnswer:
      "LSE's central Holborn campus gives students fast access to the Northern, Central and Jubilee lines — popular areas include Elephant & Castle, Bermondsey, Stratford and Aldgate.",
    body: [
      'The London School of Economics sits in Holborn, one of the most central positions of any London university. That means almost every tube line in Zone 1 is within walking distance of campus, and students have genuine flexibility when choosing where to live.',
      'South of the river, Elephant & Castle and Bermondsey have become well-established student areas. Both are on the Northern or Jubilee line, putting Holborn roughly six to twelve minutes away. Rents are lower than equivalent Zone 1 postcodes north of the Thames, and both areas have improved significantly in terms of cafes, gyms and transport links.',
      'East of the City, Aldgate, Whitechapel and Stepney Green are served by the District and Hammersmith & City lines, and the short Central line hop from Bethnal Green or Stratford takes students into the Holborn area in fifteen to twenty minutes. Stratford in particular offers large purpose-built student schemes alongside private rentals and a Westfield shopping centre on the doorstep.',
      'For students who prefer north London, the Northern line via Angel or Old Street keeps the commute under ten minutes, and Islington and Clerkenwell offer a lively food and nightlife scene within easy walking of campus. Filter by LSE on the London Tube universities map to compare all these areas side by side against your actual journey-time budget.',
    ],
  },
  {
    slug: 'where-to-live-near-kings-college-london',
    ctaSlot: 'student-housing',
    universityId: 'KINGS',
    question: "Where to live near King's College London",
    shortAnswer:
      "King's has campuses along the South Bank and in Denmark Hill — Elephant & Castle, London Bridge, Bermondsey and Camberwell are all practical bases depending on which campus you attend most.",
    body: [
      "King's College London is spread across several campuses, so the first step is identifying which one you will use daily. The Strand and Waterloo campuses sit on or near the South Bank, while Denmark Hill and Camberwell are further south in Zone 2. Each requires a slightly different approach to flat hunting.",
      "For the Strand and Waterloo campuses, Elephant & Castle is the most popular student base. It sits on both the Northern and Bakerloo lines, putting Waterloo four minutes away and the Strand under ten. London Bridge and Borough are equally close but command higher rents. Bermondsey and Peckham offer a balance of price and character for students willing to mix buses with occasional tube journeys.",
      "If your main campus is Denmark Hill, look at Brixton, Herne Hill and East Dulwich. Brixton is on the Victoria line — a single change at Stockwell covers the Waterloo campus in around fifteen minutes — and has one of London's most vibrant market and nightlife scenes. Herne Hill and East Dulwich are quieter residential alternatives that sit closer to Denmark Hill campus itself.",
      "The King's filter on the London Tube map lets you overlay walking circles around each campus and spot which tube stations keep journey times manageable across multiple sites. If you regularly travel between the Strand and Denmark Hill, stations near the Victoria or Northern lines tend to serve both most efficiently.",
    ],
  },
  {
    slug: 'where-to-live-near-queen-mary-university-london',
    ctaSlot: 'student-housing',
    universityId: 'QMUL',
    question: 'Where to live near Queen Mary University of London',
    shortAnswer:
      "QMUL's Mile End campus is on the Central and District lines — Bethnal Green, Bow Road, Stratford and Stepney Green give students short commutes and noticeably lower rents than central London.",
    body: [
      'Queen Mary University of London is based in Mile End, at the eastern edge of Zone 2. Mile End station is on both the Central and District lines, which means students have two independent routes into central London and can reach most of the city in under thirty minutes.',
      'Bethnal Green, one stop west on the Central line, is one of the most popular choices for QMUL students. It has a strong independent food scene along Bethnal Green Road and Roman Road, and the ten-minute walk to campus is straightforward. Bow Road and Bromley-by-Bow, just east of Mile End on the District line, offer lower rents and slightly more space for students who prefer a quieter neighbourhood.',
      'Stratford is worth considering if you want a wider choice of purpose-built student accommodation and strong transport connections. The journey to Mile End is three minutes on the Central line, and from Stratford you can also reach Canary Wharf, the City and Liverpool Street without changing trains. The Westfield shopping centre and a large number of gyms and cafes make it practical for everyday life.',
      'Stepney Green and Whitechapel round out the options closest to campus. Whitechapel gives quick access to the Elizabeth line as well as the District and Hammersmith & City lines. Use the QMUL filter on the London Tube universities map to set your own walking and tube-time limits and see which of these areas sits most comfortably within your commute budget.',
    ],
  },
  {
    slug: 'where-to-live-near-city-university-london',
    ctaSlot: 'student-housing',
    universityId: 'CITY',
    question: 'Where to live near City, University of London',
    shortAnswer:
      "City's Northampton Square campus in Islington is served by Angel (Northern line) and Barbican (Circle/Metropolitan) — students commonly live in Islington, Hackney, Finsbury Park and Stoke Newington.",
    body: [
      'City, University of London sits in Islington, close enough to both Angel and Barbican stations that students have a choice of lines. Angel gives direct access to the Northern line, while Barbican connects to the Circle, Metropolitan and Hammersmith & City lines. That combination makes a wide arc of north and east London practical for the daily commute.',
      'Islington itself — particularly Upper Street and the streets around Highbury — is a popular choice for students who want to be within walking distance of campus. Rents are relatively high for Zone 2, but the neighbourhood offers an excellent range of restaurants, independent shops and direct bus routes. Highbury & Islington station adds Overground and Victoria line access if you need to travel south or west.',
      'For more affordable rents, look east to Hackney. Hackney Central, London Fields and Dalston Kingsland are all reachable from campus in around twenty to twenty-five minutes by a combination of bus and Overground, and the area has one of London\'s most active independent culture and food scenes. Finsbury Park, on the Victoria and Piccadilly lines, is a northern option that gives a fast single-change route to many parts of the city.',
      'Stoke Newington and Canonbury appeal to students who want a calmer neighbourhood with a strong community feel. Use the City University filter on the London Tube map to compare walking distances and tube times from Northampton Square, then click individual station cards to jump to student housing listings in the areas that suit you best.',
    ],
  },
  {
    slug: 'where-to-live-near-soas-university-of-london',
    ctaSlot: 'student-housing',
    universityId: 'SOAS',
    question: 'Where to live near SOAS University of London',
    shortAnswer:
      'SOAS shares the Bloomsbury campus belt with UCL — Camden, Kentish Town, Angel, Hackney and Finsbury Park all give students a realistic daily commute via the Northern, Victoria or Overground lines.',
    body: [
      'SOAS University of London occupies the western edge of Bloomsbury, close to Russell Square (Piccadilly line) and Euston Square (Circle, Metropolitan and Hammersmith & City lines). Euston and King\'s Cross mainline stations are a ten-minute walk, which means students also benefit from the Northern, Victoria and Elizabeth line services that fan out from those hubs.',
      'Camden Town and Kentish Town, both on the Northern line, are consistently popular with SOAS students. The journey from Camden to Russell Square or Euston Square takes around ten to fifteen minutes with one change, and Camden offers a well-known market, live music venues and a diverse food scene that suits many students\' social budgets.',
      'For a quieter residential feel at a similar price point, Tufnell Park and Archway sit further north on the Northern line and give straightforward southbound journeys into Bloomsbury every few minutes. Angel in Islington — directly south of King\'s Cross — is on the same Northern line and places students within one or two stops of campus.',
      'East of the centre, Hackney and Dalston are increasingly common for SOAS students who ride the Overground to Highbury & Islington and then switch to the Victoria line for Euston. The slightly longer journey is often offset by lower rents and larger flats. Filter by SOAS on the London Tube universities map to see all these options plotted against real tube times.',
    ],
  },
  {
    slug: 'where-to-live-near-university-of-westminster-london',
    ctaSlot: 'student-housing',
    universityId: 'WESTMINSTER',
    question: 'Where to live near the University of Westminster',
    shortAnswer:
      "Westminster's Marylebone campus is close to Baker Street and Oxford Circus — students often live in Kilburn, Queens Park, Paddington, Acton and Harrow, all within 15–25 minutes by Bakerloo, Jubilee or Metropolitan line.",
    body: [
      'The University of Westminster has its main campus in Marylebone, within easy reach of Baker Street (Jubilee, Metropolitan, Circle, Hammersmith & City lines) and Oxford Circus (Bakerloo, Victoria, Central lines). That unusually high density of tube connections means students can draw on a broad range of neighbourhoods to the north and west without stretching their commute.',
      'Kilburn and Queens Park, served by the Bakerloo line and Overground, are among the most affordable options within a fifteen-minute journey. Both have large residential streets popular with flatshares, a growing independent food scene, and regular services through Baker Street and Marylebone Road. Maida Vale and Little Venice are upscale alternatives on the same Bakerloo corridor, with canal-side streets that many students enjoy.',
      'To the west, Paddington offers Elizabeth and Bakerloo line access alongside a large number of purpose-built student rooms and private rentals. Acton and Ealing Broadway are further out on the Central and Elizabeth lines but remain under twenty-five minutes from the Marylebone campus, and rents are significantly lower than anything in Zone 1 or inner Zone 2.',
      'North of Baker Street, the Metropolitan line runs through Harrow-on-the-Hill and Wembley, where larger flats at lower rents attract students comfortable with a twenty-to-thirty minute commute. Use the Westminster filter on the London Tube universities map to set realistic walking and tube-time limits, then jump from promising station cards directly to student housing listings near your shortlisted areas.',
    ],
  },
]

export function getBlogQuestion(slug: string) {
  return blogQuestions.find((q) => q.slug === slug)
}
