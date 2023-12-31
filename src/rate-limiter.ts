import { isSameDay, parseISO } from 'date-fns'
import { DEFAULT_REQUEST_QUOTA_PER_DAY, DAY_MILLISECONDS } from './constants.js'
import {
    getLastRequestTime,
    getRequestsToday,
    increaseRequestsToday,
    resetRequestsToday,
    updateLastRequestTime,
} from './state.js'

export const getRequestQuota = (): number => {
    return parseInt(
        process.env.REQUEST_QUOTA_PER_DAY ?? `${DEFAULT_REQUEST_QUOTA_PER_DAY}`
    )
}

export const getRemainingRequests = () => {
    return getRequestQuota() - getRequestsToday()
}

export const getInterval = () => {
    return Math.floor(DAY_MILLISECONDS / getRequestQuota())
}

export const trackSuccessfulRequest = () => {
    updateLastRequestTime()
    increaseRequestsToday()
}

export const canRequest = () => {
    // Check if it's a new day and the quota can be reset
    const lastRequestTime = parseISO(getLastRequestTime())
    const now = new Date()

    if (!isSameDay(now, lastRequestTime)) {
        resetRequestsToday()
    }

    return getRemainingRequests() > 0
}
