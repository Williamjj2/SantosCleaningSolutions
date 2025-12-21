import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { Bill } from './billTypes';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type NotificationSettings = {
    billReminders: boolean;
    reminderDaysBefore: number;
    partnerPayments: boolean;
};

/**
 * Request notification permissions and get push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not determined
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return null;
    }

    // Get Expo push token
    try {
        const token = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-project-id', // Replace with actual project ID
        });
        return token.data;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

/**
 * Save push token to Supabase
 */
export async function savePushToken(token: string, userId: string): Promise<void> {
    try {
        const platform = Platform.OS;

        await supabase
            .from('push_tokens')
            .upsert({
                user_id: userId,
                token,
                platform,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,token',
            });
    } catch (error) {
        console.error('Error saving push token:', error);
    }
}

/**
 * Get notification settings for user
 */
export async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
    const defaultSettings: NotificationSettings = {
        billReminders: true,
        reminderDaysBefore: 2,
        partnerPayments: true,
    };

    try {
        const { data, error } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // Create default settings
            await supabase
                .from('notification_settings')
                .insert({
                    user_id: userId,
                    bill_reminders: defaultSettings.billReminders,
                    reminder_days_before: defaultSettings.reminderDaysBefore,
                    partner_payments: defaultSettings.partnerPayments,
                });
            return defaultSettings;
        }

        return {
            billReminders: data.bill_reminders,
            reminderDaysBefore: data.reminder_days_before,
            partnerPayments: data.partner_payments,
        };
    } catch (error) {
        console.error('Error getting notification settings:', error);
        return defaultSettings;
    }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
): Promise<void> {
    try {
        const updates: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (settings.billReminders !== undefined) {
            updates.bill_reminders = settings.billReminders;
        }
        if (settings.reminderDaysBefore !== undefined) {
            updates.reminder_days_before = settings.reminderDaysBefore;
        }
        if (settings.partnerPayments !== undefined) {
            updates.partner_payments = settings.partnerPayments;
        }

        await supabase
            .from('notification_settings')
            .update(updates)
            .eq('user_id', userId);
    } catch (error) {
        console.error('Error updating notification settings:', error);
    }
}

/**
 * Schedule a local notification for bill reminder
 */
export async function scheduleBillReminder(
    bill: Bill,
    daysBefore: number,
    language: 'en' | 'pt'
): Promise<string | null> {
    try {
        const dueDate = new Date(bill.dueDate);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - daysBefore);
        reminderDate.setHours(9, 0, 0, 0); // 9 AM

        // If reminder date is in the past, don't schedule
        if (reminderDate <= new Date()) {
            return null;
        }

        const title = language === 'pt'
            ? '💰 Conta próxima do vencimento'
            : '💰 Bill due soon';

        const body = language === 'pt'
            ? `${bill.name} vence em ${daysBefore} dia${daysBefore > 1 ? 's' : ''} - R$${bill.amount.toFixed(2)}`
            : `${bill.name} is due in ${daysBefore} day${daysBefore > 1 ? 's' : ''} - $${bill.amount.toFixed(2)}`;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: { billId: bill.id, type: 'reminder' },
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: reminderDate,
            },
        });

        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

/**
 * Schedule notification for bill due today
 */
export async function scheduleDueTodayNotification(
    bill: Bill,
    language: 'en' | 'pt'
): Promise<string | null> {
    try {
        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(8, 0, 0, 0); // 8 AM on due date

        if (dueDate <= new Date()) {
            return null;
        }

        const title = language === 'pt'
            ? '⚠️ Conta vence hoje!'
            : '⚠️ Bill due today!';

        const body = language === 'pt'
            ? `${bill.name} - R$${bill.amount.toFixed(2)}`
            : `${bill.name} - $${bill.amount.toFixed(2)}`;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: { billId: bill.id, type: 'dueToday' },
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: dueDate,
            },
        });

        return notificationId;
    } catch (error) {
        console.error('Error scheduling due today notification:', error);
        return null;
    }
}

/**
 * Cancel all scheduled notifications for a bill
 */
export async function cancelBillNotifications(billId: string): Promise<void> {
    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        for (const notification of scheduledNotifications) {
            if (notification.content.data?.billId === billId) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }
    } catch (error) {
        console.error('Error canceling notifications:', error);
    }
}

/**
 * Schedule notifications for all unpaid bills
 */
export async function scheduleAllBillReminders(
    bills: Bill[],
    daysBefore: number,
    language: 'en' | 'pt'
): Promise<void> {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const unpaidBills = bills.filter(b => !b.isPaid);

    for (const bill of unpaidBills) {
        await scheduleBillReminder(bill, daysBefore, language);
        await scheduleDueTodayNotification(bill, language);
    }
}

/**
 * Send immediate notification (for testing)
 */
export async function sendTestNotification(language: 'en' | 'pt'): Promise<void> {
    const title = language === 'pt'
        ? '🔔 Notificações ativadas!'
        : '🔔 Notifications enabled!';

    const body = language === 'pt'
        ? 'Você receberá lembretes de contas.'
        : 'You will receive bill reminders.';

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: null, // Immediate
    });
}
