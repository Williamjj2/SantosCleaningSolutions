import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0E17', alignItems: 'center', justifyContent: 'center' },
});
