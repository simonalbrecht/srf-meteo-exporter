import { DEFAULT_METEO_API_BASE_URL, USER_AGENT } from '../constants.js'
import {
    GeoLocationLookupResponse,
    ForecastResponse,
    Location,
    Forecast,
    DailyForecast,
    DailyForecastResponse,
    HourlyForecast,
    HourlyForecastResponse,
    TimePeriod,
    SymbolTexts,
    SymbolsResponse,
} from '../types.js'
import { logger } from '../logger.js'
import {
    mockedForecastData,
    mockedGeoLocationData,
    mockedSymbolData,
} from '../mock-data.js'
import { isAfter, isBefore, parseISO } from 'date-fns'
import { isAuthSkipped, isMocked } from '../env.js'
import { getAccessToken, getSymbol24Texts, getSymbolTexts } from '../state.js'

const mapDailyForecast = (day: DailyForecastResponse): DailyForecast => {
    return {
        date: day.date_time,
        symbolCode: day.symbol_code,
        symbolText: getSymbolTexts()[day.symbol_code] ?? 'N/A',
        symbol24Code: day.symbol24_code,
        symbol24Text: getSymbol24Texts()[day.symbol24_code] ?? 'N/A',
        rainProbability: day.PROBPCP_PERCENT,
        totalRainfall: day.RRR_MM,
        averageWindSpeed: day.FF_KMH,
        averageGustSpeed: day.FX_KMH,
        windDirection: day.DD_DEG,
        sunrise: day.SUNRISE,
        sunset: day.SUNSET,
        hoursOfSunshine: day.SUN_H,
        uvIndex: day.UVI,
        minTemperature: day.TN_C,
        maxTemperature: day.TX_C,
        timePeriod: 'daily',
    }
}

const sortByDateAscending = (
    a: DailyForecast | HourlyForecast,
    b: DailyForecast | HourlyForecast
): number => {
    const dateA = parseISO(a.date)
    const dateB = parseISO(b.date)

    if (isBefore(dateA, dateB)) {
        return -1
    } else if (isAfter(dateA, dateB)) {
        return 1
    } else {
        return 0
    }
}

type HourlyForecastMapCallback = (
    element: HourlyForecastResponse
) => HourlyForecast

const mapHourlyForecast = (
    timePeriod: TimePeriod
): HourlyForecastMapCallback => {
    return (hour: HourlyForecastResponse) => {
        return {
            date: hour.date_time,
            symbolCode: hour.symbol_code,
            symbolText: getSymbolTexts()[hour.symbol_code] ?? 'N/A',
            symbol24Code: hour.symbol24_code,
            symbol24Text: getSymbol24Texts()[hour.symbol24_code] ?? 'N/A',
            rainProbability: hour.PROBPCP_PERCENT,
            totalRainfall: hour.RRR_MM,
            averageWindSpeed: hour.FF_KMH,
            averageGustSpeed: hour.FX_KMH,
            windDirection: hour.DD_DEG,
            temperature: hour.TTT_C,
            feelsLikeTemperature: hour.TTTFEEL_C,
            minTemperature: hour.TTL_C,
            maxTemperature: hour.TTH_C,
            dewpoint: hour.DEWPOINT_C,
            humidity: hour.RELHUM_PERCENT,
            pressure: hour.PRESSURE_HPA,
            sunshineDuration: hour.SUN_MIN,
            freshSnowAmount: hour.FRESHSNOW_MM,
            irradiance: hour.IRRADIANCE_WM2,
            timePeriod,
        }
    }
}

export const findLocation = async (
    zip: string | number
): Promise<Location | null> => {
    logger.debug(
        {
            zip,
        },
        'Fetching geo location information for ZIP'
    )

    let data: GeoLocationLookupResponse[] = []
    if (!isMocked()) {
        try {
            const accessToken = getAccessToken()
            const headers = new Headers({
                'User-Agent': USER_AGENT,
                Authorization: `Bearer ${accessToken?.token}`,
                'Cache-Control': 'no-cache',
            })

            const response = await fetch(
                `${
                    process.env.METEO_API_BASE_URL ?? DEFAULT_METEO_API_BASE_URL
                }/geolocationNames?zip=${zip}`,
                {
                    method: 'GET',
                    headers,
                }
            )

            if (response.status !== 200) {
                logger.error(
                    { zip, code: response.status, status: response.status },
                    'Error fetching geo location information. Received non-200 status code'
                )
                return null
            }

            data = await response.json()
        } catch (err) {
            logger.error(
                { zip },
                'Error during fetching of geo location information',
                err
            )
            throw err
        }
    } else {
        data = mockedGeoLocationData
    }

    if (data.length === 0) {
        logger.error('No geo location information received')
        return null
    }

    const {
        description_long,
        description_short,
        name,
        country,
        province,
        height,
        type,
        geolocation,
    } = data[0]

    const location = {
        description: description_long,
        descriptionShort: description_short,
        name,
        country,
        province,
        height,
        id: geolocation.id,
        lat: geolocation.lat,
        lon: geolocation.lon,
        stationId: geolocation.station_id,
        timezone: geolocation.timezone,
        type,
        zip: parseInt(zip as string),
    }

    return location
}

export const getForecast = async (
    locationId: string
): Promise<Forecast | null> => {
    logger.debug(
        {
            locationId,
        },
        'Fetching forecast'
    )

    let data: ForecastResponse | undefined = undefined
    if (!isMocked()) {
        try {
            const accessToken = getAccessToken()
            const headers = new Headers({
                'User-Agent': USER_AGENT,
                'Cache-Control': 'no-cache',
            })

            if (!isAuthSkipped()) {
                headers.set('Authorization', `Bearer ${accessToken?.token}`)
            }

            const response = await fetch(
                `${
                    process.env.METEO_API_BASE_URL ?? DEFAULT_METEO_API_BASE_URL
                }/forecastpoint/${locationId}`,
                {
                    method: 'GET',
                    headers,
                }
            )

            if (response.status !== 200) {
                logger.error(
                    {
                        locationId,
                        code: response.status,
                        status: response.status,
                    },
                    'Error fetching forecast. Received non-200 status code'
                )
                return null
            }

            data = await response.json()
        } catch (err) {
            logger.error(
                { locationId },
                'Error during fetching of forecast',
                err
            )
            throw err
        }
    } else {
        data = mockedForecastData
    }

    if (!data) {
        logger.error('No forecast data received')
        return null
    }

    const { days, three_hours, hours } = data

    logger.debug(
        {
            locationId,
        },
        'Forecast fetched'
    )

    return {
        daily: days.map(mapDailyForecast).sort(sortByDateAscending),
        threeHourly: three_hours
            .map(mapHourlyForecast('three_hourly'))
            .sort(sortByDateAscending),
        hourly: hours
            .map(mapHourlyForecast('hourly'))
            .sort(sortByDateAscending),
    }
}

export const getSymbols = async (): Promise<{
    symbolTexts: SymbolTexts
    symbol24Texts: SymbolTexts
}> => {
    logger.debug('Fetching symbols')

    let data: SymbolsResponse = {} as SymbolsResponse
    if (!isMocked()) {
        try {
            const accessToken = getAccessToken()
            const headers = new Headers({
                'User-Agent': USER_AGENT,
                Authorization: `Bearer ${accessToken?.token}`,
                'Cache-Control': 'no-cache',
            })

            const response = await fetch(
                `${
                    process.env.METEO_API_BASE_URL ?? DEFAULT_METEO_API_BASE_URL
                }/symbols`,
                {
                    method: 'GET',
                    headers,
                }
            )

            if (response.status !== 200) {
                logger.error(
                    { code: response.status, status: response.status },
                    'Error fetching symbol information information. Received non-200 status code. Will return static data instead.'
                )

                // Until symbols is public behind the SRG SSR API gateway (not via direct link), return
                // mocked data in case of errors
                const { symbol_text = {}, symbol24_text = {} } =
                    mockedSymbolData
                return {
                    symbolTexts: symbol_text,
                    symbol24Texts: symbol24_text,
                }
            }

            data = await response.json()
        } catch (err) {
            logger.error('Error during fetching of symbol information', err)
            throw err
        }
    } else {
        data = mockedSymbolData
    }

    const { symbol_text = {}, symbol24_text = {} } = data

    return {
        symbolTexts: symbol_text,
        symbol24Texts: symbol24_text,
    }
}
