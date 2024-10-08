import { createRootRoute, createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Header } from '../components/Header'
import { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
}>()({
    component: () => (
        <>
            <Header />
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
    notFoundComponent: () => {
        return (
            <div>
                <p>This is the notFoundComponent configured on root route</p>
                <Link to="/">Start Over</Link>
            </div>
        )
    },
})