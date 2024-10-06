import { LIBERATOR_EXPORT_PATH } from './src/env/LIBERATOR_EXPORT_PATH';
import { rateLimit, client as trakt } from './src/trakt/client';
import type { Movie, Show, List } from './src/types';
import { readFile } from 'fs/promises';

async function traktUnlimited() {
    await rateLimit();
    return trakt;
}

/**
 * * * * *  Read liberator data  * * * * *
 */
const shows: Show[] = JSON
    .parse(await readFile(`${LIBERATOR_EXPORT_PATH}/shows.json`, 'utf-8'));

const movies: Movie[] = JSON
    .parse(await readFile(`${LIBERATOR_EXPORT_PATH}/movies.json`, 'utf-8'));

const favorites: List = JSON
    .parse(await readFile(`${LIBERATOR_EXPORT_PATH}/favorites.json`, 'utf-8'));

/**
 * * * * *  Add shows and movies to watchlist  * * * * *
 */
const showWatchlist = shows
    .map(serie => ({
        ids: {
            tvdb: serie.id.tvdb,
            imdb: serie.id.imdb === '-1'
                ? ''
                : serie.id.imdb,
            slug: '',
            tmdb: -Infinity,
            trakt: -Infinity,
        },
    }));

const movieWatchlist = movies
    .map(movie => ({
        watched_at: movie.watched_at,
        ids: {
            imdb: movie.id.imdb,
            slug: '',
            tmdb: -Infinity,
            trakt: -Infinity,
        },
    }));

await traktUnlimited()
    .then(trakt =>
        trakt.sync.watchlist.add({
            shows: showWatchlist,
            movies: movieWatchlist,

        }),
    )
    .then(async response => {
        console.log('--- Imported watchlist: ', await response.text());
    });

/**
 * * * * *  Add show and movie watches to history  * * * * *
 */
const showHistory = shows
    .map(show => ({
        ids: {
            tvdb: show.id.tvdb,
            imdb: show.id.imdb === '-1'
                ? ''
                : show.id.imdb,
            slug: '',
            tmdb: -Infinity,
            trakt: -Infinity,
        },
        seasons: show
            .seasons
            .map(season => ({
                number: season.number,
                episodes: season
                    .episodes
                    .filter(episode => episode.is_watched)
                    .map(episode => ({
                        watched_at: episode.watched_at,
                        number: episode.number,
                    })),
            })),
    }));

const movieHistory = movieWatchlist
    .filter(movie => movie.watched_at != null);

await traktUnlimited()
    .then(trakt =>
        trakt.sync.history.add({
            /**
             * Library typings are not compliant with Trakt Apiary documentation.
             * 
             * See: https://trakt.docs.apiary.io/#reference/sync/add-to-history/add-items-to-watched-history
             */
            // @ts-expect-error
            shows: showHistory,
            movies: movieHistory,
        }),
    )
    .then(async response => {
        console.log('--- Imported watch history: ', await response.text());
    });

/***
 * * * * *  Add stopped shows to hidden sections  * * * * *
 */
const stoppedShows = shows
    .filter(show => show.status === 'stopped')
    .map(show => ({
        ids: {
            tvdb: show.id.tvdb,
            imdb: show.id.imdb === '-1'
                ? ''
                : show.id.imdb,
            slug: '',
            tmdb: -Infinity,
            trakt: -Infinity,
        }
    }));

await traktUnlimited()
    .then(trakt =>
        trakt
            .users
            .requests
            .hidden
            .add({
                shows: stoppedShows,
                section: 'progress_watched',
            })
            .then(async response => {
                console.log('--- Stopped shows hiiden from progress: ', await response.text());
            })
    );

await traktUnlimited()
    .then(trakt =>
        trakt
            .users
            .requests
            .hidden
            .add({
                shows: stoppedShows,
                section: 'recommendations',
            })
            .then(async response => {
                console.log('--- Stopped shows hidden from recommendations: ', await response.text());
            })
    );

/*
* * * * *  Add favorites to lists  * * * * *
*/
const FAVORITE_MAX = 1;

const favoriteShows = favorites
    .shows
    .map(show => ({
        ids: {
            tvdb: show.id.tvdb,
            imdb: show.id.imdb === '-1'
                ? ''
                : show.id.imdb,
            slug: '',
            tmdb: -Infinity,
            trakt: -Infinity,
        }
    }));

const favoriteMovies = favorites
    .movies
    .map(movie => ({
        ids: {
            imdb: movie.id.imdb,
            slug: '',
            tmdb: -Infinity,
            trakt: -Infinity,
        }
    }));

const totalFavorites = favoriteShows.length + favoriteMovies.length;
const isTraktFavoriteLimitExceeded = totalFavorites > FAVORITE_MAX;

if (isTraktFavoriteLimitExceeded) {
    console.log(`--- Favorites list exceeds the Trakt ${FAVORITE_MAX} limit.`);
    console.log('--- No worries, original favorite list will be created as a custom list, called "TV Time Favorites".');

    await traktUnlimited()
        .then(trakt =>
            trakt
                .users
                .lists
                .create({
                    name: 'TV Time Favorites',
                    description: 'Favorites list from TV Time.',
                    privacy: favorites.is_public ? 'public' : 'private',
                    id: 'me',
                })
                .then(async res => {
                    const { ids: { slug } } = await res.json();

                    await trakt
                        .users
                        .list
                        .items
                        .add({
                            id: 'me',
                            list_id: slug,
                            movies: favoriteMovies,
                            shows: favoriteShows,
                        });
                })
                .catch(async error => {
                    console.error('--- Error adding favorites to custom list: ', await error);
                    return null;
                })
        );
}