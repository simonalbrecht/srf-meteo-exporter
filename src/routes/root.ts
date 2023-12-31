import { FastifyReply, FastifyRequest } from 'fastify'

export const handle = (_: FastifyRequest, reply: FastifyReply) => {
    return reply
        .code(200)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .send('SRF Meteo Exporter')
}
