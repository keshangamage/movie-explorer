// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { movieApi } from './api'
import type { Movie, MovieDetail } from './types'

vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api')>()
  return { ...actual, movieApi: { status: vi.fn(), trending: vi.fn(), genres: vi.fn(), search: vi.fn(), discover: vi.fn(), detail: vi.fn() } }
})

const film: Movie = { id: 11, title: 'The Good Film', overview: 'A story worth watching.', poster_path: null, backdrop_path: null, release_date: '2024-01-10', vote_average: 8.2 }
const second: Movie = { ...film, id: 12, title: 'Another Film' }

beforeEach(() => {
  localStorage.clear()
  window.history.pushState({}, '', '/login')
  vi.mocked(movieApi.status).mockResolvedValue(true)
  vi.mocked(movieApi.trending).mockResolvedValue({ page: 1, results: [film], total_pages: 1, total_results: 1 })
  vi.mocked(movieApi.genres).mockResolvedValue([{ id: 18, name: 'Drama' }])
  vi.mocked(movieApi.search).mockImplementation(async (_query, page) => page === 1
    ? { page: 1, results: [film], total_pages: 2, total_results: 2 }
    : { page: 2, results: [second], total_pages: 2, total_results: 2 })
  vi.mocked(movieApi.discover).mockResolvedValue({ page: 1, results: [film], total_pages: 1, total_results: 1 })
  vi.mocked(movieApi.detail).mockResolvedValue({ ...film, runtime: 104, tagline: 'Keep watching', genres: [{ id: 18, name: 'Drama' }], homepage: null, credits: { cast: [{ id: 1, name: 'Alex Actor', character: 'Lead', profile_path: null }], crew: [{ id: 2, name: 'Dana Director', job: 'Director' }] }, videos: { results: [] } } satisfies MovieDetail)
})

afterEach(() => { cleanup(); vi.clearAllMocks() })

function signIn() {
  render(<App />)
  fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'demo' } })
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'movie123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Enter the cinema' }))
}

describe('Movie Explorer', () => {
  it('validates demo login and persists the theme preference', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enter the cinema' }))
    expect(screen.getByText(/credentials did not match/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'demo' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'movie123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enter the cinema' }))
    expect(await screen.findByText('Trending this week')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(localStorage.getItem('movie-explorer-theme')).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('loads more search results and saves a favorite without a poster', async () => {
    signIn()
    const search = screen.getByRole('textbox', { name: 'Search movies' })
    fireEvent.change(search, { target: { value: 'good' } })
    fireEvent.submit(search.closest('form')!)
    expect(await screen.findByText('The Good Film')).toBeInTheDocument()
    expect(screen.getByText('Poster unavailable')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Load more movies' }))
    expect(await screen.findByText('Another Film')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add The Good Film to favorites' }))
    expect(JSON.parse(localStorage.getItem('movie-explorer-favorites') ?? '[]')).toHaveLength(1)
    expect(localStorage.getItem('movie-explorer-last-search')).toBe('good')
  })

  it('shows movie details and a useful no-trailer state', async () => {
    signIn()
    const details = await screen.findByRole('link', { name: 'View details for The Good Film' })
    fireEvent.click(details)
    expect(await screen.findByText('Alex Actor')).toBeInTheDocument()
    expect(screen.getByText('No trailer is available for this film.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View on TMDB/ })).toHaveAttribute('href', 'https://www.themoviedb.org/movie/11')
  })

  it('passes discovery filters to the API', async () => {
    signIn()
    fireEvent.click(screen.getByRole('link', { name: 'Discover' }))
    await screen.findByText('Discover films')
    fireEvent.change(screen.getByRole('combobox', { name: 'Genre' }), { target: { value: '18' } })
    fireEvent.click(screen.getByRole('button', { name: 'Show films' }))
    await waitFor(() => expect(movieApi.discover).toHaveBeenCalledWith({ genre: '18', year: '', rating: '' }, 1))
  })

  it('restores favorites and explains missing TMDB setup', async () => {
    localStorage.setItem('movie-explorer-session', 'demo')
    localStorage.setItem('movie-explorer-favorites', JSON.stringify([film]))
    vi.mocked(movieApi.status).mockResolvedValue(false)
    window.history.pushState({}, '', '/favorites')
    render(<App />)
    expect(await screen.findByText(/Connect TMDB to see live films/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View details for The Good Film' })).toBeInTheDocument()
  })
})
