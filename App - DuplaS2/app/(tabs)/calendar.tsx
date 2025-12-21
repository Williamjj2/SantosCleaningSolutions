import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useI18n } from '../../lib/i18n';
import { useBills } from '../../context/BillsContext';
import { colors, typography, spacing, radius, glassStyle } from '../../lib/theme';
import { haptic } from '../../lib/animations';
import { billCategories, billCategoriesPt } from '../../lib/billTypes';
import { MiniLogo } from '../../components/BrandLogo';

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - spacing.xl * 2 - spacing.xs * 12) / 7;

// Days of week header
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Month names
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
    return (
        <View style={[styles.glassCard, style]}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            {children}
        </View>
    );
}

export default function CalendarScreen() {
    const { language } = useI18n();
    const { bills, markAsPaid } = useBills();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const headerOpacity = useRef(new Animated.Value(0)).current;
    const calendarOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(100, [
            Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(calendarOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const months = language === 'pt' ? MONTHS_PT : MONTHS_EN;
    const days = language === 'pt' ? DAYS_PT : DAYS_EN;

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Get bills for current month
    const billsByDay = useMemo(() => {
        const map: { [key: number]: typeof bills } = {};
        bills.forEach(bill => {
            const billDate = new Date(bill.dueDate);
            if (billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear) {
                const day = billDate.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(bill);
            }
        });
        return map;
    }, [bills, currentMonth, currentYear]);

    // Get bills for selected day
    const selectedDayBills = selectedDay ? billsByDay[selectedDay] || [] : [];

    const goToPrevMonth = () => {
        haptic.light();
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
        setSelectedDay(null);
    };

    const goToNextMonth = () => {
        haptic.light();
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
        setSelectedDay(null);
    };

    const handleDayPress = (day: number) => {
        haptic.selection();
        setSelectedDay(day === selectedDay ? null : day);
    };

    const handleMarkPaid = (billId: string) => {
        haptic.success();
        markAsPaid(billId);
    };

    const getCategoryData = (category: string) => {
        const cats = language === 'pt' ? billCategoriesPt : billCategories;
        return cats[category as keyof typeof cats] || { icon: '📦', label: 'Other', color: '#6B7280' };
    };

    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    // Render calendar grid
    const renderCalendarDays = () => {
        const rows = [];
        let cells = [];

        // Empty cells for days before first of month
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayBills = billsByDay[day] || [];
            const hasBills = dayBills.length > 0;
            const hasOverdue = dayBills.some(b => !b.isPaid && new Date(b.dueDate) < today);
            const allPaid = hasBills && dayBills.every(b => b.isPaid);
            const isToday = isCurrentMonth && today.getDate() === day;
            const isSelected = selectedDay === day;

            cells.push(
                <TouchableOpacity
                    key={day}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.dayCell,
                        isToday && styles.todayCell,
                        isSelected && styles.selectedCell,
                    ]}>
                        <Text style={[
                            styles.dayNumber,
                            isToday && styles.todayNumber,
                            isSelected && styles.selectedNumber,
                        ]}>
                            {day}
                        </Text>
                        {hasBills && (
                            <View style={styles.dotsContainer}>
                                {dayBills.slice(0, 3).map((bill, idx) => (
                                    <View key={idx} style={{ marginHorizontal: 1 }}>
                                        <MiniLogo billName={bill.name} size={12} />
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            );

            if ((firstDayOfMonth + day) % 7 === 0 || day === daysInMonth) {
                rows.push(
                    <View key={`row-${rows.length}`} style={styles.calendarRow}>
                        {cells}
                    </View>
                );
                cells = [];
            }
        }

        return rows;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                    <Text style={styles.headerTitle}>
                        {language === 'pt' ? 'Calendário' : 'Calendar'}
                    </Text>
                </Animated.View>

                {/* Month Navigation */}
                <Animated.View style={[styles.monthNav, { opacity: calendarOpacity }]}>
                    <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
                        <ChevronLeft size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {months[currentMonth]} {currentYear}
                    </Text>
                    <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                        <ChevronRight size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Calendar */}
                <Animated.View style={{ opacity: calendarOpacity }}>
                    <GlassCard>
                        <View style={styles.calendarContent}>
                            {/* Days of week header */}
                            <View style={styles.daysHeader}>
                                {days.map((day, idx) => (
                                    <View key={idx} style={styles.dayHeaderCell}>
                                        <Text style={styles.dayHeaderText}>{day}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Calendar grid */}
                            {renderCalendarDays()}
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.brand.primary }]} />
                        <Text style={styles.legendText}>{language === 'pt' ? 'Pago' : 'Paid'}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.status.warning }]} />
                        <Text style={styles.legendText}>{language === 'pt' ? 'Pendente' : 'Pending'}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.status.error }]} />
                        <Text style={styles.legendText}>{language === 'pt' ? 'Atrasado' : 'Overdue'}</Text>
                    </View>
                </View>

                {/* Selected Day Bills */}
                {selectedDay && (
                    <Animated.View>
                        <Text style={styles.sectionTitle}>
                            {language === 'pt' ? `Contas do dia ${selectedDay}` : `Bills for day ${selectedDay}`}
                        </Text>

                        {selectedDayBills.length === 0 ? (
                            <GlassCard>
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>
                                        {language === 'pt' ? 'Nenhuma conta neste dia' : 'No bills on this day'}
                                    </Text>
                                </View>
                            </GlassCard>
                        ) : (
                            selectedDayBills.map((bill) => {
                                const catData = getCategoryData(bill.category);
                                return (
                                    <GlassCard key={bill.id}>
                                        <View style={styles.billContent}>
                                            <Text style={styles.billIcon}>{catData.icon}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.billName}>{bill.name}</Text>
                                                <Text style={[
                                                    styles.billStatus,
                                                    { color: bill.isPaid ? colors.brand.primary : colors.status.warning }
                                                ]}>
                                                    {bill.isPaid
                                                        ? (language === 'pt' ? '✓ Pago' : '✓ Paid')
                                                        : (language === 'pt' ? 'Pendente' : 'Pending')
                                                    }
                                                </Text>
                                            </View>
                                            <Text style={styles.billAmount}>${bill.amount}</Text>
                                            {!bill.isPaid && (
                                                <TouchableOpacity
                                                    style={styles.payButton}
                                                    onPress={() => handleMarkPaid(bill.id)}
                                                >
                                                    <Check size={18} color={colors.brand.primary} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </GlassCard>
                                );
                            })
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    scrollView: { flex: 1, paddingHorizontal: spacing.xl },

    header: { marginTop: spacing.lg, marginBottom: spacing.xl },
    headerTitle: {
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        color: colors.text.primary
    },

    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg
    },
    navButton: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    monthText: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary
    },

    glassCard: { ...glassStyle, marginBottom: spacing.md },
    calendarContent: { padding: spacing.md },

    daysHeader: { flexDirection: 'row', marginBottom: spacing.sm },
    dayHeaderCell: { width: DAY_SIZE, alignItems: 'center' },
    dayHeaderText: {
        fontSize: typography.sizes.xs,
        color: colors.text.tertiary,
        fontWeight: typography.weights.medium
    },

    calendarRow: { flexDirection: 'row' },
    dayCell: {
        width: DAY_SIZE,
        height: DAY_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.xs,
    },
    todayCell: {
        backgroundColor: colors.glass.highlight,
        borderRadius: radius.md
    },
    selectedCell: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.brand.primary,
    },
    dayNumber: {
        fontSize: typography.sizes.md,
        color: colors.text.primary,
        fontWeight: typography.weights.medium
    },
    todayNumber: { color: colors.brand.primary, fontWeight: typography.weights.bold },
    selectedNumber: { color: colors.brand.primary },

    dotsContainer: { flexDirection: 'row', marginTop: 2 },
    billDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 1 },

    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: spacing.lg
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md
    },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
    legendText: { fontSize: typography.sizes.sm, color: colors.text.secondary },

    sectionTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md
    },

    emptyState: { padding: spacing.xl, alignItems: 'center' },
    emptyText: { color: colors.text.secondary, fontSize: typography.sizes.md },

    billContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
    billIcon: { fontSize: 28, marginRight: spacing.md },
    billName: { color: colors.text.primary, fontWeight: typography.weights.medium, fontSize: typography.sizes.lg },
    billStatus: { fontSize: typography.sizes.sm },
    billAmount: { color: colors.text.primary, fontWeight: typography.weights.bold, fontSize: typography.sizes.xl, marginRight: spacing.sm },
    payButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.brand.primary
    },
});
