import { Tables } from "../../database.types"

export const EntryCard = ({ entry }: { entry: Tables<'entries'> }) => {
    return (
        <div className="card contest-card entry-card col-12 p-0">
            <h3 className="p-2 fs-5">{entry.discord_name}</h3>
            <div className="image-wrap">
            <img src={`${import.meta.env.VITE_CDN_URL}${entry.id}.png`} />
            </div>
        </div>
    )
}