import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill } from '../lib/billTypes';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type BillsContextType = {
    bills: Bill[];
    isLoading: boolean;
    addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => Promise<void>;
    updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
    deleteBill: (id: string) => Promise<void>;
    markAsPaid: (id: string) => Promise<void>;
};

const BillsContext = createContext<BillsContextType>({
    bills: [],
    isLoading: true,
    addBill: async () => { },
    updateBill: async () => { },
    deleteBill: async () => { },
    markAsPaid: async () => { },
});

export function useBills() {
    return useContext(BillsContext);
}

export function BillsProvider({ children }: { children: React.ReactNode }) {
    const { user, profile } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBills = async () => {
        if (!profile?.household_id) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('bills')
                .select('*')
                .eq('household_id', profile.household_id)
                .order('due_date', { ascending: true });

            if (error) throw error;

            const formattedBills = data.map(item => ({
                id: item.id,
                name: item.name,
                amount: Number(item.amount),
                category: item.category,
                dueDate: new Date(item.due_date),
                frequency: item.frequency,
                responsible: item.responsible,
                isPaid: item.is_paid,
                createdAt: new Date(item.created_at),
                creatorId: item.user_id,
            }));

            setBills(formattedBills);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();

        // Realtime subscription based on household
        if (profile?.household_id) {
            const channel = supabase
                .channel(`bills_household_${profile.household_id}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'bills',
                    filter: `household_id=eq.${profile.household_id}`
                }, () => {
                    fetchBills();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            setBills([]);
            setIsLoading(false);
        }
    }, [profile?.household_id]);

    const addBill = async (billData: Omit<Bill, 'id' | 'createdAt'>) => {
        if (!user || !profile?.household_id) return;

        try {
            const { error } = await supabase.from('bills').insert({
                name: billData.name,
                amount: billData.amount,
                category: billData.category,
                due_date: billData.dueDate.toISOString().split('T')[0],
                frequency: billData.frequency,
                responsible: billData.responsible,
                is_paid: billData.isPaid,
                user_id: user.id,
                household_id: profile.household_id
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error adding bill:', error);
            throw error;
        }
    };

    const updateBill = async (id: string, updates: Partial<Bill>) => {
        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate.toISOString().split('T')[0];
            if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
            if (updates.responsible !== undefined) dbUpdates.responsible = updates.responsible;
            if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;

            const { error } = await supabase
                .from('bills')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating bill:', error);
            throw error;
        }
    };

    const deleteBill = async (id: string) => {
        try {
            const { error } = await supabase
                .from('bills')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting bill:', error);
            throw error;
        }
    };

    const markAsPaid = async (id: string) => {
        await updateBill(id, { isPaid: true });
    };

    return (
        <BillsContext.Provider value={{ bills, isLoading, addBill, updateBill, deleteBill, markAsPaid }}>
            {children}
        </BillsContext.Provider>
    );
}
