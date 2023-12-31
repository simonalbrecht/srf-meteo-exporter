import { DEFAULT_OAUTH_ACCESS_TOKEN_URL, USER_AGENT } from '../constants.js'
import { logger } from '../logger.js'
import { addSeconds, formatISO } from 'date-fns'
import { AccessToken, AccessTokenResponse } from '../types.js'
import { canRequest, trackSuccessfulRequest } from '../rate-limiter.js'
import { mockedAccessToken } from '../mock-data.js'
import { isDevelopmentMode } from '../env.js'

export const fetchAccessToken = async () => {
    if (!canRequest()) {
        logger.warn('Request quota has been used up. Cannot fetch access token')
        return null
    }

    const consumerKey = process.env.CONSUMER_KEY
    const consumerSecret = process.env.CONSUMER_SECRET

    try {
        logger.info(
            {
                consumerKey,
            },
            'Fetching access token'
        )

        let data: AccessTokenResponse
        if (!isDevelopmentMode()) {
            const auth = Buffer.from(
                `${consumerKey}:${consumerSecret}`
            ).toString('base64')

            const headers = new Headers({
                'User-Agent': USER_AGENT,
                Authorization: `Basic ${auth}`,
                'Cache-Control': 'no-cache',
            })

            const response = await fetch(
                process.env.OAUTH_ACCESS_TOKEN_URL ??
                    DEFAULT_OAUTH_ACCESS_TOKEN_URL,
                {
                    method: 'POST',
                    headers,
                }
            )

            if (response.status !== 200) {
                logger.error(
                    {
                        consumerKey,
                        code: response.status,
                        status: response.status,
                    },
                    'Error fetching access token. Received non-200 status code'
                )
                return
            }

            data = await response.json()
        } else {
            data = mockedAccessToken
        }

        const accessToken: AccessToken = {
            token: data.access_token,
            expires: formatISO(addSeconds(new Date(), data.expires_in)),
            type: data.token_type,
        }

        trackSuccessfulRequest()
        logger.info(
            {
                consumerKey,
                expiresAt: accessToken.expires,
                type: accessToken.type,
            },
            'Fetched access token'
        )

        return accessToken
    } catch (err) {
        logger.error(
            { consumerKey },
            'Error during fetching of access token',
            err
        )
        return null
    }
}
