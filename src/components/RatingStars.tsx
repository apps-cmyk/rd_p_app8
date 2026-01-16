import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface RatingStarsProps {
    rating: number;
    showNumber?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    showNumber = true,
    size = 'medium',
}) => {
    const getSize = () => {
        switch (size) {
            case 'small':
                return { fontSize: 12, starSize: 12 };
            case 'large':
                return { fontSize: 18, starSize: 18 };
            default:
                return { fontSize: 14, starSize: 14 };
        }
    };

    const { fontSize, starSize } = getSize();

    return (
        <View style={styles.container}>
            <Text style={[styles.star, { fontSize: starSize }]}>⭐</Text>
            {showNumber && (
                <Text style={[styles.rating, { fontSize }]}>{rating.toFixed(1)}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        marginRight: theme.spacing.xs,
    },
    rating: {
        color: theme.colors.white,
        fontWeight: theme.typography.weights.semibold,
    },
});
