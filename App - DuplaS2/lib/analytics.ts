import { Bill, BillCategory } from './billTypes';

export type CategorySpending = {
    category: BillCategory;
    total: number;
    count: number;
    percentage: number;
    color: string;
};

export type MonthlyTotal = {
    month: string;
    year: number;
    total: number;
    myTotal: number;
    partnerTotal: number;
    paidCount: number;
    totalCount: number;
};

export type PartnerStats = {
    userId: string;
    name: string;
    avatar?: string;
    totalSpent: number;
    billsCreated: number;
    billsPaid: number;
    topCategory: BillCategory;
};

export type ChangeStats = {
    currentMonth: number;
    lastMonth: number;
    change: number;
    changePercentage: number;
};

// Category colors mapping
const categoryColors: Record<BillCategory, string> = {
    rent: '#8B5CF6',
    electricity: '#F59E0B',
    water: '#3B82F6',
    internet: '#10B981',
    gas: '#EF4444',
    phone: '#EC4899',
    streaming: '#F43F5E',
    gym: '#14B8A6',
    insurance: '#6366F1',
    groceries: '#22C55E',
    transport: '#0EA5E9',
    healthcare: '#F97316',
    education: '#A855F7',
    other: '#6B7280',
};

/**
 * Calculate spending by category
 */
export function getSpendingByCategory(bills: Bill[]): CategorySpending[] {
    const categoryTotals: Record<BillCategory, number> = {} as any;
    const categoryCounts: Record<BillCategory, number> = {} as any;

    // Calculate totals
    let grandTotal = 0;
    bills.forEach(bill => {
        if (!categoryTotals[bill.category]) {
            categoryTotals[bill.category] = 0;
            categoryCounts[bill.category] = 0;
        }
        categoryTotals[bill.category] += bill.amount;
        categoryCounts[bill.category]++;
        grandTotal += bill.amount;
    });

    // Convert to array with percentages
    const result: CategorySpending[] = Object.entries(categoryTotals).map(([category, total]) => ({
        category: category as BillCategory,
        total,
        count: categoryCounts[category as BillCategory],
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
        color: categoryColors[category as BillCategory],
    }));

    // Sort by total descending
    return result.sort((a, b) => b.total - a.total);
}

/**
 * Get monthly totals for last N months
 */
export function getMonthlyTotals(bills: Bill[], months: number, userId?: string): MonthlyTotal[] {
    const now = new Date();
    const monthlyData: MonthlyTotal[] = [];

    // Generate last N months
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('en-US', { month: 'short' });

        monthlyData.push({
            month: monthName,
            year: date.getFullYear(),
            total: 0,
            myTotal: 0,
            partnerTotal: 0,
            paidCount: 0,
            totalCount: 0,
        });
    }

    // Aggregate bills into months
    bills.forEach(bill => {
        const billDate = new Date(bill.dueDate);
        const monthIndex = monthlyData.findIndex(m => {
            const monthDate = new Date(`${m.month} 1, ${m.year}`);
            return billDate.getMonth() === monthDate.getMonth() &&
                billDate.getFullYear() === monthDate.getFullYear();
        });

        if (monthIndex !== -1) {
            monthlyData[monthIndex].total += bill.amount;
            monthlyData[monthIndex].totalCount++;

            if (bill.isPaid) {
                monthlyData[monthIndex].paidCount++;
            }

            // Track by creator if userId provided
            if (userId) {
                if (bill.creatorId === userId) {
                    monthlyData[monthIndex].myTotal += bill.amount;
                } else {
                    monthlyData[monthIndex].partnerTotal += bill.amount;
                }
            }
        }
    });

    return monthlyData;
}

/**
 * Calculate partner-specific stats
 */
export function getPartnerStats(bills: Bill[], userId: string, userName: string, avatar?: string): PartnerStats {
    const myBills = bills.filter(b => b.creatorId === userId);
    const totalSpent = myBills.reduce((sum, b) => sum + b.amount, 0);
    const billsPaid = myBills.filter(b => b.isPaid).length;

    // Find top category
    const categoryTotals: Record<BillCategory, number> = {} as any;
    myBills.forEach(bill => {
        if (!categoryTotals[bill.category]) {
            categoryTotals[bill.category] = 0;
        }
        categoryTotals[bill.category] += bill.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] as BillCategory || 'other';

    return {
        userId,
        name: userName,
        avatar,
        totalSpent,
        billsCreated: myBills.length,
        billsPaid,
        topCategory,
    };
}

/**
 * Get top N categories by spending
 */
export function getTopCategories(bills: Bill[], limit: number = 5): CategorySpending[] {
    const allCategories = getSpendingByCategory(bills);
    return allCategories.slice(0, limit);
}

/**
 * Calculate month-over-month change
 */
export function getMonthlyChange(bills: Bill[]): ChangeStats {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();

    let currentMonthTotal = 0;
    let lastMonthTotal = 0;

    bills.forEach(bill => {
        const billDate = new Date(bill.dueDate);
        const billMonth = billDate.getMonth();
        const billYear = billDate.getFullYear();

        if (billMonth === currentMonth && billYear === currentYear) {
            currentMonthTotal += bill.amount;
        } else if (billMonth === lastMonth && billYear === lastYear) {
            lastMonthTotal += bill.amount;
        }
    });

    const change = currentMonthTotal - lastMonthTotal;
    const changePercentage = lastMonthTotal > 0 ? (change / lastMonthTotal) * 100 : 0;

    return {
        currentMonth: currentMonthTotal,
        lastMonth: lastMonthTotal,
        change,
        changePercentage,
    };
}
