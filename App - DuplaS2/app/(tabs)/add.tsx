import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useI18n } from '../../lib/i18n';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { haptic } from '../../lib/animations';
import { useBills } from '../../context/BillsContext';
import {
    billCategories,
    billCategoriesPt,
    frequencies,
    responsible,
    BillCategory,
    BillFrequency,
    BillResponsible
} from '../../lib/billTypes';

// Animated Input Component
function FormInput({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    prefix,
    delay = 0
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'decimal-pad';
    prefix?: string;
    delay?: number;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.inputContainer, { opacity, transform: [{ translateY }] }]}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                {prefix && (
                    <View style={styles.prefixContainer}>
                        <Text style={styles.inputPrefix}>{prefix}</Text>
                    </View>
                )}
                <TextInput
                    style={[styles.textInput, prefix && styles.textInputWithPrefix]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType={keyboardType}
                    onFocus={() => haptic.selection()}
                />
            </View>
        </Animated.View>
    );
}

// Category Selector
function CategorySelector({
    selected,
    onSelect,
    language,
    delay = 0
}: {
    selected: BillCategory | null;
    onSelect: (cat: BillCategory) => void;
    language: string;
    delay?: number;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const categories = language === 'pt' ? billCategoriesPt : billCategories;

    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={[styles.selectorContainer, { opacity }]}>
            <Text style={styles.inputLabel}>{language === 'pt' ? 'Categoria' : 'Category'}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
            >
                {Object.entries(categories).map(([key, cat]) => {
                    const isSelected = selected === key;
                    return (
                        <TouchableOpacity
                            key={key}
                            onPress={() => {
                                haptic.light();
                                onSelect(key as BillCategory);
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.categoryChip,
                                isSelected && { backgroundColor: `${cat.color}25`, borderColor: cat.color }
                            ]}>
                                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                <Text style={[
                                    styles.categoryLabel,
                                    isSelected && { color: cat.color }
                                ]}>{cat.label}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </Animated.View>
    );
}

// Option Selector (for frequency and responsible)
function OptionSelector({
    label,
    options,
    selected,
    onSelect,
    delay = 0
}: {
    label: string;
    options: { key: string; label: string; icon?: string }[];
    selected: string | null;
    onSelect: (key: string) => void;
    delay?: number;
}) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={[styles.selectorContainer, { opacity }]}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.optionsRow}>
                {options.map((opt) => {
                    const isSelected = selected === opt.key;
                    return (
                        <TouchableOpacity
                            key={opt.key}
                            onPress={() => {
                                haptic.light();
                                onSelect(opt.key);
                            }}
                            activeOpacity={0.7}
                            style={styles.optionTouchable}
                        >
                            <View style={[
                                styles.optionChip,
                                isSelected && styles.optionChipSelected
                            ]}>
                                {opt.icon && <Text style={styles.optionIcon}>{opt.icon}</Text>}
                                <Text style={[
                                    styles.optionLabel,
                                    isSelected && styles.optionLabelSelected
                                ]}>{opt.label}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Animated.View>
    );
}

export default function AddBillScreen() {
    const { t, language } = useI18n();
    const { addBill } = useBills();

    // Form state
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<BillCategory | null>(null);
    const [frequency, setFrequency] = useState<BillFrequency | null>(null);
    const [responsiblePerson, setResponsiblePerson] = useState<BillResponsible | null>(null);
    const [dueDay, setDueDay] = useState('');

    // Animation
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const isFormValid = name.trim() && amount && category && frequency && responsiblePerson && dueDay;

    const handleSave = async () => {
        if (!isFormValid) {
            haptic.error();
            Alert.alert(
                language === 'pt' ? 'Campos obrigatórios' : 'Required fields',
                language === 'pt' ? 'Preencha todos os campos' : 'Please fill all fields'
            );
            return;
        }

        const parsedAmount = parseFloat(amount.replace(',', '.'));
        const parsedDay = parseInt(dueDay, 10);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            haptic.error();
            Alert.alert(
                language === 'pt' ? 'Valor inválido' : 'Invalid amount',
                language === 'pt' ? 'Digite um valor válido' : 'Enter a valid amount'
            );
            return;
        }

        if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
            haptic.error();
            Alert.alert(
                language === 'pt' ? 'Dia inválido' : 'Invalid day',
                language === 'pt' ? 'Digite um dia entre 1 e 31' : 'Enter a day between 1 and 31'
            );
            return;
        }

        // Create due date for current or next month
        const today = new Date();
        let dueDate = new Date(today.getFullYear(), today.getMonth(), parsedDay);
        if (dueDate < today) {
            dueDate = new Date(today.getFullYear(), today.getMonth() + 1, parsedDay);
        }

        try {
            await addBill({
                name: name.trim(),
                amount: parsedAmount,
                category: category!,
                dueDate,
                frequency: frequency!,
                responsible: responsiblePerson!,
                isPaid: false,
            });

            haptic.success();

            // Reset form
            setName('');
            setAmount('');
            setCategory(null);
            setFrequency(null);
            setResponsiblePerson(null);
            setDueDay('');

            Alert.alert(
                language === 'pt' ? 'Sucesso!' : 'Success!',
                language === 'pt' ? 'Conta adicionada' : 'Bill added',
                [{ text: 'OK', onPress: () => router.navigate('/(tabs)') }]
            );
        } catch (error) {
            haptic.error();
            Alert.alert(
                language === 'pt' ? 'Erro' : 'Error',
                language === 'pt' ? 'Não foi possível salvar a conta' : 'Could not save the bill'
            );
        }
    };

    const handlePressIn = () => {
        haptic.light();
        Animated.spring(buttonScale, { toValue: 0.96, tension: 100, friction: 8, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
    };

    // Build frequency options
    const frequencyOptions = Object.entries(frequencies).map(([key, val]) => ({
        key,
        label: language === 'pt' ? val.pt : val.en,
    }));

    // Build responsible options
    const responsibleOptions = Object.entries(responsible).map(([key, val]) => ({
        key,
        label: language === 'pt' ? val.pt : val.en,
        icon: val.icon,
    }));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => {
                            haptic.light();
                            router.navigate('/(tabs)');
                        }}
                    >
                        <X size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {language === 'pt' ? 'Nova Conta' : 'New Bill'}
                    </Text>
                    <View style={{ width: 44 }} />
                </Animated.View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 140 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Bill Name */}
                    <FormInput
                        label={language === 'pt' ? 'Nome da conta' : 'Bill name'}
                        value={name}
                        onChangeText={setName}
                        placeholder={language === 'pt' ? 'Ex: Aluguel' : 'Ex: Rent'}
                        delay={50}
                    />

                    {/* Amount */}
                    <FormInput
                        label={language === 'pt' ? 'Valor' : 'Amount'}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        prefix="$"
                        delay={100}
                    />

                    {/* Category */}
                    <CategorySelector
                        selected={category}
                        onSelect={setCategory}
                        language={language}
                        delay={150}
                    />

                    {/* Due Day */}
                    <FormInput
                        label={language === 'pt' ? 'Dia do vencimento (1-31)' : 'Due day (1-31)'}
                        value={dueDay}
                        onChangeText={(text) => setDueDay(text.replace(/[^0-9]/g, '').slice(0, 2))}
                        placeholder="15"
                        keyboardType="numeric"
                        delay={200}
                    />

                    {/* Frequency */}
                    <OptionSelector
                        label={language === 'pt' ? 'Frequência' : 'Frequency'}
                        options={frequencyOptions}
                        selected={frequency}
                        onSelect={(key) => setFrequency(key as BillFrequency)}
                        delay={250}
                    />

                    {/* Responsible */}
                    <OptionSelector
                        label={language === 'pt' ? 'Responsável' : 'Responsible'}
                        options={responsibleOptions}
                        selected={responsiblePerson}
                        onSelect={(key) => setResponsiblePerson(key as BillResponsible)}
                        delay={300}
                    />
                </ScrollView>

                {/* Save Button */}
                <View style={styles.bottomContainer}>
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity
                            onPress={handleSave}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={1}
                        >
                            <LinearGradient
                                colors={isFormValid ? colors.gradients.primary : ['#374151', '#4B5563']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveButton}
                            >
                                <Check size={22} color="#fff" />
                                <Text style={styles.saveButtonText}>
                                    {language === 'pt' ? 'Salvar Conta' : 'Save Bill'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.border,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
    },

    scrollView: { flex: 1, paddingHorizontal: spacing.xl },

    inputContainer: { marginTop: spacing.xl },
    inputLabel: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    prefixContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 50,
        backgroundColor: colors.glass.highlight,
        borderTopLeftRadius: radius.lg,
        borderBottomLeftRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glass.border,
        borderRightWidth: 0,
        zIndex: 1,
    },
    inputPrefix: {
        fontSize: typography.sizes.xl,
        color: colors.brand.primary,
        fontWeight: typography.weights.bold,
    },
    textInput: {
        flex: 1,
        backgroundColor: colors.glass.background,
        borderWidth: 1,
        borderColor: colors.glass.border,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        fontSize: typography.sizes.xl,
        color: colors.text.primary,
    },
    textInputWithPrefix: {
        paddingLeft: 60,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    },

    selectorContainer: { marginTop: spacing.xl },
    categoryScroll: { paddingVertical: spacing.xs },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: colors.glass.background,
        borderWidth: 1,
        borderColor: colors.glass.border,
        marginRight: spacing.sm,
    },
    categoryIcon: { fontSize: 18, marginRight: spacing.xs },
    categoryLabel: {
        fontSize: typography.sizes.md,
        color: colors.text.secondary,
        fontWeight: typography.weights.medium,
    },

    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
    },
    optionTouchable: {
        width: '33.33%',
        paddingHorizontal: spacing.xs,
    },
    optionChip: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.glass.background,
        borderWidth: 1,
        borderColor: colors.glass.border,
        marginBottom: spacing.sm,
    },
    optionChipSelected: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: colors.brand.primary,
    },
    optionIcon: { fontSize: 20, marginBottom: spacing.xs },
    optionLabel: {
        fontSize: typography.sizes.xs,
        color: colors.text.secondary,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
    },
    optionLabelSelected: { color: colors.brand.primary },

    bottomContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 100,
        paddingTop: spacing.lg,
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.glass.border,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: radius.lg,
    },
    saveButtonText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: '#fff',
        marginLeft: spacing.sm,
    },
});
