import { Tables } from "../../database.types.ts";
import { useGetContestEntries } from "../../utils/supabase.ts";
import { EntryCard } from "./EntryCard.tsx";
import Modal from "../Model.tsx";
import ReactPlayer from 'react-player/lazy'
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useState } from "react";

export const ContestEntries = ({ contest }: { contest: Tables<'art_contest'> }) => {
    const { data: entries, isLoading, error } = useGetContestEntries(contest.id);
    const [previewEntry, setPreviewEntry] = useState<Tables<'entries'> | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const toggleModal = (setState: React.Dispatch<React.SetStateAction<any>>) => {
        setState(null);
        setCurrentImageIndex(0); // Reset image index when closing modal
    };

    const handleNextImage = () => {
        if (previewEntry) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % previewEntry.image_count);
        }
    };

    const handlePrevImage = () => {
        if (previewEntry) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + previewEntry.image_count) % previewEntry.image_count);
        }
    };

    return (
        <>
            <h1 className="text-white">Contest Entries</h1>
            <div className="entry-wrap d-flex flex-wrap gap-3 py-3">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {entries != null && entries.length > 0 ? (
                    entries.map((entry) => (
                        <div key={entry.id} className="entry-item" onClick={() => setPreviewEntry(entry)}>
                            <EntryCard entry={entry} />
                        </div>
                    ))
                ) : null}
            </div>
            {
                previewEntry != null ? (
                    <Modal toggleModal={() => toggleModal(setPreviewEntry)} dismissable={true} className={"entry-fullscreen"}>
                        <div className="content-modal-content">
                            <div className="entry-info">
                                <div className="info-top d-flex gap-2">
                                <h3 className="fs-5 badge bg-light text-dark m-0">{previewEntry.discord_name}</h3>
                                {previewEntry.image_count > 1 && (
                                    <div className="image-controls">
                                        <span id="img-no" className="fs-5 badge">Image {currentImageIndex + 1} / {previewEntry.image_count}</span>
                                        <button className="btn" onClick={handlePrevImage}>Previous</button>
                                        <button className="btn" onClick={handleNextImage}>Next</button>
                                    </div>
                                )}
                                </div>
                                {
                                    previewEntry.message && (
                                        <p className="message text-white fs-6 fw-medium">{previewEntry.message}</p>
                                    )
                                }
                                {
                                    previewEntry.isVideo != null ? (
                                        previewEntry.isVideo == "attatched" ? (
                                            <ReactPlayer
                                                url={`${import.meta.env.VITE_CDN_URL}${previewEntry.contest_id}/${previewEntry.id}.mp4`}
                                                controls
                                                volume={0.1}
                                                width="100%"
                                                height="auto"
                                            />
                                        ) : (
                                            <ReactPlayer
                                                url={previewEntry.isVideo}
                                                controls
                                                width="100%"
                                                height="auto"
                                            />
                                        )
                                    ) : (
                                        <div className="image-wrapper">
                                        <TransformWrapper
                                            minScale={0}
                                            limitToBounds={false}
                                            centerContent={true}
                                            wheelEnabled={true}
                                            disabled={false}
                                            zoomout={{ step: 100 }}
                                        >
                                            <TransformComponent>
                                                <img
                                                    src={`${import.meta.env.VITE_CDN_URL}${previewEntry.contest_id}/${previewEntry.id}${previewEntry.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}.png`}
                                                    alt="Zoomable"
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                    }}
                                                />
                                            </TransformComponent>
                                        </TransformWrapper>
                                    </div>
                                    )
                                }
                            </div>
                        </div>
                    </Modal>
                ) : null
            }
        </>
    )
}