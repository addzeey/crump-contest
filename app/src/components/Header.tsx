import { Link } from "@tanstack/react-router";
import { menuItems } from "../data/menu";
import "../assets/header.scss";
import { useSession, useUserQuery, signOut } from "../utils/supabase";
import { UserCardCompact } from "./Account/UserCardCompact";
export const Header = () => {
    const { data: user, error, isLoading: loading } = useUserQuery();
    return (
        <header className="container d-flex flex-column gap-4">
            <Link to="/" className="logo">
            <img src="/images/Bannerartcontest.png" alt="" className="contest-logo w-100" />
            </Link>
            <nav className="w-100">
                <ul className="menu gap-2 py-2 px-3 d-flex justify-content-center align-items-center rounded-3">
                    {menuItems.map((item, index) => (
                        <li key={index} className={`${item.name == "Login" ? "acc-link" : ""}`}>
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