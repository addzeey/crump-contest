import { Tables } from "../../database.types"
import { faFilm, faTrophy, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getImageurl, getImageThumb, useGetEntriesById } from "../../utils/supabase";
type Entry = Tables<'entries'>
export const VoteCard = ({entry} : {entry: Entry}) => {
    const imageUrl = getImageThumb(`${entry.contest_id}/${entry.id}${entry.image_count > 1 ? "_1" : ""}`, false, null);
    
    return (
        <div className="winner-wrap d-flex flex-column gap-1">
        <div className="card contest-card entry-card col-12 p-0">
            <h3 className="p-2 fs-5">{entry.discord_name}</h3>
            <div className="image-wrap d-none d-sm-block">
            {
                entry && entry.isVideo == null ? (
                    <img src={imageUrl} title={entry.discord_name}/>
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