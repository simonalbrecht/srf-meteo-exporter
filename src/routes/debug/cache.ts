import { FastifyReply, FastifyRequest } from 'fastify'
import { getCache } from '../../cache.js'

export const handle = (_: FastifyRequest, reply: FastifyReply) => {
    const cache = getCache()
    return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(JSON.stringify(cache, null, 2))
}
