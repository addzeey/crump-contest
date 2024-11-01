import { createClient, Session } from "@supabase/supabase-js";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Tables } from "../database.types";
import { useEffect, useState } from "react";
type Contest = Tables<"art_contest">;
type Entry = Tables<"entries">;
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
export const useTwitchAuth = () => {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

	const signInWithTwitch = async () => {
		setLoading(true);
		setError(null);

		const { user, session, error } = await supabase.auth.signInWithOAuth({
			provider: "twitch",
		});

		if (error) {
			setError(error.message);
			setLoading(false);
			return;
		}

		setUser(user);
		setLoading(false);
	};

	const signOut = async () => {
		setLoading(true);
		setError(null);

		const { error } = await supabase.auth.signOut();

		if (error) {
			setError(error.message);
		} else {
			setUser(null);
		}

		setLoading(false);
	};

	return {
		signInWithTwitch,
		signOut,
		user,
		loading,
		error,
	};
};
