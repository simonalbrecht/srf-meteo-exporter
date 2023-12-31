import { pino } from 'pino'
import { isDevelopmentMode } from './env.js'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // TODO: Only in dev
    transport: isDevelopmentMode()
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
              },
          }
        : undefined,
})
