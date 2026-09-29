import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { createServer as createHttpServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { createTmdbRouter } from './tmdb.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = express()
const httpServer = createHttpServer(app)
app.use('/api', createTmdbRouter())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')))
  app.use((_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')))
} else {
  const { createServer } = await import('vite')
  const vite = await createServer({ root, server: { middlewareMode: true, hmr: { server: httpServer } }, appType: 'spa' })
  app.use(vite.middlewares)
}

const port = Number(process.env.PORT) || 5173
httpServer.listen(port, () => console.log(`Movie Explorer running at http://localhost:${port}`))
