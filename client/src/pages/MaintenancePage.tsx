import React, { useState, useEffect } from 'react';
import { format, parseISO, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { useQuery } from '@apollo/client'; // Import useQuery
import { QUERY_MY_VEHICLES } from '../utils/queries'; // Adjust path if necessary

// Interfaces
interface ReminderOverride {
  method: 'email' | 'popup';
  minutes: number;
}

interface CalendarEventDetailsData {
  summary: string;
  description: string;
  eventDate: string;
  startTimeStr: string;
  endTimeStr: string;
}

interface UserVehicle { // Interface for the vehicle data
  _id: string;
  make: string;
  model: string;
  year: number;
}

const MaintenancePage: React.FC = () => {
  const initialEventDate = format(new Date(), 'yyyy-MM-dd');

  const [calendarEventDetails, setCalendarEventDetails] = useState<CalendarEventDetailsData>({
    summary: '', // Initial summary will be set by useEffect
    description: '',
    eventDate: initialEventDate,
    startTimeStr: '09:00',
    endTimeStr: '10:00',
  });

  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Other state variables
  const [useDefaultReminders, setUseDefaultReminders] = useState(false);
  const [reminderOverrides, setReminderOverrides] = useState<ReminderOverride[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For calendar submission
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user's vehicles
  const { loading: vehiclesLoading, error: vehiclesError, data: vehiclesData } = useQuery(QUERY_MY_VEHICLES);

  useEffect(() => {
    if (vehiclesData && vehiclesData.myVehicles) {
      const fetchedVehicles: UserVehicle[] = vehiclesData.myVehicles;
      setUserVehicles(fetchedVehicles);
      if (fetchedVehicles.length > 0) {
        // Auto-select the first vehicle by default
        setSelectedVehicleId(fetchedVehicles[0]._id);
      } else {
        setSelectedVehicleId(''); // No vehicle to select
      }
    }
  }, [vehiclesData]);

  // Effect to update summary when eventDate or selectedVehicleId changes
  useEffect(() => {
    const selectedVehicle = userVehicles.find(vehicle => vehicle._id === selectedVehicleId);
    let vehicleInfo = "Car"; // Default if no vehicle is selected or found

    if (selectedVehicle) {
      vehicleInfo = `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`;
    }

    setCalendarEventDetails(prev => ({
      ...prev,
      summary: `${vehicleInfo} Service on ${prev.eventDate ? format(parseISO(prev.eventDate), 'MM/dd/yyyy') : 'selected date'}`
    }));
  }, [calendarEventDetails.eventDate, selectedVehicleId, userVehicles]);

  const handleCalendarEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "selectedVehicle") {
      setSelectedVehicleId(value);
    } else {
      setCalendarEventDetails(prev => ({ ...prev, [name]: value }));
    }
  };

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

  const handleCalendarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!selectedVehicleId && userVehicles.length > 0) {
        setError("Please select a vehicle.");
        setIsLoading(false);
        return;
    }

    const { summary, description, eventDate, startTimeStr, endTimeStr } = calendarEventDetails;

    if (!summary || !eventDate || !startTimeStr || !endTimeStr) {
      setError("Please fill in all required fields for the calendar event: Summary, Date, Start Time, End Time.");
      setIsLoading(false);
      return;
    }
    // ... (rest of handleCalendarSubmit logic remains the same)
    try {
      const baseDate = parseISO(eventDate);
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
        setError("End time must be after start time for the calendar event.");
        setIsLoading(false);
        return;
      }

      const payload = {
        summary,
        description: `${description}\nVehicle ID: ${selectedVehicleId || 'N/A'}`, // Optionally add vehicle ID to description
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reminders: {
          useDefault: useDefaultReminders,
          overrides: !useDefaultReminders && reminderOverrides.length > 0 ? reminderOverrides : undefined,
        },
      };

      const appAuthToken = localStorage.getItem('yourAppAuthToken'); 
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (appAuthToken) {
        headers['Authorization'] = `Bearer ${appAuthToken}`;
      }

      const response = await fetch('/api/calendar/events', { 
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.text();
        setError(errData || `Failed to create event (${response.status})`);
        throw new Error(errData || `Failed to create event (${response.status})`);
      }

      const createdEvent = await response.json();
      setSuccessMessage(`Event "${createdEvent.summary}" (ID: ${createdEvent.id}) created in Google Calendar!`);

    } catch (err: any) {
      if (!error) { 
        setError(err.message || 'An unexpected error occurred while creating the calendar event.');
      }
      console.error("Error in handleCalendarSubmit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Set Google Calendar Reminder</h1>
      
      <form onSubmit={handleCalendarSubmit} style={{ padding: '20px', border: '1px solid #28a745', borderRadius: '8px' }}>
        <p style={{ fontSize: '1.1em', marginBottom: '20px' }}>Fill in the details below to add an event to your Google Calendar.</p>

        {/* Vehicle Selection Dropdown */}
        {vehiclesLoading && <p style={{ marginBottom: '20px' }}>Loading your vehicles...</p>}
        {vehiclesError && <p style={{ color: 'red', marginBottom: '20px' }}>Error loading vehicles. Please ensure you are logged in and try again.</p>}
        
        {!vehiclesLoading && !vehiclesError && userVehicles.length === 0 && (
          <p style={{ marginBottom: '20px', color: 'orange' }}>No vehicles found. Please add a vehicle to your profile first to schedule maintenance.</p>
        )}

        {userVehicles.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="selectedVehicle" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1em' }}>Select Vehicle:</label>
            <select
              id="selectedVehicle"
              name="selectedVehicle" // Name attribute for the handler
              value={selectedVehicleId}
              onChange={handleCalendarEventChange} // Use the combined handler
              required
              style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="" disabled={selectedVehicleId !== ""}>-- Select a Vehicle --</option> {/* Added a default placeholder */}
              {userVehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Event Summary - now dynamically populated */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="summary" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1em' }}>Event Summary (Title):</label>
          <input 
            type="text" id="summary" name="summary" 
            value={calendarEventDetails.summary} 
            onChange={handleCalendarEventChange} // Allow override if needed
            required 
            style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' }}/>