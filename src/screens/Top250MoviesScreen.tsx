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

import { theme } from '../theme';
import { MovieCard } from '../components';
import { useMovies } from '../hooks';
import { Movie } from '../types/movie';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../assets/images';
import { processMovieGenres } from '../utils/genres';

type Top250MoviesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Top250Movies'>;

interface Top250MoviesScreenProps {
    navigation: Top250MoviesScreenNavigationProp;
}

export const Top250MoviesScreen: React.FC<Top250MoviesScreenProps> = ({ navigation }) => {
    const { movies, loading, error, isRetrying } = useMovies('top250');

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
            <Text style={styles.headerTitle}>Top 250 Movies</Text>
            <View style={styles.placeholder} />
        </View>
    );

    if (loading || isRetrying) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.accentRed} />
                </View>
            </SafeAreaView>
        );
    }

    if (error && !isRetrying) {
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
    row: {
        justifyContent: 'space-between',
    },
    movieCardContainer: {
        width: '48%',
        marginBottom: theme.spacing.md,
    },
});
