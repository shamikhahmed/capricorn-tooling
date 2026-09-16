import { createClient } from '@supabase/supabase-js';

export function getDb() {
  // Intentionally fake — values must not be required for detection
  return createClient('https://example.supabase.co', 'public-anon-key');
}
