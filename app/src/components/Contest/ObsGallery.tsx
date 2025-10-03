import { Tables } from "../../database.types.ts";
import { useGetContestEntries, getImageurl } from "../../utils/supabase.ts";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { useState, useEffect } from "react";

export const ObsGallery = ({ contest }: { contest: Tables<"art_contest"> }) => {
    const { data: entries, isLoading, error } = useGetContestEntries(contest.id);

    // Build slides with url + discord name + file type, include GIFs and attached MP4 videos
    type Slide = { url: string; name: string; type: "png" | "gif" | "video" };
    const slides: Slide[] =
        entries
            ?.flatMap((entry) => {
                const basePath = `${entry.contest_id}/${entry.id}`;
                const count = entry.image_count ?? 1;
                const isAttached = entry.isVideo === "attatched";

                // If the entry references an external video (e.g., YouTube) and doesn't
                // provide type_index to mark which indices are videos, skip the entry
                // entirely to avoid generating non-existent CDN URLs.
                if (entry.isVideo && !isAttached && (!Array.isArray(entry.type_index) || (entry.type_index as number[]).length === 0)) {
                    return [];
                }

                if (count > 1) {
                    const gifIndexSet = entry.isGif && Array.isArray(entry.type_index)
                        ? new Set<number>(entry.type_index as number[])
                        : new Set<number>();
                    const videoIndexSet = entry.isVideo && Array.isArray(entry.type_index)
                        ? new Set<number>(entry.type_index as number[])
                        : new Set<number>();

                    return Array.from({ length: count }, (_, idx) => {
                        // Skip non-attached (e.g., YouTube) video indices entirely
                        if (videoIndexSet.has(idx) && !isAttached) return null;

                        const asVideo = isAttached && videoIndexSet.has(idx);
                        const asGif = !!entry.isGif && gifIndexSet.has(idx);
                        if (asVideo) {
                            const url = `${import.meta.env.VITE_CDN_URL}${basePath}_${idx + 1}.mp4`;
                            return { url, name: entry.discord_name, type: "video" } as Slide;
                        }
                        if (asGif) {
                            const url = getImageurl(`${basePath}_${idx + 1}`, null, false, "gif");
                            return { url, name: entry.discord_name, type: "gif" } as Slide;
                        }
                        const url = getImageurl(`${basePath}_${idx + 1}`, 1200, false, "png");
                        return { url, name: entry.discord_name, type: "png" } as Slide;
                    }).filter((s): s is Slide => Boolean(s));
                } else {
                    // Single media: if it's a non-attached video (e.g., YouTube), skip from OBS
                    if (entry.isVideo && !isAttached) {
                        return [];
                    }
                    if (isAttached) {
                        const url = `${import.meta.env.VITE_CDN_URL}${basePath}.mp4`;
                        return [{ url, name: entry.discord_name, type: "video" }];
                    }
                    if (entry.isGif) {
                        const url = getImageurl(basePath, null, false, "gif");
                        return [{ url, name: entry.discord_name, type: "gif" }];
                    }
                    const url = getImageurl(basePath, 1200, false, "png");
                    return [{ url, name: entry.discord_name, type: "png" }];
                }
            }) || [];

    // State to track the current slide index
    const [currentSlide, setCurrentSlide] = useState(0);
    // Track image dimensions
    const [imageDims, setImageDims] = useState<{ width: number; height: number }[]>([]);
    // Rendered dimensions of panning images and their target Y translation
    const [renderedImageDims, setRenderedImageDims] = useState<Record<number, { width: number; height: number }>>({});
    const [panTargetY, setPanTargetY] = useState<Record<number, number>>({});
    // Video durations in ms (indexed by slide)
    const [videoDurationsMs, setVideoDurationsMs] = useState<Record<number, number>>({});

    // Keep currentSlide in-bounds when slides change
    useEffect(() => {
        if (currentSlide >= slides.length) {
            setCurrentSlide(0);
        }
    }, [slides.length]);

    // Preload only images/gifs
    if (slides.length > 0) {
        slides.forEach((s) => {
            if (s.type !== "video") {
                new window.Image().src = s.url;
            }
        });
    }

    // Handler for image load
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, idx: number) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setImageDims((prev) => {
            const next = [...prev];
            next[idx] = { width: naturalWidth, height: naturalHeight };
            return next;
        });

        if (slides[idx]?.type === "png" && naturalHeight > 2 * naturalWidth) {
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

    // Capture video duration on metadata load
    const handleVideoMeta = (e: React.SyntheticEvent<HTMLVideoElement>, idx: number) => {
        const d = e.currentTarget.duration;
        if (!isNaN(d) && isFinite(d) && d > 0) {
            setVideoDurationsMs(prev => ({ ...prev, [idx]: Math.max(d * 1000, 3000) }));
        }
    };

    // Determine if image should pan (PNG only)
    const shouldPan = (idx: number) => {
        const s = slides[idx];
        if (!s || s.type !== "png") return false;
        const dims = imageDims[idx];
        return !!dims && dims.height > 2 * dims.width;
    };

    const PAN_SPEED = 150; // px per second
    const MIN_DURATION = 5; // seconds
    const DEFAULT_DURATION = 10000; // ms
    const DEFAULT_VIDEO_DURATION = 15000; // ms fallback if metadata missing

    const getPanDuration = (idx: number) => {
        const rDims = renderedImageDims[idx];
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

    const getPanDurationMs = (idx: number) => {
        const rDims = renderedImageDims[idx];
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

    // Per-slide duration resolver (video vs image)
    const getSlideDurationMs = (idx: number) => {
        const s = slides[idx];
        if (!s) return DEFAULT_DURATION;
        if (s.type === "video") return videoDurationsMs[idx] ?? DEFAULT_VIDEO_DURATION;
        return shouldPan(idx) ? getPanDurationMs(idx) : DEFAULT_DURATION;
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
                {entries != null && entries.length > 0 && slides.length > 0 ? (
                    <>
                        {/* Background Layer (note: for videos this will be empty) */}
                        <div
                            className="obs-background"
                            style={{
                                backgroundImage: slides[currentSlide]?.type !== "video" ? `url(${slides[currentSlide]?.url})` : undefined,
                                backgroundColor: slides[currentSlide]?.type === "video" ? "#000" : undefined,
                            }}
                        ></div>

                        {/* Foreground Slideshow */}
                        <Fade
                            autoplay={true}
                            duration={getSlideDurationMs(currentSlide)}
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
                            {slides.map((slide, index) => {
                                const pan = shouldPan(index);
                                const isActive = index === currentSlide;
                                return (
                                    <div className="each-slide" key={index}>
                                        {slide.type === "video" ? (
                                            <video
                                                key={`video-${isActive ? 'active' : 'inactive'}-${index}`}
                                                src={slide.url}
                                                autoPlay
                                                muted
                                                playsInline
                                                controls={false}
                                                preload="metadata"
                                                onLoadedMetadata={(e) => handleVideoMeta(e, index)}
                                                style={{
                                                    height: "100vh",
                                                    width: "auto",
                                                    maxWidth: "100vw",
                                                    objectFit: "contain",
                                                    display: "block",
                                                    margin: "0 auto",
                                                }}
                                            />
                                        ) : pan ? (
                                            <div
                                                key={`pan-container-${currentSlide}-${index}`}
                                                style={{
                                                    width: "70vw",
                                                    height: "100vh",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <img
                                                    src={slide.url}
                                                    alt={`Slide ${index}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "auto",
                                                        animation: isActive ? `transform-pan-up ${getPanDuration(index)} linear forwards` : undefined,
                                                        ['--pan-translate-y' as string]: `${panTargetY[index] || 0}px`,
                                                    }}
                                                    onLoad={(e) => handleImageLoad(e, index)}
                                                />
                                            </div>
                                        ) : (
                                            <img
                                                src={slide.url}
                                                alt={`Slide ${index}`}
                                                onLoad={(e) => handleImageLoad(e, index)}
                                                style={{
                                                    maxHeight: "100vh",
                                                    maxWidth: "100vw",
                                                    objectFit: "contain",
                                                    display: "block",
                                                    margin: "0 auto"
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </Fade>

                        {/* Top-right nametag for current entry */}
                        {slides[currentSlide]?.name && (
                            <div className="obs-nametag">
                                {slides[currentSlide].name}
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </>
    );
};