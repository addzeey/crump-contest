import { Tables } from "../../database.types"
import { faFilm, faTrophy, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
export const EntryCard = ({ entry, placement }: { entry: Tables<'entries'>, placement: number | null  }) => {
    return (
        <div className="winner-wrap d-flex flex-column gap-1">
        {placement != null ? (
            <div className="winner-placement rounded">
                <FontAwesomeIcon icon={faTrophy} />
                <span className="">#{placement}</span>
            </div>
        ) : null}
        <div className="card contest-card entry-card col-12 p-0">
            <h3 className="p-2 fs-5">{entry.discord_name}</h3>
            <div className="image-wrap">
            {
                entry.isVideo == null ? (
                    <img src={`${import.meta.env.VITE_CDN_URL}${entry.contest_id}/thumbs/${entry.id}${entry.image_count > 1 ? "_1" : ""}.png`}/>
                ) : (
                    <>
                    <FontAwesomeIcon className="card-icon" icon={faFilm}/>
                    <span>Video</span>
                    </>
                )
            }
            </div>
        </div>
        </div>
    )
}