/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  indicators: {
    index: typeof routes['indicators.index']
    show: typeof routes['indicators.show']
  }
  viewers: {
    store: typeof routes['viewers.store']
    update: typeof routes['viewers.update']
  }
  sync: {
    store: typeof routes['sync.store']
  }
}
