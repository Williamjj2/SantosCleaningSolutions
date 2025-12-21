import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, Check, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../lib/i18n';
import Avatar from '../components/Avatar';
import { colors, typography, spacing, radius } from '../lib/theme';
import { haptic } from '../lib/animations';

export default function ProfileEditScreen() {
    const { profile, updateProfile, uploadAvatar } = useAuth();
    const { language } = useI18n();

    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePickImage = async (useCamera: boolean) => {
        haptic.light();

        try {
            let result;

            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        language === 'pt' ? 'Permissão necessária' : 'Permission required',
                        language === 'pt'
                            ? 'Precisamos de acesso à câmera'
                            : 'We need camera access'
                    );
                    return;
                }

                result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        language === 'pt' ? 'Permissão necessária' : 'Permission required',
                        language === 'pt'
                            ? 'Precisamos de acesso à galeria'
                            : 'We need gallery access'
                    );
                    return;
                }

                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0]) {
                // Compress and resize image
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 800, height: 800 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );

                setAvatarUri(manipulatedImage.uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(
                language === 'pt' ? 'Erro' : 'Error',
                language === 'pt' ? 'Não foi possível selecionar a imagem' : 'Could not select image'
            );
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            language === 'pt' ? 'Escolher foto' : 'Choose photo',
            language === 'pt' ? 'De onde você quer escolher?' : 'Where do you want to choose from?',
            [
                {
                    text: language === 'pt' ? 'Câmera' : 'Camera',
                    onPress: () => handlePickImage(true),
                },
                {
                    text: language === 'pt' ? 'Galeria' : 'Gallery',
                    onPress: () => handlePickImage(false),
                },
                {
                    text: language === 'pt' ? 'Cancelar' : 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            haptic.error();
            Alert.alert(
                language === 'pt' ? 'Nome obrigatório' : 'Name required',
                language === 'pt' ? 'Por favor, insira seu nome' : 'Please enter your name'
            );
            return;
        }

        setIsLoading(true);
        haptic.light();

        try {
            const updates: { display_name?: string; avatar_url?: string } = {};

            // Upload avatar if changed
            if (avatarUri) {
                const publicUrl = await uploadAvatar(avatarUri);
                updates.avatar_url = publicUrl;
            }

            // Update display name if changed
            if (displayName.trim() !== profile?.display_name) {
                updates.display_name = displayName.trim();
            }

            if (Object.keys(updates).length > 0) {
                await updateProfile(updates);
            }

            haptic.success();
            Alert.alert(
                language === 'pt' ? 'Sucesso!' : 'Success!',
                language === 'pt' ? 'Perfil atualizado' : 'Profile updated',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error saving profile:', error);
            haptic.error();
            Alert.alert(
                language === 'pt' ? 'Erro' : 'Error',
                language === 'pt' ? 'Não foi possível salvar o perfil' : 'Could not save profile'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.95, tension: 100, friction: 8, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <X size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {language === 'pt' ? 'Editar Perfil' : 'Edit Profile'}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        onPress={showImageOptions}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Avatar
                                url={avatarUri || profile?.avatar_url}
                                name={displayName || profile?.display_name}
                                size="xlarge"
                            />
                            <View style={styles.cameraButton}>
                                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                                <Camera size={20} color={colors.text.primary} />
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>
                        {language === 'pt' ? 'Toque para alterar' : 'Tap to change'}
                    </Text>
                </View>

                {/* Display Name Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>
                        {language === 'pt' ? 'NOME DE EXIBIÇÃO' : 'DISPLAY NAME'}
                    </Text>
                    <View style={styles.inputWrapper}>
                        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                        <TextInput
                            style={styles.textInput}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder={language === 'pt' ? 'Seu nome' : 'Your name'}
                            placeholderTextColor={colors.text.tertiary}
                            maxLength={50}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    style={styles.saveButtonContainer}
                >
                    <LinearGradient colors={colors.gradients.primary} style={styles.saveButton}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Check size={22} color="#fff" />
                                <Text style={styles.saveText}>
                                    {language === 'pt' ? 'Salvar Alterações' : 'Save Changes'}
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
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
    headerButton: {
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

    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing['4xl'],
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.background.primary,
    },
    avatarHint: {
        marginTop: spacing.md,
        fontSize: typography.sizes.sm,
        color: colors.text.tertiary,
    },

    inputSection: {
        marginBottom: spacing['3xl'],
    },
    inputLabel: {
        fontSize: typography.sizes.sm,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        fontWeight: typography.weights.medium,
    },
    inputWrapper: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    textInput: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.lg,
        color: colors.text.primary,
        fontWeight: typography.weights.medium,
    },

    saveButtonContainer: {
        marginTop: spacing.xl,
        marginBottom: spacing['4xl'],
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: radius.lg,
    },
    saveText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: '#fff',
        marginLeft: spacing.sm,
    },
});
