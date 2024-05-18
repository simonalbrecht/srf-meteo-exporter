export const EXPORTER_VERSION = '1.0.0'

export const DEFAULT_DATA_PATH = './data'
export const DEFAULT_REQUEST_QUOTA_PER_DAY = 50 // Free plan
export const DEFAULT_OAUTH_ACCESS_TOKEN_REFRESH_INTERVAL = 604800000 - 3600000 // 7 days minus 1 hour (to account for time slip)
export const DEFAULT_OAUTH_ACCESS_TOKEN_URL =
    'https://api.srgssr.ch/oauth/v1/accesstoken?grant_type=client_credentials'
export const DEFAULT_METEO_API_BASE_URL = 'https://api.srgssr.ch/srf-meteo/v2'

export const DAY_MILLISECONDS = 86400000

export const STATE_FILE_NAME = 'state.json'
export const CACHE_FILE_NAME = 'cache.json'

export const USER_AGENT = `github:simonalbrecht/srf-meteo-exporter/${EXPORTER_VERSION}`

export const LABEL_NAMES = {
    RAIN_PROBABILITY: 'Rain Probability',
    TOTAL_RAINFALL: 'Total Rainfall',
    AVG_WIND_SPEED: 'Wind Speed',
    AVG_GUST_SPEED: 'Gust of Wind Speed',
    WIND_DIRECTION: 'Wind Direction',
    TEMPERATURE: 'Temperature',
    FEELS_LIKE_TEMPERATURE: 'Feels Like',
    MIN_TEMPERATURE: 'Min Temperature',
    MAX_TEMPERATURE: 'Max Temperature',
    DEWPOINT: 'Dewpoint',
    HUMIDITY: 'Humidity',
    PRESSURE: 'Pressure',
    FRESH_SNOW: 'Fresh Snow',
    IRRADIANCE: 'Irradiance',
    SUNRISE: 'Sunrise',
    SUNSET: 'Sunset',
    HOURS_OF_SUNSHINE: 'Hours of Sunshine',
    SUNSHINE_DURATION: 'Sunshine Duration',
    UV_INDEX: 'UV Index',
}

export const ICONS_PATH_PREFIX = {
    COLOR: '/meteo-icons/color/',
    DARK: '/meteo-icons/dark/',
    LIGHT: '/meteo-icons/light/',
    '24_DARK': '/meteo-icons-24/dark/',
    '24_LIGHT': '/meteo-icons-24/light/',
}
