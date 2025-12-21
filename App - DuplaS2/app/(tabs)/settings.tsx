import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Animated,
    TextInput,
    Modal,
    Alert,
    Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
    User,
    Users,
    Bell,
    CreditCard,
    LogOut,
    ChevronRight,
    Shield,
    Globe,
    Sparkles,
    Copy,
    Link as LinkIcon,
    X,
    Edit3,
    Home
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import Avatar from '../../components/Avatar';
import { colors, typography, spacing, radius, glassStyle } from '../../lib/theme';
import { haptic } from '../../lib/animations';

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
}

function SettingsItem({
    icon: Icon,
    title,
    subtitle,
    onPress,
    danger = false,
    rightElement
}: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    danger?: boolean;
    rightElement?: React.ReactNode;
}) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (onPress) {
            haptic.light();
            Animated.spring(scale, { toValue: 0.97, tension: 100, friction: 8, useNativeDriver: true }).start();
        }
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            disabled={!onPress}
        >
            <Animated.View style={[styles.settingsItem, { transform: [{ scale }] }]}>
                <View style={[styles.iconBox, danger && { backgroundColor: 'rgba(251, 113, 133, 0.15)' }]}>
                    <Icon size={20} color={danger ? colors.status.error : colors.text.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, danger && { color: colors.status.error }]}>{title}</Text>
                    {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
                </View>
                {rightElement || <ChevronRight size={20} color={colors.text.tertiary} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

function LanguageSelector() {
    const { language, setLanguage } = useI18n();

    const handleLanguageChange = (lang: 'en' | 'pt') => {
        haptic.selection();
        setLanguage(lang);
    };

    return (
        <View style={styles.languageSelector}>
            <TouchableOpacity
                style={[styles.langOption, language === 'en' && styles.langOptionActive]}
                onPress={() => handleLanguageChange('en')}
            >
                <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>🇺🇸</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.langOption, language === 'pt' && styles.langOptionActive]}
                onPress={() => handleLanguageChange('pt')}
            >
                <Text style={[styles.langText, language === 'pt' && styles.langTextActive]}>🇧🇷</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function SettingsScreen() {
    const { user, profile, signOut, joinPartner } = useAuth();
    const { t, language } = useI18n();
    const [connectModalVisible, setConnectModalVisible] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleSignOut = () => {
        haptic.warning();
        signOut();
    };

    const copyToClipboard = () => {
        if (profile?.invite_code) {
            Clipboard.setString(profile.invite_code);
            haptic.success();
            Alert.alert(
                t.settings.partner.copyCode,
                t.settings.partner.inviteDescription
            );
        }
    };

    const handleConnect = async () => {
        if (!inviteCode.trim()) return;

        setIsConnecting(true);
        haptic.selection();

        const result = await joinPartner(inviteCode);

        setIsConnecting(false);
        if (result.success) {
            haptic.success();
            setConnectModalVisible(false);
            setInviteCode('');
            Alert.alert(t.settings.partner.enterCodeTitle, t.settings.partner.alreadyLinked);
        } else {
            haptic.error();
            Alert.alert('Erro', result.error || 'Falha ao conectar');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <AnimatedCard>
                    <Text style={styles.headerTitle}>{t.settings.title}</Text>
                </AnimatedCard>

                {/* Profile Card */}
                <AnimatedCard delay={50}>
                    <View style={styles.profileCard}>
                        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0)']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.profileContent}>
                            <Avatar
                                url={profile?.avatar_url}
                                name={profile?.display_name}
                                size="large"
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.profileName}>{profile?.display_name || user?.email?.split('@')[0] || t.settings.guestUser}</Text>
                                <Text style={styles.profileEmail}>{user?.email || t.settings.anonymous}</Text>
                            </View>
                            <View style={styles.proBadge}>
                                <Sparkles size={12} color={colors.brand.primary} />
                                <Text style={styles.proText}>PRO</Text>
                            </View>
                        </View>
                    </View>
                </AnimatedCard>

                {/* Edit Profile Section */}
                <AnimatedCard delay={100}>
                    <SettingsItem
                        icon={Edit3}
                        title={language === 'pt' ? 'Editar Perfil' : 'Edit Profile'}
                        subtitle={language === 'pt' ? 'Nome e foto' : 'Name and photo'}
                        onPress={() => router.push('/profile')}
                    />
                </AnimatedCard>

                {/* Partner / Household Section */}
                <AnimatedCard delay={100}>
                    <Text style={styles.sectionLabel}>{t.settings.partner.title}</Text>
                    <View style={styles.sectionCard}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.sectionContent}>
                            <View style={styles.inviteContainer}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inviteLabel}>{t.settings.partner.yourCode}</Text>
                                    <Text style={styles.inviteCode}>{profile?.invite_code || '------'}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={copyToClipboard}
                                >
                                    <Copy size={18} color={colors.brand.primary} />
                                    <Text style={styles.copyText}>{t.settings.partner.copyCode}</Text>
                                </TouchableOpacity>
                            </View>

                            <SettingsItem
                                icon={LinkIcon}
                                title={t.settings.partner.connectPartner}
                                subtitle={t.settings.partner.inviteDescription}
                                onPress={() => {
                                    haptic.selection();
                                    setConnectModalVisible(true);
                                }}
                            />
                            <SettingsItem
                                icon={Home}
                                title={t.household.title}
                                onPress={() => router.push('/household')}
                            />
                        </View>
                    </View>
                </AnimatedCard>

                {/* Language Section */}
                <AnimatedCard delay={150}>
                    <Text style={styles.sectionLabel}>{t.settings.language}</Text>
                    <View style={styles.sectionCard}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.sectionContent}>
                            <SettingsItem
                                icon={Globe}
                                title={t.settings.language}
                                rightElement={<LanguageSelector />}
                            />
                        </View>
                    </View>
                </AnimatedCard>

                {/* Account Section */}
                <AnimatedCard delay={200}>
                    <Text style={styles.sectionLabel}>{t.settings.account}</Text>
                    <View style={styles.sectionCard}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.sectionContent}>
                            <SettingsItem icon={User} title={t.settings.editProfile} subtitle={t.settings.nameAvatar} onPress={() => router.push('/profile')} />
                            <SettingsItem icon={Bell} title={t.settings.notifications} subtitle={t.settings.alertsReminders} onPress={() => router.push('/notifications')} />
                        </View>
                    </View>
                </AnimatedCard>

                {/* Subscription Section */}
                <AnimatedCard delay={250}>
                    <Text style={styles.sectionLabel}>{t.settings.subscription}</Text>
                    <View style={styles.sectionCard}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.sectionContent}>
                            <SettingsItem icon={CreditCard} title={t.settings.pro} subtitle={t.settings.perMonth} onPress={() => haptic.selection()} />
                            <SettingsItem icon={Shield} title={t.settings.privacySecurity} onPress={() => haptic.selection()} />
                        </View>
                    </View>
                </AnimatedCard>

                {/* Danger Zone */}
                <AnimatedCard delay={300}>
                    <View style={[styles.sectionCard, { marginBottom: spacing['3xl'] }]}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.sectionContent}>
                            <SettingsItem icon={LogOut} title={t.settings.signOut} onPress={handleSignOut} danger />
                        </View>
                    </View>
                </AnimatedCard>

                <AnimatedCard delay={350}>
                    <Text style={styles.footerText}>{t.settings.madeWith}</Text>
                </AnimatedCard>
            </ScrollView>

            {/* Connect Modal */}
            <Modal
                visible={connectModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setConnectModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setConnectModalVisible(false)}
                    />

                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t.settings.partner.enterCodeTitle}</Text>
                            <TouchableOpacity onPress={() => setConnectModalVisible(false)}>
                                <X size={24} color={colors.text.tertiary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalDescription}>
                            {t.settings.partner.enterCodeDescription}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={t.settings.partner.placeholder}
                            placeholderTextColor={colors.text.tertiary}
                            value={inviteCode}
                            onChangeText={setInviteCode}
                            autoCapitalize="characters"
                            maxLength={6}
                        />

                        <TouchableOpacity
                            style={[styles.connectButton, !inviteCode.trim() && { opacity: 0.5 }]}
                            onPress={handleConnect}
                            disabled={!inviteCode.trim() || isConnecting}
                        >
                            <LinearGradient
                                colors={colors.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.connectGradient}
                            >
                                <Text style={styles.connectButtonText}>
                                    {isConnecting ? t.loading : t.settings.partner.connect}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    scrollView: { flex: 1, paddingHorizontal: spacing.xl },
    headerTitle: { color: colors.text.primary, fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold, marginTop: spacing.lg, marginBottom: spacing['2xl'] },

    profileCard: { ...glassStyle, marginBottom: spacing['2xl'] },
    profileContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl },
    avatarBox: { width: 64, height: 64, borderRadius: radius.xl, overflow: 'hidden', marginRight: spacing.lg },
    avatarGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    profileName: { color: colors.text.primary, fontWeight: typography.weights.bold, fontSize: typography.sizes.xl },
    profileEmail: { color: colors.text.tertiary, fontSize: typography.sizes.md },
    proBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
    proText: { color: colors.brand.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, marginLeft: spacing.xs },

    sectionLabel: { color: colors.text.tertiary, fontSize: typography.sizes.sm, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: spacing.xs },
    sectionCard: { ...glassStyle, marginBottom: spacing.xl },
    sectionContent: { paddingHorizontal: spacing.lg },

    settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.glass.border },
    iconBox: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.glass.highlight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg },
    itemTitle: { color: colors.text.primary, fontWeight: typography.weights.medium, fontSize: typography.sizes.lg },
    itemSubtitle: { color: colors.text.tertiary, fontSize: typography.sizes.md },

    inviteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.border
    },
    inviteLabel: { color: colors.text.tertiary, fontSize: typography.sizes.xs, textTransform: 'uppercase', marginBottom: 4 },
    inviteCode: { color: colors.text.primary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, letterSpacing: 2 },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        gap: spacing.xs
    },
    copyText: { color: colors.brand.primary, fontWeight: typography.weights.bold, fontSize: typography.sizes.sm },

    footerText: { color: colors.text.tertiary, textAlign: 'center', fontSize: typography.sizes.sm, marginBottom: spacing['4xl'] },

    languageSelector: { flexDirection: 'row', gap: spacing.sm },
    langOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.glass.background, borderWidth: 1, borderColor: colors.glass.border },
    langOptionActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.brand.primary },
    langText: { fontSize: 18 },
    langTextActive: {},

    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    modalContent: {
        width: '100%',
        backgroundColor: colors.background.secondary,
        borderRadius: radius['2xl'],
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.glass.border
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    modalTitle: { color: colors.text.primary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
    modalDescription: { color: colors.text.secondary, fontSize: typography.sizes.md, marginBottom: spacing.xl, lineHeight: 22 },
    modalInput: {
        backgroundColor: colors.glass.background,
        borderWidth: 1,
        borderColor: colors.glass.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        color: colors.text.primary,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        textAlign: 'center',
        letterSpacing: 4,
        marginBottom: spacing.xl
    },
    connectButton: { width: '100%', borderRadius: radius.lg, overflow: 'hidden' },
    connectGradient: { paddingVertical: spacing.lg, alignItems: 'center' },
    connectButtonText: { color: '#fff', fontSize: typography.sizes.md, fontWeight: typography.weights.bold }
});
