import { parseISO, isAfter } from 'date-fns'
import { FastifyReply, FastifyRequest } from 'fastify'
import { updateMetrics, collectMetrics } from '../metrics.js'
import { DailyForecast, Forecast, HourlyForecast } from '../types.js'
import { getCache } from '../cache.js'
import { getLocation } from '../state.js'
import { isMocked } from '../env.js'

const filterCurrentForecast = (): Forecast | null => {
    const forecast: Forecast = getCache() as Forecast

    if (!forecast) {
        return null
    }

    const { hourly, threeHourly, daily } = forecast
    const [currentHourly] = [...hourly]
        .reverse()
        .filter(keepOnlyCurrentForecast, [])
    const [currentThreeHourly] = [...threeHourly]
        .reverse()
        .filter(keepOnlyCurrentForecast, [])
    const [currentDaily] = [...daily]
        .reverse()
        .filter(keepOnlyCurrentForecast, [])

    return {
        hourly: [currentHourly],
        threeHourly: [currentThreeHourly],
        daily: [currentDaily],
    }
}

const keepOnlyCurrentForecast = (forecast: DailyForecast | HourlyForecast) => {
    const forecastDate = parseISO(forecast.date)
    const currentDate = new Date()

    if (isMocked()) {
        return true
    }

    return isAfter(currentDate, forecastDate)
}

export const handle = async (_: FastifyRequest, reply: FastifyReply) => {
    const location = getLocation()
    const currentForecasts = filterCurrentForecast()
    if (location && currentForecasts) {
        updateMetrics(currentForecasts, location)
    }

    const metrics = await collectMetrics()
    return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(metrics)
}
