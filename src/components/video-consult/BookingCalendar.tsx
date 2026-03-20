interface BookingCalendarProps {
  onBook?: (date: Date) => void;
  className?: string;
}

export function BookingCalendar({ onBook, className }: BookingCalendarProps) {
  return <div className={className} />;
}
