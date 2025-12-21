import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aituawudhverpayhtizw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdHVhd3VkaHZlcnBheWh0aXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzcyNDMsImV4cCI6MjA4MTg1MzI0M30.TiDTygM5Fb9khhGt1BI1ieRpTjP79drqc67pVXyKyjY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
