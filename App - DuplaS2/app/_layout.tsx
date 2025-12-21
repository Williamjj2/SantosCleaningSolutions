import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { BillsProvider } from '../context/BillsContext';
import { I18nProvider } from '../lib/i18n';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BillsProvider>
          <View style={{ flex: 1, backgroundColor: '#0A0E17' }}>
            <StatusBar style="light" backgroundColor="#0A0E17" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0A0E17' },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
            </Stack>
          </View>
        </BillsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
