import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { useAuth } from '../context/AuthContext';
import { useI18n } from '../lib/i18n';
import { colors, typography, spacing, radius } from '../lib/theme';
import { haptic, createPulse } from '../lib/animations';

const { width, height } = Dimensions.get('window');

// Configure Google Sign-In
GoogleSignin.configure({
    iosClientId: '430379674828-2r0ln2mqubrvma17e8kead6s56d4ctge.apps.googleusercontent.com',
    webClientId: '430379674828-av7p0vf28sdbqg066j84f7nq83ikg55u.apps.googleusercontent.com',
});

export default function LoginScreen() {
    const { signIn, signUp, signInWithGoogle, isLoading } = useAuth();
    const { t } = useI18n();

    // Form State
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);

    // Animations
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const formTranslate = useRef(new Animated.Value(20)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Staggered entrance animation
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(formOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(formTranslate, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]),
        ]).start();

        // Start pulsing animation
        createPulse(pulseAnim).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
    };

    const handleSubmit = async () => {
        haptic.success();

        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (isRegistering && !name) {
            Alert.alert('Erro', 'Por favor, informe seu nome.');
            return;
        }

        try {
            if (isRegistering) {
                await signUp(email, password, name);
            } else {
                await signIn(email, password);
            }
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const handleGoogleSignIn = async () => {
        haptic.success();
        setGoogleLoading(true);

        try {
            // Check if play services are available (Android)
            await GoogleSignin.hasPlayServices();

            // Sign in with Google
            const userInfo = await GoogleSignin.signIn();

            // Get the ID token
            const idToken = userInfo.data?.idToken;

            if (idToken) {
                // Use the ID token to authenticate with Firebase/Supabase
                await signInWithGoogle(idToken);
            } else {
                Alert.alert('Erro', 'Não foi possível obter o token de autenticação.');
            }
        } catch (error: any) {
            console.error('Google Sign-In error:', error);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled the sign-in
                console.log('User cancelled sign-in');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('Aguarde', 'Login em andamento...');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Erro', 'Google Play Services não disponível.');
            } else {
                Alert.alert('Erro', 'Falha ao fazer login com Google. Tente novamente.');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const toggleMode = () => {
        haptic.light();
        setIsRegistering(!isRegistering);
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Animated Background Orbs */}
            <View style={styles.orbContainer}>
                <Animated.View
                    style={[
                        styles.orb,
                        styles.orb1,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                />
                <View style={[styles.orb, styles.orb2]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo Section */}
                    <Animated.View
                        style={[
                            styles.logoSection,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }]
                            }
                        ]}
                    >
                        <View style={styles.iconBox}>
                            <LinearGradient
                                colors={colors.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.iconGradient}
                            >
                                <Zap size={40} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>DuplaS2</Text>
                        <Text style={styles.subtitle}>
                            {isRegistering ? 'Crie sua conta' : 'Gerencie suas contas a dois'}
                        </Text>
                    </Animated.View>

                    {/* Form Section */}
                    <Animated.View
                        style={[
                            styles.formSection,
                            {
                                opacity: formOpacity,
                                transform: [{ translateY: formTranslate }]
                            }
                        ]}
                    >
                        {isRegistering && (
                            <View style={styles.inputContainer}>
                                <User size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nome"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <Mail size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={colors.text.tertiary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Senha"
                                placeholderTextColor={colors.text.tertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Submit Button */}
                        <Animated.View
                            style={[
                                styles.buttonContainer,
                                { transform: [{ scale: buttonScale }] }
                            ]}
                        >
                            <TouchableOpacity
                                onPress={handleSubmit}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                disabled={isLoading}
                                activeOpacity={1}
                            >
                                <LinearGradient
                                    colors={colors.gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    <Text style={styles.buttonText}>
                                        {isLoading ? 'Carregando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
                                    </Text>
                                    {!isLoading && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                            disabled={googleLoading || isLoading}
                        >
                            <AntDesign name="google" size={20} color="#fff" style={{ marginRight: 12 }} />
                            <Text style={styles.googleButtonText}>
                                {googleLoading ? 'Carregando...' : 'Entrar com Google'}
                            </Text>
                        </TouchableOpacity>

                        {/* Toggle Mode */}
                        <TouchableOpacity onPress={toggleMode} style={styles.footerButton}>
                            <Text style={styles.footerText}>
                                {isRegistering ? 'Já tem uma conta? ' : 'Não tem conta? '}
                                <Text style={styles.footerLink}>
                                    {isRegistering ? 'Entrar' : 'Criar conta'}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    orbContainer: {
        overflow: 'hidden',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },
    orb1: {
        width: 300,
        height: 300,
        backgroundColor: colors.brand.primary,
        opacity: 0.15,
        top: -100,
        right: -100,
    },
    orb2: {
        width: 200,
        height: 200,
        backgroundColor: colors.brand.secondary,
        opacity: 0.1,
        bottom: 100,
        left: -50,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: spacing.xl * 2,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.xl * 2,
    },
    iconBox: {
        marginBottom: spacing.lg,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    formSection: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glass.border,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: typography.sizes.md,
        color: colors.text.primary,
    },
    buttonContainer: {
        marginTop: spacing.md,
    },
    gradientButton: {
        height: 56,
        borderRadius: radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text.primary,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.glass.border,
    },
    dividerText: {
        color: colors.text.tertiary,
        fontSize: typography.sizes.sm,
        marginHorizontal: spacing.md,
    },
    googleButton: {
        height: 56,
        borderRadius: radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.tertiary,
        borderWidth: 1,
        borderColor: colors.glass.border,
        marginTop: spacing.md,
    },
    googleButtonText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.medium,
        color: colors.text.primary,
    },
    footerButton: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        color: colors.text.secondary,
        fontSize: typography.sizes.sm,
    },
    footerLink: {
        color: colors.brand.primary,
        fontWeight: typography.weights.bold,
    },
});
