import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useBills } from '../../context/BillsContext';
import { useI18n } from '../../lib/i18n';
import Avatar from '../../components/Avatar';
import { colors, typography, spacing, radius } from '../../lib/theme';
import {
    getSpendingByCategory,
    getMonthlyTotals,
    getPartnerStats,
    getTopCategories,
    getMonthlyChange,
} from '../../lib/analytics';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
    const { user, profile } = useAuth();
    const { bills } = useBills();
    const { t, language } = useI18n();

    // Calculate analytics
    const categoryData = useMemo(() => getSpendingByCategory(bills), [bills]);
    const monthlyData = useMemo(() => getMonthlyTotals(bills, 6, user?.id), [bills, user?.id]);
    const topCategories = useMemo(() => getTopCategories(bills, 5), [bills]);
    const monthlyChange = useMemo(() => getMonthlyChange(bills), [bills]);
    const myStats = useMemo(() =>
        getPartnerStats(bills, user?.id || '', profile?.display_name || 'Me', profile?.avatar_url || undefined),
        [bills, user?.id, profile]
    );

    // Partner stats (if household has partner)
    const partnerBills = bills.filter(b => b.creatorId !== user?.id);
    const hasPartner = partnerBills.length > 0;
    const partnerStats = useMemo(() => {
        if (!hasPartner) return null;
        const partnerId = partnerBills[0]?.creatorId;
        return getPartnerStats(bills, partnerId, t.reports.partnerSpending);
    }, [bills, hasPartner, partnerBills, t.reports.partnerSpending]);

    // Chart configurations
    const chartConfig = {
        backgroundColor: colors.background.primary,
        backgroundGradientFrom: colors.background.secondary,
        backgroundGradientTo: colors.background.primary,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        propsForLabels: {
            fontSize: 11,
            fontFamily: 'System',
        },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: colors.brand.primary,
        },
    };

    // Prepare pie chart data
    const pieData = categoryData.slice(0, 6).map(cat => ({
        name: cat.category,
        population: cat.total,
        color: cat.color,
        legendFontColor: colors.text.secondary,
        legendFontSize: 12,
    }));

    // Prepare line chart data
    const lineData = {
        labels: monthlyData.map(m => m.month),
        datasets: [
            {
                data: monthlyData.map(m => m.total || 0.01),
                color: (opacity = 1) => colors.brand.primary,
                strokeWidth: 3,
            },
        ],
    };

    // Prepare bar chart data
    const barData = {
        labels: topCategories.map(c => c.category.substring(0, 4)),
        datasets: [
            {
                data: topCategories.map(c => c.total || 0.01),
            },
        ],
    };

    const isPositiveChange = monthlyChange.change >= 0;

    if (bills.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView style={styles.scrollView}>
                    <Text style={styles.headerTitle}>{t.reports.title}</Text>

                    <View style={styles.emptyState}>
                        <PieChartIcon size={64} color={colors.text.tertiary} />
                        <Text style={styles.emptyTitle}>{t.reports.noData}</Text>
                        <Text style={styles.emptySubtitle}>{t.reports.addBillsPrompt}</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Text style={styles.headerTitle}>{t.reports.title}</Text>

                {/* Monthly Overview */}
                <View style={styles.card}>
                    <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.cardTitle}>{t.reports.monthlyOverview}</Text>

                    <View style={styles.overviewRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.overviewLabel}>{t.reports.thisMonth}</Text>
                            <Text style={styles.overviewValue}>
                                ${monthlyChange.currentMonth.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.changeContainer}>
                            {isPositiveChange ? (
                                <TrendingUp size={20} color={colors.status.error} />
                            ) : (
                                <TrendingDown size={20} color={colors.status.success} />
                            )}
                            <Text style={[
                                styles.changeText,
                                { color: isPositiveChange ? colors.status.error : colors.status.success }
                            ]}>
                                {Math.abs(monthlyChange.changePercentage).toFixed(1)}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {bills.filter(b => b.isPaid).length}
                            </Text>
                            <Text style={styles.statLabel}>{t.reports.paidBills}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {bills.filter(b => !b.isPaid).length}
                            </Text>
                            <Text style={styles.statLabel}>{t.reports.pendingBills}</Text>
                        </View>
                    </View>
                </View>

                {/* Category Breakdown */}
                {pieData.length > 0 && (
                    <View style={styles.card}>
                        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                        <Text style={styles.cardTitle}>{t.reports.categoryBreakdown}</Text>

                        <PieChart
                            data={pieData}
                            width={screenWidth - spacing.xl * 2 - 32}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                )}

                {/* Spending Trend */}
                {monthlyData.length > 0 && (
                    <View style={styles.card}>
                        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                        <Text style={styles.cardTitle}>{t.reports.spendingTrend}</Text>
                        <Text style={styles.cardSubtitle}>{t.reports.last6Months}</Text>

                        <LineChart
                            data={lineData}
                            width={screenWidth - spacing.xl * 2 - 32}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            withInnerLines={false}
                            withOuterLines={false}
                            withVerticalLines={false}
                            withHorizontalLines={true}
                            withDots={true}
                            withShadow={false}
                        />
                    </View>
                )}

                {/* Top Categories */}
                {topCategories.length > 0 && (
                    <View style={styles.card}>
                        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                        <Text style={styles.cardTitle}>{t.reports.topCategories}</Text>

                        <BarChart
                            data={barData}
                            width={screenWidth - spacing.xl * 2 - 32}
                            height={220}
                            yAxisLabel="$"
                            yAxisSuffix=""
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => colors.gradients.primary[0],
                            }}
                            style={styles.chart}
                            showValuesOnTopOfBars
                            withInnerLines={false}
                            fromZero
                        />
                    </View>
                )}

                {/* Partner Comparison */}
                {hasPartner && partnerStats && (
                    <View style={styles.card}>
                        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                        <Text style={styles.cardTitle}>{t.reports.partnerComparison}</Text>

                        <View style={styles.partnerRow}>
                            <View style={styles.partnerCard}>
                                <Avatar
                                    url={profile?.avatar_url}
                                    name={profile?.display_name}
                                    size="medium"
                                />
                                <Text style={styles.partnerName}>{t.reports.mySpending}</Text>
                                <Text style={styles.partnerAmount}>
                                    ${myStats.totalSpent.toFixed(2)}
                                </Text>
                                <Text style={styles.partnerBills}>
                                    {myStats.billsCreated} {t.reports.bills}
                                </Text>
                            </View>

                            <View style={styles.partnerCard}>
                                <Avatar
                                    url={partnerStats.avatar}
                                    name={partnerStats.name}
                                    size="medium"
                                />
                                <Text style={styles.partnerName}>{t.reports.partnerSpending}</Text>
                                <Text style={styles.partnerAmount}>
                                    ${partnerStats.totalSpent.toFixed(2)}
                                </Text>
                                <Text style={styles.partnerBills}>
                                    {partnerStats.billsCreated} {t.reports.bills}
                                </Text>
                            </View>
                        </View>
                    </View>
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

    headerTitle: {
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },

    card: {
        borderRadius: radius['2xl'],
        padding: spacing.xl,
        marginBottom: spacing.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glass.border,
    },

    cardTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },

    cardSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.text.tertiary,
        marginBottom: spacing.lg,
    },

    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },

    overviewLabel: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },

    overviewValue: {
        fontSize: typography.sizes['4xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
    },

    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
    },

    changeText: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        marginLeft: spacing.xs,
    },

    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    statItem: {
        flex: 1,
        alignItems: 'center',
    },

    statValue: {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.brand.primary,
        marginBottom: spacing.xs,
    },

    statLabel: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
    },

    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.glass.border,
    },

    chart: {
        marginVertical: spacing.md,
        borderRadius: radius.lg,
    },

    partnerRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },

    partnerCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.glass.background,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glass.border,
    },

    partnerName: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },

    partnerAmount: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },

    partnerBills: {
        fontSize: typography.sizes.xs,
        color: colors.text.tertiary,
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['5xl'],
    },

    emptyTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
    },

    emptySubtitle: {
        fontSize: typography.sizes.md,
        color: colors.text.secondary,
        textAlign: 'center',
    },
});
