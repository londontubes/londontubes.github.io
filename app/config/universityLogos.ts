// Mapping for universityId to official brand asset filenames and brand colors.
// Real SVGs can be dropped into public/images/universities/ matching the filename field.
// This indirection lets us replace placeholder logos without touching component code.
// NOTE: Ensure SVGs are optimized (SVGO) and have <title> for accessibility.

export interface UniversityLogoMeta {
  universityId: string
  filename: string // Expected path: /images/universities/<filename>
  brandColor: string // Primary brand color (hex) for optional theming
  alt: string // Alt text for the logo image
}

export const UNIVERSITY_LOGOS: UniversityLogoMeta[] = [
  {
    universityId: 'UCL',
    filename: 'ucl.png',
    brandColor: '#003B5C',
    alt: 'University College London logo'
  },
  {
    universityId: 'IMPERIAL',
    filename: 'imperial.png',
    brandColor: '#002147',
    alt: 'Imperial College London logo'
  },
  {
    universityId: 'LSE',
    filename: 'lse.png',
    brandColor: '#D40000',
    alt: 'London School of Economics logo'
  },
  {
    universityId: 'KINGS',
    filename: 'kings.png',
    brandColor: '#C8102E',
    alt: "King's College London logo"
  },
  {
    universityId: 'QMUL',
    filename: 'qmul.png',
    brandColor: '#1F3C88',
    alt: 'Queen Mary University of London logo'
  },
  {
    universityId: 'CITY',
    filename: 'city.svg',
    brandColor: '#A6192E',
    alt: 'City, University of London logo'
  },
  {
    universityId: 'SOAS',
    filename: 'soas.svg',
    brandColor: '#00573F',
    alt: 'SOAS University of London logo'
  },
  {
    universityId: 'WESTMINSTER',
    filename: 'westminster.png',
    brandColor: '#004C3F',
    alt: 'University of Westminster logo'
  }
]

export function getUniversityLogoMeta(universityId: string): UniversityLogoMeta | undefined {
  return UNIVERSITY_LOGOS.find(l => l.universityId === universityId)
}
