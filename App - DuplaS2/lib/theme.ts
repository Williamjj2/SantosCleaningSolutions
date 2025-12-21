// DuplaS2 Design System - Theme Configuration
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color Palette
export const colors = {
    // Background
    background: {
        primary: '#0A0E17',
        secondary: '#0F1419',
        tertiary: '#151B25',
    },

    // Brand
    brand: {
        primary: '#10B981',
        secondary: '#059669',
        accent: '#34D399',
        glow: 'rgba(16, 185, 129, 0.4)',
    },

    // Text
    text: {
        primary: '#FFFFFF',
        secondary: '#9CA3AF',
        tertiary: '#6B7280',
        muted: '#4B5563',
    },

    // Status
    status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#FB7185',
        info: '#3B82F6',
    },

    // Glass
    glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        highlight: 'rgba(255, 255, 255, 0.15)',
    },

    // Gradients
    gradients: {
        primary: ['#10B981', '#059669'] as const,
        accent: ['#8B5CF6', '#6366F1'] as const,
        warm: ['#F59E0B', '#EF4444'] as const,
        cool: ['#3B82F6', '#8B5CF6'] as const,
    },
};

// Typography
export const typography = {
    sizes: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        '2xl': 20,
        '3xl': 24,
        '4xl': 32,
        '5xl': 40,
        '6xl': 48,
    },
    weights: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

// Border Radius
export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
};

// Shadows (for elevated elements)
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
};

// Screen dimensions
export const screen = {
    width,
    height,
    isSmall: width < 375,
    isMedium: width >= 375 && width < 414,
    isLarge: width >= 414,
};

// Glass card preset
export const glassStyle = {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius['2xl'],
    overflow: 'hidden' as const,
};
