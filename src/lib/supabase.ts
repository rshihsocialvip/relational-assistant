import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Using project configuration values
const supabaseUrl = 'https://dwjqtintbuklkcrqsrdy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3anF0aW50YnVrbGtjcnFzcmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQzODgsImV4cCI6MjA2ODgyMDM4OH0.O4gxszToBabORc9BhLNHSI39DAX1k8fkIrGsU-HLDbs';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };