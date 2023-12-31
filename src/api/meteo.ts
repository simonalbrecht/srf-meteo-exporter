import { USER_AGENT } from '../constants.js'
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
} from '../types.js'
import { logger } from '../logger.js'
import { mockedForecastData, mockedGeoLocationData } from '../mock-data.js'
import { isAfter, isBefore, parseISO } from 'date-fns'
import { isDevelopmentMode } from '../env.js'
import { getAccessToken } from '../state.js'

const mapDailyForecast = (day: DailyForecastResponse): DailyForecast => {
    return {
        date: day.date_time,
        symbolCode: day.symbol_code,
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
            freshSnowAmount: hour.FRESHSNOW_CM,
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
    if (!isDevelopmentMode()) {
        try {
            const accessToken = getAccessToken()
            const headers = new Headers({
                'User-Agent': USER_AGENT,
                Authorization: `Bearer ${accessToken?.token}`,
                'Cache-Control': 'no-cache',
            })

            const response = await fetch(
                `${process.env.METEO_API_BASE_URL}/geolocationNames?zip=${zip}`,
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
    if (!isDevelopmentMode()) {
        try {
            const accessToken = getAccessToken()
            const headers = new Headers({
                'User-Agent': USER_AGENT,
                Authorization: `Bearer ${accessToken?.token}`,
                'Cache-Control': 'no-cache',
            })

            const response = await fetch(
                `${process.env.METEO_API_BASE_URL}/forecastpoint/${locationId}`,
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
