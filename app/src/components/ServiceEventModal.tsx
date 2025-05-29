import React, { useState, useEffect } from 'react';
import { format, parseISO, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

// Define interfaces for clarity (can be in a separate types.ts file if you prefer)
interface ReminderOverride {
  method: 'email' | 'popup';
  minutes: number;
}

interface NewEventData {
  summary: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  reminders?: {
    useDefault: boolean;
    overrides?: ReminderOverride[];
  };
}

interface ServiceEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  serviceTitle?: string;
  onEventCreated: (eventData: any) => void;
}

const ServiceEventModal: React.FC<ServiceEventModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  serviceTitle,
  onEventCreated,
}) => {
  const [summary, setSummary] = useState(serviceTitle || '');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<string>(
    initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [startTimeStr, setStartTimeStr] = useState<string>('09:00');
  const [endTimeStr, setEndTimeStr] = useState<string>('10:00');
  const [useDefaultReminders, setUseDefaultReminders] = useState(false);
  const [reminderOverrides, setReminderOverrides] = useState<ReminderOverride[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form fields when the modal is opened or initial data changes
    if (isOpen) {
      setSummary(serviceTitle || '');
      setDescription('');
      setEventDate(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setStartTimeStr('09:00');
      setEndTimeStr('10:00');
      setUseDefaultReminders(false);
      setReminderOverrides([]);
      setError(null); // Clear previous errors
    }
  }, [isOpen, initialDate, serviceTitle]);

  const handleAddReminder = () => {
    setReminderOverrides(prev => [...prev, { method: 'popup', minutes: 30 }]);
  };

  const handleReminderChange = (index: number, field: keyof ReminderOverride, value: string | number) => {
    const newReminders = [...reminderOverrides];
    if (field === 'minutes' && typeof value === 'string') {
      newReminders[index][field] = parseInt(value, 10) || 0;
    } else if (field === 'method' && (value === 'email' || value === 'popup')) {
      newReminders[index][field] = value;
    }
    setReminderOverrides(newReminders);
  };

  const handleRemoveReminder = (index: number) => {
    setReminderOverrides(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!summary || !eventDate || !startTimeStr || !endTimeStr) {
      setError("Please fill in all required fields: Summary, Date, Start Time, End Time.");
      setIsLoading(false);
      return;
    }

    try {
      const baseDate = parseISO(eventDate); // Date part
      const [startHour, startMinute] = startTimeStr.split(':').map(Number);
      const [endHour, endMinute] = endTimeStr.split(':').map(Number);

      let startDateTime = setHours(baseDate, startHour);
      startDateTime = setMinutes(startDateTime, startMinute);
      startDateTime = setSeconds(startDateTime, 0);
      startDateTime = setMilliseconds(startDateTime, 0);

      let endDateTime = setHours(baseDate, endHour);
      endDateTime = setMinutes(endDateTime, endMinute);
      endDateTime = setSeconds(endDateTime, 0);
      endDateTime = setMilliseconds(endDateTime, 0);


      if (startDateTime >= endDateTime) {
        setError("End time must be after start time.");
        setIsLoading(false);
        return;
      }

      const payload: NewEventData = {
        summary,
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reminders: {
          useDefault: useDefaultReminders,
          overrides: !useDefaultReminders && reminderOverrides.length > 0 ? reminderOverrides : undefined,
        },
      };

      // Replace with your actual API endpoint and authentication
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer YOUR_APP_JWT_TOKEN`, // Add your app's auth token if needed
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || `Failed to create event (${response.status})`);
      }

      const createdEvent = await response.json();
      onEventCreated(createdEvent);
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Set Google Calendar Reminder</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="summary">Summary:</label>
            <input type="text" id="summary" value={summary} onChange={e => setSummary(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="description">Description (Optional):</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label htmlFor="eventDate">Date:</label>
            <input type="date" id="eventDate" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="startTime">Start Time:</label>
            <input type="time" id="startTime" value={startTimeStr} onChange={e => setStartTimeStr(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="endTime">End Time:</label>
            <input type="time" id="endTime" value={endTimeStr} onChange={e => setEndTimeStr(e.target.value)} required />
          </div>

          <h4>Reminders:</h4>
          <div>
            <label>
              <input
                type="checkbox"
                checked={useDefaultReminders}
                onChange={e => setUseDefaultReminders(e.target.checked)}
              />
              Use Google Calendar default reminders
            </label>
          </div>
          {!useDefaultReminders && (
            <>
              {reminderOverrides.map((reminder, index) => (
                <div key={index} className="reminder-item">
                  <select
                    value={reminder.method}
                    onChange={e => handleReminderChange(index, 'method', e.target.value)}
                  >
                    <option value="popup">Popup</option>
                    <option value="email">Email</option>
                  </select>
                  <input
                    type="number"
                    value={reminder.minutes}
                    onChange={e => handleReminderChange(index, 'minutes', e.target.value)}
                    min="0"
                  /> minutes before
                  <button type="button" onClick={() => handleRemoveReminder(index)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={handleAddReminder}>Add Custom Reminder</button>
            </>
          )}

          {error && <p className="error-message">Error: {error}</p>}

          <div className="modal-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save to Google Calendar'}
            </button>
            <button type="button" onClick={onClose} disabled={isLoading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceEventModal;