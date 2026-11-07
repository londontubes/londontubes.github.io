import { installGtagShim } from '@/app/components/Analytics/Analytics'

// gtag.js ignores plain arrays in dataLayer; it only processes `arguments`
// objects. A rest-args shim (`(...args) => push(args)`) meant GA4 never
// received config or hits ("No data received from your website yet").
describe('installGtagShim', () => {
  beforeEach(() => {
    window.dataLayer = undefined
    window.gtag = undefined
  })

  it('queues gtag commands as arguments objects, not arrays', () => {
    installGtagShim('G-TEST123')
    window.gtag?.('event', 'test_event', { value: 1 })

    const queue = window.dataLayer ?? []
    expect(queue).toHaveLength(3)
    for (const entry of queue) {
      expect(Array.isArray(entry)).toBe(false)
      expect(Object.prototype.toString.call(entry)).toBe('[object Arguments]')
    }

    const [js, config, event] = queue as ArrayLike<unknown>[]
    expect(js[0]).toBe('js')
    expect(config[0]).toBe('config')
    expect(config[1]).toBe('G-TEST123')
    expect(event[0]).toBe('event')
    expect(event[1]).toBe('test_event')
  })

  it('leaves an existing gtag function alone', () => {
    const existing = jest.fn()
    window.gtag = existing
    installGtagShim('G-TEST123')
    expect(window.gtag).toBe(existing)
  })
})
