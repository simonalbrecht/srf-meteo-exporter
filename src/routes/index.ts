import { handle as handleRoot } from './root.js'
import { handle as handleMetrics } from './metrics.js'
import { handle as handleDebugState } from './debug/state.js'
import { handle as handleDebugCache } from './debug/cache.js'

export { handleRoot, handleDebugState, handleDebugCache, handleMetrics }
