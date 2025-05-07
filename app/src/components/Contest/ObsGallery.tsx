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

    // Preload images only once
    if (images.length > 0) {
        images.forEach((url) => {
            new window.Image().src = url;
        });
    }

    // Handler for image load
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, idx: number) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
        setImageDims((prev) => {
            const next = [...prev];
            next[idx] = { width, height };
            return next;
        });
    };

    // Helper to determine if image should pan
    const shouldPan = (idx: number) => {
        const dims = imageDims[idx];
        return dims && dims.height > 2 * dims.width;
    };

    const PAN_SPEED = 200; // px per second
    const MIN_DURATION = 5; // seconds
    const DEFAULT_DURATION = 10000; // ms

    const getPanDuration = (idx: number) => {
        const dims = imageDims[idx];
        if (!dims) return `${MIN_DURATION}s`;
        const containerHeight = window.innerHeight * 0.8; // 80vh
        const panDistance = Math.max(dims.height - containerHeight, 0);
        const duration = panDistance / PAN_SPEED;
        return `${Math.max(duration, MIN_DURATION)}s`;
    };

    // New: get pan duration in ms for slideshow
    const getPanDurationMs = (idx: number) => {
        const dims = imageDims[idx];
        if (!dims) return DEFAULT_DURATION;
        const containerHeight = window.innerHeight * 0.8;
        const panDistance = Math.max(dims.height - containerHeight, 0);
        const duration = panDistance / PAN_SPEED;
        return Math.max(duration, MIN_DURATION - 1) * 1000;
    };

    return (
        <>
            {/* Pan animation style */}
            <style>{`
                @keyframes bg-pan-up {
                    0% { background-position: center top; }
                    100% { background-position: center bottom; }
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
                                                key={`pan-${currentSlide}-${index}`}
                                                style={{
                                                    width: "100vw",
                                                    height: "100vh",
                                                    backgroundImage: `url(${url})`,
                                                    backgroundSize: "cover",
                                                    backgroundRepeat: "no-repeat",
                                                    backgroundPosition: "center top",
                                                    animation: isActive ? `bg-pan-up ${getPanDuration(index)} linear forwards` : undefined
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src={url}
                                                alt={`Slide ${index}`}
                                                onLoad={(e) => handleImageLoad(e, index)}
                                                style={{
                                                    maxHeight: "100vh",
                                                    maxWidth: "100%",
                                                    objectFit: "contain",
                                                    display: "block",
                                                    margin: "0 auto"
                                                }}
                                            />
                                        )}
                                        {/* Hidden img for dimension detection if pan */}
                                        {pan && (
                                            <img
                                                src={url}
                                                alt="hidden"
                                                style={{ display: "none" }}
                                                onLoad={(e) => handleImageLoad(e, index)}
                                            />
                                        )}
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