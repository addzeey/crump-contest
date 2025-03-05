import { Tables } from "../../database.types.ts";
import { useGetContestEntries } from "../../utils/supabase.ts";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { useState } from "react"; // Import useState to track the current slide

export const ObsGallery = ({ contest }: { contest: Tables<"art_contest"> }) => {
    const { data: entries, isLoading, error } = useGetContestEntries(contest.id);

    // Construct an array of image URLs
    const images = entries
        ?.filter((entry) => entry.isVideo === null) // Filter out entries where isVideo is not null
        .flatMap((entry) => {
            const baseUrl = `${import.meta.env.VITE_CDN_URL}${entry.contest_id}/${entry.id}`;
            if (entry.image_count > 1) {
                return Array.from({ length: entry.image_count }, (_, i) => `${baseUrl}_${i + 1}.png`);
            } else {
                return [`${baseUrl}.png`];
            }
        }) || [];

    // State to track the current slide index
    const [currentSlide, setCurrentSlide] = useState(0);

    // preload images only once
    if (images.length > 0) {
        images.forEach((url) => {
            new Image().src = url;
        }
        );
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
                            duration={5000}
                            transitionDuration={500}
                            infinite={true}
                            arrows={false}
                            pauseOnHover={false}
                            onStartChange={(_oldIndex: number, newIndex: number) => {
                                setTimeout(() => {
                                    setCurrentSlide(newIndex)
                                }, 100);
                            }} // Sync background with foreground
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