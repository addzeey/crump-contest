import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/entry/$contestid')({
  component: () => <div>Hello /admin/entry/$contestid!</div>
})