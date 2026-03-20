interface WhiteboardCanvasProps {
  className?: string;
}

export function WhiteboardCanvas({ className }: WhiteboardCanvasProps) {
  return <canvas className={className} />;
}
