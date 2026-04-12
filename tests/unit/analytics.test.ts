import {
  trackRevenueClick,
  trackRevenueSurfaceView,
  trackZooplaClick,
} from '@/app/lib/analytics'

describe('revenue analytics helpers', () => {
  beforeEach(() => {
    window.gtag = jest.fn()
    window.history.pushState({}, '', '/student-accommodation/ucl-student-accommodation/')
  })

  afterEach(() => {
    window.gtag = undefined
    jest.clearAllMocks()
  })

  it('emits placement, intent, and partner metadata for revenue clicks', () => {
    trackRevenueClick({
      partner: 'amber',
      placement: 'student-hub-amber',
      intentSegment: 'student-housing',
      href: 'https://example.com/amber',
      label: 'Browse rooms',
    })

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'revenue_click',
      expect.objectContaining({
        event_category: 'Revenue',
        event_label: 'Browse rooms',
        partner: 'amber',
        placement: 'student-hub-amber',
        intent_segment: 'student-housing',
        page_path: '/student-accommodation/ucl-student-accommodation/',
        destination_url: 'https://example.com/amber',
      })
    )
  })

  it('emits placement metadata for revenue surface views', () => {
    trackRevenueSurfaceView({
      partner: 'adsense',
      placement: 'home-launchpad-adsense',
      intentSegment: 'student-housing',
    })

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'revenue_surface_view',
      expect.objectContaining({
        partner: 'adsense',
        placement: 'home-launchpad-adsense',
        intent_segment: 'student-housing',
      })
    )
  })

  it('keeps legacy portal tracking while adding structured revenue metadata', () => {
    trackZooplaClick('Baker Street', {
      placement: 'landing-ucl-zoopla',
      intentSegment: 'student-housing',
      href: 'https://www.zoopla.co.uk/example',
    })

    expect(window.gtag).toHaveBeenNthCalledWith(
      1,
      'event',
      'cta_click',
      expect.objectContaining({
        event_category: 'Affiliate',
        event_label: 'Zoopla: Baker Street',
      })
    )
    expect(window.gtag).toHaveBeenNthCalledWith(
      2,
      'event',
      'revenue_click',
      expect.objectContaining({
        partner: 'zoopla',
        placement: 'landing-ucl-zoopla',
        intent_segment: 'student-housing',
      })
    )
  })
})