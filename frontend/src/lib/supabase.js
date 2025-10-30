import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eurwcyzwtzraudcuwdck.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cndjeXp3dHpyYXVkY3V3ZGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTI5MzAsImV4cCI6MjA3NzQyODkzMH0.Be-_lbg5t3Px0WLZAqxY0Z9vVjR_Ulu7fTA-0mRsEHc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

