import React, { useCallback, useMemo, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    Dimensions,
    Animated,
    ScrollView,
    Easing,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { MovieCard } from '../components';
import { useMovies } from '../hooks';
import { Movie } from '../types/movie';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../assets/images';
import { useSavedMoviesStore } from '../storage/store';

const { width, height } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TabNavigator'>;

const MovieSlider = memo(({
    movies,
    onMoviePress
}: {
    movies: Movie[];
    onMoviePress: (movie: Movie) => void;
}) => {

    const [currentSlide, setCurrentSlide] = React.useState(0);
    const scrollViewRef = React.useRef<ScrollView | null>(null);
    const slideAnimation = React.useRef(new Animated.Value(0)).current;
    const paginationAnimation = React.useRef(new Animated.Value(8)).current;

    if (!movies || movies.length === 0) {
        return null;
    }

    const sliderMovies = useMemo(() => movies.slice(0, 5), [movies]);

    React.useEffect(() => {
        if (sliderMovies.length >= 5) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => {
                    const nextSlide = (prev + 1) % 5;
                    const nextMovie = sliderMovies[nextSlide];
                    if (nextMovie && nextMovie.poster) {
                        Image.prefetch(nextMovie.poster);
                    }
                    return nextSlide;
                });
            }, 15000);

            return () => clearInterval(interval);
        }
    }, [sliderMovies]);

    React.useEffect(() => {
        if (scrollViewRef.current) {
            Animated.timing(slideAnimation, {
                toValue: currentSlide * width,
                duration: 3000,
                useNativeDriver: true,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }).start();

            scrollViewRef.current.scrollTo({
                x: currentSlide * width,
                animated: true,
            });
        }

        Animated.sequence([
            Animated.timing(paginationAnimation, {
                toValue: 8,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(paginationAnimation, {
                toValue: 24,
                duration: 300,
                useNativeDriver: false,
            })
        ]).start();
    }, [currentSlide, slideAnimation]);

    React.useEffect(() => {
        sliderMovies.forEach((movie, index) => {
            if (movie.poster) {
                Image.prefetch(movie.poster).then(() => {
                }).catch((error) => {
                });
            }
        });
    }, [sliderMovies]);

    const handleSlideChange = useCallback((index: number) => {
        setCurrentSlide(index);

        const nextIndex = (index + 1) % 5;
        const nextMovie = sliderMovies[nextIndex];
        if (nextMovie && nextMovie.poster) {
            Image.prefetch(nextMovie.poster);
        }
    }, [sliderMovies]);

    return (
        <View style={styles.sliderContainer}>
            <ScrollView
                bounces={false}
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                style={styles.sliderScrollView}
            >
                {sliderMovies.map((movie) => (
                    <TouchableOpacity
                        key={movie.id}
                        style={styles.sliderItem}
                        onPress={() => onMoviePress(movie)}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: movie.poster }}
                                style={styles.sliderImage}
                                resizeMode="cover"
                                fadeDuration={0}
                                defaultSource={images.PLACEHOLDER}
                            />
                        </View>
                        <View style={styles.sliderOverlay}>
                            <BlurView
                                style={styles.blurBackground}
                                blurType="dark"
                                blurAmount={5}
                                reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.7)"
                            />
                            <View style={styles.sliderContent}>
                                <Text style={styles.sliderTitle}>{movie.title}</Text>
                                <View style={styles.sliderMetadata}>
                                    <Text style={styles.sliderGenres}>{movie.genres.join(', ')}</Text>
                                    <Text style={styles.sliderYear}>• {movie.year}</Text>
                                </View>
                                <Text style={styles.sliderPlot} numberOfLines={3}>{movie.plot}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Pagination dots */}
            <View style={styles.paginationContainer}>
                {sliderMovies.map((_, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === currentSlide && {
                                ...styles.paginationDotActive,
                                width: paginationAnimation,
                            }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
});

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = memo(({ navigation }) => {
    const { movies: popularMovies, loading: popularLoading, error: popularError, isRetrying: popularRetrying } = useMovies('popular');
    const { movies: boxOfficeMovies, loading: boxOfficeLoading, error: boxOfficeError, isRetrying: boxOfficeRetrying } = useMovies('boxOffice');


    React.useEffect(() => {
    }, [boxOfficeMovies, boxOfficeLoading, boxOfficeError]);

    const handleMoviePress = useCallback((movie: Movie) => {
        navigation.navigate('MovieDetails', { movieId: movie.id });
    }, [navigation]);

    const handleShowAllPopular = useCallback(() => {
        navigation.navigate('PopularMovies');
    }, [navigation]);


    const renderMovieCard = useCallback(({ item }: { item: Movie }) => (
        <MovieCard
            movie={item}
            onPress={() => handleMoviePress(item)}
            showBookmark={true}
        />
    ), [handleMoviePress]);

    const renderSlider = () => {
        if (boxOfficeLoading || boxOfficeRetrying) {
            return (
                <View style={styles.sliderContainer}>
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={theme.colors.accentRed} />
                    </View>
                </View>
            );
        }

        if (boxOfficeError || !boxOfficeMovies || boxOfficeMovies.length === 0) {
            return null;
        }

        return (
            <MovieSlider
                movies={boxOfficeMovies}
                onMoviePress={handleMoviePress}
            />
        );
    };

    const renderSection = useCallback((title: string, movies: Movie[], loading: boolean, error?: string | null, isRetrying?: boolean, onShowAll?: () => void) => {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {!loading && !isRetrying && movies.length > 0 && (
                        <TouchableOpacity onPress={onShowAll} style={styles.seeAllContainer}>
                            <Text style={styles.seeAllText}>Show all</Text>
                            <Image source={images.ARROW_RIGHT_WIDE_LINE} style={styles.arrowIcon} tintColor={theme.colors.accentRed} />
                        </TouchableOpacity>
                    )}
                </View>

                {(loading || isRetrying) ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.accentRed} />
                    </View>
                ) : error && !isRetrying ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.errorText}>Error: {error}</Text>
                    </View>
                ) : (
                    movies && Array.isArray(movies) && movies.length > 0 ? (
                        <FlatList
                            data={movies.slice(0, 10)}
                            renderItem={({ item: movie }) => (
                                <View style={styles.movieItem}>
                                    <MovieCard movie={movie} onPress={() => handleMoviePress(movie)} />
                                </View>
                            )}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.row}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={6}
                            windowSize={10}
                            initialNumToRender={6}
                        />
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.errorText}>Нет фильмов для отображения</Text>
                        </View>
                    )
                )}
            </View>
        );
    }, [handleMoviePress]);


    const renderContent = useCallback(() => (
        <View style={styles.content}>
            {/* Welcome Header */}
            <View style={styles.welcomeContainer}>
                <Image source={images.BANNER} style={styles.bannerImage} />
            </View>

            {/* Box Office Slider */}
            {renderSlider()}

            {/* Popular Movies */}
            {renderSection('Most Popular Movies', popularMovies, popularLoading, popularError, popularRetrying, handleShowAllPopular)}
        </View>
    ), [boxOfficeLoading, boxOfficeError, boxOfficeMovies, boxOfficeRetrying, handleMoviePress, renderSection, popularMovies, popularLoading, popularError, popularRetrying, handleShowAllPopular]);

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <FlatList
                bounces={false}
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={renderContent}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
            />
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.black,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    headerTitle: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
    },
    searchButton: {
        backgroundColor: theme.colors.gray,
        borderRadius: theme.borderRadius.full,
        padding: theme.spacing.sm,
    },
    searchIcon: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.lg,
    },
    content: {
        paddingHorizontal: theme.spacing.md,
    },
    scrollView: {
        flex: 1,
    },
    welcomeContainer: {
        marginTop: theme.spacing.md,
        marginBottom: 0,
        alignItems: 'center',
    },
    bannerImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    moviesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    movieItem: {
        width: '48%',
        marginBottom: theme.spacing.md,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        marginBottom: theme.spacing.lg,
    },
    heroTitle: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.xxxl,
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    heroSubtitle: {
        color: theme.colors.lightGray,
        fontSize: theme.typography.sizes.lg,
        textAlign: 'center',
    },
    section: {
        marginBottom: theme.spacing.xs,
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
    row: {
        justifyContent: 'space-between',
    },
    loadingContainer: {
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
    },
    errorText: {
        color: theme.colors.accentRed,
        fontSize: theme.typography.sizes.md,
        textAlign: 'center',
    },
    sliderContainer: {
        height: height * 0.48,
        marginTop: 0,
        marginBottom: theme.spacing.lg,
        position: 'relative',
        marginHorizontal: -theme.spacing.md,
        overflow: 'hidden',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderScrollView: {
        flex: 1,
    },
    sliderItem: {
        width: width,
        height: '100%',
        position: 'relative',
    },
    imageContainer: {
        flex: 1,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    sliderImage: {
        width: '100%',
        height: '100%',
    },
    sliderOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    blurBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    sliderContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        zIndex: 1,
    },
    sliderTitle: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        marginBottom: theme.spacing.sm,
    },
    sliderMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sliderGenres: {
        color: theme.colors.lightGray,
        fontSize: theme.typography.sizes.md,
    },
    sliderYear: {
        color: theme.colors.lightGray,
        fontSize: theme.typography.sizes.md,
    },
    sliderPlot: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.md,
        lineHeight: 22,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: theme.spacing.md,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: theme.colors.accentRed,
    },
});