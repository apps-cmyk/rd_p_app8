import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
}) => {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startShimmer = () => {
            Animated.sequence([
                Animated.timing(shimmerAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start(() => startShimmer());
        };

        startShimmer();
    }, []);

    const shimmerTranslateX = shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 100],
    });

    return (
        <View style={[styles.container, { width, height, borderRadius }, style]}>
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX: shimmerTranslateX }],
                    },
                ]}
            />
        </View>
    );
};

export const MovieCardSkeleton: React.FC = () => {
    return (
        <View style={styles.movieCardContainer}>
            <SkeletonLoader
                width={150}
                height={225}
                borderRadius={12}
                style={styles.posterSkeleton}
            />
            <View style={styles.movieInfoContainer}>
                <SkeletonLoader width="90%" height={16} style={styles.titleSkeleton} />
                <SkeletonLoader width="60%" height={14} style={styles.yearSkeleton} />
                <SkeletonLoader width="40%" height={12} style={styles.ratingSkeleton} />
            </View>
        </View>
    );
};

export const MovieListSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => {
    return (
        <View style={styles.movieListContainer}>
            {Array.from({ length: count }).map((_, index) => (
                <MovieCardSkeleton key={index} />
            ))}
        </View>
    );
};

export const SearchResultSkeleton: React.FC = () => {
    return (
        <View style={styles.searchResultContainer}>
            <SkeletonLoader width={60} height={60} borderRadius={8} style={styles.searchPoster} />
            <View style={styles.searchInfoContainer}>
                <SkeletonLoader width="80%" height={16} style={styles.searchTitle} />
                <SkeletonLoader width="50%" height={14} style={styles.searchYear} />
                <SkeletonLoader width="70%" height={12} style={styles.searchGenre} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.lightGray,
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: '100%',
    },

    movieCardContainer: {
        marginBottom: spacing.md,
        marginRight: spacing.sm,
    },
    posterSkeleton: {
        marginBottom: spacing.sm,
    },
    movieInfoContainer: {
        paddingHorizontal: spacing.xs,
    },
    titleSkeleton: {
        marginBottom: spacing.xs,
    },
    yearSkeleton: {
        marginBottom: spacing.xs,
    },
    ratingSkeleton: {},

    movieListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
    },

    searchResultContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    searchPoster: {
        marginRight: spacing.md,
    },
    searchInfoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    searchTitle: {
        marginBottom: spacing.xs,
    },
    searchYear: {
        marginBottom: spacing.xs,
    },
    searchGenre: {},
});
