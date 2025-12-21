import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type Profile = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    household_id: string | null;
    household_name?: string;
    invite_code?: string; // from household
};

type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    signIn: (email?: string, password?: string) => Promise<void>;
    signInWithGoogle: (idToken: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    joinPartner: (code: string) => Promise<{ success: boolean; error?: string }>;
    refreshProfile: () => Promise<void>;
    updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<void>;
    uploadAvatar: (imageUri: string) => Promise<string>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    signIn: async () => { },
    signInWithGoogle: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    joinPartner: async () => ({ success: false, error: 'Not implemented' }),
    refreshProfile: async () => { },
    updateProfile: async () => { },
    uploadAvatar: async () => '',
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, 
                    display_name, 
                    avatar_url, 
                    household_id,
                    households ( invite_code )
                `)
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (data) {
                setProfile({
                    id: data.id,
                    display_name: data.display_name,
                    avatar_url: data.avatar_url,
                    household_id: data.household_id,
                    invite_code: (data.households as any)?.invite_code,
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id);
                // We'll set isLoading to false after profile fetch in this case too
                // but let's ensure it doesn't block forever
                setTimeout(() => setIsLoading(false), 2000);
            } else {
                setProfile(null);
                setIsLoading(false);
                router.replace('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Also update isLoading when profile is set
    useEffect(() => {
        if (profile) {
            setIsLoading(false);
        }
    }, [profile]);

    const signIn = async (email?: string, password?: string) => {
        setIsLoading(true);
        try {
            if (email && password) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInAnonymously();
                if (error) throw error;
            }
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Falha ao entrar. Tente novamente.');
        } finally {
            // Loading will be cleared by the auth state change listener
        }
    };

    const signInWithGoogle = async (idToken: string) => {
        setIsLoading(true);
        try {
            // 1. Firebase Auth
            const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
            const { auth } = await import('../lib/firebase');

            const credential = GoogleAuthProvider.credential(idToken);
            const firebaseUserCredential = await signInWithCredential(auth, credential);
            const fbUser = firebaseUserCredential.user;

            if (!fbUser.email) throw new Error('Google Log In failed: No email provided');

            // 2. Data Bridge (Supabase)
            const shadowPassword = `fb_shadow_${fbUser.uid}_sec`;

            // Try to sign in to Supabase
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: fbUser.email,
                password: shadowPassword
            });

            if (signInError) {
                // If Sign In fails, try to Sign Up (Shadow Account)
                console.log('Shadow sign-in failed, creating new shadow account...');

                const { error: signUpError } = await supabase.auth.signUp({
                    email: fbUser.email,
                    password: shadowPassword,
                    options: {
                        data: {
                            display_name: fbUser.displayName || fbUser.email.split('@')[0],
                            avatar_url: fbUser.photoURL,
                            firebase_uid: fbUser.uid
                        }
                    }
                });

                if (signUpError) {
                    // If account already exists but password differs (e.g. manual sign up), we can't bridge securely without reset.
                    // For now, alert user.
                    console.error('Shadow creation error:', signUpError);
                    if (signUpError.message.includes('already registered')) {
                        throw new Error('Este email já está cadastrado via senha. Por favor, faça login com senha.');
                    }
                    throw signUpError;
                }
            }
        } catch (error: any) {
            console.error('Hybrid Auth Error:', error);
            alert(error.message || 'Erro no login com Google.');
        } finally {
            // Loading handled by listener
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            const { auth } = await import('../lib/firebase');
            await auth.signOut(); // Sign out from Firebase
            await supabase.auth.signOut(); // Sign out from Supabase
            setUser(null);
            setSession(null);
            setProfile(null);
            router.replace('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const joinPartner = async (code: string) => {
        try {
            const { data, error } = await supabase.rpc('join_household_via_code', {
                code_to_join: code.trim().toUpperCase()
            });

            if (error) throw error;

            if (data.success) {
                await fetchProfile(user!.id);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error: any) {
            console.error('Error joining partner:', error);
            return { success: false, error: error.message || 'Erro ao conectar' };
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    // Upload avatar to Supabase Storage
    const uploadAvatar = async (imageUri: string): Promise<string> => {
        if (!user) throw new Error('No user logged in');

        try {
            // Convert image URI to blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Generate unique filename
            const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, {
                    contentType: `image/${fileExt}`,
                    upsert: true,
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    };

    // Update profile
    const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
        if (!user) throw new Error('No user logged in');

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            // Refresh profile
            await refreshProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                // Profile trigger might handle creation, but let's ensure we have local state if needed
                // For now, Supabase Auth handles the session
                alert('Conta criada com sucesso! Você já pode entrar.');
                // Auto sign in is usually handled by Supabase unless email confirmation is on
            }
        } catch (error: any) {
            console.error('Error signing up:', error);
            alert(error.message || 'Falha ao criar conta.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            isLoading,
            signIn,
            signInWithGoogle,
            signUp,
            signOut,
            joinPartner,
            refreshProfile,
            updateProfile,
            uploadAvatar
        }}>
            {children}
        </AuthContext.Provider>
    );
}
