export interface Movie {
    id: string;
    title: string;
    year: number;
    rating: number;
    poster: string;
    plot: string;
    genres: string[];
    ageRating: string;
    country: string;
    language: string;
    duration: string;
    directors: Person[];
    writers: Person[];
    cast: Person[];
    crew: Person[];
    similarMovies?: Movie[];
}

export interface Person {
    id: string;
    name: string;
    photo: string;
    bio: string;
    character?: string;
    filmography?: Movie[];
}

export interface SearchResult {
    movies: Movie[];
    totalResults: number;
    hasMore: boolean;
}

export interface Category {
    id: string;
    title: string;
    count: number;
    icon: string;
    movies: Movie[];
}

export interface UserList {
    id: string;
    name: string;
    movies: Movie[];
    isDefault: boolean;
}
