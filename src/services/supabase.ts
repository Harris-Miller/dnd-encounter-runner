import { createClient } from '@supabase/supabase-js';

import type { Database } from '../types/database.types'; // Update with your actual path

export const supabase = createClient<Database>(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);
