interface BookingCalendarProps {
  onSelect?: (date: any, time: any) => void;
  onBook?: (date: Date) => void;
  className?: string;
}

export function BookingCalendar({ onSelect, onBook, className }: BookingCalendarProps) {
  return <div className={className} />;
}
