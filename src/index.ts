import path from 'path'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'
import fastify from 'fastify'
import fastifyStatic from '@fastify/static'

import { logger } from './logger.js'
import { validateEnvironment } from './env.js'
import {
    handleDebugCache,
    handleDebugState,
    handleRoot,
    handleMetrics,
} from './routes/index.js'
import { initState } from './state.js'
import { initCache } from './cache.js'
import { registerMetrics } from './metrics.js'
import { startAccessTokenAutoRefresh, startPollingData } from './poller.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
logger.level = process.env.LOG_LEVEL || 'info'

validateEnvironment()

initState()
initCache()

registerMetrics()

const server = fastify({
    logger,
})

server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public', 'meteo-icons'),
    prefix: '/meteo-icons/',
})

server.get('/', handleRoot)
server.get('/debug/state', handleDebugState)
server.get('/debug/cache', handleDebugCache)
server.get('/metrics', handleMetrics)

server.addHook('onListen', async () => {
    await startAccessTokenAutoRefresh()
    await startPollingData()
})

try {
    await server.listen({
        host: process.env.HOST || 'localhost',
        port: parseInt(process.env.PORT || '') || 3000,
    })
} catch (err) {
    logger.error(err)
    process.exit(1)
}
