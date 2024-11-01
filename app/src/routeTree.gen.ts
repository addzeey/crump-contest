/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as ObsLatestImport } from './routes/obs.latest'
import { Route as ContestContestIdImport } from './routes/contest.$contestId'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const ObsLatestRoute = ObsLatestImport.update({
  path: '/obs/latest',
  getParentRoute: () => rootRoute,
} as any)

const ContestContestIdRoute = ContestContestIdImport.update({
  path: '/contest/$contestId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/contest/$contestId': {
      id: '/contest/$contestId'
      path: '/contest/$contestId'
      fullPath: '/contest/$contestId'
      preLoaderRoute: typeof ContestContestIdImport
      parentRoute: typeof rootRoute
    }
    '/obs/latest': {
      id: '/obs/latest'
      path: '/obs/latest'
      fullPath: '/obs/latest'
      preLoaderRoute: typeof ObsLatestImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  LoginRoute,
  ContestContestIdRoute,
  ObsLatestRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/login",
        "/contest/$contestId",
        "/obs/latest"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/contest/$contestId": {
      "filePath": "contest.$contestId.tsx"
    },
    "/obs/latest": {
      "filePath": "obs.latest.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
