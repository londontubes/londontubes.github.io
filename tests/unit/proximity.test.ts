import type { Station } from '@/app/types/transit'
import { calculateDistance, findNearbyStations } from '@/app/lib/map/proximity'

const stations: Station[] = [
	{
		stationId: 'A',
		displayName: 'Alpha Station',
		position: {
			type: 'Point',
			coordinates: [-0.1339, 51.5246],
		},
		lineCodes: ['northern'],
		isInterchange: false,
		markerIcon: 'default',
		tooltipSummary: 'Alpha Station',
		order: 0,
	},
	{
		stationId: 'B',
		displayName: 'Bravo Station',
		position: {
			type: 'Point',
			coordinates: [-0.1357, 51.5254],
		},
		lineCodes: ['circle'],
		isInterchange: false,
		markerIcon: 'default',
		tooltipSummary: 'Bravo Station',
		order: 1,
	},
]

describe('proximity utilities', () => {
	it('calculates a short London walking distance consistently', () => {
		const distance = calculateDistance([-0.1339, 51.5246], [-0.1357, 51.5254])

		expect(distance).toBeGreaterThan(0)
		expect(distance).toBeLessThan(0.2)
	})

	it('returns stations within the requested radius', () => {
		const nearby = findNearbyStations([-0.1339, 51.5246], 0.1, stations)

		expect(nearby).toEqual(['A'])
	})
})
