import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import { theme } from '../theme';
import { images } from '../../assets/images';
import { useSavedMoviesStore } from '../storage/store';
import { imdbApi } from '../services/imdbApi';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

import { Movie } from '../types/movie';

interface MovieCardProps {
    movie: Movie;
    onPress: () => void;
    showBookmark?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress, showBookmark = false }) => {
    const { isMovieSaved, toggleMovie, updateMoviePoster } = useSavedMoviesStore();
    const [imageError, setImageError] = useState(false);
    const [isRefreshingPoster, setIsRefreshingPoster] = useState(false);
    const spinValue = useRef(new Animated.Value(0)).current;

    // Use movie.poster directly, but track if we've tried to refresh it
    const [hasTriedRefresh, setHasTriedRefresh] = useState(false);
    const posterUri = movie.poster && movie.poster.trim() !== '' ? movie.poster : null;

    // Reset refresh state when movie changes
    useEffect(() => {
        setHasTriedRefresh(false);
        setImageError(false);
    }, [movie.id]);

    // Debug logging
    useEffect(() => {
        console.log(`MovieCard for ${movie.title}:`, {
            hasPoster: !!(movie.poster && movie.poster.trim() !== ''),
            posterUrl: movie.poster,
            imageError,
            isRefreshingPoster,
            hasTriedRefresh
        });
    }, [movie.poster, imageError, isRefreshingPoster, hasTriedRefresh]);

    // Function to refresh poster URL from API
    const refreshPosterUrl = async () => {
        if (isRefreshingPoster || !movie.id || hasTriedRefresh) {
            return;
        }

        try {
            setIsRefreshingPoster(true);
            setHasTriedRefresh(true);
            console.log(`Refreshing poster for movie: ${movie.title} (${movie.id})`);
            const newPosterUrl = await imdbApi.getMoviePoster(movie.id);
            console.log(`New poster URL for ${movie.title}:`, newPosterUrl);
            if (newPosterUrl && newPosterUrl.trim() !== '') {
                setImageError(false);
                // Update the poster URL in the saved movies store
                updateMoviePoster(movie.id, newPosterUrl);
                console.log(`Successfully updated poster for ${movie.title}`);
            }
        } catch (error) {
            console.log(`Failed to refresh poster URL for ${movie.title}:`, error);
        } finally {
            setIsRefreshingPoster(false);
        }
    };

    // Animation for loading spinner (only when refreshing poster)
    useEffect(() => {
        if (isRefreshingPoster) {
            const spin = Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            spin.start();
            return () => spin.stop();
        }
    }, [isRefreshingPoster, spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.posterContainer}>
                {posterUri && !imageError ? (
                    <Image
                        source={{
                            uri: posterUri,
                            cache: 'force-cache'
                        }}
                        style={styles.poster}
                        onLoad={() => {
                            // Image loaded successfully
                        }}
                        onError={() => {
                            console.log(`Image load error for ${movie.title}, poster URL:`, movie.poster);
                            // Try to refresh poster URL once before showing error
                            if (!imageError && !isRefreshingPoster && !hasTriedRefresh) {
                                refreshPosterUrl();
                            } else {
                                setImageError(true);
                            }
                        }}
                        resizeMode="cover"
                    />
                ) : (
                    <Image source={images.NO_POSTER} style={styles.poster} />
                )}
                {isRefreshingPoster && posterUri && !imageError && (
                    <View style={styles.loadingOverlay}>
                        <Animated.View style={[styles.loadingIndicator, { transform: [{ rotate: spin }] }]} />
                    </View>
                )}
                {showBookmark && (
                    <TouchableOpacity
                        style={styles.bookmarkButton}
                        onPress={() => toggleMovie(movie)}
                    >
                        <Image
                            source={isMovieSaved(movie.id) ? images.BOOKMARK_FILLED : images.BOOKMARK_EMPTY}
                            style={styles.bookmarkIcon}
                            tintColor={isMovieSaved(movie.id) ? theme.colors.accentRed : theme.colors.white}
                        />
                    </TouchableOpacity>
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
    );
};

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        marginBottom: theme.spacing.md,
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
    bookmarkButton: {
        position: 'absolute',
        top: theme.spacing.sm,
        left: theme.spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookmarkIcon: {
        width: 16,
        height: 16,
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
    placeholder: {
        backgroundColor: theme.colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 32,
        color: theme.colors.lightGray,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
    },
    loadingIndicator: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: theme.colors.lightGray,
        borderTopColor: theme.colors.accentRed,
        borderRadius: 10,
        // Note: Animation would need to be added separately
    },
});
