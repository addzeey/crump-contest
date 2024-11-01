import { useTwitchAuth } from "../../utils/supabase";

export const TwitchButton = () => {
    const { signInWithTwitch, signOut, user, loading, error } = useTwitchAuth();

    return (
        <div className="twitch-login contest-card col-4">
            {loading ? (
                <p>Loading...</p>
            ) : user ? (
                <div>
                    <p>Welcome, {user.email}</p>
                    <button onClick={signOut}>Sign Out</button>
                </div>
            ) : (
                <button className="twitch-btn" onClick={signInWithTwitch}>Sign In with Twitch</button>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};