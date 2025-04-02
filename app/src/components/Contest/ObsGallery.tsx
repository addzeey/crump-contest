import { Tables } from "../../database.types.ts";
import { useGetContestEntries } from "../../utils/supabase.ts";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { useState } from "react";

export const ObsGallery = ({ contest }: { contest: Tables<"art_contest"> }) => {
    const { data: entries, isLoading, error } = useGetContestEntries(contest.id);

    // Construct an array of image URLs, only including PNGs
    const images = entries
        ?.filter((entry) => entry.isVideo === null) // Filter out entries where isVideo is not null
        .flatMap((entry) => {
            const baseUrl = `${import.meta.env.VITE_CDN_URL}${entry.contest_id}/${entry.id}`;
            if (entry.image_count > 1) {
                return Array.from({ length: entry.image_count }, (_, i) => {
                    // Check if this index should be a GIF based on type_index
                    const isGif = entry.isGif && Array.isArray(entry.type_index) && entry.type_index.includes(i+1);
                    // Only include if it's not a GIF
                    return !isGif ? `${baseUrl}_${i + 1}.png` : null;
                }).filter(Boolean); // Remove null entries
            } else {
                // For single image, only include if it's not a GIF
                const isGif = entry.isGif && (!Array.isArray(entry.type_index) || entry.type_index.includes(0));
                return !isGif ? [`${baseUrl}.png`] : [];
            }
        }) || [];

    // State to track the current slide index
    const [currentSlide, setCurrentSlide] = useState(0);

    // Preload images only once
    if (images.length > 0) {
        images.forEach((url) => {
            new Image().src = url;
        });
    }

    return (
        <>
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
                            duration={10000}
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
                            {images.map((url, index) => (
                                <div className="each-slide" key={index}>
                                    <img src={url} alt={`Slide ${index}`} />
                                </div>
                            ))}
                        </Fade>
                    </>
                ) : null}
            </div>
        </>
    );
};