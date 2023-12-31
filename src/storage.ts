import * as fs from 'fs'
import * as path from 'path'
import {
    DEFAULT_DATA_PATH,
    STATE_FILE_NAME,
    CACHE_FILE_NAME,
} from './constants.js'

export const getDataPath = () => {
    return process.env.DATA_PATH ?? DEFAULT_DATA_PATH
}

export const getStatePath = () => {
    const dataPath = getDataPath()
    return path.join(dataPath, STATE_FILE_NAME)
}

export const getCachePath = () => {
    const dataPath = getDataPath()
    return path.join(dataPath, CACHE_FILE_NAME)
}

export const initStorage = () => {
    const dataPath = getDataPath()

    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath)
    }
}

export const pathExists = (fileOrDirPath: string): boolean => {
    return fs.existsSync(fileOrDirPath)
}

export const createDir = (dirPath: string) => {
    fs.mkdirSync(dirPath)
}

export const readFile = (filePath: string) => {
    return fs.readFileSync(filePath, {
        encoding: 'utf-8',
    })
}

export const writeFile = (filePath: string, content: string) => {
    return fs.writeFileSync(filePath, content, {
        encoding: 'utf-8',
    })
}
