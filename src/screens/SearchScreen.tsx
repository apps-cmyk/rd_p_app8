import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { SearchBar } from '../components';
import { Image } from 'react-native';
import { useSearch } from '../hooks';
import { Movie } from '../types/movie';
import { RootStackParamList } from '../types/navigation';
import { imdbApi } from '../services/imdbApi';
import { processMovieGenres } from '../utils/genres';
import { apiRequest } from '../services/apiClient';
import { images } from '../../assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3;

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TabNavigator'>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const {
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
    clearAutocomplete
  } = useSearch();

  const lastSearchQueryRef = useRef<string>('');
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  useEffect(() => {
    fetchTopRatedMovies();
  }, []);

  const fetchTopRatedMovies = async () => {
    try {
      setTopRatedLoading(true);
      const data = await apiRequest('https://imdb236.p.rapidapi.com/api/imdb/top-rated-english-movies');

      const transformedMovies = data.map((movie: any) => ({
        id: movie.id || '',
        title: movie.primaryTitle || '',
        year: movie.startYear || 0,
        rating: movie.averageRating || 0,
        poster: movie.primaryImage || '',
        genres: processMovieGenres(movie.genres),
        ageRating: movie.contentRating || 'N/A',
      }));

      setTopRatedMovies(transformedMovies);
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
    } finally {
      setTopRatedLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    if (text === lastSearchQueryRef.current) {
      return;
    }

    if (text.trim().length >= 2) {
      lastSearchQueryRef.current = text;
      setShowAutocomplete(false);
      clearAutocomplete();
      search(text);
    } else {
      lastSearchQueryRef.current = '';
      setShowAutocomplete(false);
      clearAutocomplete();
      clearResults();
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setShowAutocomplete(false);
      clearAutocomplete();
      search(searchQuery);
    }
  };

  const handleClear = () => {
    lastSearchQueryRef.current = '';
    clearResults();
    setShowAutocomplete(false);
    clearAutocomplete();
  };

  const handleAutocompleteSelect = (item: typeof autocompleteResults[0]) => {
    setShowAutocomplete(false);
    clearAutocomplete();
    navigation.navigate('MovieDetails', { movieId: item.id });
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };


  const handleTopRatedMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.searchMovieCard}
      onPress={() => handleMoviePress(item)}
    >
      <View style={styles.searchPosterContainer}>
        {item.poster ? (
          <Image source={{ uri: item.poster }} style={styles.searchPoster} />
        ) : (
          <Image source={images.NO_POSTER} style={styles.searchPoster} />
        )}
        <View style={styles.searchRatingContainer}>
          <Text style={styles.searchRating}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.searchInfoContainer}>
        <Text style={styles.searchTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.searchGenres}>
          {item.genres.join(', ')} • {item.ageRating}
        </Text>
      </View>
    </TouchableOpacity>
  );



  const renderContent = () => {
    if (loading || isRetrying) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.accentRed} />
        </View>
      );
    }

    if (error && !isRetrying) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      );
    }

    if (query && results.movies.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsText}>Nothing found</Text>
          <Text style={styles.noResultsSubtext}>Try another search</Text>
        </View>
      );
    }

    if (query && results.movies.length > 0) {
      return (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results.movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.searchRow}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    return (
      <View style={styles.defaultContainer}>
        {/* Top Rated English Movies */}
        {!topRatedLoading && topRatedMovies.length > 0 && (
          <View style={styles.topRatedSection}>
            <FlatList
              data={topRatedMovies}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.movieCard}
                  onPress={() => handleTopRatedMoviePress(item)}
                >
                  <View style={styles.posterContainer}>
                    {item.poster ? (
                      <Image source={{ uri: item.poster }} style={styles.poster} />
                    ) : (
                      <Image source={images.NO_POSTER} style={styles.poster} />
                    )}
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.genres}>
                      {item.genres.join(', ')} • {item.ageRating}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Плейсхолдер если нет фильмов */}
        {topRatedMovies.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.placeholderText}>Start searching</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClear}
          onChange={handleInputChange}
          placeholder="Search for movies and tv shows"
        />
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  searchContainer: {
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
  },
  noResultsText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  noResultsSubtext: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  placeholderText: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
  },
  defaultContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  genresSection: {
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  genresContainer: {
    paddingRight: theme.spacing.md,
  },
  genreItem: {
    backgroundColor: theme.colors.accentRed,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 7,
    marginRight: theme.spacing.sm,
  },
  genreText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
  },
  topRatedSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  movieCard: {
    width: cardWidth,
    marginBottom: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  searchRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  posterContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  poster: {
    width: '100%',
    height: cardWidth * 1.4,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray,
  },
  ratingContainer: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.accentRed,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  rating: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  infoContainer: {
    paddingHorizontal: theme.spacing.xs,
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  genres: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.sm,
  },
  searchMovieCard: {
    width: (width - 48) / 2,
    marginBottom: theme.spacing.md,
  },
  searchPosterContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  searchPoster: {
    width: '100%',
    height: ((width - 48) / 2) * 1.4,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray,
  },
  searchRatingContainer: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.accentRed,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  searchRating: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  searchInfoContainer: {
    paddingHorizontal: theme.spacing.xs,
  },
  searchTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  searchGenres: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.sm,
  },
});