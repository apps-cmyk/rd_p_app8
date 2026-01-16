import { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types/movie';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_MOVIES_KEY = 'saved_movies';

export const useSavedMovies = () => {
    const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSavedMovies = useCallback(async () => {
        try {
            setLoading(true);
            const savedData = await AsyncStorage.getItem(SAVED_MOVIES_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                setSavedMovies(parsed);
            } else {
                setSavedMovies([]);
            }
        } catch (err) {
            console.error('[useSavedMovies] Error loading:', err);
            setError(err instanceof Error ? err.message : 'Failed to load saved movies');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveMovie = useCallback(async (movie: Movie) => {
        try {
            const updatedMovies = [...savedMovies, movie];
            await AsyncStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(updatedMovies));
            setSavedMovies(updatedMovies);
        } catch (err) {
            console.error('[useSavedMovies] Error saving:', err);
            setError(err instanceof Error ? err.message : 'Failed to save movie');
        }
    }, [savedMovies]);

    const removeMovie = useCallback(async (movieId: string) => {
        try {
            const updatedMovies = savedMovies.filter(movie => movie.id !== movieId);
            await AsyncStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(updatedMovies));
            setSavedMovies(updatedMovies);
        } catch (err) {
            console.error('[useSavedMovies] Error removing:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove movie');
        }
    }, [savedMovies]);

    const isMovieSaved = useCallback((movieId: string) => {
        return savedMovies.some(movie => movie.id === movieId);
    }, [savedMovies]);

    const toggleMovie = useCallback(async (movie: Movie) => {
        if (isMovieSaved(movie.id)) {
            await removeMovie(movie.id);
        } else {
            await saveMovie(movie);
        }
    }, [isMovieSaved, removeMovie, saveMovie]);

    useEffect(() => {
        loadSavedMovies();
    }, []);

    return {
        savedMovies,
        loading,
        error,
        saveMovie,
        removeMovie,
        isMovieSaved,
        toggleMovie,
        refetch: loadSavedMovies,
    };
};
