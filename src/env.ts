import { logger } from './logger.js'

export const validateEnvironment = () => {
    if (!process.env.CONSUMER_KEY) {
        logger.error(
            `CONSUMER_KEY environment variable is missing. Cannot start!`
        )
        process.exit(1)
    }

    if (!process.env.CONSUMER_SECRET) {
        logger.error(
            `CONSUMER_SECRET environment variable is missing. Cannot start!`
        )
        process.exit(1)
    }

    if (!process.env.OAUTH_ACCESS_TOKEN_URL) {
        logger.error(
            `OAUTH_ACCESS_TOKEN_URL environment variable is missing. Cannot start!`
        )
        process.exit(1)
    }

    if (!process.env.METEO_API_BASE_URL) {
        logger.error(
            `METEO_API_BASE_URL environment variable is missing. Cannot start!`
        )
        process.exit(1)
    }

    if (isDevelopmentMode()) {
        logger.warn(
            'Application is development mode. No actual requests will be done; mock data will be used instead!'
        )
    }
}

export const isDevelopmentMode = () => {
    return process.env.NODE_ENV === 'development'
}