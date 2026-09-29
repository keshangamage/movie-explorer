import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { errorMessage, movieApi } from '../api'
import { MovieGrid } from '../components/MovieGrid'
import { Button } from '../components/ui/button'
import { Spinner } from '../components/ui/spinner'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty'
import type { Movie } from '../types'
import { useApp } from '../state/AppContext'

export function SearchPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const { lastSearch, saveSearch } = useApp()
  const [movies, setMovies] = useState<Movie[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generation = useRef(0)

  const load = useCallback(async (nextPage: number, fresh = false) => {
    if (!query) return
    const requestGeneration = generation.current
    setLoading(true)
    setError(null)
    try {
      const data = await movieApi.search(query, nextPage)
      if (requestGeneration !== generation.current) return
      setMovies((current) => fresh ? data.results : [...current, ...data.results.filter((item) => !current.some((movie) => movie.id === item.id))])
      setPage(data.page)
      setTotalPages(data.total_pages)
      setTotalResults(data.total_results)
    } catch (cause) {
      if (requestGeneration === generation.current) setError(errorMessage(cause))
    } finally {
      if (requestGeneration === generation.current) setLoading(false)
    }
  }, [query])

  useEffect(() => {
    generation.current += 1
    const current = generation.current
    queueMicrotask(() => {
      if (generation.current !== current) return
      setMovies([])
      setPage(0)
      setTotalPages(0)
      setTotalResults(0)
      if (query) { saveSearch(query); void load(1, true) }
    })
    return () => { generation.current += 1 }
  }, [query, load, saveSearch])

  return <div className="mx-auto max-w-7xl px-5 py-10 pb-20 lg:px-8 lg:py-14">
    <header className="mb-8 border-b pb-7">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Search / Movie titles</p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Search results</h1>
      <p className="mt-2 text-sm text-muted-foreground">{query ? <>For <strong className="text-foreground">“{query}”</strong>{totalResults > 0 ? ` · ${totalResults.toLocaleString()} results` : ''}</> : 'Search for a film in the top bar.'}</p>
    </header>
    {!query ? <Empty className="min-h-65 border"><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>Start with a title</EmptyTitle><EmptyDescription>Use the search field above to look for a movie.</EmptyDescription></EmptyHeader>
      {lastSearch && <EmptyContent><Button asChild variant="outline"><Link to={`/search?q=${encodeURIComponent(lastSearch)}`}>Repeat “{lastSearch}”</Link></Button></EmptyContent>}</Empty>
      : <>
        <MovieGrid movies={movies} loading={loading} error={error} onRetry={() => void load(page || 1, page === 0)} emptyTitle="No matching films" emptyBody="Check the spelling or try a broader title." />
        {error && movies.length > 0 && <Alert variant="destructive" className="mt-5"><AlertDescription>{error}</AlertDescription></Alert>}
        {page < totalPages && <div className="mt-10 flex justify-center"><Button variant="outline" onClick={() => void load(page + 1)} disabled={loading}>{loading && <Spinner data-icon="inline-start" />}Load more movies</Button></div>}
      </>}
  </div>
}
