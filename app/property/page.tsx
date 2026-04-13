import type { Metadata } from 'next'
import PropertyExperienceLoader from '@/app/components/PropertyExperience/PropertyExperienceLoader'

export const metadata: Metadata = {
  title: 'Property Filter | London Tube & DLR Map',
  description: 'Compare current sampled rental and sale prices within 0.5 miles of London Tube, DLR, and Elizabeth line stations.',
}

export default function PropertyPage() {
  return <PropertyExperienceLoader />
}