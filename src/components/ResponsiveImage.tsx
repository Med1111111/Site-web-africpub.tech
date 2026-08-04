type Props = {
  src: string;
  avif?: string;
  webp?: string;
  alt: string;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
};

/**
 * Affiche une image avec variantes AVIF/WebP responsives (générées au build)
 * et repli JPEG. Les dimensions sont conservées pour éviter tout décalage.
 */
export function ResponsiveImage({
  src,
  avif,
  webp,
  alt,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
  width = 1024,
  height = 768,
  loading = "lazy",
  fetchPriority,
}: Props) {
  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} sizes={sizes} />}
      {webp && <source type="image/webp" srcSet={webp} sizes={sizes} />}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        width={width}
        height={height}
        className={className}
      />
    </picture>
  );
}

export default ResponsiveImage;
