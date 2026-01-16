import { useState, useCallback, useRef, useEffect } from 'react';
import { Movie, SearchResult } from '../types/movie';
import { imdbApi } from '../services/imdbApi';
import { isNetworkError } from '../utils/retryUtils';
import { useNetworkStatus } from './useNetworkStatus';

interface AutocompleteItem {
    id: string;
    title: string;
    year?: number;
    poster?: string;
}

export const useSearch = () => {
    const [results, setResults] = useState<SearchResult>({ movies: [], totalResults: 0, hasMore: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteItem[]>([]);
    const [autocompleteLoading, setAutocompleteLoading] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { isConnected } = useNetworkStatus();

    const search = useCallback(async (searchQuery: string, filters?: {
        type?: 'movie' | 'tv' | 'all';
        genre?: string;
        country?: string;
    }) => {
        if (!searchQuery.trim() && !filters?.genre && !filters?.country) {
            setResults({ movies: [], totalResults: 0, hasMore: false });
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            setError(null);
            setQuery(searchQuery);
            setAutocompleteResults([]);

            try {
                const data = await imdbApi.searchMovies(searchQuery);
                setResults(data);
            } catch (err: any) {
                if (isNetworkError(err)) {
                    setIsRetrying(true);
                    const retryInterval = setInterval(async () => {
                        try {
                            const data = await imdbApi.searchMovies(searchQuery);
                            setResults(data);
                            setIsRetrying(false);
                            clearInterval(retryInterval);
                        } catch (retryErr: any) {
                            if (!isNetworkError(retryErr)) {
                                setError(retryErr instanceof Error ? retryErr.message : 'Search failed');
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
                    setError(err instanceof Error ? err.message : 'Search failed');
                }
            } finally {
                setLoading(false);
            }
        }, 300);
    }, []);

    const getAutocomplete = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setAutocompleteResults([]);
            return;
        }

        if (autocompleteTimeoutRef.current) {
            clearTimeout(autocompleteTimeoutRef.current);
        }

        autocompleteTimeoutRef.current = setTimeout(async () => {
            setAutocompleteLoading(true);
            try {
                const data = await imdbApi.getAutocomplete(searchQuery);
                setAutocompleteResults(data.slice(0, 5));
            } catch (err: any) {
                if (err.name !== 'NetworkError' && err.message !== 'NETWORK_ERROR') {
                    console.error('Non-network autocomplete error:', err);
                }
            } finally {
                setAutocompleteLoading(false);
            }
        }, 300);
    }, []);

    const clearAutocomplete = useCallback(() => {
        setAutocompleteResults([]);
        if (autocompleteTimeoutRef.current) {
            clearTimeout(autocompleteTimeoutRef.current);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults({ movies: [], totalResults: 0, hasMore: false });
        setQuery('');
        setError(null);
        setAutocompleteResults([]);
    }, []);

    useEffect(() => {
        if (isConnected && (isRetrying || error) && query) {
            setIsRetrying(false);
            setError(null);
            search(query);
        }
    }, [isConnected, query]);

    return {
        results,
        loading,
        error,
        query,
        isRetrying,
        search,
        clearResults,
        autocompleteResults,
        autocompleteLoading,
        getAutocomplete,
        clearAutocomplete,
    };
};
