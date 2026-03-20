import { useState } from "react";

interface DailyVideoRoomProps {
  roomUrl?: string;
  onLeave?: () => void;
  className?: string;
}

export function DailyVideoRoom({ roomUrl, onLeave, className }: DailyVideoRoomProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center h-full bg-muted rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">Video room will connect when a session starts.</p>
      </div>
    </div>
  );
}
