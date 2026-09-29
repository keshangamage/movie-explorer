import { Router } from 'express'

const TMDB_BASE = 'https://api.themoviedb.org/3'

function pageNumber(value) {
  const page = Number(value ?? 1)
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : null
}

function positiveId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function error(res, status, message) {
  return res.status(status).json({ error: message })
}

export function createTmdbRouter({ token = process.env.TMDB_READ_TOKEN, fetchImpl = fetch } = {}) {
  const router = Router()

  async function forward(res, path, params = {}) {
    if (!token) return error(res, 503, 'TMDB is not configured. Add TMDB_READ_TOKEN to your .env file and restart the server.')

    const url = new URL(`${TMDB_BASE}${path}`)
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }

    try {
      const response = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return error(res, 502, 'TMDB rejected the configured token. Check TMDB_READ_TOKEN.')
        if (response.status === 404) return error(res, 404, 'This movie could not be found on TMDB.')
        if (response.status === 429) return error(res, 429, 'TMDB is busy. Try again in a moment.')
        return error(res, 502, 'TMDB could not complete the request. Please try again.')
      }
      return res.json(await response.json())
    } catch {
      return error(res, 502, 'Could not reach TMDB. Check your connection and try again.')
    }
  }

  router.get('/status', (_req, res) => res.json({ configured: Boolean(token) }))

  router.get('/movies/trending', (_req, res) => forward(res, '/trending/movie/week', { language: 'en-US' }))

  router.get('/movies/search', (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const page = pageNumber(req.query.page)
    if (!query || query.length > 120 || !page) return error(res, 400, 'Enter a movie title and a valid page number.')
    return forward(res, '/search/movie', { query, page, language: 'en-US', include_adult: false })
  })

  router.get('/movies/discover', (req, res) => {
    const page = pageNumber(req.query.page)
    const genre = req.query.genre === undefined || req.query.genre === '' ? null : positiveId(req.query.genre)
    const year = req.query.year === undefined || req.query.year === '' ? null : Number(req.query.year)
    const rating = req.query.rating === undefined || req.query.rating === '' ? null : Number(req.query.rating)
    const maxYear = new Date().getFullYear() + 2
    if (!page || (req.query.genre && !genre) || (year !== null && (!Number.isInteger(year) || year < 1888 || year > maxYear)) || (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 10))) {
      return error(res, 400, 'Choose valid discover filters and a valid page number.')
    }
    return forward(res, '/discover/movie', {
      page,
      language: 'en-US',
      include_adult: false,
      sort_by: 'popularity.desc',
      with_genres: genre,
      primary_release_year: year,
      'vote_average.gte': rating,
      'vote_count.gte': rating ? 100 : undefined,
    })
  })

  router.get('/genres', (_req, res) => forward(res, '/genre/movie/list', { language: 'en-US' }))

  router.get('/movies/:id', (req, res) => {
    const id = positiveId(req.params.id)
    if (!id) return error(res, 400, 'Invalid movie ID.')
    return forward(res, `/movie/${id}`, { language: 'en-US', append_to_response: 'credits,videos' })
  })

  return router
}
