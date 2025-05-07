import { Tables } from "../../database.types.ts";
import { useGetContestEntries, getImageurl } from "../../utils/supabase.ts";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { useState } from "react";

export const ObsGallery = ({ contest }: { contest: Tables<"art_contest"> }) => {
    const { data: entries, isLoading, error } = useGetContestEntries(contest.id);

    // Construct an array of image URLs, only including PNGs, using Cloudflare Images optimization
    const images = entries
        ?.filter((entry) => entry.isVideo === null) // Filter out entries where isVideo is not null
        .flatMap((entry) => {
            const basePath = `${entry.contest_id}/${entry.id}`;
            if (entry.image_count > 1) {
                return Array.from({ length: entry.image_count }, (_, i) => {
                    // Check if this index should be a GIF based on type_index
                    const isGif = entry.isGif && Array.isArray(entry.type_index) && entry.type_index.includes(i+1);
                    // Only include if it's not a GIF
                    return !isGif ? getImageurl(`${basePath}_${i + 1}`, 1200, false, "png") : null;
                }).filter(Boolean); // Remove null entries
            } else {
                // For single image, only include if it's not a GIF
                const isGif = entry.isGif && (!Array.isArray(entry.type_index) || entry.type_index.includes(0));
                return !isGif ? [getImageurl(basePath, 1200, false, "png")] : [];
            }
        }) || [];

    // State to track the current slide index
    const [currentSlide, setCurrentSlide] = useState(0);
    // Track image dimensions
    const [imageDims, setImageDims] = useState<{ width: number; height: number }[]>([]);
    // New state for rendered dimensions of panning images and their target Y translation
    const [renderedImageDims, setRenderedImageDims] = useState<Record<number, { width: number; height: number }>>({});
    const [panTargetY, setPanTargetY] = useState<Record<number, number>>({});

    // Preload images only once
    if (images.length > 0) {
        images.forEach((url) => {
            new window.Image().src = url;
        });
    }

    // Handler for image load
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, idx: number) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        // Store natural dimensions
        setImageDims((prev) => {
            const next = [...prev];
            next[idx] = { width: naturalWidth, height: naturalHeight };
            return next;
        });

        // If it's a tall image that will pan, calculate its rendered height
        // when its width is constrained to 70vw, and the target Y translation.
        // Use a local check for shouldPan criteria to avoid dependency on state that might not be updated yet.
        if (naturalHeight > 2 * naturalWidth) {
            const viewportWidth70 = window.innerWidth * 0.7;
            const _renderedHeight = (naturalHeight / naturalWidth) * viewportWidth70;
            setRenderedImageDims(prev => ({
                ...prev,
                [idx]: { width: viewportWidth70, height: _renderedHeight }
            }));

            const containerHeightPx = window.innerHeight * 0.7; // 70vh
            const translateY = containerHeightPx - _renderedHeight;
            setPanTargetY(prev => ({ ...prev, [idx]: translateY < 0 ? translateY : 0 }));
        }
    };

    // Helper to determine if image should pan (based on natural dimensions)
    const shouldPan = (idx: number) => {
        const dims = imageDims[idx];
        return dims && dims.height > 2 * dims.width;
    };

    const PAN_SPEED = 150; // px per second (increased from 100)
    const MIN_DURATION = 5; // seconds
    const DEFAULT_DURATION = 10000; // ms

    const getPanDuration = (idx: number) => {
        const rDims = renderedImageDims[idx]; // Use rendered dimensions for pan distance
        // Ensure shouldPan is checked based on natural dimensions (imageDims)
        const naturalDims = imageDims[idx];
        if (!rDims || !naturalDims || !(naturalDims.height > 2 * naturalDims.width)) {
            return `${MIN_DURATION}s`;
        }

        const containerHeightPx = window.innerHeight * 0.7; // 70vh
        const panDistance = Math.max(rDims.height - containerHeightPx, 0);
        if (panDistance === 0) return `${MIN_DURATION}s`;

        const duration = panDistance / PAN_SPEED;
        return `${Math.max(duration, MIN_DURATION)}s`;
    };

    // New: get pan duration in ms for slideshow
    const getPanDurationMs = (idx: number) => {
        const rDims = renderedImageDims[idx]; // Use rendered dimensions
        const naturalDims = imageDims[idx];
        if (!rDims || !naturalDims || !(naturalDims.height > 2 * naturalDims.width)) {
            return DEFAULT_DURATION;
        }

        const containerHeightPx = window.innerHeight * 0.7; // 70vh
        const panDistance = Math.max(rDims.height - containerHeightPx, 0);
        if (panDistance === 0) return DEFAULT_DURATION;

        const duration = panDistance / PAN_SPEED;
        return Math.max(duration, MIN_DURATION) * 1000;
    };

    return (
        <>
            {/* Pan animation style */}
            <style>{`
                @keyframes transform-pan-up {
                    0% { transform: translateY(0px); }
                    100% { transform: translateY(var(--pan-translate-y)); }
                }
            `}</style>
            <div className="obs-wrap">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {entries != null && entries.length > 0 ? (
                    <>
                        {/* Background Layer */}
                        <div
                            className="obs-background"
                            style={{
                                backgroundImage: `url(${images[currentSlide]})`,
                            }}
                        ></div>

                        {/* Foreground Slideshow */}
                        <Fade
                            autoplay={true}
                            duration={shouldPan(currentSlide) ? getPanDurationMs(currentSlide) : DEFAULT_DURATION}
                            transitionDuration={500}
                            infinite={true}
                            arrows={false}
                            pauseOnHover={false}
                            onStartChange={(_oldIndex: number, newIndex: number) => {
                                setTimeout(() => {
                                    setCurrentSlide(newIndex);
                                }, 100);
                            }}
                        >
                            {images.map((url, index) => {
                                const pan = shouldPan(index);
                                const isActive = index === currentSlide;
                                return (
                                    <div className="each-slide" key={index}>
                                        {pan ? (
                                            <div
                                                key={`pan-container-${currentSlide}-${index}`}
                                                style={{
                                                    width: "70vw",
                                                    height: "100vh",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "flex-start", // Align to top for transform pan
                                                }}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Slide ${index}`}
                                                    style={{
                                                        width: "100%", // Image width fills the 70vw container
                                                        height: "auto", // Height adjusts to maintain aspect ratio
                                                        animation: isActive ? `transform-pan-up ${getPanDuration(index)} linear forwards` : undefined,
                                                        ['--pan-translate-y' as string]: `${panTargetY[index] || 0}px`,
                                                    }}
                                                    onLoad={(e) => handleImageLoad(e, index)} // Keep for all images to get dimensions
                                                />
                                            </div>
                                        ) : (
                                            <img
                                                src={url}
                                                alt={`Slide ${index}`}
                                                onLoad={(e) => handleImageLoad(e, index)}
                                                style={{
                                                    maxHeight: "100vh", // Corrected from 100vh
                                                    maxWidth: "100vw",   // Corrected from 100vw
                                                    objectFit: "contain",
                                                    display: "block",
                                                    margin: "0 auto"
                                                }}
                                            />
                                        )}
                                        {/* Hidden img for dimension detection if pan - NO LONGER NEEDED if main img's onLoad is used for all */}
                                        {/* Ensure handleImageLoad is called for all images, even non-panning ones, if imageDims is used elsewhere for them */}
                                        {/* The current setup calls onLoad for the visible img if not panning, or the transformed img if panning. This is fine. */}
                                    </div>
                                );
                            })}
                        </Fade>
                    </>
                ) : null}
            </div>
        </>
    );
};