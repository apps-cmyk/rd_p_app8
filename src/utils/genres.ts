import { imdbApi } from '../services/imdbApi';

export const DEFAULT_GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];

export const DEFAULT_COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'France', 'Germany', 'Italy', 'Spain', 'Japan', 'South Korea', 'China', 'India', 'Australia', 'Brazil', 'Mexico', 'Russia'];

let cachedGenres: string[] | null = null;
let cachedCountries: string[] | null = null;

export const getGenres = async (): Promise<string[]> => {
    if (cachedGenres) {
        return cachedGenres;
    }

    try {
        const genres = await imdbApi.getGenres();
        cachedGenres = genres;
        return genres;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return DEFAULT_GENRES;
    }
};

export const getCountries = async (): Promise<string[]> => {
    if (cachedCountries) {
        return cachedCountries;
    }

    try {
        const countries = await imdbApi.getCountries();
        cachedCountries = countries;
        return countries;
    } catch (error) {
        console.error('Error fetching countries:', error);
        return DEFAULT_COUNTRIES;
    }
};

export const getLanguages = async (): Promise<string[]> => {
    try {
        const languages = await imdbApi.getLanguages();
        return languages;
    } catch (error) {
        console.error('Error fetching languages:', error);
        return ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Hindi', 'Arabic'];
    }
};

export const getDefaultGenre = (): string => {
    return DEFAULT_GENRES[0];
};

export const getDefaultCountry = (): string => {
    return DEFAULT_COUNTRIES[0];
};

export const processMovieGenres = (movieGenres?: string[]): string[] => {
    if (movieGenres && movieGenres.length > 0) {
        return movieGenres;
    }
    return [getDefaultGenre()];
};

export const processMovieCountries = (movieCountries?: string[]): string[] => {
    if (movieCountries && movieCountries.length > 0) {
        return movieCountries;
    }
    return [getDefaultCountry()];
};
