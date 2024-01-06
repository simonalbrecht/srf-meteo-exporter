import { FastifyReply, FastifyRequest } from 'fastify'

export const handle = (_: FastifyRequest, reply: FastifyReply) => {
    return reply
        .code(200)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(
            `<html>
            <head>
                <title>SRF Meteo Exporter</title>
            </head>
            <body>
                <h1>SRF Meteo Exporter</h1>
                <ul>
                    <li><a href="/metrics">Metrics</a>
                    <li><a href="/debug/state">Debug: State</a>
                    <li><a href="/debug/cache">Debug: Cache</a>
                </ul>
            </body>
            </html>
        `
        )
}
