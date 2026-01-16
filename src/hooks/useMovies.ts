import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { imdbApi } from '../services/imdbApi';
import { isNetworkError } from '../utils/retryUtils';
import { useNetworkStatus } from './useNetworkStatus';

export const useMovies = (type: 'top250' | 'popular' | 'rated' | 'lowest' | 'boxOffice') => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const { isConnected } = useNetworkStatus();

    const fetchMovies = async () => {
        setLoading(true);
        setError(null);

        try {
            let data: Movie[] = [];

            switch (type) {
                case 'top250':
                    data = await imdbApi.getTop250Movies();
                    break;
                case 'popular':
                    data = await imdbApi.getMostPopularMovies();
                    break;
                case 'boxOffice':
                    data = await imdbApi.getBoxOfficeMovies();
                    break;
            }

            setMovies(data);
        } catch (err: any) {
            if (isNetworkError(err)) {
                setIsRetrying(true);
                const retryInterval = setInterval(async () => {
                    try {
                        let data: Movie[] = [];
                        switch (type) {
                            case 'top250':
                                data = await imdbApi.getTop250Movies();
                                break;
                            case 'popular':
                                data = await imdbApi.getMostPopularMovies();
                                break;
                            case 'boxOffice':
                                data = await imdbApi.getBoxOfficeMovies();
                                break;
                        }
                        setMovies(data);
                        setIsRetrying(false);
                        clearInterval(retryInterval);
                    } catch (retryErr: any) {
                        if (!isNetworkError(retryErr)) {
                            setError(retryErr instanceof Error ? retryErr.message : 'Failed to fetch movies');
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
                setError(err instanceof Error ? err.message : 'Failed to fetch movies');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [type]);

    useEffect(() => {
        if (isConnected && (isRetrying || error)) {
            setIsRetrying(false);
            setError(null);
            fetchMovies();
        }
    }, [isConnected]);

    return { movies, loading, error, isRetrying, refetch: fetchMovies };
};
