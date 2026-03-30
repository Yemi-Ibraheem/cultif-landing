import { useState } from 'react';
import './ScheduleSend.css';

interface ScheduleSendProps {
  scheduledAt: number | null;
  onSchedule: (timestamp: number | null) => void;
  onClose: () => void;
}

function ScheduleSend({ scheduledAt, onSchedule, onClose }: ScheduleSendProps) {
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(
    scheduledAt ? new Date(scheduledAt).toISOString().split('T')[0] : ''
  );
  const [selectedTime, setSelectedTime] = useState(
    scheduledAt
      ? new Date(scheduledAt).toTimeString().slice(0, 5)
      : '12:00'
  );

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      const timestamp = new Date(`${selectedDate}T${selectedTime}`).getTime();
      onSchedule(timestamp);
      onClose();
    }
  };

  const handleSkip = () => {
    onSchedule(null);
    onClose();
  };

  return (
    <div className="schedule-send-overlay">
      <div className="schedule-send-modal">
        <div className="schedule-send-header">
          <button className="schedule-back-btn" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="schedule-title">Schedule send</h2>
        </div>
        <p className="schedule-subtitle">Pick a time and date in the future to post your recipe</p>

        <div className="schedule-fields">
          <div className="schedule-field">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              min={now.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="schedule-input"
            />
          </div>
          <div className="schedule-field">
            <label>Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="schedule-input"
            />
          </div>
        </div>

        <button
          className="schedule-next-btn"
          onClick={handleNext}
          disabled={!selectedDate}
        >
          Next →
        </button>
        <button className="schedule-skip-btn" onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

export default ScheduleSend;
