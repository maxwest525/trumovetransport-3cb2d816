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

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container) return;
    const newScale = container.clientWidth / contentWidth;
    setScale(newScale);

    // Calculate the scaled height so the container wraps the content
    if (content) {
      const contentHeight = content.scrollHeight;
      setScaledHeight(contentHeight * newScale);
    }
  }, [contentWidth]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container) return;
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [updateScale]);

  // For scrollable mode, let the parent scroll and show full content
  if (scrollable) {
    return (
      <div ref={containerRef} className={className} style={{ overflow: "auto", position: "relative" }}>
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

  return (
    <div ref={containerRef} className={className} style={{ overflow: "hidden", position: "relative" }}>
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
