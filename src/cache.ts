import { Cache } from './types.js'
import {
    getCachePath,
    initStorage,
    pathExists,
    readFile,
    writeFile,
} from './storage.js'

export const initCache = () => {
    initStorage()

    const cachePath = getCachePath()
    if (!pathExists(cachePath)) {
        const cache: Cache = undefined

        setCache(cache)
    }
}

export const getCache = (): Cache => {
    const json = readFile(getCachePath())
    return JSON.parse(json)
}

export const setCache = (cache: Cache) => {
    const json = JSON.stringify(cache || {})
    writeFile(getCachePath(), json)
}
