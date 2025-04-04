import { Tables } from "../../database.types.ts";
import { getImageThumb, useGetContestEntries, getImageurl } from "../../utils/supabase.ts";
import { EntryCard } from "./EntryCard.tsx";
import Modal from "../Model.tsx";
import ReactPlayer from 'react-player/lazy'
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { setAgeConfirmation, getAgeConfirmation, setAlwaysShowNsfw, getAlwaysShowNsfw, parseUrls } from '../../utils/client'
type Entry = Tables<'entries'>

export const ContestEntries = ({ contest, entries, onVoteChange, selectedVotes, votingEnabled, showNsfw }: { contest: Tables<'art_contest'>, entries: Tables<'entries'>[], onVoteChange: (entryId: string) => void, selectedVotes: Entry[], votingEnabled: boolean, showNsfw: boolean }) => {
    const [previewEntry, setPreviewEntry] = useState<Tables<'entries'> | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [imageLoaded, setImageLoaded] = useState(true);
    const toggleModal = (setState: React.Dispatch<React.SetStateAction<any>>) => {
        setState(null);
        setCurrentImageIndex(0);
    };
    const zoomAreaRef = useRef(null);
    const transformWrapperRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const entryId = params.get('entry');
        if (entryId) {
            const entry = entries.find(entry => entry.id === entryId);
            if (entry) {
                setPreviewEntry(entry);
            }
        }
    }, [entries]);

    useEffect(() => {
        if (previewEntry) {
            setImageLoaded(false);
            // Determine file type based on type_index if it exists and isGif is true
            console.log("types", previewEntry.type_index);
            
            const fileType = previewEntry.isGif && Array.isArray(previewEntry.type_index)
                ? (previewEntry.type_index.includes(currentImageIndex + 1) ? "gif" : "png")
                : (previewEntry.isGif ? "gif" : "png");
            
            const url = getImageurl(
                `${previewEntry?.contest_id}/${previewEntry?.id}${previewEntry?.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}`,
                null,
                false,
                fileType
            );
            
            const img = new Image();
            img.src = url;
            img.onload = () => {
                setTimeout(() => {
                    setImageLoaded(true);
                }, 300);
            };
            setImageUrl(url);
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('entry', previewEntry.id);
            window.history.replaceState({}, '', newUrl);
        }
    }, [previewEntry, currentImageIndex]);

    useEffect(() => {
        const preventPinchZoom = (e) => {
            if (zoomAreaRef.current && zoomAreaRef.current.contains(e.target)) {
                return;
            }
            if (e.touches.length > 1) {
                e.preventDefault();
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
            setCurrentImageIndex(0);
        }
    };

    const handlePrevEntry = () => {
        if (previewEntry) {
            const currentIndex = entries.findIndex(entry => entry.id === previewEntry.id);
            const prevIndex = (currentIndex - 1 + entries.length) % entries.length;
            setPreviewEntry(entries[prevIndex]);
            setCurrentImageIndex(0);
        }
    };

    const preloadImages = (entry: Tables<'entries'>) => {
        if (entry.image_count > 0) {
            for (let i = 1; i <= entry.image_count; i++) {
                const index = i - 1;
                const fileType = entry.isGif && Array.isArray(entry.type_index)
                    ? (entry.type_index.includes(index) ? "gif" : "png")
                    : "png";
                const img = new Image();
                img.src = `${import.meta.env.VITE_CDN_URL}${entry.contest_id}/${entry.id}${entry.image_count > 1 ? "_" + i : ""}.${fileType}`;
            }
        }
    };

    return (
        <>
            <div className="entries-heading pt-2 d-flex gap-2 align-items-center">
            <h1 className="text-white">Contest Entries - <span className="fw-normal fs-2">{entries.length} Total Entries </span></h1>
            </div>
            <div className="entry-wrap d-flex flex-wrap gap-3 py-3">
                {entries != null && entries.length > 0 ? (
                    entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="entry-item"
                            onMouseDown={() => preloadImages(entry)}
                        >
                            <EntryCard
                                entry={entry}
                                isSelected={selectedVotes.includes(entry)}
                                onVoteToggle={onVoteChange}
                                onPreview={() => setPreviewEntry(entry)}
                                votingEnabled={votingEnabled}
                                nsfwEnabled={(contest.nsfw && showNsfw) || !contest.nsfw}
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
                                    <div className="image-controls">
                                    {previewEntry.image_count > 1 && (
                                        <>
                                        <span id="img-no" className="fs-5 badge">Image {currentImageIndex + 1} / {previewEntry.image_count}</span>
                                        <button className="btn" onClick={handlePrevImage}>Previous</button>
                                        <button className="btn" onClick={handleNextImage}>Next</button>
                                        </>                            
                                        
                                    )}
                                    <button className="btn btn-reset" onClick={() => transformWrapperRef.current.resetTransform()}>Reset Zoom</button>
                                    </div>
                                    
                                </div>
                                {
                                    previewEntry.message && (
                                        <p className="message text-white fs-6 fw-medium" dangerouslySetInnerHTML={{ __html: parseUrls(previewEntry.message) }}></p>
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
                                                className="hosted-player"
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
                                                ref={transformWrapperRef}
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