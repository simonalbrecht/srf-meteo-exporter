import { FastifyReply, FastifyRequest } from 'fastify'
import { getState } from '../../state.js'

export const handle = (_: FastifyRequest, reply: FastifyReply) => {
    const state = getState()
    return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(JSON.stringify(state, null, 2))
}
