import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Animated,
    Alert,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Trash2, Edit3 } from 'lucide-react-native';
import { useI18n } from '../lib/i18n';
import { colors, typography, spacing, radius } from '../lib/theme';
import { haptic } from '../lib/animations';
import { useBills } from '../context/BillsContext';
import { useAuth } from '../context/AuthContext';
import {
    billCategories,
    billCategoriesPt,
    frequencies,
    responsible,
    Bill,
    BillCategory,
    BillFrequency,
    BillResponsible
} from '../lib/billTypes';

type BillDetailModalProps = {
    visible: boolean;
    bill: Bill | null;
    onClose: () => void;
};

export default function BillDetailModal({ visible, bill, onClose }: BillDetailModalProps) {
    const { language } = useI18n();
    const { user } = useAuth();
    const { updateBill, deleteBill, markAsPaid } = useBills();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<BillCategory>('other');
    const [dueDay, setDueDay] = useState('');
    const [frequency, setFrequency] = useState<BillFrequency>('monthly');
    const [responsiblePerson, setResponsiblePerson] = useState<BillResponsible>('me');

    const slideAnim = useRef(new Animated.Value(300)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible && bill) {
            // Reset form with bill data
            setName(bill.name);
            setAmount(bill.amount.toString());
            setCategory(bill.category);
            setDueDay(new Date(bill.dueDate).getDate().toString());
            setFrequency(bill.frequency);
            setResponsiblePerson(bill.responsible);
            setIsEditing(false);

            // Animate in
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible, bill]);

    if (!bill) return null;

    const categories = language === 'pt' ? billCategoriesPt : billCategories;
    const catData = categories[category];

    const handleClose = () => {
        haptic.light();
        onClose();
    };

    const handleEdit = () => {
        haptic.light();
        setIsEditing(true);
    };

    const handleSave = () => {
        const parsedAmount = parseFloat(amount.replace(',', '.'));
        const parsedDay = parseInt(dueDay, 10);

        if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
            haptic.error();
            Alert.alert(
                language === 'pt' ? 'Erro' : 'Error',
                language === 'pt' ? 'Dados inválidos' : 'Invalid data'
            );
            return;
        }

        const today = new Date();
        let dueDate = new Date(today.getFullYear(), today.getMonth(), parsedDay);
        if (dueDate < today) {
            dueDate = new Date(today.getFullYear(), today.getMonth() + 1, parsedDay);
        }

        updateBill(bill.id, {
            name: name.trim(),
            amount: parsedAmount,
            category,
            dueDate,
            frequency,
            responsible: responsiblePerson,
        });

        haptic.success();
        setIsEditing(false);
        onClose();
    };

    const handleDelete = () => {
        haptic.warning();
        Alert.alert(
            language === 'pt' ? 'Excluir conta?' : 'Delete bill?',
            language === 'pt' ? 'Esta ação não pode ser desfeita.' : 'This action cannot be undone.',
            [
                { text: language === 'pt' ? 'Cancelar' : 'Cancel', style: 'cancel' },
                {
                    text: language === 'pt' ? 'Excluir' : 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteBill(bill.id);
                        haptic.success();
                        onClose();
                    }
                },
            ]
        );
    };

    const handleMarkPaid = () => {
        haptic.success();
        markAsPaid(bill.id);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
                <TouchableOpacity style={styles.overlayTouch} onPress={handleClose} activeOpacity={1} />

                <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

                    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                                <X size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>
                                {isEditing
                                    ? (language === 'pt' ? 'Editar Conta' : 'Edit Bill')
                                    : (language === 'pt' ? 'Detalhes' : 'Details')
                                }
                            </Text>
                            {!isEditing ? (
                                <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                                    <Edit3 size={20} color={colors.text.primary} />
                                </TouchableOpacity>
                            ) : (
                                <View style={{ width: 44 }} />
                            )}
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {!isEditing ? (
                                // View Mode
                                <>
                                    <View style={styles.billHeader}>
                                        <Text style={styles.billIcon}>{catData.icon}</Text>
                                        <View>
                                            <Text style={styles.billName}>{bill.name}</Text>
                                            <Text style={styles.billCategory}>{catData.label}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.amountContainer}>
                                        <Text style={styles.amountLabel}>
                                            {language === 'pt' ? 'Valor' : 'Amount'}
                                        </Text>
                                        <Text style={styles.amountValue}>${bill.amount.toLocaleString()}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>
                                                {language === 'pt' ? 'Vencimento' : 'Due Date'}
                                            </Text>
                                            <Text style={styles.infoValue}>
                                                {new Date(bill.dueDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                                            </Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>
                                                {language === 'pt' ? 'Frequência' : 'Frequency'}
                                            </Text>
                                            <Text style={styles.infoValue}>
                                                {language === 'pt' ? frequencies[bill.frequency].pt : frequencies[bill.frequency].en}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>
                                                {language === 'pt' ? 'Responsável' : 'Responsible'}
                                            </Text>
                                            <Text style={styles.infoValue}>
                                                {(() => {
                                                    const isCreator = bill.creatorId === user?.id;
                                                    let respObj = responsible[bill.responsible];

                                                    if (bill.responsible === 'me') {
                                                        respObj = isCreator ? responsible.me : responsible.partner;
                                                    } else if (bill.responsible === 'partner') {
                                                        respObj = isCreator ? responsible.partner : responsible.me;
                                                    }

                                                    return `${respObj.icon} ${language === 'pt' ? respObj.pt : respObj.en}`;
                                                })()}
                                            </Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>Status</Text>
                                            <Text style={[styles.infoValue, { color: bill.isPaid ? colors.brand.primary : colors.status.warning }]}>
                                                {bill.isPaid
                                                    ? (language === 'pt' ? '✓ Pago' : '✓ Paid')
                                                    : (language === 'pt' ? 'Pendente' : 'Pending')
                                                }
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Actions */}
                                    <View style={styles.actionsContainer}>
                                        {!bill.isPaid && (
                                            <TouchableOpacity onPress={handleMarkPaid} style={styles.actionButton}>
                                                <LinearGradient
                                                    colors={colors.gradients.primary}
                                                    style={styles.actionGradient}
                                                >
                                                    <Check size={20} color="#fff" />
                                                    <Text style={styles.actionText}>
                                                        {language === 'pt' ? 'Marcar como Pago' : 'Mark as Paid'}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                                            <Trash2 size={20} color={colors.status.error} />
                                            <Text style={styles.deleteText}>
                                                {language === 'pt' ? 'Excluir' : 'Delete'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                // Edit Mode
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>
                                            {language === 'pt' ? 'Nome' : 'Name'}
                                        </Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={name}
                                            onChangeText={setName}
                                            placeholderTextColor={colors.text.tertiary}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>
                                            {language === 'pt' ? 'Valor' : 'Amount'}
                                        </Text>
                                        <View style={styles.amountInputWrapper}>
                                            <Text style={styles.amountPrefix}>$</Text>
                                            <TextInput
                                                style={[styles.textInput, { paddingLeft: 40 }]}
                                                value={amount}
                                                onChangeText={setAmount}
                                                keyboardType="decimal-pad"
                                                placeholderTextColor={colors.text.tertiary}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>
                                            {language === 'pt' ? 'Categoria' : 'Category'}
                                        </Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {Object.entries(categories).map(([key, cat]) => (
                                                <TouchableOpacity
                                                    key={key}
                                                    onPress={() => {
                                                        haptic.selection();
                                                        setCategory(key as BillCategory);
                                                    }}
                                                >
                                                    <View style={[
                                                        styles.categoryChip,
                                                        category === key && { backgroundColor: `${cat.color}25`, borderColor: cat.color }
                                                    ]}>
                                                        <Text>{cat.icon}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>
                                            {language === 'pt' ? 'Dia do vencimento' : 'Due day'}
                                        </Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={dueDay}
                                            onChangeText={(t) => setDueDay(t.replace(/[^0-9]/g, '').slice(0, 2))}
                                            keyboardType="numeric"
                                            placeholder="15"
                                            placeholderTextColor={colors.text.tertiary}
                                        />
                                    </View>

                                    <TouchableOpacity onPress={handleSave} style={{ marginTop: spacing.xl }}>
                                        <LinearGradient
                                            colors={colors.gradients.primary}
                                            style={styles.saveButton}
                                        >
                                            <Check size={22} color="#fff" />
                                            <Text style={styles.saveText}>
                                                {language === 'pt' ? 'Salvar Alterações' : 'Save Changes'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end'
    },
    overlayTouch: { flex: 1 },
    modalContainer: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: radius['2xl'],
        borderTopRightRadius: radius['2xl'],
        maxHeight: '85%',
        overflow: 'hidden',
    },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.border,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.glass.background,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text.primary
    },

    content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

    billHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
    billIcon: { fontSize: 48, marginRight: spacing.lg },
    billName: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.text.primary },
    billCategory: { fontSize: typography.sizes.md, color: colors.text.secondary },

    amountContainer: {
        backgroundColor: colors.glass.background,
        borderRadius: radius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    amountLabel: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.xs },
    amountValue: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.bold, color: colors.text.primary },

    infoRow: { flexDirection: 'row', marginBottom: spacing.lg },
    infoItem: { flex: 1 },
    infoLabel: { fontSize: typography.sizes.sm, color: colors.text.tertiary, marginBottom: spacing.xs },
    infoValue: { fontSize: typography.sizes.lg, color: colors.text.primary, fontWeight: typography.weights.medium },

    actionsContainer: { marginTop: spacing.xl, paddingBottom: spacing['3xl'] },
    actionButton: { marginBottom: spacing.md },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: radius.lg
    },
    actionText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: '#fff', marginLeft: spacing.sm },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: radius.lg,
        backgroundColor: 'rgba(251, 113, 133, 0.15)',
        borderWidth: 1,
        borderColor: colors.status.error,
    },
    deleteText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium, color: colors.status.error, marginLeft: spacing.sm },

    inputGroup: { marginBottom: spacing.lg },
    inputLabel: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
    textInput: {
        backgroundColor: colors.glass.background,
        borderWidth: 1,
        borderColor: colors.glass.border,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.lg,
        color: colors.text.primary,
    },
    amountInputWrapper: { position: 'relative' },
    amountPrefix: { position: 'absolute', left: spacing.lg, top: spacing.md, fontSize: typography.sizes.lg, color: colors.brand.primary, zIndex: 1 },

    categoryChip: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        backgroundColor: colors.glass.background,
        borderWidth: 1,
        borderColor: colors.glass.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },

    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: radius.lg,
        marginBottom: spacing['4xl'],
    },
    saveText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: '#fff', marginLeft: spacing.sm },
});
