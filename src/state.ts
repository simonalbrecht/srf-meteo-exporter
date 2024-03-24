import { formatISO } from 'date-fns'
import {
    getStatePath,
    initStorage,
    pathExists,
    readFile,
    writeFile,
} from './storage.js'
import { AccessToken, State, Location } from './types.js'

export const initState = () => {
    initStorage()

    const statePath = getStatePath()
    if (!pathExists(statePath)) {
        const state: State = {
            accessToken: undefined,
            requestsToday: 0,
            lastRequestTime: undefined,
            location: undefined,
        }

        setState(state)
    }
}

export const getState = (): State => {
    const json = readFile(getStatePath())
    return JSON.parse(json)
}

export const setState = (state: State) => {
    const json = JSON.stringify(state)
    writeFile(getStatePath(), json)
}

export const getAccessToken = (): AccessToken | undefined => {
    const { accessToken } = getState()
    return accessToken
}

export const setAccessToken = (accessToken?: AccessToken) => {
    const state = getState()

    setState({
        ...state,
        accessToken,
    })
}

export const getLocation = (): Location | undefined => {
    const { location } = getState()
    return location
}

export const setLocation = (location: Location) => {
    const state = getState()

    setState({
        ...state,
        location,
    })
}

export const getRequestsToday = () => {
    const { requestsToday = 0 } = getState()
    return requestsToday
}

export const increaseRequestsToday = () => {
    const state = getState()

    setState({
        ...state,
        requestsToday: (state.requestsToday ?? 0) + 1,
    })
}

export const resetRequestsToday = () => {
    const state = getState()

    setState({
        ...state,
        requestsToday: 0,
    })
}

export const updateLastRequestTime = () => {
    const state = getState()

    setState({
        ...state,
        lastRequestTime: formatISO(new Date()),
    })
}

export const getLastRequestTime = () => {
    const { lastRequestTime } = getState()
    return lastRequestTime ?? formatISO(new Date())
}
