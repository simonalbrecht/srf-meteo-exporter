import * as client from 'prom-client'
import {
    DailyForecast,
    Forecast,
    HourlyForecast,
    Location,
    TimePeriod,
} from './types.js'
import { parseISO } from 'date-fns'
import {
    EXPORTER_VERSION,
    ICONS_PATH_PREFIX,
    LABEL_NAMES,
} from './constants.js'
import { isRateLimited } from './rate-limiter.js'

const commonLabelNames = [
    'time_period',
    'description',
    'description_short',
    'name',
    'province',
    'country',
    'zip',
    'lat',
    'lon',
    'height',
    'label',
] as const

const collectDefaultMetrics = client.collectDefaultMetrics
const defaultregistry = new client.Registry()
const weatherRegistry = new client.Registry()

const version = new client.Gauge({
    name: 'meteo_version_info',
    help: 'Version information of the Exporter',
    labelNames: [
        'version',
        'colorIconsPathPrefix',
        'darkIconsPathPrefix',
        'lightIconsPathPrefix',
    ] as const,
})

weatherRegistry.registerMetric(version)

const rateLimit = new client.Gauge({
    name: 'meteo_rate_limit_info',
    help: 'Information if application is rate limited',
})

weatherRegistry.registerMetric(rateLimit)

const symbolCode = new client.Gauge({
    name: 'meteo_symbol_index',
    help: 'The code for the weather symbol',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(symbolCode)

const rainProbability = new client.Gauge({
    name: 'meteo_rain_probability_percentages',
    help: 'Probability of rain in %',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(rainProbability)

const totalRainfall = new client.Gauge({
    name: 'meteo_total_rainfall_millimeters',
    help: 'Total rainfall in mm',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(totalRainfall)

const averageWindSpeed = new client.Gauge({
    name: 'meteo_average_windspeed_kilometers_per_hour',
    help: 'Average Wind Speed in km/h',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(averageWindSpeed)

const averageGustSpeed = new client.Gauge({
    name: 'meteo_average_gust_kilometers_per_hour',
    help: 'Average Gust Speed in km/h',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(averageGustSpeed)

export const windDirection = new client.Gauge({
    name: 'meteo_wind_direction_degrees',
    help: 'Wind Direction in Degrees, -1 means turning winds',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(windDirection)

export const sunrise = new client.Gauge({
    name: 'meteo_sunrise_time',
    help: 'The time of sunrise',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(sunrise)

export const sunset = new client.Gauge({
    name: 'meteo_sunset_time',
    help: 'The time of sunset',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(sunset)

export const hoursOfSunshine = new client.Gauge({
    name: 'meteo_sunshine_hours',
    help: 'Hours of sunshine',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(hoursOfSunshine)

export const uvIndex = new client.Gauge({
    name: 'meteo_uv_index',
    help: 'UX Index',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(uvIndex)

export const temperature = new client.Gauge({
    name: 'meteo_temperature_celsius',
    help: 'Temperature in Celsius',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(temperature)

export const feelsLikeTemperature = new client.Gauge({
    name: 'meteo_feels_like_temperature_celsius',
    help: 'Feels-Like Temperature in Celsius',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(feelsLikeTemperature)

export const minTemperature = new client.Gauge({
    name: 'meteo_min_temperature_celsius',
    help: 'Min Temperature in Celsius',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(minTemperature)

export const maxTemperature = new client.Gauge({
    name: 'meteo_max_temperature_celsius',
    help: 'Max Temperature in Celsius',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(maxTemperature)

export const dewpoint = new client.Gauge({
    name: 'meteo_dewpoint_celsius',
    help: 'Dewpoint in Celsius',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(dewpoint)

export const humidity = new client.Gauge({
    name: 'meteo_humidity_percentages',
    help: 'Relative humidity in percent',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(humidity)

export const pressure = new client.Gauge({
    name: 'meteo_pressure_pascals',
    help: 'Pressure in Pascals',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(pressure)

export const sunshineDuration = new client.Gauge({
    name: 'meteo_sunshine_duration_minutes',
    help: 'Sunshine durations in minutes',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(sunshineDuration)

export const freshSnowAmount = new client.Gauge({
    name: 'meteo_fresh_snow_centimeters',
    help: 'Fresh snow amount in Centimeters',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(freshSnowAmount)

export const irradiance = new client.Gauge({
    name: 'meteo_irradiance_wm2',
    help: 'Global Irradiance in w/m2',
    labelNames: commonLabelNames,
})

weatherRegistry.registerMetric(irradiance)

export const registries = client.Registry.merge([
    weatherRegistry,
    defaultregistry,
])

export const registerMetrics = () => {
    collectDefaultMetrics({ register: registries })
    version.set(
        {
            version: EXPORTER_VERSION,
            colorIconsPathPrefix: ICONS_PATH_PREFIX.COLOR,
            darkIconsPathPrefix: ICONS_PATH_PREFIX.DARK,
            lightIconsPathPrefix: ICONS_PATH_PREFIX.LIGHT,
        },
        1
    )
}

export const updateMetrics = (forecast: Forecast, location: Location) => {
    rateLimit.set({}, isRateLimited() ? 1 : 0)

    updateHourlyMetrics(forecast.hourly, location)
    updateHourlyMetrics(forecast.threeHourly, location)
    updateDailyMetrics(forecast.daily, location)
}

const getLabels = (
    timePeriod: TimePeriod,
    {
        description,
        descriptionShort,
        name,
        province,
        country,
        zip,
        lat,
        lon,
        height,
    }: Location,
    labelName: string
) => {
    return {
        time_period: timePeriod,
        description,
        description_short: descriptionShort,
        name,
        province,
        country,
        zip,
        lat,
        lon,
        height,
        label: labelName,
    }
}

const updateHourlyMetrics = (
    forecasts: HourlyForecast[],
    location: Location
) => {
    const [forecast] = forecasts

    symbolCode.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.SYMBOL_CODE),
        forecast.symbolCode
    )
    rainProbability.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.RAIN_PROBABILITY),
        forecast.rainProbability
    )
    totalRainfall.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.TOTAL_RAINFALL),
        forecast.totalRainfall
    )
    averageWindSpeed.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.AVG_WIND_SPEED),
        forecast.averageWindSpeed
    )
    averageGustSpeed.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.AVG_GUST_SPEED),
        forecast.averageGustSpeed
    )
    windDirection.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.WIND_DIRECTION),
        forecast.windDirection
    )
    temperature.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.TEMPERATURE),
        forecast.temperature
    )
    feelsLikeTemperature.set(
        getLabels(
            forecast.timePeriod,
            location,
            LABEL_NAMES.FEELS_LIKE_TEMPERATURE
        ),
        forecast.feelsLikeTemperature
    )
    minTemperature.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.MIN_TEMPERATURE),
        forecast.minTemperature
    )
    maxTemperature.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.MAX_TEMPERATURE),
        forecast.maxTemperature
    )
    dewpoint.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.DEWPOINT),
        forecast.dewpoint
    )
    humidity.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.HUMIDITY),
        forecast.humidity
    )
    pressure.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.PRESSURE),
        forecast.pressure
    )
    sunshineDuration.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.SUNSHINE_DURATION),
        forecast.sunshineDuration
    )
    freshSnowAmount.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.FRESH_SNOW),
        forecast.freshSnowAmount
    )
    irradiance.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.IRRADIANCE),
        forecast.irradiance
    )
}

const updateDailyMetrics = (forecasts: DailyForecast[], location: Location) => {
    const [forecast] = forecasts

    symbolCode.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.SYMBOL_CODE),
        forecast.symbolCode
    )
    rainProbability.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.RAIN_PROBABILITY),
        forecast.rainProbability
    )
    totalRainfall.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.TOTAL_RAINFALL),
        forecast.totalRainfall
    )
    averageWindSpeed.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.AVG_WIND_SPEED),
        forecast.averageWindSpeed
    )
    averageGustSpeed.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.AVG_GUST_SPEED),
        forecast.averageGustSpeed
    )
    windDirection.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.WIND_DIRECTION),
        forecast.windDirection
    )
    sunrise.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.SUNRISE),
        parseISO(forecast.sunrise).getTime()
    )
    sunset.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.SUNSET),
        parseISO(forecast.sunset).getTime()
    )
    hoursOfSunshine.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.HOURS_OF_SUNSHINE),
        forecast.hoursOfSunshine
    )
    uvIndex.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.UV_INDEX),
        forecast.uvIndex
    )
    minTemperature.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.MIN_TEMPERATURE),
        forecast.minTemperature
    )
    maxTemperature.set(
        getLabels(forecast.timePeriod, location, LABEL_NAMES.MAX_TEMPERATURE),
        forecast.maxTemperature
    )
    return
}

export const collectMetrics = async () => {
    return await registries.metrics()
}
