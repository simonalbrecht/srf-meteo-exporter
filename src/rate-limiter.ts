import { isSameDay, parseISO } from 'date-fns'
import { DEFAULT_REQUEST_QUOTA_PER_DAY, DAY_MILLISECONDS } from './constants.js'
import {
    getLastRequestTime,
    getRequestsToday,
    increaseRequestsToday,
    resetRequestsToday,
    updateLastRequestTime,
} from './state.js'
import { isAuthSkipped } from './env.js'

export const getRequestQuota = (): number => {
    return parseInt(
        process.env.REQUEST_QUOTA_PER_DAY ?? `${DEFAULT_REQUEST_QUOTA_PER_DAY}`
    )
}

export const getRemainingRequests = () => {
    if (isAuthSkipped()) {
        return Number.MAX_VALUE
    }

    return getRequestQuota() - getRequestsToday()
}

export const getInterval = () => {
    if (isAuthSkipped()) {
        return 1000 * 60 * 5 // 5 min
    }

    return Math.floor(DAY_MILLISECONDS / getRequestQuota())
}

export const trackSuccessfulRequest = () => {
    updateLastRequestTime()
    increaseRequestsToday()
}

export const isRateLimited = () => {
    if (isAuthSkipped()) {
        return false
    }

    // Check if it's a new day and the quota can be reset
    const lastRequestTime = parseISO(getLastRequestTime())
    const now = new Date()

    if (!isSameDay(now, lastRequestTime)) {
        resetRequestsToday()
    }

    return getRemainingRequests() <= 0
}
