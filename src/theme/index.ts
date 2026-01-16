export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';

export const theme = {
    colors: {
        black: '#000000',
        gray: '#2C2C2E',
        white: '#FFFFFF',
        accentRed: '#E10101',

        darkGray: '#1C1C1E',
        lightGray: '#8E8E93',
        yellow: '#FFD700',
        asphalt: '#2F2F2F',
        darkAsphalt: '#1A1A1A',
        lighterBlack: '#0A0A0A',

        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',

        overlay: 'rgba(0, 0, 0, 0.7)',
        cardBackground: 'rgba(44, 44, 46, 0.8)',
    },

    typography: {
        sizes: {
            xs: 11,
            sm: 12,
            md: 14,
            lg: 16,
            xl: 18,
            xxl: 24,
            xxxl: 32,
            huge: 48,
        },

        families: {
            heading: 'SF Pro Display',
            body: 'SF Pro Text',
        },

        weights: {
            light: '300' as const,
            regular: '400' as const,
            medium: '500' as const,
            semibold: '600' as const,
            bold: '700' as const,
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },
};
