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
        // Remove 'entry' param from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('entry');
        window.history.replaceState({}, '', newUrl);
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
                // Reset zoom/position on new image or entry
            if (transformWrapperRef.current && typeof transformWrapperRef.current.resetTransform === 'function') {
                transformWrapperRef.current.resetTransform();
            }
            const typeIndex: number[] = (previewEntry.type_index as any) || [];
            const isGif = previewEntry.isGif;
            const isVideo = previewEntry.isVideo;
            let fileType = "png";
            let url = "";
            let isCurrentGif = false;
            let isCurrentVideo = false;
            if (previewEntry.image_count === 1) {
                // Only one media: use isVideo/isGif
                if (isVideo) {
                    isCurrentVideo = true;
                } else if (isGif) {
                    fileType = "gif";
                    isCurrentGif = true;
                }
            } else {
                // Multiple media: use type_index
                if (isVideo && typeIndex.includes(currentImageIndex)) {
                    isCurrentVideo = true;
                } else if (isGif && typeIndex.includes(currentImageIndex)) {
                    fileType = "gif";
                    isCurrentGif = true;
                }
            }
            if (isCurrentVideo) {
                if (isVideo === "attatched") {
                    url = `${import.meta.env.VITE_CDN_URL}${previewEntry.contest_id}/${previewEntry.id}${previewEntry.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}.mp4`;
                } else {
                    url = previewEntry.image_count > 1 ? `${previewEntry.isVideo}${currentImageIndex + 1}` : previewEntry.isVideo;
                }
                setImageLoaded(true);
            } else if (isCurrentGif) {
                url = getImageurl(
                    `${previewEntry.contest_id}/${previewEntry.id}${previewEntry.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}`,
                    null,
                    false,
                    "gif"
                );
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    setTimeout(() => {
                        setImageLoaded(true);
                    }, 300);
                };
            } else {
                url = getImageurl(
                    `${previewEntry.contest_id}/${previewEntry.id}${previewEntry.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}`,
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
            }
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
                                    /* --- REVERTED LOGIC: Use isGif, isVideo, and type_index as number[] --- */
                                    (() => {
                                        const typeIndex: number[] = (previewEntry.type_index as any) || [];
                                        const isGif = previewEntry.isGif;
                                        const isVideo = previewEntry.isVideo;
                                        let isCurrentGif = false;
                                        let isCurrentVideo = false;
                                        if (previewEntry.image_count === 1) {
                                            if (isVideo) {
                                                isCurrentVideo = true;
                                            } else if (isGif) {
                                                isCurrentGif = true;
                                            }
                                        } else {
                                            if (isVideo && typeIndex.includes(currentImageIndex)) {
                                                isCurrentVideo = true;
                                            } else if (isGif && typeIndex.includes(currentImageIndex)) {
                                                isCurrentGif = true;
                                            }
                                        }
                                        if (isCurrentVideo) {
                                            if (isVideo === "attatched") {
                                                return (
                                                    <div className="video-wrapper" style={{height: 'calc(100vh - 200px)', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                                                        <ReactPlayer
                                                            url={`${import.meta.env.VITE_CDN_URL}${previewEntry.contest_id}/${previewEntry.id}${previewEntry.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}.mp4`}
                                                            controls={true}
                                                            volume={0.1}
                                                            width="auto"
                                                            height="100%"
                                                            style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: 'auto'}}
                                                            config={{
                                                                file: {
                                                                    attributes: {
                                                                        style: {objectFit: 'contain', width: '100%', height: '95%'}
                                                                }
                                                            }
                                                        }}
                                                        className="hosted-player"
                                                    />
                                                </div>
                                                );
                                            } else {
                                                return (
                                                    <div className="video-wrapper" style={{height: 'calc(100vh - 200px)', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                                                        <ReactPlayer
                                                            url={previewEntry.image_count > 1 ? `${previewEntry.isVideo}${currentImageIndex + 1}` : previewEntry.isVideo}
                                                            controls={true}
                                                            width="auto"
                                                            height="100%"
                                                            style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: 'auto'}}
                                                            config={{
                                                                file: {
                                                                    attributes: {
                                                                        style: {objectFit: 'contain', width: '100%', height: '95%'}
                                                                }
                                                            }
                                                        }}
                                                        className="yt-player"
                                                    />
                                                </div>
                                                );
                                            }
                                        } else if (isCurrentGif) {
                                            return (
                                                <div className="image-wrapper">
                                                    {!imageLoaded && (
                                                        <div className="loading-spinner">
                                                            <div className="spinner-border text-light" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        </div>
                                                    )}
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
                                                                src={getImageurl(`${previewEntry.contest_id}/${previewEntry.id}${previewEntry.image_count > 1 ? "_" + (currentImageIndex + 1) : ""}`, null, false, "gif")}
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
                                            );
                                        } else {
                                            return (
                                                <div className="image-wrapper" style={{height: 'calc(100vh - 200px)', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    {!imageLoaded && (
                                                        <div className="loading-spinner">
                                                            <div className="spinner-border text-light" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <TransformWrapper
                                                        ref={transformWrapperRef}
                                                        minScale={0.1}
                                                        limitToBounds={false}
                                                        centerContent={true}
                                                        wheelEnabled={true}
                                                        disabled={false}
                                                        zoomout={{ step: 100 }}
                                                        style={{height: '100%', width: '100%'}}
                                                    >
                                                        <TransformComponent wrapperStyle={{height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                            <img
                                                                src={imageUrl}
                                                                alt="Zoomable"
                                                                style={{
                                                                    maxHeight: '100%',
                                                                    maxWidth: '100%',
                                                                    height: 'auto',
                                                                    width: 'auto',
                                                                    display: 'block',
                                                                    margin: 'auto',
                                                                }}
                                                            />
                                                        </TransformComponent>
                                                    </TransformWrapper>
                                                </div>
                                            );
                                        }
                                    })()
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