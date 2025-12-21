import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../lib/theme';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

type AvatarProps = {
    url?: string | null;
    name?: string | null;
    size?: AvatarSize;
};

const sizeMap: Record<AvatarSize, number> = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
};

const fontSizeMap: Record<AvatarSize, number> = {
    small: 14,
    medium: 18,
    large: 24,
    xlarge: 36,
};

export default function Avatar({ url, name, size = 'medium' }: AvatarProps) {
    const dimension = sizeMap[size];
    const fontSize = fontSizeMap[size];

    // Generate initials from name
    const getInitials = (fullName?: string | null): string => {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = getInitials(name);

    // Generate a consistent color based on the name
    const getColorFromName = (fullName?: string | null): string => {
        if (!fullName) return colors.brand.primary;

        const colors_palette = [
            '#10B981', // green
            '#3B82F6', // blue
            '#8B5CF6', // purple
            '#F59E0B', // orange
            '#EC4899', // pink
            '#14B8A6', // teal
        ];

        const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors_palette[hash % colors_palette.length];
    };

    const backgroundColor = getColorFromName(name);

    if (url) {
        return (
            <View style={[styles.container, { width: dimension, height: dimension }]}>
                <Image
                    source={{ uri: url }}
                    style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
                />
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                styles.placeholder,
                {
                    width: dimension,
                    height: dimension,
                    borderRadius: dimension / 2,
                    backgroundColor: `${backgroundColor}25`,
                    borderColor: backgroundColor,
                },
            ]}
        >
            <Text style={[styles.initials, { fontSize, color: backgroundColor }]}>
                {initials}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        resizeMode: 'cover',
    },
    placeholder: {
        borderWidth: 2,
    },
    initials: {
        fontWeight: typography.weights.bold,
    },
});
