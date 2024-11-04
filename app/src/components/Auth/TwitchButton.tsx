import { signInWithTwitch, signOut, useUserQuery } from "../../utils/supabase";

export const TwitchButton = () => {
    const { data: user, error, isLoading: loading } = useUserQuery();
    return (
        <div className="twitch-login contest-card col-12 col-sm-6">
            {loading ? (
                <p>Loading...</p>
            ) : user ? (
                <div className="card-body d-flex gap-2 overflow-hidden">
                    <div className="col-4">
                        <img className="h-75" src={user.avatar_url} alt="" />
                    </div>
                    <div className="d-flex flex-column gap-2 col-8 overflow-hidden">
                        <h3 className="card-title col-12">Welcome, {user.nickname}</h3>
                        <p>
                            More Information coming soon.
                        </p>
                        <button className="btn btn-danger rounded-3 col-12" onClick={signOut}>Sign Out</button>
                    </div>
                </div>
            ) : (
                <>
                <p class="alert alert-info">No personal information or access to your twitch accounts is provided to us. It is only used to create an account connected to your twitch username/id, similar to how a game would do it for twitch drops.</p>
                <button className="twitch-btn text-white py-3" onClick={signInWithTwitch}>Sign In with Twitch</button>
                <p className="fs-6">If for any reason you want your twitch connection purged / terminated from my servers contact Addzeey on Discord/Twitch/Twitter, but this will remove your voting history</p>
                </>
            )}
            {error && <p style={{ color: 'red' }}>{error.message}</p>}
        </div>
    );
};