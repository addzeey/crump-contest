import { createFileRoute } from '@tanstack/react-router'
import { ObsScene } from '../components/Contest/ObsScene'

export const Route = createFileRoute('/obs/latest')({
  component: ObsScene,
})