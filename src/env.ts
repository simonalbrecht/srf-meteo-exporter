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

    if (!process.env.LOCATION_ZIP) {
        logger.error(
            `LOCATION_ZIP environment variable is missing. Cannot start!`
        )
        process.exit(1)
    }

    if (isMocked()) {
        logger.warn(
            'Application is in mocked mode. No actual requests will be done; mock data will be used instead!'
        )
    }
}

export const isDevelopmentMode = () => {
    return process.env.NODE_ENV === 'development'
}

export const isMocked = () => {
    return process.env.MOCKED === 'true'
}

export const isAuthSkipped = () => {
    return process.env.OAUTH_ACCESS_TOKEN_URL === ''
}
