export const ThumbnailImage = ({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) => {
    return (
        <div className="thumbnail-image" onClick={onClick}>
            <img src={src} alt={alt} />
        </div>
    );
}