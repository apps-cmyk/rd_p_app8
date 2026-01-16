import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { theme } from '../theme';
import { MovieCard } from '../components';
import { useMovies } from '../hooks';
import { Movie } from '../types/movie';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { images } from '../../assets/images';
import { processMovieGenres } from '../utils/genres';

type CategoriesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Categories'>,
  StackNavigationProp<RootStackParamList>
>;

interface CategoriesScreenProps {
  navigation: CategoriesScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3;

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  // Use the new hooks for automatic retry functionality
  const { movies: top250Movies, loading: top250Loading, error: top250Error, isRetrying: top250Retrying } = useMovies('top250');

  // For TV shows and lowest rated movies, we'll need to create separate hooks or handle them differently
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [popularTvShows, setPopularTvShows] = useState<Movie[]>([]);
  const [lowestRatedMovies, setLowestRatedMovies] = useState<Movie[]>([]);
  const [tvLoading, setTvLoading] = useState(true);
  const [popularTvLoading, setPopularTvLoading] = useState(true);
  const [lowestRatedLoading, setLowestRatedLoading] = useState(true);
  const [tvError, setTvError] = useState<string | null>(null);
  const [popularTvError, setPopularTvError] = useState<string | null>(null);
  const [lowestRatedError, setLowestRatedError] = useState<string | null>(null);

  useEffect(() => {
    fetchTop250TvShows();
    fetchMostPopularTvShows();
    fetchLowestRatedMovies();
  }, []);


  const fetchTop250TvShows = async () => {
    try {
      setTvLoading(true);
      const options = {
        method: 'GET',
        url: 'https://imdb236.p.rapidapi.com/api/imdb/top250-tv',
        headers: {
          'x-rapidapi-key': '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997',
          'x-rapidapi-host': 'imdb236.p.rapidapi.com'
        },
        timeout: 15000
      };

      const response = await axios.request(options);

      const transformedTvShows = response.data.map((show: any) => ({
        id: show.id || '',
        title: show.primaryTitle || '',
        year: show.startYear || 0,
        rating: show.averageRating || 0,
        poster: show.primaryImage || '',
        genres: processMovieGenres(show.genres),
        ageRating: show.contentRating || 'N/A',
      }));

      setTvShows(transformedTvShows.slice(0, 15));
    } catch (error) {
      console.error(error);
      setTvError('Failed to load TV shows');
    } finally {
      setTvLoading(false);
    }
  };

  const fetchMostPopularTvShows = async () => {
    try {
      setPopularTvLoading(true);
      const options = {
        method: 'GET',
        url: 'https://imdb236.p.rapidapi.com/api/imdb/most-popular-tv',
        headers: {
          'x-rapidapi-key': '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997',
          'x-rapidapi-host': 'imdb236.p.rapidapi.com'
        },
        timeout: 15000
      };

      const response = await axios.request(options);

      const transformedPopularTvShows = response.data.map((show: any) => ({
        id: show.id || '',
        title: show.primaryTitle || '',
        year: show.startYear || 0,
        rating: show.averageRating || 0,
        poster: show.primaryImage || '',
        genres: processMovieGenres(show.genres),
        ageRating: show.contentRating || 'N/A',
      }));

      setPopularTvShows(transformedPopularTvShows.slice(0, 15));
    } catch (error) {
      console.error(error);
      setPopularTvError('Failed to load popular TV shows');
    } finally {
      setPopularTvLoading(false);
    }
  };

  const handleTvShowPress = (tvShow: Movie) => {
    navigation.navigate('MovieDetails', { movieId: tvShow.id });
  };

  const handlePopularTvShowPress = (tvShow: Movie) => {
    navigation.navigate('MovieDetails', { movieId: tvShow.id });
  };

  const fetchTop250Movies = async () => {
    try {
      setTop250Loading(true);
      const options = {
        method: 'GET',
        url: 'https://imdb236.p.rapidapi.com/api/imdb/top250-movies',
        headers: {
          'x-rapidapi-key': '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997',
          'x-rapidapi-host': 'imdb236.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);

      const transformedTop250 = response.data.map((movie: any) => ({
        id: movie.id || '',
        title: movie.primaryTitle || '',
        year: movie.startYear || 0,
        rating: movie.averageRating || 0,
        poster: movie.primaryImage || '',
        genres: processMovieGenres(movie.genres),
        ageRating: movie.contentRating || 'N/A',
      }));

      setTop250Movies(transformedTop250.slice(0, 15));
    } catch (error) {
      console.error(error);
      setTop250Error('Failed to load Top 250 movies');
    } finally {
      setTop250Loading(false);
    }
  };

  const handleTop250MoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const handleShowAllTvShows = () => {
    navigation.navigate('Top250TvShows');
  };

  const handleShowAllPopularTvShows = () => {
    navigation.navigate('PopularTvShows');
  };

  const handleShowAllTop250Movies = () => {
    navigation.navigate('Top250Movies');
  };

  const fetchLowestRatedMovies = async () => {
    try {
      setLowestRatedLoading(true);
      const options = {
        method: 'GET',
        url: 'https://imdb236.p.rapidapi.com/api/imdb/lowest-rated-movies',
        headers: {
          'x-rapidapi-key': '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997',
          'x-rapidapi-host': 'imdb236.p.rapidapi.com'
        },
        timeout: 15000
      };

      const response = await axios.request(options);

      const transformedLowestRated = response.data.map((movie: any) => ({
        id: movie.id || '',
        title: movie.primaryTitle || '',
        year: movie.startYear || 0,
        rating: movie.averageRating || 0,
        poster: movie.primaryImage || '',
        genres: processMovieGenres(movie.genres),
        ageRating: movie.contentRating || 'N/A',
      }));

      setLowestRatedMovies(transformedLowestRated.slice(0, 15));
    } catch (error) {
      console.error(error);
      setLowestRatedError('Failed to load lowest rated movies');
    } finally {
      setLowestRatedLoading(false);
    }
  };

  const handleLowestRatedMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const handleShowAllLowestRatedMovies = () => {
    navigation.navigate('LowRatedMovies');
  };


  if (tvLoading && popularTvLoading && top250Loading && lowestRatedLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accentRed} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Top 250 Movies Section */}
          <View style={[styles.sectionHeader, styles.tvSectionHeader]}>
            <Text style={styles.sectionTitle}>Top 250 Movies</Text>
            <TouchableOpacity onPress={handleShowAllTop250Movies} style={styles.seeAllContainer}>
              <Text style={styles.seeAllText}>Show all</Text>
              <Image source={images.ARROW_RIGHT_WIDE_LINE} style={styles.arrowIcon} tintColor={theme.colors.accentRed} />
            </TouchableOpacity>
          </View>

          {(top250Loading || top250Retrying) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accentRed} />
            </View>
          ) : top250Error && !top250Retrying ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{top250Error}</Text>
            </View>
          ) : (
            <FlatList
              data={top250Movies}
              renderItem={({ item: movie }) => (
                <TouchableOpacity
                  style={styles.movieCard}
                  onPress={() => handleTop250MoviePress(movie)}
                >
                  <View style={styles.posterContainer}>
                    {movie.poster ? (
                      <Image
                        source={{
                          uri: movie.poster,
                          cache: 'force-cache'
                        }}
                        style={styles.poster}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.poster, styles.loadingPlaceholder]}>
                        <ActivityIndicator size="small" color={theme.colors.accentRed} />
                      </View>
                    )}
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>{movie.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                      {movie.title}
                    </Text>
                    <Text style={styles.genres}>
                      {movie.genres.join(', ')} • {movie.ageRating}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          )}

          {/* Top 250 TV Shows Section */}
          <View style={[styles.sectionHeader, styles.tvSectionHeader]}>
            <Text style={styles.sectionTitle}>Top 250 TV Shows</Text>
            <TouchableOpacity onPress={handleShowAllTvShows} style={styles.seeAllContainer}>
              <Text style={styles.seeAllText}>Show all</Text>
              <Image source={images.ARROW_RIGHT_WIDE_LINE} style={styles.arrowIcon} tintColor={theme.colors.accentRed} />
            </TouchableOpacity>
          </View>

          {tvLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accentRed} />
            </View>
          ) : tvError ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accentRed} />
            </View>
          ) : (
            <FlatList
              data={tvShows}
              renderItem={({ item: tvShow }) => (
                <TouchableOpacity
                  style={styles.movieCard}
                  onPress={() => handleTvShowPress(tvShow)}
                >
                  <View style={styles.posterContainer}>
                    {tvShow.poster ? (
                      <Image
                        source={{
                          uri: tvShow.poster,
                          cache: 'force-cache'
                        }}
                        style={styles.poster}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.poster, styles.loadingPlaceholder]}>
                        <ActivityIndicator size="small" color={theme.colors.accentRed} />
                      </View>
                    )}
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>{tvShow.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                      {tvShow.title}
                    </Text>
                    <Text style={styles.genres}>
                      {tvShow.genres.join(', ')} • {tvShow.ageRating}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          )}

          {/* Most Popular TV Shows Section */}
          <View style={[styles.sectionHeader, styles.tvSectionHeader]}>
            <Text style={styles.sectionTitle}>Most Popular TV Shows</Text>
            <TouchableOpacity onPress={handleShowAllPopularTvShows} style={styles.seeAllContainer}>
              <Text style={styles.seeAllText}>Show all</Text>
              <Image source={images.ARROW_RIGHT_WIDE_LINE} style={styles.arrowIcon} tintColor={theme.colors.accentRed} />
            </TouchableOpacity>
          </View>

          {popularTvLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accentRed} />
            </View>
          ) : popularTvError ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accentRed} />
            </View>
          ) : (
            <FlatList
              data={popularTvShows}
              renderItem={({ item: tvShow }) => (
                <TouchableOpacity
                  style={styles.movieCard}
                  onPress={() => handlePopularTvShowPress(tvShow)}
                >
                  <View style={styles.posterContainer}>
                    {tvShow.poster ? (
                      <Image
                        source={{
                          uri: tvShow.poster,
                          cache: 'force-cache'
                        }}
                        style={styles.poster}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.poster, styles.loadingPlaceholder]}>
                        <ActivityIndicator size="small" color={theme.colors.accentRed} />
                      </View>
                    )}
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>{tvShow.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                      {tvShow.title}
                    </Text>
                    <Text style={styles.genres}>
                      {tvShow.genres.join(', ')} • {tvShow.ageRating}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          )}

          {/* Lowest Rated Movies Section */}
          <View style={[styles.sectionHeader, styles.tvSectionHeader]}>
            <Text style={styles.sectionTitle}>Lowest Rated Movies</Text>
            <TouchableOpacity onPress={handleShowAllLowestRatedMovies} style={styles.seeAllContainer}>
              <Text style={styles.seeAllText}>Show all</Text>
              <Image source={images.ARROW_RIGHT_WIDE_LINE} style={styles.arrowIcon} tintColor={theme.colors.accentRed} />
            </TouchableOpacity>
          </View>

          {lowestRatedLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accentRed} />
            </View>
          ) : lowestRatedError ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accentRed} />
            </View>
          ) : (
            <FlatList
              data={lowestRatedMovies}
              renderItem={({ item: movie }) => (
                <TouchableOpacity
                  style={styles.movieCard}
                  onPress={() => handleLowestRatedMoviePress(movie)}
                >
                  <View style={styles.posterContainer}>
                    {movie.poster ? (
                      <Image
                        source={{
                          uri: movie.poster,
                          cache: 'force-cache'
                        }}
                        style={styles.poster}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.poster, styles.loadingPlaceholder]}>
                        <ActivityIndicator size="small" color={theme.colors.accentRed} />
                      </View>
                    )}
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>{movie.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                      {movie.title}
                    </Text>
                    <Text style={styles.genres}>
                      {movie.genres.join(', ')} • {movie.ageRating}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tvSectionHeader: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: theme.colors.accentRed,
    fontSize: theme.typography.sizes.md,
    marginRight: theme.spacing.xs,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  moviesContainer: {
    flexDirection: 'row',
  },
  movieCard: {
    width: cardWidth,
    marginRight: theme.spacing.sm,
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
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.accentRed,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 7,
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
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  genres: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.xs,
  },
  placeholder: {
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: theme.colors.lightGray,
  },
  loadingPlaceholder: {
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
  },
});