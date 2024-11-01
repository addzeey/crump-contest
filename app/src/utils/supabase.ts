import { createClient, Session } from "@supabase/supabase-js";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Tables } from "../database.types";
import { useEffect, useState } from "react";
type Contest = Tables<"art_contest">;
type Entry = Tables<"entries">;
type Votes = Tables<"vote_entries">;
export const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_KEY_ANON
);

const getContests = async (id?: string): Promise<Contest[]> => {
	let query = supabase.from("art_contest").select("*");

	if (id) {
		query = query.eq("id", id);
	}

	const { data: art_contest, error } = await query;

	if (error) {
		console.error(error);
	}
	return art_contest ?? [];
};

const getEntries = async (contestId: string): Promise<Entry[]> => {
	const { data: entries, error } = await supabase
		.from("entries")
		.select("*")
		.eq("contest_id", contestId);
	if (error) {
		console.error(error);
	}
	return entries ?? [];
};
const getEntryById = async (ids: string[]): Promise<Entry[]> => {
	const { data: entries, error } = await supabase
		.from("entries")
		.select("*")
		.in("id", ids);
	if (error) {
		console.error(error);
	}
	return entries ?? [];
};
// get the latest contest that has the status finished by date
export const getLatestContest = async (): Promise<Contest[]> => {
	const { data: art_contest, error } = await supabase
		.from("art_contest")
		.select("*")
		.eq("status", "finished")
		.order("end_date", { ascending: false })
		.limit(1);
	if (error) {
		console.error(error);
	}
	return art_contest ?? [];
};
export const useGetContests = (id?: string) => {
	return useQuery<Contest[]>({
		queryKey: id ? ["contests", id] : ["contests"],
		queryFn: () => getContests(id),
		refetchOnWindowFocus: false,
	});
};

export const getContestSingle = (postId: string) => {
	return queryOptions<Contest[]>({
		queryKey: ["contests", { postId }],
		queryFn: () => getContests(postId),
		refetchOnWindowFocus: false,
	});
};
export const useGetContestEntries = (contestId: string) => {
	return useQuery<Entry[]>({
		queryKey: ["entries", { contestId }],
		queryFn: () => getEntries(contestId),
		refetchOnWindowFocus: false,
	});
};

export const useGetEntriesById = (id: string[]) => {
	return useQuery<Entry[]>({
		queryKey: ["entry", { id }],
		queryFn: () => getEntryById(id),
		refetchOnWindowFocus: false,
	});
};
export const useGetLatestContest = () => {
	return useQuery<Contest[]>({
		queryKey: ["latestContest"],
		queryFn: () => getLatestContest(),
		refetchOnWindowFocus: false,
	});
};
export const useSession = () => {
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		// Fetch initial session on component mount
		const getSession = async () => {
			const { data, error } = await supabase.auth.getSession();
			if (!error) {
				setSession(data?.session ?? null);
			} else {
				console.error("Error fetching session:", error);
			}
		};

		getSession();

		// Set up the auth state listener
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSession(session);
			}
		);

		// Cleanup the listener on unmount
		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	return session;
};
const fetchUser = async () => {
	const session = supabase.auth;	
	const getSession = await session.getSession()
	if (session && getSession && getSession.data.session) {
		return getSession.data.session.user.user_metadata
	} else {
		return null;
	}
};
export function useUserQuery() {
    return useQuery({
        queryKey: ['user'],
        queryFn: fetchUser, // Directly pass the fetch function
		staleTime: 1000 * 60 * 30
    });
}
export const signInWithTwitch = async () => {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "twitch",
		options: {
			scopes: "user:read:email",
			redirectTo: import.meta.env.VITE_REDIRECT_URL,
		},
	});
	if (error) throw error;
    
    return data;
};
export const signOut = async () => {
	const { error } = await supabase.auth.signOut();
	// eslint-disable-next-line react-hooks/rules-of-hooks
	window.location.reload();
	if (error) throw error;
};
// if width is passed resize the image
export const getImageurl = (url: string, width: number | null) => {
	if(width != null){
		return supabase.storage.from("crump-contest").getPublicUrl(`${url}.png`, {
			transform: {
				quality: 80,
				width: width,
				resize: 'contain', 
			},
		});
	} else {
		return supabase.storage.from("crump-contest").getPublicUrl(`${url}.png`, {
			transform: {
				quality: 80,
			},
		});
	}
};
export const getImageThumb = (url: string) => {
	return supabase.storage.from("crump-contest").getPublicUrl(`${url}.png`, {
		transform: {
			quality: 60,
			width: 250,
			resize: 'contain',
		},
	});
}
export const useGetUserVotes = (contestId: string) => {
	return useQuery<Votes[]>({
		queryKey: ["votes", { contestId }],
		queryFn: () => getUserVotes(contestId),
		refetchOnWindowFocus: false,
	});
}
export const getUserVotes = async (contestId: string) => {
	const { data, error } = await supabase
		.from("vote_entries")
		.select("*")
		.eq("contest_id", contestId);
	if (error) {
		console.error(error);
	}
	return data ?? [];
}
// votes are stored as json in the database
export const saveVote = async (contestId: string, votes: Votes[]) => {
    // Pull out the entry id from the entry object
    const votearray = votes.map((entry) => entry.id);
    // Convert the array to a JSON string
    const voteJson = JSON.stringify(votearray);

    // Check if there is an existing vote entry for the contestId
    const { data: existingVote, error: fetchError } = await supabase
        .from("vote_entries")
        .select("*")
        .eq("contest_id", contestId)
        .maybeSingle(); // Use maybeSingle to handle no rows case

    if (fetchError) {
        console.error(fetchError);
        return null;
    }

    let result;
    if (existingVote) {
        // Update the existing vote entry
        const { data, error } = await supabase
            .from("vote_entries")
            .update({ votes: voteJson })
            .eq("contest_id", contestId)
            .select();
        if (error) {
            console.error(error);
            return null;
        }
        result = data;
    } else {
        // Insert a new vote entry
        const { data, error } = await supabase
            .from("vote_entries")
            .insert([
                {
                    contest_id: contestId,
                    votes: voteJson,
                },
            ])
            .select();
        if (error) {
            console.error(error);
            return null;
        }
        result = data;
    }

    return result;
};