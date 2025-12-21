import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    ChevronRight,
    Zap,
    Heart,
    Bell,
    Plus,
    CreditCard,
    PieChart,
    Check
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo';
import { useBills } from '../../context/BillsContext';
import { useI18n } from '../../lib/i18n';
import Avatar from '../../components/Avatar';
import { colors, typography, spacing, radius, glassStyle } from '../../lib/theme';
import { haptic } from '../../lib/animations';
import { billCategories, billCategoriesPt, Bill } from '../../lib/billTypes';
import BillDetailModal from '../../components/BillDetailModal';

const { width } = Dimensions.get('window');

// Animated Glass Card Component
function GlassCard({ children, style, delay = 0, onPress }: { children: React.ReactNode; style?: any; delay?: number; onPress?: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    const handlePressIn = () => {
        if (onPress) {
            Animated.spring(scale, { toValue: 0.98, tension: 100, friction: 8, useNativeDriver: true }).start();
        }
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
    };

    const card = (
        <Animated.View style={[styles.glassCard, style, { opacity, transform: [{ translateY }, { scale }] }]}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            {children}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                {card}
            </TouchableOpacity>
        );
    }

    return card;
}

// Quick Action Button
function QuickAction({ icon: Icon, label, color, onPress }: { icon: any; label: string; color: string; onPress?: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        haptic.light();
        Animated.spring(scale, { toValue: 0.92, tension: 100, friction: 8, useNativeDriver: true }).start();
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
        >
            <Animated.View style={[styles.quickAction, { transform: [{ scale }] }]}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
                    <Icon size={22} color={color} />
                </View>
                <Text style={styles.quickActionLabel}>{label}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function DashboardScreen() {
    const { user, profile } = useAuth();
    const { bills, markAsPaid } = useBills();
    const { t, language } = useI18n();

    // Modal state
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Header animation
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslate = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(headerTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t.dashboard.goodMorning;
        if (hour < 18) return t.dashboard.goodAfternoon;
        return t.dashboard.goodEvening;
    };

    const userName = profile?.display_name?.split(' ')[0] || 'there';

    // Calculate real data from bills
    const stats = useMemo(() => {
        const totalDue = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const paidSoFar = bills.filter(b => b.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
        const remaining = totalDue - paidSoFar;
        const paidCount = bills.filter(b => b.isPaid).length;

        // Calculate harmony score based on responsibility distribution
        let myBills = 0;
        let partnerBills = 0;
        let splitBills = 0;

        bills.forEach(b => {
            const isCreator = b.creatorId === user?.id;
            if (b.responsible === 'split') {
                splitBills++;
            } else if (b.responsible === 'me') {
                isCreator ? myBills++ : partnerBills++;
            } else if (b.responsible === 'partner') {
                isCreator ? partnerBills++ : myBills++;
            }
        });

        const totalBillsCount = bills.length || 1;
        const balanceRatio = Math.min(myBills, partnerBills) / Math.max(myBills, partnerBills, 1);
        const splitBonus = (splitBills / totalBillsCount) * 20;
        const harmonyScore = Math.round((balanceRatio * 80) + splitBonus);

        return { totalDue, paidSoFar, remaining, paidCount, harmonyScore: Math.min(harmonyScore, 100) };
    }, [bills]);

    // Get upcoming unpaid bills sorted by due date
    const upcomingBills = useMemo(() => {
        return bills
            .filter(b => !b.isPaid)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5);
    }, [bills]);

    // Get bill status
    const getBillStatus = (dueDate: Date) => {
        const today = new Date();
        const due = new Date(dueDate);
        const daysUntil = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) return 'overdue';
        if (daysUntil <= 3) return 'soon';
        return 'ok';
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'overdue': return t.dashboard.overdue;
            case 'soon': return t.dashboard.dueSoon;
            default: return t.dashboard.onTrack;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'overdue': return colors.status.error;
            case 'soon': return colors.status.warning;
            default: return colors.status.success;
        }
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return d.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', options);
    };

    const getCategoryData = (category: string) => {
        const cats = language === 'pt' ? billCategoriesPt : billCategories;
        return cats[category as keyof typeof cats] || { icon: '📦', label: 'Other', color: '#6B7280' };
    };

    const handleBillPress = (bill: Bill) => {
        haptic.selection();
        setSelectedBill(bill);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setTimeout(() => setSelectedBill(null), 300);
    };

    const handleMarkPaid = (billId: string) => {
        haptic.success();
        markAsPaid(billId);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}>
                    <View style={styles.headerLeft}>
                        <Avatar
                            url={profile?.avatar_url}
                            name={profile?.display_name}
                            size="medium"
                        />
                        <View style={{ marginLeft: spacing.md }}>
                            <Text style={styles.greetingText}>{getGreeting()},</Text>
                            <Text style={styles.nameText}>{userName} 👋</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.bellButton}
                        onPress={() => haptic.light()}
                    >
                        <Bell size={20} color={colors.text.primary} />
                        {upcomingBills.some(b => getBillStatus(b.dueDate) === 'overdue') && (
                            <View style={styles.notificationDot} />
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* Main Balance Card */}
                <GlassCard delay={100}>
                    <LinearGradient
                        colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0)']}
                        style={styles.cardGradient}
                    />
                    <View style={styles.balanceContent}>
                        <Text style={styles.labelText}>{t.dashboard.totalDueMonth}</Text>
                        <Text style={styles.bigNumber}>${stats.totalDue.toLocaleString()}</Text>
                        <View style={styles.trendBadge}>
                            {stats.paidCount > 0 ? (
                                <>
                                    <TrendingUp size={14} color={colors.status.success} />
                                    <Text style={styles.trendText}>
                                        {stats.paidCount} {language === 'pt' ? 'pagas' : 'paid'}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Zap size={14} color={colors.status.warning} />
                                    <Text style={[styles.trendText, { color: colors.status.warning }]}>
                                        {language === 'pt' ? 'Nenhuma paga ainda' : 'None paid yet'}
                                    </Text>
                                </>
                            )}
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <LinearGradient
                                    colors={colors.gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${stats.totalDue > 0 ? (stats.paidSoFar / stats.totalDue) * 100 : 0}%` }]}
                                />
                            </View>
                            <View style={styles.progressLabels}>
                                <Text style={styles.progressLabel}>{t.dashboard.paidSoFar}: ${stats.paidSoFar.toLocaleString()}</Text>
                                <Text style={styles.progressLabel}>{t.dashboard.remaining}: ${stats.remaining.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>
                </GlassCard>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>{language === 'pt' ? 'Ações Rápidas' : 'Quick Actions'}</Text>
                <View style={styles.quickActionsGrid}>
                    <QuickAction
                        icon={Plus}
                        label={language === 'pt' ? 'Nova Conta' : 'Add Bill'}
                        color={colors.brand.primary}
                        onPress={() => router.navigate('/(tabs)/add')}
                    />
                    <QuickAction icon={CreditCard} label={language === 'pt' ? 'Pagar' : 'Pay'} color={colors.status.info} />
                    <QuickAction icon={PieChart} label={language === 'pt' ? 'Relatório' : 'Reports'} color="#8B5CF6" />
                    <QuickAction
                        icon={Calendar}
                        label={language === 'pt' ? 'Calendário' : 'Calendar'}
                        color={colors.status.warning}
                        onPress={() => router.navigate('/(tabs)/calendar')}
                    />
                </View>

                {/* Harmony Score */}
                <GlassCard delay={200}>
                    <View style={styles.harmonyContent}>
                        <View style={styles.harmonyRow}>
                            <View style={styles.harmonyLeft}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 113, 133, 0.2)' }]}>
                                    <Heart size={20} color={colors.status.error} />
                                </View>
                                <View>
                                    <Text style={styles.labelText}>{t.dashboard.coupleHarmony}</Text>
                                    <Text style={styles.harmonyScore}>{stats.harmonyScore}%</Text>
                                </View>
                            </View>
                            <View style={styles.balancedBadge}>
                                <Text style={styles.balancedText}>
                                    {stats.harmonyScore >= 70 ? t.dashboard.balanced : (language === 'pt' ? 'Ajustar' : 'Adjust')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </GlassCard>

                {/* Upcoming Bills */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t.dashboard.upcomingBills}</Text>
                    <TouchableOpacity style={styles.seeAllButton} onPress={() => haptic.selection()}>
                        <Text style={styles.seeAllText}>{t.dashboard.seeAll}</Text>
                        <ChevronRight size={16} color={colors.text.tertiary} />
                    </TouchableOpacity>
                </View>

                {upcomingBills.length === 0 ? (
                    <GlassCard delay={300}>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🎉</Text>
                            <Text style={styles.emptyText}>
                                {language === 'pt' ? 'Nenhuma conta pendente!' : 'No pending bills!'}
                            </Text>
                        </View>
                    </GlassCard>
                ) : (
                    upcomingBills.map((bill, index) => {
                        const status = getBillStatus(bill.dueDate);
                        const catData = getCategoryData(bill.category);

                        return (
                            <GlassCard
                                key={bill.id}
                                delay={300 + index * 80}
                            >
                                <View style={styles.billContent}>
                                    <View style={{ marginRight: spacing.md }}>
                                        <BrandLogo billName={bill.name} category={bill.category} size={40} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.billName}>{bill.name}</Text>
                                        <Text style={styles.billDate}>{formatDate(bill.dueDate)}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.billAmount}>${bill.amount.toLocaleString()}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}20` }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                                                {getStatusText(status)}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.payButton}
                                        onPress={(e) => {
                                            e.stopPropagation?.();
                                            handleMarkPaid(bill.id);
                                        }}
                                    >
                                        <Check size={18} color={colors.brand.primary} />
                                    </TouchableOpacity>
                                </View>
                            </GlassCard>
                        );
                    })
                )}
            </ScrollView>

            {/* Bill Detail Modal */}
            <BillDetailModal
                visible={modalVisible}
                bill={selectedBill}
                onClose={handleCloseModal}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    scrollView: { flex: 1, paddingHorizontal: spacing.xl },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing['2xl'] },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    greetingText: { color: colors.text.secondary, fontSize: typography.sizes.lg },
    nameText: { color: colors.text.primary, fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold },
    bellButton: { width: 48, height: 48, backgroundColor: colors.glass.background, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glass.border },
    notificationDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, backgroundColor: colors.status.error, borderRadius: 4 },

    glassCard: { ...glassStyle, marginBottom: spacing.md },
    cardGradient: { ...StyleSheet.absoluteFillObject },

    balanceContent: { padding: spacing['2xl'] },
    labelText: { color: colors.text.secondary, fontSize: typography.sizes.sm, marginBottom: spacing.xs },
    bigNumber: { color: colors.text.primary, fontSize: typography.sizes['5xl'], fontWeight: typography.weights.bold },
    trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, marginTop: spacing.md, alignSelf: 'flex-start' },
    trendText: { color: colors.brand.accent, fontSize: typography.sizes.sm, marginLeft: spacing.xs, fontWeight: typography.weights.medium },

    progressContainer: { marginTop: spacing.xl },
    progressBar: { height: 8, backgroundColor: colors.glass.background, borderRadius: radius.full, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: radius.full },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    progressLabel: { color: colors.text.tertiary, fontSize: typography.sizes.xs },

    sectionTitle: { color: colors.text.primary, fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, marginTop: spacing.lg, marginBottom: spacing.md },

    quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
    quickAction: { alignItems: 'center', width: (width - spacing.xl * 2 - spacing.md * 3) / 4 },
    quickActionIcon: { width: 52, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    quickActionLabel: { color: colors.text.secondary, fontSize: typography.sizes.xs, textAlign: 'center' },

    harmonyContent: { padding: spacing.xl },
    harmonyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    harmonyLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    harmonyScore: { color: colors.text.primary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
    balancedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
    balancedText: { color: colors.brand.accent, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
    seeAllButton: { flexDirection: 'row', alignItems: 'center' },
    seeAllText: { color: colors.text.tertiary, fontSize: typography.sizes.md, marginRight: spacing.xs },

    emptyState: { padding: spacing['2xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 40, marginBottom: spacing.md },
    emptyText: { color: colors.text.secondary, fontSize: typography.sizes.lg },

    billContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
    billIcon: { fontSize: 28, marginRight: spacing.md },
    billName: { color: colors.text.primary, fontWeight: typography.weights.medium, fontSize: typography.sizes.lg },
    billDate: { color: colors.text.tertiary, fontSize: typography.sizes.md },
    billAmount: { color: colors.text.primary, fontWeight: typography.weights.bold, fontSize: typography.sizes.xl },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, marginTop: spacing.xs },
    statusText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
    payButton: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: 'rgba(16, 185, 129, 0.15)', alignItems: 'center', justifyContent: 'center', marginLeft: spacing.md, borderWidth: 1, borderColor: colors.brand.primary },
});
