import { useEffect, useState } from "react";
import { Tables } from "../../database.types.ts";
import { useGetContestEntries } from "../../utils/supabase.ts";
import { EntryCard } from "./EntryCard.tsx";
import Modal from "../Model.tsx";
export const ContestEntries = ({ contest }: { contest: Tables<'art_contest'> }) => {
    const { data: entries, isLoading, error } = useGetContestEntries(contest.id);
    const [previewEntry, setPreviewEntry] = useState<Tables<'entries'> | null>(null);
    const [imageZoomed, setImageZoomed] = useState(false);
    const toggleModal = (setState: React.Dispatch<React.SetStateAction<any>>) => {
        setState(null);
    };
    useEffect(() => {
        console.log(previewEntry);
        
    }, [previewEntry]);
    return (
        <>
            <h1 className="text-white">Contest Entries</h1>
            <div className="entry-wrap d-flex gap-3 py-3">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {entries != null && entries.length > 0 ? (
                    entries.map((entry) => (
                        <div key={entry.id} className="entry-item col-3" onClick={() => setPreviewEntry(entry)}>
                            <EntryCard entry={entry} />
                        </div>
                    ))
                ) : null}
            </div>
            {
                previewEntry != null ? (
                    <Modal toggleModal={() => toggleModal(setPreviewEntry)} dismissable={true} className={"entry-fullscreen"}>
                    <div className="w-100 h-100">
                        <h3 className="p-2 fs-5">{previewEntry.discord_name}</h3>
                        <div className="image-wrap">
                            <img onClick={()=> setImageZoomed(!imageZoomed)} className={`entry-image ${imageZoomed ? "full" : ""}`} src={`${import.meta.env.VITE_CDN_URL}${previewEntry.id}.png`} />
                        </div>
                    </div>
                    </Modal>
                ) : null
            }
        </>
    )
}