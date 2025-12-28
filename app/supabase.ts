import { createClient } from '@supabase/supabase-js';
import type { PUBLIC_ENV } from './env.server';

declare global {
  // eslint-disable-next-line no-var
  var ENV: PUBLIC_ENV;
}

const supabaseUrl = globalThis.ENV?.SUPABASE_URL;
const supabaseKey = globalThis.ENV?.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is not set');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
