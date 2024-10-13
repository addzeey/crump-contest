import { createRootRouteWithContext, Link, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Header } from '../components/Header'
import { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
}>()({
    component: () => {
        const location = useLocation();
        const showHeader = !location.pathname.startsWith('/obs/');

        return (
            <>
                {showHeader && <Header />}
                <Outlet />
                <TanStackRouterDevtools />
            </>
        );
    },
    notFoundComponent: () => {
        return (
            <div>
                <p>This is the notFoundComponent configured on root route</p>
                <Link to="/">Start Over</Link>
            </div>
        )
    },
})