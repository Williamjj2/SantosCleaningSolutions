// Bill translations - English
export const billCategories = {
    rent: { icon: '🏠', label: 'Rent', color: '#8B5CF6' },
    electricity: { icon: '⚡', label: 'Electricity', color: '#F59E0B' },
    water: { icon: '💧', label: 'Water', color: '#3B82F6' },
    internet: { icon: '🌐', label: 'Internet', color: '#10B981' },
    gas: { icon: '🔥', label: 'Gas', color: '#EF4444' },
    phone: { icon: '📱', label: 'Phone', color: '#EC4899' },
    streaming: { icon: '📺', label: 'Streaming', color: '#F43F5E' },
    gym: { icon: '💪', label: 'Gym', color: '#14B8A6' },
    insurance: { icon: '🛡️', label: 'Insurance', color: '#6366F1' },
    groceries: { icon: '🛒', label: 'Groceries', color: '#22C55E' },
    transport: { icon: '🚗', label: 'Transport', color: '#0EA5E9' },
    healthcare: { icon: '🏥', label: 'Healthcare', color: '#F97316' },
    education: { icon: '📚', label: 'Education', color: '#A855F7' },
    credit_card: { icon: '💳', label: 'Credit Card', color: '#DB2777' },
    shopping: { icon: '🛍️', label: 'Shopping', color: '#BE185D' },
    food: { icon: '🍔', label: 'Food & Delivery', color: '#F59E0B' },
    software: { icon: '💻', label: 'Software', color: '#4B5563' },
    pets: { icon: '🐾', label: 'Pets', color: '#B45309' },
    other: { icon: '📦', label: 'Other', color: '#6B7280' },
};

export const billCategoriesPt = {
    rent: { icon: '🏠', label: 'Aluguel', color: '#8B5CF6' },
    electricity: { icon: '⚡', label: 'Luz', color: '#F59E0B' },
    water: { icon: '💧', label: 'Água', color: '#3B82F6' },
    internet: { icon: '🌐', label: 'Internet', color: '#10B981' },
    gas: { icon: '🔥', label: 'Gás', color: '#EF4444' },
    phone: { icon: '📱', label: 'Telefone', color: '#EC4899' },
    streaming: { icon: '📺', label: 'Streaming', color: '#F43F5E' },
    gym: { icon: '💪', label: 'Academia', color: '#14B8A6' },
    insurance: { icon: '🛡️', label: 'Seguro', color: '#6366F1' },
    groceries: { icon: '🛒', label: 'Mercado', color: '#22C55E' },
    transport: { icon: '🚗', label: 'Transporte', color: '#0EA5E9' },
    healthcare: { icon: '🏥', label: 'Saúde', color: '#F97316' },
    education: { icon: '📚', label: 'Educação', color: '#A855F7' },
    credit_card: { icon: '💳', label: 'Cartão de Crédito', color: '#DB2777' },
    shopping: { icon: '🛍️', label: 'Compras', color: '#BE185D' },
    food: { icon: '🍔', label: 'Delivery', color: '#F59E0B' },
    software: { icon: '💻', label: 'Software', color: '#4B5563' },
    pets: { icon: '🐾', label: 'Pets', color: '#B45309' },
    other: { icon: '📦', label: 'Outro', color: '#6B7280' },
};

export const frequencies = {
    monthly: { en: 'Monthly', pt: 'Mensal' },
    weekly: { en: 'Weekly', pt: 'Semanal' },
    biweekly: { en: 'Bi-weekly', pt: 'Quinzenal' },
    yearly: { en: 'Yearly', pt: 'Anual' },
    once: { en: 'One-time', pt: 'Único' },
};

export const responsible = {
    me: { en: 'Me', pt: 'Eu', icon: '👤' },
    partner: { en: 'Partner', pt: 'Parceiro(a)', icon: '💑' },
    split: { en: 'Split 50/50', pt: 'Dividido 50/50', icon: '🤝' },
};

export type BillCategory = keyof typeof billCategories;
export type BillFrequency = keyof typeof frequencies;
export type BillResponsible = keyof typeof responsible;

export interface Bill {
    id: string;
    name: string;
    amount: number;
    category: BillCategory;
    dueDate: Date;
    frequency: BillFrequency;
    responsible: BillResponsible;
    isPaid: boolean;
    createdAt: Date;
    creatorId: string;
}
