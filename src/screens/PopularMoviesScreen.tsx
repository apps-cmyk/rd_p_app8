import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { apiRequest } from '../services/apiClient';
import { theme } from '../theme';
import { MovieCard } from '../components';
import { Movie } from '../types/movie';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../assets/images';
import { processMovieGenres } from '../utils/genres';

type PopularMoviesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PopularMovies'>;

interface PopularMoviesScreenProps {
    navigation: PopularMoviesScreenNavigationProp;
}

export const PopularMoviesScreen: React.FC<PopularMoviesScreenProps> = ({ navigation }) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPopularMovies();
    }, []);

    const fetchPopularMovies = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('https://imdb236.p.rapidapi.com/api/imdb/most-popular-movies');

            const transformedMovies = data.map((movie: any) => ({
                id: movie.id || '',
                title: movie.primaryTitle || '',
                year: movie.startYear || 0,
                rating: movie.averageRating || 0,
                poster: movie.primaryImage || '',
                genres: processMovieGenres(movie.genres),
                ageRating: movie.contentRating || 'N/A',
            }));

            setMovies(transformedMovies);
        } catch (error) {
            console.error(error);
            setError('Failed to load popular movies');
        } finally {
            setLoading(false);
        }
    };

    const handleMoviePress = (movie: Movie) => {
        navigation.navigate('MovieDetails', { movieId: movie.id });
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const renderMovieCard = ({ item }: { item: Movie }) => (
        <View style={styles.movieCardContainer}>
            <MovieCard movie={item} onPress={() => handleMoviePress(item)} />
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Image source={images.ARROW_LEFT} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Most Popular Movies</Text>
            <View style={styles.placeholder} />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.accentRed} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'top']} style={styles.container}>
            {renderHeader()}
            <FlatList
                data={movies}
                renderItem={renderMovieCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.moviesGrid}
                showsVerticalScrollIndicator={false}
                initialNumToRender={8}
                maxToRenderPerBatch={4}
                windowSize={8}
                removeClippedSubviews={false}
            />
        </SafeAreaView>
    );
};

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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: theme.colors.white,
    },
    headerTitle: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
    },
    placeholder: {
        width: 40,
    },
    moviesGrid: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
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
        padding: theme.spacing.lg,
    },
    errorText: {
        color: theme.colors.accentRed,
        fontSize: theme.typography.sizes.md,
        textAlign: 'center',
    },
    movieCardContainer: {
        width: '48%',
        marginBottom: theme.spacing.md,
    },
});
