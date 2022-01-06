import { lazy } from 'react'

const TopDownVehicle = { Component: lazy(() => import('./TopDownVehicle')) }
const SideScroller = { Component: lazy(() => import('./SideScroller')) }
const MarbleRun = { Component: lazy(() => import('./MarbleRun')) }
const Simple = { Component: lazy(() => import('./Simple')) }
const Shapes = { Component: lazy(() => import('./Shapes')) }

export {
  TopDownVehicle,
  SideScroller,
  MarbleRun,
  Simple,
  Shapes,
}