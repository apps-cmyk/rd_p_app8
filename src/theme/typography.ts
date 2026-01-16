export const typography = {
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

    styles: {
        h1: {
            fontSize: 32,
            fontFamily: 'SF Pro Display',
            fontWeight: '700' as const,
        },
        h2: {
            fontSize: 24,
            fontFamily: 'SF Pro Display',
            fontWeight: '600' as const,
        },
        h3: {
            fontSize: 18,
            fontFamily: 'SF Pro Display',
            fontWeight: '600' as const,
        },
        body: {
            fontSize: 16,
            fontFamily: 'SF Pro Text',
            fontWeight: '400' as const,
        },
        caption: {
            fontSize: 14,
            fontFamily: 'SF Pro Text',
            fontWeight: '400' as const,
        },
        small: {
            fontSize: 12,
            fontFamily: 'SF Pro Text',
            fontWeight: '400' as const,
        },
    },
};
