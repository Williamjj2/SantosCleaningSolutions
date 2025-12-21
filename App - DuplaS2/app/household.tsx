import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
    Home, ChevronLeft, UserMinus, Trash2, Check
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useBills } from '../context/BillsContext';
import { useI18n } from '../lib/i18n';
import Avatar from '../components/Avatar';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing, radius } from '../lib/theme';
import { haptic } from '../lib/animations';

export default function HouseholdScreen() {
    const { user, profile } = useAuth();
    const { bills, deleteBill } = useBills();
    const { t, language } = useI18n();

    const [houseName, setHouseName] = useState(profile?.household_name || '');
    const [partnerInfo, setPartnerInfo] = useState<{
        display_name: string;
        email: string;
        avatar_url: string | null;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        if (profile?.household_id) {
            fetchPartnerInfo();
        }
    }, [profile?.household_id]);

    const fetchPartnerInfo = async () => {
        if (!profile?.household_id || !user?.id) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('display_name, email, avatar_url')
                .eq('household_id', profile.household_id)
                .neq('id', user.id)
                .single();

            if (!error && data) {
                setPartnerInfo(data);
            }
        } catch (error) {
            console.error('Error fetching partner:', error);
        }
    };

    const handleSaveHouseName = async () => {
        if (!user?.id) return;

        haptic.selection();
        setIsSaving(true);

        try {
            await supabase
                .from('profiles')
                .update({ household_name: houseName })
                .eq('id', user.id);

            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        } catch (error) {
            console.error('Error saving house name:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisconnectPartner = () => {
        haptic.warning();
        Alert.alert(
            t.household.disconnect,
            t.household.disconnectConfirm,
            [
                { text: language === 'pt' ? 'Cancelar' : 'Cancel', style: 'cancel' },
                {
                    text: t.household.disconnect,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Remove household_id from current user
                            await supabase
                                .from('profiles')
                                .update({ household_id: null })
                                .eq('id', user?.id);

                            router.back();
                        } catch (error) {
                            console.error('Error disconnecting:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleResetData = () => {
        haptic.warning();
        Alert.alert(
            t.household.resetData,
            t.household.resetConfirm,
            [
                { text: language === 'pt' ? 'Cancelar' : 'Cancel', style: 'cancel' },
                {
                    text: t.household.resetData,
                    style: 'destructive',
                    onPress: async () => {
                        // Delete all bills
                        for (const bill of bills) {
                            await deleteBill(bill.id);
                        }
                        router.back();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t.household.title}</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* House Name */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t.household.houseName}</Text>
                    <View style={styles.card}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.cardContent}>
                            <View style={styles.inputRow}>
                                <Home size={24} color={colors.brand.primary} />
                                <TextInput
                                    style={styles.input}
                                    value={houseName}
                                    onChangeText={setHouseName}
                                    placeholder={t.household.houseNamePlaceholder}
                                    placeholderTextColor={colors.text.tertiary}
                                />
                                <TouchableOpacity
                                    onPress={handleSaveHouseName}
                                    style={[styles.saveButton, showSaved && styles.saveButtonSuccess]}
                                    disabled={isSaving}
                                >
                                    <Check size={20} color={showSaved ? colors.status.success : colors.text.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Connected Partner */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t.household.connectedPartner}</Text>
                    <View style={styles.card}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.cardContent}>
                            {partnerInfo ? (
                                <View style={styles.partnerRow}>
                                    <Avatar
                                        url={partnerInfo.avatar_url}
                                        name={partnerInfo.display_name}
                                        size="medium"
                                    />
                                    <View style={styles.partnerInfo}>
                                        <Text style={styles.partnerName}>{partnerInfo.display_name}</Text>
                                        <Text style={styles.partnerEmail}>{partnerInfo.email}</Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.noPartner}>{t.household.noPartner}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={styles.dangerLabel}>{t.household.dangerZone}</Text>
                    <View style={styles.dangerCard}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.cardContent}>
                            {partnerInfo && (
                                <>
                                    <TouchableOpacity onPress={handleDisconnectPartner} style={styles.dangerRow}>
                                        <UserMinus size={20} color={colors.status.warning} />
                                        <Text style={styles.dangerText}>{t.household.disconnect}</Text>
                                    </TouchableOpacity>
                                    <View style={styles.divider} />
                                </>
                            )}
                            <TouchableOpacity onPress={handleResetData} style={styles.dangerRow}>
                                <Trash2 size={20} color={colors.status.error} />
                                <Text style={[styles.dangerText, { color: colors.status.error }]}>
                                    {t.household.resetData}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
        marginBottom: spacing['2xl'],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
    },

    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },

    card: {
        borderRadius: radius['2xl'],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    cardContent: {
        padding: spacing.lg,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    input: {
        flex: 1,
        fontSize: typography.sizes.lg,
        color: colors.text.primary,
        padding: 0,
    },
    saveButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonSuccess: {
        backgroundColor: `${colors.status.success}20`,
    },

    partnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    partnerInfo: {
        marginLeft: spacing.md,
    },
    partnerName: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
    },
    partnerEmail: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
    noPartner: {
        fontSize: typography.sizes.md,
        color: colors.text.tertiary,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },

    dangerLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.status.error,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },
    dangerCard: {
        borderRadius: radius['2xl'],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${colors.status.error}50`,
    },
    dangerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    dangerText: {
        fontSize: typography.sizes.md,
        color: colors.status.warning,
        marginLeft: spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: colors.glass.border,
        marginVertical: spacing.md,
    },
});
