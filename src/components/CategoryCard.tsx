import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { theme } from '../theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface CategoryCardProps {
    title: string;
    count: number;
    onPress: () => void;
    icon?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    title,
    count,
    onPress,
    icon,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.iconContainer}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.count}>{count} фильмов</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        backgroundColor: theme.colors.gray,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: theme.colors.darkGray,
        borderRadius: theme.borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    icon: {
        fontSize: 24,
    },
    title: {
        color: theme.colors.white,
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.semibold,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    count: {
        color: theme.colors.lightGray,
        fontSize: theme.typography.sizes.sm,
    },
});
