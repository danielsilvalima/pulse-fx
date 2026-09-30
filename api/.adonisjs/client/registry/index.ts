/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'indicators.index': {
    methods: ["GET","HEAD"],
    pattern: '/indicators',
    tokens: [{"old":"/indicators","type":0,"val":"indicators","end":""}],
    types: placeholder as Registry['indicators.index']['types'],
  },
  'indicators.show': {
    methods: ["GET","HEAD"],
    pattern: '/indicators/:code',
    tokens: [{"old":"/indicators/:code","type":0,"val":"indicators","end":""},{"old":"/indicators/:code","type":1,"val":"code","end":""}],
    types: placeholder as Registry['indicators.show']['types'],
  },
  'viewers.store': {
    methods: ["POST"],
    pattern: '/viewers',
    tokens: [{"old":"/viewers","type":0,"val":"viewers","end":""}],
    types: placeholder as Registry['viewers.store']['types'],
  },
  'viewers.update': {
    methods: ["PUT"],
    pattern: '/viewers/:id/favorites/:code',
    tokens: [{"old":"/viewers/:id/favorites/:code","type":0,"val":"viewers","end":""},{"old":"/viewers/:id/favorites/:code","type":1,"val":"id","end":""},{"old":"/viewers/:id/favorites/:code","type":0,"val":"favorites","end":""},{"old":"/viewers/:id/favorites/:code","type":1,"val":"code","end":""}],
    types: placeholder as Registry['viewers.update']['types'],
  },
  'sync.store': {
    methods: ["POST"],
    pattern: '/admin/sync',
    tokens: [{"old":"/admin/sync","type":0,"val":"admin","end":""},{"old":"/admin/sync","type":0,"val":"sync","end":""}],
    types: placeholder as Registry['sync.store']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
