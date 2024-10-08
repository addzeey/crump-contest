import { Link } from "@tanstack/react-router";
import { menuItems } from "../data/menu";
import "../assets/header.scss";
export const Header = () => {
    return (
        <header className="container">
            <h1>MurderCrumpet Art Showcase</h1>
            <nav>
                <ul className="menu gap-4">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link to={item.url} className={`menu-${item.type}`} target={item.target || ""}>{item.name}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}