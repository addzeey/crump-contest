import { createClient } from '@supabase/supabase-js'
import { queryOptions, useQuery } from '@tanstack/react-query';
import { Tables } from '../database.types';
type Contest = Tables<"art_contest">;
type Entry = Tables<"entries">;
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_KEY_ANON
);

const getContests = async (id?: string): Promise<Contest[]> => {
    let query = supabase.from('art_contest').select('*');
    
    if (id) {
        query = query.eq('id', id);
    }
    
    const { data: art_contest, error } = await query;
    
    if (error) {
        console.error(error);
    }
    return art_contest ?? [];
}

const getEntries = async (contestId: string): Promise<Entry[]> => {
    const { data: entries, error } = await supabase
    .from('entries')
    .select("*")
    .eq('contest_id', contestId)
    if (error) {
        console.error(error);
    }
    return entries?? [];
}
const getEntryById = async (ids: string[]): Promise<Entry[]> => {
    const { data: entries, error } = await supabase
    .from('entries')
    .select("*")
    .in('id', ids)
    if (error) {
        console.error(error);
    }
    return entries?? [];
}

export const useGetContests = (id?: string) => {
    return useQuery<Contest[]>({
        queryKey: id ? ['contests', id] : ['contests'],
        queryFn: () => getContests(id),
        refetchOnWindowFocus: false,
    });
};
export const getContestSingle = (postId: string) => {
    return queryOptions<Contest[]>({
        queryKey: ['contests', {postId}],
        queryFn: () => getContests(postId),
        refetchOnWindowFocus: false,
    })
}
export const useGetContestEntries = (contestId: string) => {
    return useQuery<Entry[]>({
        queryKey: ['entries', {contestId}],
        queryFn: () => getEntries(contestId),
        refetchOnWindowFocus: false,
    })
}

export const useGetEntriesById = (id: string[]) => {
    return useQuery<Entry[]>({
        queryKey: ['entry', {id}],
        queryFn: () => getEntryById(id),
        refetchOnWindowFocus: false,
    })
}