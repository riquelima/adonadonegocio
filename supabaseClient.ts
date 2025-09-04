import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkyzzkabsbulhtozjfyt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreXp6a2Fic2J1bGh0b3pqZnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODU5OTcsImV4cCI6MjA2ODc2MTk5N30.CviigAQy_0Y5UyIzHodz6P_FZ71crV5F1ylc8hKHeyU';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
