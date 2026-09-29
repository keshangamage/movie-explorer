import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage, movieApi } from '../api'
import { MovieGrid } from '../components/MovieGrid'
import { Button } from '../components/ui/button'
import { Spinner } from '../components/ui/spinner'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import { NativeSelect, NativeSelectOption } from '../components/ui/native-select'
import type { DiscoverFilters, Movie } from '../types'
import { useApp } from '../state/AppContext'

const blank: DiscoverFilters = { genre: '', year: '', rating: '' }

export function DiscoverPage() {
  const { genres } = useApp()
  const [draft, setDraft] = useState<DiscoverFilters>(blank)
  const [filters, setFilters] = useState<DiscoverFilters>(blank)
  const [movies, setMovies] = useState<Movie[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generation = useRef(0)
  const years = Array.from({ length: new Date().getFullYear() - 1885 }, (_, index) => String(new Date().getFullYear() + 2 - index))

  const load = useCallback(async (nextPage: number, fresh = false) => {
    const requestGeneration = generation.current
    setLoading(true)
    setError(null)
    try {
      const data = await movieApi.discover(filters, nextPage)
      if (requestGeneration !== generation.current) return
      setMovies((current) => fresh ? data.results : [...current, ...data.results.filter((item) => !current.some((movie) => movie.id === item.id))])
      setPage(data.page)
      setTotalPages(data.total_pages)
    } catch (cause) {
      if (requestGeneration === generation.current) setError(errorMessage(cause))
    } finally {
      if (requestGeneration === generation.current) setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    generation.current += 1
    const current = generation.current
    queueMicrotask(() => {
      if (generation.current !== current) return
      setMovies([])
      setPage(0)
      setTotalPages(0)
      void load(1, true)
    })
    return () => { generation.current += 1 }
  }, [load])

  return <div className="mx-auto max-w-7xl px-5 py-10 pb-20 lg:px-8 lg:py-14">
    <header className="mb-8"><p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Browse / TMDB catalog</p><h1 className="font-display mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Discover films</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Follow a genre, revisit a year, or find a highly rated story you missed.</p></header>
    <div className="mb-8 border-y py-5">
      <FieldGroup className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <Field><FieldLabel htmlFor="filter-genre">Genre</FieldLabel><NativeSelect className="w-full" id="filter-genre" value={draft.genre} onChange={(event) => setDraft({ ...draft, genre: event.target.value })}>
          <NativeSelectOption value="">All genres</NativeSelectOption>{genres.map((genre) => <NativeSelectOption key={genre.id} value={String(genre.id)}>{genre.name}</NativeSelectOption>)}
        </NativeSelect></Field>
        <Field><FieldLabel htmlFor="filter-year">Year</FieldLabel><NativeSelect className="w-full" id="filter-year" value={draft.year} onChange={(event) => setDraft({ ...draft, year: event.target.value })}>
          <NativeSelectOption value="">Any year</NativeSelectOption>{years.map((year) => <NativeSelectOption key={year} value={year}>{year}</NativeSelectOption>)}
        </NativeSelect></Field>
        <Field><FieldLabel htmlFor="filter-rating">Minimum rating</FieldLabel><NativeSelect className="w-full" id="filter-rating" value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: event.target.value })}>
          <NativeSelectOption value="">Any rating</NativeSelectOption>{['6', '7', '8', '9'].map((rating) => <NativeSelectOption key={rating} value={rating}>{rating}+ / 10</NativeSelectOption>)}
        </NativeSelect></Field>
        <div className="flex gap-2"><Button onClick={() => setFilters({ ...draft })}>Show films</Button><Button variant="ghost" onClick={() => { setDraft(blank); setFilters({ ...blank }) }}>Clear</Button></div>
      </FieldGroup>
    </div>
    <MovieGrid movies={movies} loading={loading} error={error} onRetry={() => void load(page || 1, page === 0)} emptyTitle="No films match these filters" emptyBody="Try another genre, year, or rating." />
    {error && movies.length > 0 && <Alert variant="destructive" className="mt-5"><AlertDescription>{error}</AlertDescription></Alert>}
    {page < totalPages && <div className="mt-10 flex justify-center"><Button variant="outline" onClick={() => void load(page + 1)} disabled={loading}>{loading && <Spinner data-icon="inline-start" />}Load more films</Button></div>}
  </div>
}
