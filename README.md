# Frame / Frame — Movie Explorer

A responsive movie discovery app built for the Movie Explorer assignment. Browse this week's trending movies, search by title, filter the wider catalog, view details and trailers, and keep a local favorites list.

The interface uses React, Tailwind CSS, and shadcn/ui components, with a light and dark film archive theme.

## Requirements

- Node.js 20 or newer
- A [TMDB API Read Access Token](https://www.themoviedb.org/settings/api) for live movie data

## Local setup

```bash
npm install
cp .env.example .env
```

Open `.env` and set `TMDB_READ_TOKEN` to your **API Read Access Token** (the bearer token, not the short v3 API key). Then run:

```bash
npm run dev
```

Open <http://localhost:5173>. The local demo account is **demo** / **movie123**. This login is only a client-side demonstration; it does not create a secure account. If the token is absent, the app shows setup guidance instead of movie data. Favorites and the last search still work locally.

## Features

- Trending movies from TMDB's weekly movie feed
- Title search with paginated **Load more** results
- Discovery filters for genre, release year, and minimum rating
- Details with synopsis, cast, director, rating, genres, and an available YouTube trailer
- Local favorites, last search, demo session, and light/dark preference
- Mobile-friendly layout, image placeholders, and loading, empty, and API error states

The React app calls only `/api`. The Express server accepts a small set of movie routes, forwards them to TMDB with `TMDB_READ_TOKEN`, and never sends that token to the browser. Do not commit `.env`.

## Commands

```bash
npm run dev      # Express API + Vite development middleware
npm run build    # TypeScript check and production build
npm start        # Serve the production build on PORT (default 5173)
npm run lint
npm test
```

The app is intentionally not deployed as part of this code-only deliverable. Before publishing it, configure `TMDB_READ_TOKEN` in the host's server environment and run the Express process to serve both the API and built frontend.

## TMDB credit

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata and images come from [The Movie Database](https://www.themoviedb.org). The credit and TMDB logo appear on the app's Credits page.
