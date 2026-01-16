import { Movie } from './movie';

export type RootStackParamList = {
    TabNavigator: undefined;
    MovieDetails: { movieId: string };
    PersonProfile: { personId: string };
    MovieList: { listId: string; listName: string };
    PopularMovies: undefined;
    Top250Movies: undefined;
    TopRatedMovies: undefined;
    Top250TvShows: undefined;
    PopularTvShows: undefined;
    LowRatedMovies: undefined;
};

export type TabParamList = {
    Home: undefined;
    Search: undefined;
    Categories: undefined;
    Favorites: undefined;
};

export type HomeStackParamList = {
    HomeScreen: undefined;
    MovieDetails: { movieId: string };
    PersonProfile: { personId: string };
};

export type SearchStackParamList = {
    SearchScreen: undefined;
    MovieDetails: { movieId: string };
    PersonProfile: { personId: string };
};

export type CategoriesStackParamList = {
    CategoriesScreen: undefined;
    MovieDetails: { movieId: string };
    PersonProfile: { personId: string };
};

export type FavoritesStackParamList = {
    FavoritesScreen: undefined;
    MovieDetails: { movieId: string };
    PersonProfile: { personId: string };
};
