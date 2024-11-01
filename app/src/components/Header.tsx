import { Link } from "@tanstack/react-router";
import { menuItems } from "../data/menu";
import "../assets/header.scss";
import { useSession, useUserQuery, signOut } from "../utils/supabase";
import { UserCardCompact } from "./Account/UserCardCompact";
export const Header = () => {
    const { data: user, error, isLoading: loading } = useUserQuery();
    return (
        <header className="container d-flex flex-column flex-lg-row">
            <h1>MurderCrumpet Contests</h1>
            <nav>
                <ul className="menu gap-4">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            {
                            item.name == "Login" && user ? (
                                <UserCardCompact user={user} />
                            ) : (
                            <Link to={item.url} className={`menu-${item.type}`} target={item.target || ""}>{item.name}</Link>
                            )
                            }
                            
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}