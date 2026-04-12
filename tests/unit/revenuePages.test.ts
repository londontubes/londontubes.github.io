import { getRevenueLandingPage, revenueLandingPages } from '@/app/data/revenuePages'
import { withRevenueAttribution } from '@/app/lib/revenue'

describe('revenue landing pages', () => {
  it('defines 10 indexable landing pages with unique slugs', () => {
    const slugs = revenueLandingPages.map((page) => page.slug)

    expect(revenueLandingPages).toHaveLength(10)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('looks up a configured university page by slug', () => {
    const page = getRevenueLandingPage('ucl-student-accommodation')

    expect(page).toBeDefined()
    expect(page?.universityId).toBe('UCL')
    expect(page?.intentSegment).toBe('student-housing')
  })
})

describe('withRevenueAttribution', () => {
  it('adds standard revenue attribution parameters to partner URLs', () => {
    const url = withRevenueAttribution('https://example.com/path?existing=yes', {
      partner: 'amber',
      placement: 'student-hub',
      intentSegment: 'student-housing',
    })

    const parsed = new URL(url)

    expect(parsed.searchParams.get('existing')).toBe('yes')
    expect(parsed.searchParams.get('utm_source')).toBe('londontubes.co.uk')
    expect(parsed.searchParams.get('utm_medium')).toBe('amber')
    expect(parsed.searchParams.get('utm_campaign')).toBe('student-housing')
    expect(parsed.searchParams.get('utm_content')).toBe('student-hub')
  })
})