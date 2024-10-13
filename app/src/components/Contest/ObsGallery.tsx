import { Tables } from "../../database.types.ts";
import { useGetContestEntries } from "../../utils/supabase.ts";
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

export const ObsGallery = ({ contest }: { contest: Tables<'art_contest'> }) => {
    const { data: entries, isLoading, error } = useGetContestEntries(contest.id);

    // Construct an array of image URLs
    const images = entries
        ?.filter(entry => entry.isVideo === null) // Filter out entries where isVideo is not null
        .flatMap(entry => {
            const baseUrl = `${import.meta.env.VITE_CDN_URL}${entry.contest_id}/${entry.id}`;
            if (entry.image_count > 1) {
                return Array.from({ length: entry.image_count }, (_, i) => `${baseUrl}_${i + 1}.png`);
            } else {
                return [`${baseUrl}.png`];
            }
        }) || [];

    return (
        <>
            <div className="obs-wrap">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {entries != null && entries.length > 0 ? (
                    <Fade autoplay={true} 
                    duration={5000} 
                    transitionDuration={500}
                    infinite={true}
                    arrows={false}
                    pauseOnHover={false}
                    >
                        {images.map((url, index) => (
                            <div className="each-slide" key={index}>
                                <img src={url} alt={`Slide ${index}`} />
                            </div>
                        ))}
                    </Fade>
                ) : null}
            </div>
        </>
    )
}