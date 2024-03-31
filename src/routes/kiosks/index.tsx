import Kiosks from '@/modules/kiosks/Kiosks'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/kiosks/')({
  component: () => {
    return <Kiosks/>
  }
})