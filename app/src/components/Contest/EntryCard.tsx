import { Tables } from "../../database.types"
import { faCheck, faFilm, faSquareCheck, faTrophy, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getImageurl, getImageThumb } from "../../utils/supabase";
type EntryCardProps = {
    entry: Tables<'entries'>;
    placement?: number;
    isSelected?: boolean;
    onVoteToggle?: (entry: Entry) => void;
    onPreview?: (entry: Tables<'entries'>) => void;
    votingEnabled?: boolean;
    nsfwEnabled?: boolean;
};
type Entry = Tables<'entries'>
export const EntryCard = ({ entry, placement, isSelected, onVoteToggle, onPreview, votingEnabled, nsfwEnabled }: EntryCardProps) => {
    const fileType = entry.isGif ? "gif" : null;
    const imageUrl = getImageThumb(`${entry.contest_id}/${entry.id}${entry.image_count > 1 ? "_1" : ""}`, !nsfwEnabled ? true: false, fileType);
    return (
        <div className="winner-wrap d-flex flex-column gap-1">
        {placement != null ? (
            <div className="winner-placement rounded">
                <FontAwesomeIcon icon={faTrophy} />
                <span className="">#{placement}</span>
            </div>
        ) : null}
        <div className="card contest-card entry-card col-12 p-0">
            <div className="card-header d-flex justify-content-between">
            <h3 className="p-2 fs-5">{entry.discord_name}</h3>
            {onVoteToggle && votingEnabled && entry.canVote ? (
                <button
                    className={`voting-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => onVoteToggle(entry)}
                >
                    {isSelected ? (
                        <FontAwesomeIcon icon={faCheck} />
                    ) : (
                        <FontAwesomeIcon icon={faCheck} />
                    )}
                </button>
            ) : null
            }
            </div>

            <div onClick={() => onPreview(entry)} className="image-wrap">
            {
                entry.isVideo == null ? (
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