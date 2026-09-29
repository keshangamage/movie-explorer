import axios from 'axios'
import type { DiscoverFilters, Genre, MovieDetail, MoviePage } from './types'

const client = axios.create({ baseURL: '/api', timeout: 15000 })

export function errorMessage(cause: unknown): string {
  if (axios.isAxiosError(cause)) {
    const message = cause.response?.data?.error
    if (typeof message === 'string') return message
    if (cause.code === 'ECONNABORTED') return 'The request took too long. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export const movieApi = {
  async status(): Promise<boolean> {
    const { data } = await client.get<{ configured: boolean }>('/status')
    return data.configured
  },
  async trending(): Promise<MoviePage> {
    const { data } = await client.get<MoviePage>('/movies/trending')
    return data
  },
  async search(query: string, page = 1): Promise<MoviePage> {
    const { data } = await client.get<MoviePage>('/movies/search', { params: { q: query, page } })
    return data
  },
  async discover(filters: DiscoverFilters, page = 1): Promise<MoviePage> {
    const { data } = await client.get<MoviePage>('/movies/discover', { params: { ...filters, page } })
    return data
  },
  async genres(): Promise<Genre[]> {
    const { data } = await client.get<{ genres: Genre[] }>('/genres')
    return data.genres
  },
  async detail(id: number): Promise<MovieDetail> {
    const { data } = await client.get<MovieDetail>(`/movies/${id}`)
    return data
  },
}

export function posterUrl(path: string | null, size = 'w500'): string | undefined {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined
}
