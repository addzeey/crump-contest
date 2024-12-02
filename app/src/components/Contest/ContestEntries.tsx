import { Tables } from "../../database.types.ts";
import { getImageThumb, useGetContestEntries, getImageurl } from "../../utils/supabase.ts";
import { EntryCard } from "./EntryCard.tsx";
import Modal from "../Model.tsx";
import ReactPlayer from 'react-player/lazy'
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
type Entry = Tables<'entries'>
export const ContestEntries = ({ contest, entries, onVoteChange, selectedVotes, votingEnabled }: { contest: Tables<'art_contest'>, entries: Tables<'entries'>[], onVoteChange: (entryId: string) => void, selectedVotes: Entry[], votingEnabled: boolean }) => {
    const [previewEntry, setPreviewEntry] = useState<Tables<'entries'> | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [imageLoaded, setImageLoaded] = useState(true);
    const toggleModal = (setState: React.Dispatch<React.SetStateAction<any>>) => {
        setState(null);
        setCurrentImageIndex(0); // Reset image index when closing modal
    };
    const zoomAreaRef = useRef(null);

    useEffect(() => {
        if (previewEntry) {
            setImageLoaded(false); // Set imageLoaded to false when generating the URL
            const url = getImageurl(`${previewEntry?.contest_id}/${previewEntry?.id}${previewEntry?.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}`, null);
            const img = new Image();
            img.src = url.data.publicUrl;
            img.onload = () => {
                setTimeout(() => {
                    setImageLoaded(true);
                }, 300);
            }; // Set imageLoaded to true when the image loads
            setImageUrl(url.data.publicUrl);
        }
    }, [previewEntry, currentImageIndex]);
    useEffect(() => {
        // Function to prevent default pinch-zoom behavior on the document
        const preventPinchZoom = (e) => {
            // Check if the event target is inside the zoomAreaRef
            if (zoomAreaRef.current && zoomAreaRef.current.contains(e.target)) {
                return; // Allow pinch-zoom inside the component
            }
            if (e.touches.length > 1) {
                e.preventDefault(); // Prevent pinch-zoom globally
            }
        };

        document.addEventListener('touchmove', preventPinchZoom, { passive: false });

        return () => {
            document.removeEventListener('touchmove', preventPinchZoom);
        };
    }, []);
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

    const handleNextEntry = () => {
        if (previewEntry) {
            const currentIndex = entries.findIndex(entry => entry.id === previewEntry.id);
            const nextIndex = (currentIndex + 1) % entries.length;
            setPreviewEntry(entries[nextIndex]);
            setCurrentImageIndex(0); // Reset image index when changing entry
        }
    };

    const handlePrevEntry = () => {
        if (previewEntry) {
            const currentIndex = entries.findIndex(entry => entry.id === previewEntry.id);
            const prevIndex = (currentIndex - 1 + entries.length) % entries.length;
            setPreviewEntry(entries[prevIndex]);
            setCurrentImageIndex(0); // Reset image index when changing entry
        }
    };

    const preloadImages = (entry: Tables<'entries'>) => {
        if (entry.image_count > 0) {
            for (let i = 1; i <= entry.image_count; i++) {
                const img = new Image();
                img.src = `${import.meta.env.VITE_CDN_URL}${entry.contest_id}/${entry.id}${entry.image_count > 1 ? "_" + i : ""}.png`;
            }
        }
    };
    return (
        <>
            <h1 className="text-white">Contest Entries - <span className="fw-normal fs-2">{entries.length} Total Entries </span></h1>
            <div className="entry-wrap d-flex flex-wrap gap-3 py-3">
                {entries != null && entries.length > 0 ? (
                    entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="entry-item"
                            onMouseEnter={() => preloadImages(entry)}
                        >
                            <EntryCard
                                entry={entry}
                                isSelected={selectedVotes.includes(entry)}
                                onVoteToggle={onVoteChange}
                                onPreview={() => setPreviewEntry(entry)}
                                votingEnabled={votingEnabled}
                            />
                        </div>
                    ))
                ) : null}
            </div>
            {
                previewEntry != null ? (
                    <>
                    <div className="entry-navigation">
                        <button className="btn" onClick={handlePrevEntry}><FontAwesomeIcon icon={faChevronLeft} /></button>
                        <button className="btn" onClick={handleNextEntry}><FontAwesomeIcon icon={faChevronRight} /></button>
                    </div>
                    <Modal toggleModal={() => toggleModal(setPreviewEntry)} dismissable={true} className={"entry-fullscreen"}>
                        <div className="content-modal-content">
                            <div ref={zoomAreaRef} className="entry-info">
                                <div className="info-top d-flex flex-column flex-md-row gap-2">
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
                                                className="yt-player"
                                            />
                                        )
                                    ) : (
                                        <div className="image-wrapper">
                                            {
                                                !imageLoaded && (
                                                    <div className="loading-spinner">
                                                        <div className="spinner-border text-light" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            <TransformWrapper
                                                minScale={0.1}
                                                limitToBounds={false}
                                                centerContent={true}
                                                wheelEnabled={true}
                                                disabled={false}
                                                zoomout={{ step: 100 }}
                                            >
                                                <TransformComponent>
                                                    <img
                                                        src={imageUrl}
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
                    </>
                ) : null
            }
        </>
    )
}