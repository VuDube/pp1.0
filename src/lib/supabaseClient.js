
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzfrwduobxsgvhxhtjtd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZnJ3ZHVvYnhzZ3ZoeGh0anRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjE5MzUsImV4cCI6MjA2MjE5NzkzNX0.AQwPHO_JdtuKMoh56Ga_asCahUjvr4ktTXJo-eSCdVI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  