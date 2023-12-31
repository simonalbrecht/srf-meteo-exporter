declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CONSUMER_KEY?: string
            CONSUMER_SECRET?: string
            LOCATION_ZIP?: string | string
            REQUEST_QUOTA_PER_DAY?: string
            METEO_API_BASE_URL?: string
            OAUTH_ACCESS_TOKEN_URL?: string
            ACCESS_TOKEN_REFRESH_INTERVAL?: string
            LOG_LEVEL?: string
            DATA_PATH?: string
            NODE_ENV?: string
        }
    }
}

export {}
