import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '../types/movie';

interface SavedMoviesState {
    savedMovies: Movie[];
    _hasHydrated: boolean;
    addMovie: (movie: Movie) => void;
    removeMovie: (movieId: string) => void;
    isMovieSaved: (movieId: string) => boolean;
    toggleMovie: (movie: Movie) => void;
    updateMoviePoster: (movieId: string, newPosterUrl: string) => void;
    setHasHydrated: (hasHydrated: boolean) => void;
}

interface AppState {
    _hasHydrated: boolean;
    setHasHydrated: (hasHydrated: boolean) => void;
}

export const useSavedMoviesStore = create<SavedMoviesState>()(
    persist(
        (set, get) => ({
            savedMovies: [],
            _hasHydrated: false,
            setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
            addMovie: (movie: Movie) => {
                const { savedMovies } = get();
                if (!savedMovies.some(m => m.id === movie.id)) {
                    const updatedMovies = [...savedMovies, movie];
                    console.log('Adding movie to storage:', {
                        title: movie.title,
                        id: movie.id,
                        poster: movie.poster,
                        hasPoster: !!(movie.poster && movie.poster.trim() !== '')
                    });
                    set({ savedMovies: updatedMovies });
                }
            },
            removeMovie: (movieId: string) => {
                const { savedMovies } = get();
                set({ savedMovies: savedMovies.filter(movie => movie.id !== movieId) });
            },
            isMovieSaved: (movieId: string) => {
                const { savedMovies } = get();
                return savedMovies.some(movie => movie.id === movieId);
            },
            toggleMovie: (movie: Movie) => {
                const { isMovieSaved, addMovie, removeMovie } = get();
                if (isMovieSaved(movie.id)) {
                    removeMovie(movie.id);
                } else {
                    addMovie(movie);
                }
            },
            updateMoviePoster: (movieId: string, newPosterUrl: string) => {
                const { savedMovies } = get();
                const movie = savedMovies.find(m => m.id === movieId);
                console.log('Updating movie poster:', {
                    movieId,
                    movieTitle: movie?.title,
                    oldPoster: movie?.poster,
                    newPoster: newPosterUrl
                });
                const updatedMovies = savedMovies.map(movie =>
                    movie.id === movieId
                        ? { ...movie, poster: newPosterUrl }
                        : movie
                );
                set({ savedMovies: updatedMovies });
            },
        }),
        {
            name: 'saved-movies-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                console.log('Rehydrating saved movies from AsyncStorage:', state?.savedMovies?.map(m => ({
                    title: m.title,
                    id: m.id,
                    poster: m.poster,
                    hasPoster: !!(m.poster && m.poster.trim() !== '')
                })));
                state?.setHasHydrated(true);
            },
        }
    )
);

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            _hasHydrated: false,
            setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
