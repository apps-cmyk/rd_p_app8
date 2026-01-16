import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { TabParamList, RootStackParamList } from '../types/navigation';
import { Movie } from '../types/movie';
import { useSavedMoviesStore } from '../storage/store';
import { MovieCard } from '../components';
import { imdbApi } from '../services/imdbApi';

type FavoritesScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Favorites'>,
    StackNavigationProp<RootStackParamList>
>;

interface FavoritesScreenProps {
    navigation: FavoritesScreenNavigationProp;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
    const { savedMovies, _hasHydrated, updateMoviePoster } = useSavedMoviesStore();

    // Function to refresh poster URLs for all saved movies
    const refreshAllPosters = async () => {
        if (!_hasHydrated || savedMovies.length === 0) return;

        try {
            // Only refresh posters for movies that have empty or invalid poster URLs
            const moviesNeedingRefresh = savedMovies.filter(movie =>
                !movie.poster || movie.poster.trim() === ''
            );

            // Limit to 5 movies at a time to avoid overwhelming the API
            const moviesToRefresh = moviesNeedingRefresh.slice(0, 5);

            for (const movie of moviesToRefresh) {
                try {
                    const newPosterUrl = await imdbApi.getMoviePoster(movie.id);
                    if (newPosterUrl && newPosterUrl.trim() !== '') {
                        updateMoviePoster(movie.id, newPosterUrl);
                    }
                } catch (error) {
                    console.log(`Failed to refresh poster for movie ${movie.id}:`, error);
                }
            }
        } catch (error) {
            console.log('Failed to refresh posters:', error);
        }
    };

    // Refresh posters when the screen loads
    useEffect(() => {
        if (_hasHydrated && savedMovies.length > 0) {
            console.log('FavoritesScreen: Loaded saved movies:', savedMovies.map(m => ({
                title: m.title,
                poster: m.poster,
                hasPoster: !!(m.poster && m.poster.trim() !== '')
            })));
            refreshAllPosters();
        }
    }, [_hasHydrated, savedMovies.length]);

    const handleMoviePress = (movie: Movie) => {
        navigation.navigate('MovieDetails', { movieId: movie.id });
    };

    const handleSearchPress = () => {
        // Navigate to Search tab
        navigation.navigate('Search');
    };

    const renderMovieCard = ({ item }: { item: Movie }) => (
        <View style={styles.movieCardContainer}>
            <MovieCard movie={item} onPress={() => handleMoviePress(item)} />
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Saved Movies and TV Shows</Text>
        </View>
    );

    if (!_hasHydrated) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.accentRed} />
                    <Text style={styles.loadingText}>Loading saved movies...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (savedMovies.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No saved movies yet</Text>
                    <Text style={styles.emptySubtext}>Save movies to see them here</Text>
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
                        <Text style={styles.searchButtonText}>Search Movies</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'top']} style={styles.container}>
            {renderHeader()}
            <FlatList
                data={savedMovies}
                renderItem={renderMovieCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.moviesGrid}
                showsVerticalScrollIndicator={false}
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
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    headerTitle: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
    },
    moviesGrid: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.md,
        marginTop: theme.spacing.md,
    },
    row: {
        justifyContent: 'space-between',
    },
    movieCardContainer: {
        width: '48%',
        marginBottom: theme.spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    emptyText: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.medium,
        marginBottom: theme.spacing.sm,
    },
    emptySubtext: {
        color: theme.colors.lightGray,
        fontSize: theme.typography.sizes.md,
        textAlign: 'center',
    },
    searchButton: {
        backgroundColor: theme.colors.accentRed,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.lg,
    },
    searchButtonText: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.semibold,
        textAlign: 'center',
    },
});