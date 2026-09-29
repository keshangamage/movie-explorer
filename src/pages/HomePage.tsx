import { Link } from 'react-router-dom'
import { ArrowRight, Film, Star } from 'lucide-react'
import { posterUrl } from '../api'
import { MovieGrid } from '../components/MovieGrid'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { useApp } from '../state/AppContext'

export function HomePage() {
  const { trending, trendingLoading, trendingError, reloadTrending, lastSearch } = useApp()
  const featured = trending.find((movie) => movie.backdrop_path) ?? trending[0]

  return <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
    <section className="grid gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-stretch md:gap-10 md:py-14">
      <div className="flex flex-col justify-center py-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">The film shelf / Curated by you</p>
        <h1 className="font-display mt-5 max-w-lg text-[clamp(2.7rem,5vw,4.7rem)] leading-[1.04] font-semibold tracking-[-.065em]">Find a film for tonight.</h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">Browse this week’s conversation, search for a title, or follow a genre somewhere new.</p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button asChild size="lg"><Link to="/discover">Explore films <ArrowRight data-icon="inline-end" /></Link></Button>
          {lastSearch && <Button asChild variant="outline" size="lg"><Link to={`/search?q=${encodeURIComponent(lastSearch)}`}>Search “{lastSearch}” again</Link></Button>}
        </div>
      </div>
      <div className="relative min-h-70 overflow-hidden bg-muted md:min-h-90">
        {featured?.backdrop_path ? <div className="feature-photo absolute inset-0" style={{ backgroundImage: `url(${posterUrl(featured.backdrop_path, 'w1280')})` }} role="img" aria-label={`${featured.title} backdrop`} />
          : <div className="flex size-full items-center justify-center text-muted-foreground"><Film className="size-10" /></div>}
        {featured && <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-black/85 via-black/55 to-transparent px-5 pt-18 pb-5 text-white sm:px-7">
          <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-widest text-white/70">Featured this week</p><h2 className="font-display mt-1 line-clamp-2 text-2xl font-semibold tracking-tight sm:text-3xl">{featured.title}</h2><p className="mt-1 flex items-center gap-2 text-xs text-white/75">{featured.release_date?.slice(0, 4) || 'Film'} <span>·</span> <Star className="size-3 fill-current" /> {featured.vote_average?.toFixed(1) || 'NR'}</p></div>
          <Button asChild variant="secondary" size="sm"><Link to={`/movie/${featured.id}`} aria-label={`View ${featured.title}`}>Details <ArrowRight data-icon="inline-end" /></Link></Button>
        </div>}
      </div>
    </section>

    <Separator />
    <section className="pt-10" aria-labelledby="trending-heading">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">This week’s picks</p><h2 id="trending-heading" className="font-display mt-2 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Trending this week</h2></div>
        {trending.length > 0 && <Badge variant="outline">{trending.length} films</Badge>}
      </div>
      <MovieGrid movies={trending} loading={trendingLoading} error={trendingError} onRetry={() => void reloadTrending()}
        emptyTitle="Nothing on the shelf yet" emptyBody="Movies will appear when TMDB is connected." />
      {trending.length > 0 && <div className="mt-10 flex justify-center"><Button asChild variant="outline"><Link to="/discover">Discover more films <ArrowRight data-icon="inline-end" /></Link></Button></div>}
    </section>
  </div>
}
