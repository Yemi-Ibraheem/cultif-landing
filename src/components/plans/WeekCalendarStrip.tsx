import './WeekCalendarStrip.css';

interface WeekCalendarStripProps {
  selectedDate: string; // "YYYY-MM-DD"
  onDateSelect: (date: string) => void;
}

function getWeekDates(today: Date): { label: string; day: number; dateStr: string }[] {
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const days: { label: string; day: number; dateStr: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({
      label: labels[i],
      day: d.getDate(),
      dateStr: `${yyyy}-${mm}-${dd}`,
    });
  }

  return days;
}

function formatHeaderDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return d.toLocaleDateString('en-US', options);
}

function WeekCalendarStrip({ selectedDate, onDateSelect }: WeekCalendarStripProps) {
  const today = new Date();
  const weekDates = getWeekDates(today);

  return (
    <div className="week-calendar">
      <p className="week-calendar-header">Today, {formatHeaderDate(selectedDate)}</p>
      <div className="week-calendar-strip">
        {weekDates.map((d) => (
          <button
            key={d.dateStr}
            className={`week-calendar-day ${d.dateStr === selectedDate ? 'selected' : ''}`}
            onClick={() => onDateSelect(d.dateStr)}
          >
            <span className="week-day-label">{d.label}</span>
            <span className="week-day-number">{d.day}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WeekCalendarStrip;
