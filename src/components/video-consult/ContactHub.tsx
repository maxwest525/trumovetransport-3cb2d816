import { ReactNode } from "react";

interface ContactHubProps {
  onStartVideoCall?: () => void;
  bookingCode?: string;
  setBookingCode?: (code: string) => void;
  onJoinRoom?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ContactHub({ className, children, ...props }: ContactHubProps) {
  return <div className={className}>{children}</div>;
}
