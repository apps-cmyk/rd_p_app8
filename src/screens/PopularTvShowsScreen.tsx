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
import axios from 'axios';
import { theme } from '../theme';
import { MovieCard } from '../components';
import { Movie } from '../types/movie';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../assets/images';
import { processMovieGenres } from '../utils/genres';

type PopularTvShowsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PopularTvShows'>;

interface PopularTvShowsScreenProps {
    navigation: PopularTvShowsScreenNavigationProp;
}

export const PopularTvShowsScreen: React.FC<PopularTvShowsScreenProps> = ({ navigation }) => {
    const [tvShows, setTvShows] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPopularTvShows();
    }, []);

    const fetchPopularTvShows = async () => {
        try {
            setLoading(true);
            const options = {
                method: 'GET',
                url: 'https://imdb236.p.rapidapi.com/api/imdb/most-popular-tv',
                headers: {
                    'x-rapidapi-key': '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997',
                    'x-rapidapi-host': 'imdb236.p.rapidapi.com'
                }
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

            setTvShows(transformedTvShows);
        } catch (error) {
            console.error(error);
            setError('Failed to load popular TV shows');
        } finally {
            setLoading(false);
        }
    };

    const handleTvShowPress = (tvShow: Movie) => {
        navigation.navigate('MovieDetails', { movieId: tvShow.id });
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const renderTvShowCard = ({ item }: { item: Movie }) => (
        <View style={styles.movieCardContainer}>
            <MovieCard movie={item} onPress={() => handleTvShowPress(item)} />
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Image source={images.ARROW_LEFT} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Most Popular TV Shows</Text>
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
                data={tvShows}
                renderItem={renderTvShowCard}
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
    movieCardContainer: {
        width: '48%',
        marginBottom: theme.spacing.md,
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
});

