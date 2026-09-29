import { describe, expect, it, vi } from 'vitest'
import { createTmdbRouter } from './tmdb.mjs'

async function invoke(router, path, { query = {}, params = {} } = {}) {
  const layer = router.stack.find((item) => item.route?.path === path)
  if (!layer) throw new Error(`Missing route: ${path}`)
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
  await layer.route.stack[0].handle({ query, params }, res)
  return res
}

describe('TMDB proxy', () => {
  it('reports missing configuration without sending a movie request', async () => {
    const upstream = vi.fn()
    const router = createTmdbRouter({ token: '', fetchImpl: upstream })
    expect((await invoke(router, '/status')).body).toEqual({ configured: false })
    const response = await invoke(router, '/movies/trending')
    expect(response.statusCode).toBe(503)
    expect(response.body.error).toMatch(/TMDB_READ_TOKEN/)
    expect(upstream).not.toHaveBeenCalled()
  })

  it('forwards validated search and discovery requests with bearer auth', async () => {
    const upstream = vi.fn(async () => ({ ok: true, json: async () => ({ page: 1, results: [] }) }))
    const router = createTmdbRouter({ token: 'test-token', fetchImpl: upstream })
    await invoke(router, '/movies/search', { query: { q: 'The Matrix', page: '2' } })
    const [searchUrl, searchOptions] = upstream.mock.calls[0]
    expect(searchUrl.pathname).toBe('/3/search/movie')
    expect(searchUrl.searchParams.get('query')).toBe('The Matrix')
    expect(searchUrl.searchParams.get('page')).toBe('2')
    expect(searchOptions.headers.Authorization).toBe('Bearer test-token')

    await invoke(router, '/movies/discover', { query: { genre: '28', year: '2024', rating: '8', page: '3' } })
    const [discoverUrl] = upstream.mock.calls[1]
    expect(discoverUrl.pathname).toBe('/3/discover/movie')
    expect(discoverUrl.searchParams.get('with_genres')).toBe('28')
    expect(discoverUrl.searchParams.get('primary_release_year')).toBe('2024')
    expect(discoverUrl.searchParams.get('vote_average.gte')).toBe('8')
    expect(discoverUrl.searchParams.get('page')).toBe('3')
  })

  it('rejects invalid inputs and fetches details with credits and videos', async () => {
    const upstream = vi.fn(async () => ({ ok: true, json: async () => ({ id: 11 }) }))
    const router = createTmdbRouter({ token: 'test-token', fetchImpl: upstream })
    expect((await invoke(router, '/movies/search', { query: { q: 'x', page: '0' } })).statusCode).toBe(400)
    expect((await invoke(router, '/movies/discover', { query: { rating: '99' } })).statusCode).toBe(400)
    expect((await invoke(router, '/movies/:id', { params: { id: 'nope' } })).statusCode).toBe(400)
    expect(upstream).not.toHaveBeenCalled()
    await invoke(router, '/movies/:id', { params: { id: '11' } })
    const [url] = upstream.mock.calls[0]
    expect(url.pathname).toBe('/3/movie/11')
    expect(url.searchParams.get('append_to_response')).toBe('credits,videos')
  })

  it('returns a useful upstream error without leaking the token', async () => {
    const upstream = vi.fn(async () => ({ ok: false, status: 401 }))
    const router = createTmdbRouter({ token: 'private-token', fetchImpl: upstream })
    const response = await invoke(router, '/movies/trending')
    expect(response.statusCode).toBe(502)
    expect(JSON.stringify(response.body)).toMatch(/rejected the configured token/)
    expect(JSON.stringify(response.body)).not.toMatch(/private-token/)
  })
})
