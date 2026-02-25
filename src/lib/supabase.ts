import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbazpkdijxwhydrciyls.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYXpwa2Rpanh3aHlkcmNpeWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTA2MjMsImV4cCI6MjA4NzUyNjYyM30.rVK9INx4SzVbWZbCMDg2PZVr42Lq7UogwgzbWm5xP1Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
