import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../lib/i18n';
import { useBills } from '../context/BillsContext';
import { colors, typography, spacing, radius } from '../lib/theme';
import { haptic } from '../lib/animations';
import {
    registerForPushNotifications,
    savePushToken,
    getNotificationSettings,
    updateNotificationSettings,
    sendTestNotification,
    scheduleAllBillReminders,
    NotificationSettings,
} from '../lib/notifications';

const REMINDER_OPTIONS = [1, 2, 3] as const;

export default function NotificationsScreen() {
    const { user } = useAuth();
    const { t, language } = useI18n();
    const { bills } = useBills();

    const [settings, setSettings] = useState<NotificationSettings>({
        billReminders: true,
        reminderDaysBefore: 2,
        partnerPayments: true,
    });
    const [hasPermission, setHasPermission] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, [user?.id]);

    const loadSettings = async () => {
        if (!user?.id) return;

        try {
            const userSettings = await getNotificationSettings(user.id);
            setSettings(userSettings);

            // Check permission
            const token = await registerForPushNotifications();
            setHasPermission(!!token);

            if (token) {
                await savePushToken(token, user.id);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBillReminders = async (value: boolean) => {
        haptic.selection();
        setSettings(prev => ({ ...prev, billReminders: value }));

        if (user?.id) {
            await updateNotificationSettings(user.id, { billReminders: value });

            if (value) {
                await scheduleAllBillReminders(bills, settings.reminderDaysBefore, language);
            }
        }
    };

    const handleTogglePartnerPayments = async (value: boolean) => {
        haptic.selection();
        setSettings(prev => ({ ...prev, partnerPayments: value }));

        if (user?.id) {
            await updateNotificationSettings(user.id, { partnerPayments: value });
        }
    };

    const handleChangeReminderDays = async (days: number) => {
        haptic.selection();
        setSettings(prev => ({ ...prev, reminderDaysBefore: days }));

        if (user?.id) {
            await updateNotificationSettings(user.id, { reminderDaysBefore: days });

            if (settings.billReminders) {
                await scheduleAllBillReminders(bills, days, language);
            }
        }
    };

    const handleTestNotification = async () => {
        haptic.light();
        try {
            await sendTestNotification(language);
            Alert.alert(
                '✅',
                language === 'pt' ? 'Notificação enviada!' : 'Notification sent!'
            );
        } catch (error) {
            Alert.alert(
                language === 'pt' ? 'Erro' : 'Error',
                language === 'pt' ? 'Não foi possível enviar' : 'Could not send'
            );
        }
    };

    const handleEnableNotifications = async () => {
        haptic.light();
        const token = await registerForPushNotifications();

        if (token && user?.id) {
            setHasPermission(true);
            await savePushToken(token, user.id);
        } else {
            Alert.alert(
                t.notifications.permissionRequired,
                language === 'pt'
                    ? 'Ative as notificações nas configurações do dispositivo'
                    : 'Enable notifications in device settings'
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t.notifications.title}</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Permission Alert */}
                {!hasPermission && !isLoading && (
                    <TouchableOpacity onPress={handleEnableNotifications} style={styles.permissionCard}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <Bell size={24} color={colors.status.warning} />
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                            <Text style={styles.permissionTitle}>{t.notifications.enableNotifications}</Text>
                            <Text style={styles.permissionDesc}>{t.notifications.permissionRequired}</Text>
                        </View>
                        <ChevronRight size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                )}

                {/* Bill Reminders Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t.notifications.billReminders}</Text>
                    <View style={styles.card}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.cardContent}>
                            <View style={styles.settingRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.settingTitle}>{t.notifications.billReminders}</Text>
                                    <Text style={styles.settingDesc}>{t.notifications.billRemindersDesc}</Text>
                                </View>
                                <Switch
                                    value={settings.billReminders}
                                    onValueChange={handleToggleBillReminders}
                                    trackColor={{ false: colors.glass.background, true: colors.brand.primary }}
                                    thumbColor="#fff"
                                />
                            </View>

                            {settings.billReminders && (
                                <>
                                    <View style={styles.divider} />
                                    <View style={styles.settingRow}>
                                        <Text style={styles.settingTitle}>{t.notifications.reminderDays}</Text>
                                        <View style={styles.daysSelector}>
                                            {REMINDER_OPTIONS.map(days => (
                                                <TouchableOpacity
                                                    key={days}
                                                    onPress={() => handleChangeReminderDays(days)}
                                                    style={[
                                                        styles.dayOption,
                                                        settings.reminderDaysBefore === days && styles.dayOptionActive
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.dayText,
                                                        settings.reminderDaysBefore === days && styles.dayTextActive
                                                    ]}>
                                                        {days} {days === 1 ? t.notifications.day : t.notifications.days}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                {/* Partner Payments Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t.notifications.partnerPayments}</Text>
                    <View style={styles.card}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.cardContent}>
                            <View style={styles.settingRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.settingTitle}>{t.notifications.partnerPayments}</Text>
                                    <Text style={styles.settingDesc}>{t.notifications.partnerPaymentsDesc}</Text>
                                </View>
                                <Switch
                                    value={settings.partnerPayments}
                                    onValueChange={handleTogglePartnerPayments}
                                    trackColor={{ false: colors.glass.background, true: colors.brand.primary }}
                                    thumbColor="#fff"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Test Notification */}
                {hasPermission && (
                    <TouchableOpacity onPress={handleTestNotification} style={styles.testButton}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <Bell size={20} color={colors.brand.primary} />
                        <Text style={styles.testButtonText}>{t.notifications.testNotification}</Text>
                    </TouchableOpacity>
                )}
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

    permissionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.status.warning,
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },
    permissionTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
    },
    permissionDesc: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
        marginTop: 2,
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

    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingTitle: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.text.primary,
    },
    settingDesc: {
        fontSize: typography.sizes.sm,
        color: colors.text.tertiary,
        marginTop: 2,
    },

    divider: {
        height: 1,
        backgroundColor: colors.glass.border,
        marginVertical: spacing.lg,
    },

    daysSelector: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    dayOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: colors.glass.background,
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    dayOptionActive: {
        backgroundColor: `${colors.brand.primary}20`,
        borderColor: colors.brand.primary,
    },
    dayText: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
    },
    dayTextActive: {
        color: colors.brand.primary,
        fontWeight: typography.weights.medium,
    },

    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        borderRadius: radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glass.border,
        marginBottom: spacing['4xl'],
    },
    testButtonText: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.brand.primary,
        marginLeft: spacing.sm,
    },
});
