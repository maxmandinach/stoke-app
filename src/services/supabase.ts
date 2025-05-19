import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these values with your Supabase project URL and anon key
const supabaseUrl = 'https://lcmhkgahqvbgiopeeedn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjbWhrZ2FocXZiZ2lvcGVlZWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTM4NDAsImV4cCI6MjA2MzE2OTg0MH0.jYX-kp4yIjugJFfnFFDcZqlIqUdVVNIe9AL67ipQogo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 