import { findLocation, getForecast } from './api/meteo.js'
import { resetRequestsToday, setAccessToken, setLocation } from './state.js'
import { logger } from './logger.js'
import { setCache } from './cache.js'
import {
    isRateLimited,
    getInterval,
    getRemainingRequests,
    trackSuccessfulRequest,
} from './rate-limiter.js'
import { isAuthSkipped, isMocked } from './env.js'
import { fetchAccessToken } from './api/auth.js'
import { DEFAULT_OAUTH_ACCESS_TOKEN_REFRESH_INTERVAL } from './constants.js'

export const startAccessTokenAutoRefresh = async () => {
    if (isAuthSkipped()) {
        logger.info('Authentication is disabled')

        setAccessToken(undefined)
        resetRequestsToday()
        return
    }

    if (isMocked()) {
        resetRequestsToday()
    }

    logger.info('Starting auto-refresh of access token')
    await refreshAccessToken()

    const interval = parseInt(
        process.env.OAUTH_ACCESS_TOKEN_REFRESH_INTERVAL ??
            `${DEFAULT_OAUTH_ACCESS_TOKEN_REFRESH_INTERVAL}`
    )

    setInterval(async () => {
        logger.info('Auto-refreshing access token')
        await refreshAccessToken()
    }, interval)
}

export const refreshAccessToken = async () => {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
        logger.warn('No access token received. Trying again next time')
    } else {
        trackSuccessfulRequest()
        setAccessToken(accessToken)
    }
}

export const startPollingData = async () => {
    if (isRateLimited()) {
        logger.error('Request quota has been used up, cannot request new data')
        process.exit(1)
    }

    const interval = isMocked() ? 5000 : getInterval()

    // First, fetch the location information and store it in the state
    const zip = process.env.LOCATION_ZIP || ''
    logger.info(
        {
            zip,
            remainingRequests: getRemainingRequests(),
            interval: interval,
        },
        'Starting polling forecast data'
    )

    try {
        const location = await findLocation(zip)
        if (!location) {
            logger.error(
                { zip },
                "No data returned for ZIP. Please check if it's a valid ZIP or if there are errors in the log"
            )
            process.exit(1)
        }

        setLocation(location)
        trackSuccessfulRequest()

        await fetchForecast(location.id, zip)

        // Start refreshing on a timer
        setInterval(async () => {
            await fetchForecast(location.id, zip)
        }, interval)
    } catch (err) {
        logger.error(
            { zip },
            "Error occurred during fetching of location data. Please check if it's a valid ZIP or if there are errors in the log",
            err
        )
        process.exit(1)
    }
}

const fetchForecast = async (locationId: string, zip: string | number) => {
    if (isRateLimited()) {
        logger.warn(
            {
                locationId,
                zip,
                remainingRequests: getRemainingRequests(),
                interval: getInterval(),
            },
            'Request quota has been used up. Skipping until tomorrow.'
        )
        return
    }

    try {
        logger.info(
            {
                locationId,
                zip,
                remainingRequests: getRemainingRequests(),
                interval: getInterval(),
            },
            'Fetching new forecast data'
        )
        const forecast = await getForecast(locationId)

        if (!forecast) {
            logger.error(
                {
                    locationId,
                    zip,
                    remainingRequests: getRemainingRequests(),
                    interval: getInterval(),
                },
                'No forecast data returned. Will try again next refresh'
            )
            return
        }

        setCache(forecast)
        trackSuccessfulRequest()
    } catch (err) {
        logger.error(
            {
                locationId,
                zip,
                remainingRequests: getRemainingRequests(),
                interval: getInterval(),
            },
            'Error occurred during fetching of forecast. Will try again next refresh',
            err
        )
    }
}
