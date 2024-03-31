import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/kiosks/$kioskId')({
  component: () => <div>Hello /kiosks/$kioskId!</div>
}) 