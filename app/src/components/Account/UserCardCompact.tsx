import { Link } from "@tanstack/react-router";
import { signOut } from "../../utils/supabase";

export const UserCardCompact = ({ user }) => {
    return (
        <Link to="/account" className="menu-account">
        <div className="user-card-compact">
            <p className="fs-6 m-0">{user.nickname}</p>
            <img src={user.avatar_url} alt={user.nickname} />
        </div>
        </Link>
    );
}