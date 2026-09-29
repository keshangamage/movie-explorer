import express from 'express'
import { createTmdbRouter } from '../server/tmdb.mjs'

const app = express()
app.use('/api', createTmdbRouter())

// Vercel rewrites /api/* here and passes the original route in __route.
// Restore it before Express handles the request so the local and deployed
// apps use the same validated TMDB proxy routes.
export default function handler(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const route = url.searchParams.get('__route')
  url.searchParams.delete('__route')

  if (!route || route.startsWith('/') || route.includes('..')) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'API route not found.' }))
    return
  }

  req.url = `/api/${route}${url.search}`
  return app(req, res)
}
