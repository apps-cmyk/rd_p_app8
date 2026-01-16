import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import axios from 'axios';
import { theme } from '../theme';
import { useMovieDetails } from '../hooks';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../../assets/images';
import { Movie } from '../types/movie';
import { processMovieGenres } from '../utils/genres';
import { useSavedMoviesStore } from '../storage/store';

const { width, height } = Dimensions.get('window');

type MovieDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MovieDetails'>;
type MovieDetailsScreenProps = StackScreenProps<RootStackParamList, 'MovieDetails'>;

export const MovieDetailsScreen: React.FC<MovieDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets()
  const { movie, loading, error, isRetrying } = useMovieDetails(route.params.movieId);
  const { isMovieSaved, toggleMovie } = useSavedMoviesStore();
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);
  const [similarPosterErrors, setSimilarPosterErrors] = useState<Set<string>>(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(false);
  const [navBarVisible, setNavBarVisible] = useState(true);
  const navBarLayout = useRef({ y: 0, height: 0 });

  const handleBookmarkPress = () => {
    if (movie) {
      toggleMovie(movie);
    }
  };

  const handleSimilarMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    const navBarBottom = navBarLayout.current.y + navBarLayout.current.height;
    const isOriginalNavVisible = currentScrollY < navBarBottom;

    if (!isOriginalNavVisible && navBarVisible) {
      setNavBarVisible(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (isOriginalNavVisible && !navBarVisible) {
      setNavBarVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  const fetchSimilarMovies = async (movieId: string) => {
    try {
      setSimilarLoading(true);
      const options = {
        method: 'GET',
        url: `https://imdb236.p.rapidapi.com/api/imdb/${movieId}/similar`,
        headers: {
          'x-rapidapi-key': '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997',
          'x-rapidapi-host': 'imdb236.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);

      const transformedMovies = response.data.map((movie: any) => ({
        id: movie.id || '',
        title: movie.primaryTitle || '',
        year: movie.startYear || 0,
        rating: movie.averageRating || 0,
        poster: movie.primaryImage || '',
        genres: processMovieGenres(movie.genres),
        ageRating: movie.contentRating || 'N/A',
      }));

      setSimilarMovies(transformedMovies.slice(0, 10));
      setSimilarPosterErrors(new Set());
    } catch (error) {
      console.error('Error fetching similar movies:', error);
    } finally {
      setSimilarLoading(false);
    }
  };

  React.useEffect(() => {
    if (movie) {
      setHeroImageError(false);
      setSimilarPosterErrors(new Set());
      fetchSimilarMovies(movie.id);
    }
  }, [movie]);

  if (loading || isRetrying) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accentRed} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading movie</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Анимированная навигационная панель */}
      <Animated.View
        style={[
          styles.animatedNavBar,
          {
            paddingTop: insets.top,
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              })
            }]
          }
        ]}
      >
        <BlurView
          style={styles.animatedBlurBackground}
          blurType="dark"
          blurAmount={5}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
        />
        <View style={styles.blurContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
            <BlurView
              style={styles.buttonBlur}
              blurType="dark"
              blurAmount={5}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
            />
            <View style={styles.buttonContent}>
              <Image source={images.ARROW_LEFT} style={styles.navIcon} tintColor={theme.colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBookmarkPress} style={styles.bookmarkButton}>
            <BlurView
              style={styles.buttonBlur}
              blurType="dark"
              blurAmount={5}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
            />
            <View style={styles.buttonContent}>
              <Image
                source={movie && isMovieSaved(movie.id) ? images.BOOKMARK_FILLED : images.BOOKMARK_EMPTY}
                style={styles.bookmarkIcon}
                tintColor={movie && isMovieSaved(movie.id) ? theme.colors.accentRed : theme.colors.white}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        bounces={false}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        {movie.poster && !heroImageError ? (
          <Image
            resizeMode='cover'
            source={{ uri: movie.poster }}
            style={styles.heroImage}
            onError={() => {
              setHeroImageError(true);
            }}
          />
        ) : (
          <Image
            resizeMode='cover'
            source={images.NO_POSTER}
            style={styles.heroImage}
          />
        )}

        {/* Navigation Bar */}
        <SafeAreaView
          edges={['left', 'right']}
          style={[styles.navigationBar, { paddingTop: insets.top }]}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            navBarLayout.current = { y, height };
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
            <BlurView
              style={styles.buttonBlur}
              blurType="dark"
              blurAmount={5}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
            />
            <View style={styles.buttonContent}>
              <Image source={images.ARROW_LEFT} style={styles.navIcon} tintColor={theme.colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBookmarkPress} style={styles.bookmarkButton}>
            <BlurView
              style={styles.buttonBlur}
              blurType="dark"
              blurAmount={5}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
            />
            <View style={styles.buttonContent}>
              <Image
                source={movie && isMovieSaved(movie.id) ? images.BOOKMARK_FILLED : images.BOOKMARK_EMPTY}
                style={styles.bookmarkIcon}
                tintColor={movie && isMovieSaved(movie.id) ? theme.colors.accentRed : theme.colors.white}
              />
            </View>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)', theme.colors.black]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />
        {/* Title */}
        <Text style={styles.title}>{movie.title}</Text>

        {/* Metadata Row 1 */}
        <View style={styles.metadataRow}>
          <View style={styles.ratingContainer}>
            <Image source={images.STAR} style={styles.starIcon} tintColor="#FFD700" />
            <Text style={styles.rating}>{movie.rating}</Text>
          </View>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.genres}>{movie.genres.join(', ')}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.ageRating}>{movie.ageRating}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{movie.country}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{movie.year}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{movie.language}</Text>
          </View>
          {movie.duration && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{movie.duration}</Text>
            </View>
          )}
        </View>

        {/* Synopsis */}
        <Text style={styles.synopsis}>{movie.plot}</Text>

        {/* Similar Titles Section */}
        {similarMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Titles</Text>
            <FlatList
              data={similarMovies}
              renderItem={({ item: similarMovie }) => (
                <TouchableOpacity
                  style={styles.similarMovieCard}
                  onPress={() => handleSimilarMoviePress(similarMovie)}
                >
                  <View style={styles.similarPosterContainer}>
                    {(() => {
                      const hasPoster = similarMovie.poster && similarMovie.poster.trim() !== '';
                      const hasError = similarPosterErrors.has(similarMovie.id);

                      if (hasPoster && !hasError) {
                        return (
                          <Image
                            source={{
                              uri: similarMovie.poster,
                              cache: 'force-cache'
                            }}
                            style={styles.similarPoster}
                            resizeMode="cover"
                            onError={() => {
                              setSimilarPosterErrors(prev => new Set(prev).add(similarMovie.id));
                            }}
                          />
                        );
                      } else {
                        return (
                          <Image
                            source={images.NO_POSTER}
                            style={styles.similarPoster}
                            resizeMode="cover"
                          />
                        );
                      }
                    })()}
                    <View style={styles.similarRatingContainer}>
                      <Text style={styles.similarRating}>{similarMovie.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <Text style={styles.similarTitle} numberOfLines={2}>
                    {similarMovie.title}
                  </Text>
                  <Text style={styles.similarGenres} numberOfLines={1}>
                    {similarMovie.genres.join(', ')}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          </View>
        )}

        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <FlatList
              data={movie.cast.slice(0, 10)}
              renderItem={({ item: person, index }) => (
                <View style={styles.personCard}>
                  {person.photo ? (
                    <Image
                      source={{
                        uri: person.photo,
                        cache: 'force-cache'
                      }}
                      style={styles.personImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image source={images.NO_AVATAR} style={styles.personImage} />
                  )}
                  <Text style={styles.personName} numberOfLines={1}>{person.name}</Text>
                  <Text style={styles.personRole} numberOfLines={1}>{person.character || 'Actor'}</Text>
                </View>
              )}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          </View>
        )}

        {/* Directors Section */}
        {movie.directors && movie.directors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Directors</Text>
            <FlatList
              data={movie.directors}
              renderItem={({ item: director, index }) => (
                <View style={styles.personCard}>
                  {director.photo ? (
                    <Image
                      source={{
                        uri: director.photo,
                        cache: 'force-cache'
                      }}
                      style={styles.personImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image source={images.NO_AVATAR} style={styles.personImage} />
                  )}
                  <Text style={styles.personName} numberOfLines={1}>{director.name}</Text>
                  <Text style={styles.personRole} numberOfLines={1}>Director</Text>
                </View>
              )}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          </View>
        )}

        {/* Writers Section */}
        {movie.writers && movie.writers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Writers</Text>
            <FlatList
              data={movie.writers.slice(0, 5)}
              renderItem={({ item: writer, index }) => (
                <View style={styles.personCard}>
                  {writer.photo ? (
                    <Image
                      source={{
                        uri: writer.photo,
                        cache: 'force-cache'
                      }}
                      style={styles.personImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image source={images.NO_AVATAR} style={styles.personImage} />
                  )}
                  <Text style={styles.personName} numberOfLines={1}>{writer.name}</Text>
                  <Text style={styles.personRole} numberOfLines={1}>Writer</Text>
                </View>
              )}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          </View>
        )}

        {/* Crew Section */}
        {movie.crew && movie.crew.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crew</Text>
            <FlatList
              data={movie.crew.slice(0, 10)}
              renderItem={({ item: person, index }) => (
                <View style={styles.personCard}>
                  {person.photo ? (
                    <Image
                      source={{
                        uri: person.photo,
                        cache: 'force-cache'
                      }}
                      style={styles.personImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image source={images.NO_AVATAR} style={styles.personImage} />
                  )}
                  <Text style={styles.personName} numberOfLines={1}>{person.name}</Text>
                  <Text style={styles.personRole} numberOfLines={1}>{person.character || 'Crew'}</Text>
                </View>
              )}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
            />
          </View>
        )}


      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.accentRed,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.accentRed,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  heroImage: {
    width: width,
    height: height * 0.7,
  },
  gradient: {
    height: 80,
    marginTop: -80,
  },
  navigationBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    zIndex: 1,
  },
  animatedNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  animatedBlurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    position: 'relative',
    zIndex: 1,
  },
  scrollView: {
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  buttonBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  buttonContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 20,
    height: 20,
  },
  content: {
    backgroundColor: theme.colors.black,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.white,
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  rating: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  separator: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.md,
    marginHorizontal: theme.spacing.sm,
  },
  genres: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
  },
  ageRating: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bookmarkIcon: {
    width: 18,
    height: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.accentRed,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 7,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  synopsis: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    lineHeight: 24,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingRight: theme.spacing.md,
  },
  personCard: {
    width: 80,
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  personImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.gray,
    marginBottom: theme.spacing.xs,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: theme.colors.lightGray,
  },
  personName: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
    marginBottom: 2,
  },
  personRole: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: theme.colors.gray,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
  },
  detailValue: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  similarMovieCard: {
    width: 120,
    marginRight: theme.spacing.md,
  },
  similarPosterContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  similarPoster: {
    width: '100%',
    height: 160,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray,
  },
  similarRatingContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.accentRed,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 7,
  },
  similarRating: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  similarTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  similarGenres: {
    color: theme.colors.lightGray,
    fontSize: theme.typography.sizes.xs,
  },
});