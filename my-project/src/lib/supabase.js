import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// .env.local to'ldirilmagan bo'lsa ilova qulamaydi, login sahifasida ogohlantirish chiqadi
export const isConfigured = Boolean(url && key);
export const supabase = isConfigured ? createClient(url, key) : null;
