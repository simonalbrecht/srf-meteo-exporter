export type AccessTokenResponse = {
    access_token: string
    expires_in: number
    token_type: string
}

export type AccessToken = {
    token: string
    expires: string // ISO 8601
    type: string
}

export type Location = {
    description: string
    descriptionShort: string
    id: string
    lat: number
    lon: number
    stationId: string
    timezone: string
    name: string
    country: string
    province: string
    height: number
    type: string
    zip: number
}

export type State = {
    accessToken?: AccessToken
    requestsToday?: number
    lastRequestTime?: string
    location?: Location
}

export type Cache = Forecast | undefined

export type GeoLocationLookupResponse = {
    description_short: string
    description_long: string
    id: string
    name: string
    country: string
    province: string
    height: number
    type: string
    geolocation: GeoLocation
}

export type GeoLocation = {
    id: string
    lat: number
    lon: number
    station_id: string
    timezone: string
    default_name: string
}

export type TemperatureColor = {
    temperature: number
    background_color: string
    text_color: string
}

export type TimePeriod = 'daily' | 'three_hourly' | 'hourly'

export type DailyForecastResponse = {
    date_time: string
    symbol_code: number
    symbol24_code: number
    PROBPCP_PERCENT: number // probability of rain in %
    RRR_MM: number // total rainfall in mm
    FF_KMH: number // avg windspeed in km/h
    FX_KMH: number // avg gust speed in km/h
    DD_DEG: number // direction of wind, -1 means: turning winds
    SUNSET: string
    SUNRISE: string
    SUN_H: number // hours of sunshine, min 0, max 25 (?)
    UVI: number
    TX_C: number // expected max temperature in celsius
    TN_C: number // expected min temperature in celsius
    min_color: TemperatureColor
    max_color: TemperatureColor
}

export type DailyForecast = {
    date: string
    symbolCode: number
    symbol24Code: number
    rainProbability: number
    totalRainfall: number
    averageWindSpeed: number
    averageGustSpeed: number
    windDirection: number
    sunrise: string
    sunset: string
    hoursOfSunshine: number
    uvIndex: number
    minTemperature: number
    maxTemperature: number
    timePeriod: TimePeriod
}

export type HourlyForecastResponse = {
    date_time: string
    symbol_code: number
    symbol24_code: number
    PROBPCP_PERCENT: number // probability of rain in %
    RRR_MM: number // total rainfall in mm
    FF_KMH: number // avg windspeed in km/h
    FX_KMH: number // avg gust speed in km/h
    DD_DEG: number // direction of wind, -1 means: turning winds
    TTT_C: number // expected temperature in celsius
    TTL_C: number // lower bound of expected temperature range in celsius
    TTH_C: number // upper bound of expected temperature range in celsius
    DEWPOINT_C: number // Dewpoint
    RELHUM_PERCENT: number // Relative air humidity
    FRESHSNOW_MM: number // Fresh snow in the hour before event
    PRESSURE_HPA: number // Barometric pressure
    SUN_MIN: number // Sunshine duration in the hour before event
    IRRADIANCE_WM2: number // Global irradiance
    TTTFEEL_C: number // felt temperature
    cur_color: TemperatureColor
}

export type HourlyForecast = {
    date: string
    symbolCode: number
    symbol24Code: number
    rainProbability: number
    totalRainfall: number
    averageWindSpeed: number
    averageGustSpeed: number
    windDirection: number
    temperature: number
    feelsLikeTemperature: number
    minTemperature: number
    maxTemperature: number
    dewpoint: number
    humidity: number
    pressure: number
    sunshineDuration: number
    freshSnowAmount: number
    irradiance: number
    timePeriod: TimePeriod
}

export type ForecastResponse = {
    days: DailyForecastResponse[]
    three_hours: HourlyForecastResponse[]
    hours: HourlyForecastResponse[]
}

export type Forecast = {
    daily: DailyForecast[]
    threeHourly: HourlyForecast[]
    hourly: HourlyForecast[]
}
