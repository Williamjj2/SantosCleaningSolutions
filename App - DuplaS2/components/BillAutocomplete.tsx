import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, radius, glassStyle } from '../lib/theme';
import { BillCategory } from '../lib/billTypes';
import BrandLogo from './BrandLogo';

type Suggestion = {
    name: string;
    category: BillCategory;
    brandKey?: string;
};

const COMMON_BILLS: Suggestion[] = [
    // Streaming
    { name: 'Netflix', category: 'streaming' },
    { name: 'Spotify', category: 'streaming' },
    { name: 'Disney+', category: 'streaming' },
    { name: 'HBO Max', category: 'streaming' },
    { name: 'Amazon Prime', category: 'streaming' },
    { name: 'YouTube Premium', category: 'streaming' },
    { name: 'Hulu', category: 'streaming' },
    { name: 'Peacock', category: 'streaming' },
    { name: 'Apple Music', category: 'streaming' },
    { name: 'Apple TV+', category: 'streaming' },

    // Telecom
    { name: 'Verizon', category: 'internet' },
    { name: 'T-Mobile', category: 'internet' },
    { name: 'AT&T', category: 'internet' },
    { name: 'Xfinity', category: 'internet' },
    { name: 'Spectrum', category: 'internet' },

    // Utilities
    { name: 'Electricity', category: 'electricity' },
    { name: 'Water', category: 'water' },
    { name: 'Gas', category: 'gas' },
    { name: 'Internet', category: 'internet' },

    // Finance
    { name: 'Chase Credit Card', category: 'credit_card' },
    { name: 'Amex Gold', category: 'credit_card' },
    { name: 'Amex Platinum', category: 'credit_card' },
    { name: 'Capital One', category: 'credit_card' },
    { name: 'Citi Card', category: 'credit_card' },
    { name: 'Student Loan', category: 'education' },
    { name: 'Car Loan', category: 'transport' },
    { name: 'Rent', category: 'rent' },

    // Insurance
    { name: 'Geico', category: 'insurance' },
    { name: 'State Farm', category: 'insurance' },
    { name: 'Progressive', category: 'insurance' },
    { name: 'Allstate', category: 'insurance' },

    // Services / Subscriptions
    { name: 'Planet Fitness', category: 'gym' },
    { name: 'Gym Membership', category: 'gym' },
    { name: 'Costco Membership', category: 'shopping' },
    { name: 'Adobe Creative Cloud', category: 'software' },
    { name: 'ChatGPT Plus', category: 'software' },
    { name: 'Uber One', category: 'transport' },
    { name: 'DoorDash DashPass', category: 'food' },
    { name: 'Instacart+', category: 'food' },
    { name: 'Chewy', category: 'pets' },
];

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    onSelect: (name: string, category: BillCategory) => void;
    placeholder?: string;
    style?: any;
};

export default function BillAutocomplete({ value, onChangeText, onSelect, placeholder, style }: Props) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (!value || value.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = COMMON_BILLS.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase()) &&
            item.name.toLowerCase() !== value.toLowerCase()
        ).slice(0, 5);

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [value]);

    const handleSelect = (item: Suggestion) => {
        onSelect(item.name, item.category);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    return (
        <View style={[styles.container, style]}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
                onFocus={() => {
                    if (value.length >= 2 && suggestions.length > 0) {
                        setShowSuggestions(true);
                    }
                }}
                onBlur={() => {
                    // Slight delay to allow tap on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                }}
            />

            {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    {suggestions.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSelect(item)}
                        >
                            <BrandLogo billName={item.name} category={item.category} size={24} />
                            <View style={styles.suggestionTextContainer}>
                                <Text style={styles.suggestionName}>{item.name}</Text>
                                <Text style={styles.suggestionCategory}>{item.category}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 10,
    },
    input: {
        fontSize: typography.sizes.lg,
        color: colors.text.primary,
        paddingVertical: spacing.sm,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: -spacing.md,
        right: -spacing.md,
        borderRadius: radius.md,
        overflow: 'hidden',
        marginTop: spacing.xs,
        borderWidth: 1,
        borderColor: colors.glass.border,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.border,
    },
    suggestionTextContainer: {
        marginLeft: spacing.md,
    },
    suggestionName: {
        color: colors.text.primary,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
    },
    suggestionCategory: {
        color: colors.text.tertiary,
        fontSize: typography.sizes.xs,
        textTransform: 'capitalize',
    },
});
