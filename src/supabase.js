import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function submitScore(name, score, wave) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
        .from('results')
        .insert([{ name, score, wave }]);
    return { data, error };
}

export async function fetchLeaderboard(limit = 10) {
    if (!supabase) return { data: [], error: 'Supabase not configured' };
    const { data, error } = await supabase
        .from('results')
        .select('name, score, wave, created_at')
        .order('score', { ascending: false })
        .limit(limit);
    return { data: data || [], error };
}
