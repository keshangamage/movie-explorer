import { ExternalLink } from 'lucide-react'

export function CreditsPage() {
  return <div className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">About / Credits</p>
    <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Behind the frame.</h1>
    <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Frame by Frame is a personal film discovery project. Movie information and images are provided by The Movie Database.</p>
    <section className="mt-12 max-w-xl border-t pt-8" aria-labelledby="tmdb-credit">
      <h2 id="tmdb-credit" className="font-display text-xl font-semibold">Data and imagery</h2>
      <a className="mt-6 inline-flex items-center gap-4 text-sm font-medium hover:underline" href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg" alt="TMDB" className="h-12 w-auto" />
        Visit TMDB <ExternalLink className="size-4" aria-hidden="true" />
      </a>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    </section>
  </div>
}
