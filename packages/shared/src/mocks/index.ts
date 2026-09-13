export * from './rng'
export * from './fixtures'
export * from './build'

import { buildMockData } from './build'

/** The one shared dataset. Stories, MSW handlers and the db seed all read this. */
export const mock = buildMockData(42)
