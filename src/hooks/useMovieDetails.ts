import { useState, useEffect } from 'react';
import { Movie, Person } from '../types/movie';
import { imdbApi } from '../services/imdbApi';
import { isNetworkError } from '../utils/retryUtils';
import { useNetworkStatus } from './useNetworkStatus';

export const useMovieDetails = (movieId: string) => {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const { isConnected } = useNetworkStatus();

    const fetchMovieDetails = async () => {
        if (!movieId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await imdbApi.getMovieDetails(movieId);
            setMovie(data);
        } catch (err: any) {
            if (isNetworkError(err)) {
                setIsRetrying(true);
                const retryInterval = setInterval(async () => {
                    try {
                        const data = await imdbApi.getMovieDetails(movieId);
                        setMovie(data);
                        setIsRetrying(false);
                        clearInterval(retryInterval);
                    } catch (retryErr: any) {
                        if (!isNetworkError(retryErr)) {
                            setError(retryErr instanceof Error ? retryErr.message : 'Failed to fetch movie details');
                            setIsRetrying(false);
                            clearInterval(retryInterval);
                        }
                    }
                }, 5000);

                setTimeout(() => {
                    clearInterval(retryInterval);
                }, 120000);
                return;
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovieDetails();
    }, [movieId]);

    useEffect(() => {
        if (isConnected && (isRetrying || error) && movieId) {
            setIsRetrying(false);
            setError(null);
            fetchMovieDetails();
        }
    }, [isConnected, movieId]);

    return { movie, loading, error, isRetrying, refetch: fetchMovieDetails };
};
