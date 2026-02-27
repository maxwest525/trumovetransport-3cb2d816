import { useRef, useEffect, useState, useCallback } from "react";

interface ScaledPreviewProps {
  children: React.ReactNode;
  contentWidth?: number;
  className?: string;
  scrollable?: boolean;
}

export default function ScaledPreview({ children, contentWidth = 1440, className, scrollable = false }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);
  const rafRef = useRef<number>();
  const lastHeightRef = useRef<number>(0);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container) return;

    const newScale = container.clientWidth / contentWidth;
    setScale(newScale);

    if (content) {
      const contentHeight = content.scrollHeight;
      // Only update height if it changed by more than 2px to prevent jitter
      if (Math.abs(contentHeight - lastHeightRef.current) > 2) {
        lastHeightRef.current = contentHeight;
        setScaledHeight(contentHeight * newScale);
      }
    }
  }, [contentWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScale();

    // Only observe the container for width changes, not the content
    const observer = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateScale);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateScale]);

  // One-time content height measurement after mount + children change
  useEffect(() => {
    const timer = setTimeout(updateScale, 100);
    return () => clearTimeout(timer);
  }, [children, updateScale]);

  const wrapperStyle: React.CSSProperties = {
    overflow: scrollable ? "auto" : "hidden",
    position: "relative",
  };

  return (
    <div ref={containerRef} className={className} style={wrapperStyle}>
      <div
        style={{
          width: "100%",
          height: scaledHeight,
          position: "relative",
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: contentWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
