import React, { useState, useEffect } from 'react';
import { format, parseISO, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { useQuery } from '@apollo/client'; // gql removed
import { QUERY_MY_VEHICLES } from '../utils/auth'; // Added import for the query

// Interfaces (can be in a separate types.ts)
interface ReminderOverride {
  method: 'email' | 'popup';
  minutes: number;
}

interface MaintenanceDetailsData {
  customerName: string;
  vehicleType: string; // This can serve as a manual fallback
  maintenanceDate: string; // Store as 'yyyy-MM-dd' string
}

interface CalendarEventDetailsData {
  summary: string;
  description: string;
  eventDate: string; // Store as 'yyyy-MM-dd' string
  startTimeStr: string;
  endTimeStr: string;
}

interface Vehicle { // For typing the fetched vehicle data
  _id: string;
  make: string;
  model: string;
  year: number;
}

const MaintenancePage: React.FC = () => {
  const initialMaintenanceDate = format(new Date(), 'yyyy-MM-dd');

  const [maintenanceDetails, setMaintenanceDetails] = useState<MaintenanceDetailsData>({
    customerName: '',
    vehicleType: '',
    maintenanceDate: initialMaintenanceDate,
  });

  const [calendarEventDetails, setCalendarEventDetails] = useState<CalendarEventDetailsData>({
    summary: 'Schedule Maintenance', // Initial generic summary
    description: '',
    eventDate: initialMaintenanceDate,
    startTimeStr: '09:00',
    endTimeStr: '10:00',
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { data: vehiclesData, loading: vehiclesLoading, error: vehiclesError } = useQuery(QUERY_MY_VEHICLES);

  // Other state variables
  const [useDefaultReminders, setUseDefaultReminders] = useState(false);
  const [reminderOverrides, setReminderOverrides] = useState<ReminderOverride[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Effect to update calendar event summary based on selected vehicle, manual vehicle type, and date
  useEffect(() => {
    let newSummary = 'Schedule Maintenance'; // Default summary
    const selectedVehicle = vehiclesData?.myVehicles?.find((v: Vehicle) => v._id === selectedVehicleId);
    
    // Use calendarEventDetails.eventDate if available, otherwise fallback to maintenanceDetails.maintenanceDate
    const dateForSummary = calendarEventDetails.eventDate || maintenanceDetails.maintenanceDate;

    if (selectedVehicle) {
      newSummary = `Maintenance for ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`;
    } else if (maintenanceDetails.vehicleType) { // Fallback to manually entered vehicle type
      newSummary = `Maintenance for ${maintenanceDetails.vehicleType}`;
    }

    if (dateForSummary) {
      try {
        newSummary += ` on ${format(parseISO(dateForSummary), 'MM/dd/yyyy')}`;
      } catch (e) {
        console.warn("Invalid date format for summary:", dateForSummary);
        // Keep newSummary as is if date is invalid
      }
    }
    
    setCalendarEventDetails(prev => ({
      ...prev,
      summary: newSummary,
      // Ensure eventDate in calendar form is also updated if maintenanceDate was the source
      eventDate: dateForSummary 
    }));

  }, [selectedVehicleId, vehiclesData, calendarEventDetails.eventDate, maintenanceDetails.maintenanceDate, maintenanceDetails.vehicleType]);


  // Effect to specifically sync maintenanceDate from the first form to the calendarEventDetails.eventDate
  // This helps if the user changes the date in the first form, the second form's date field should also update.
  useEffect(() => {
    if (maintenanceDetails.maintenanceDate && maintenanceDetails.maintenanceDate !== calendarEventDetails.eventDate) {
      setCalendarEventDetails(prev => ({
        ...prev,
        eventDate: maintenanceDetails.maintenanceDate,
      }));
    }
  }, [maintenanceDetails.maintenanceDate]);


  const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMaintenanceDetails(prev => ({ ...prev, [name]: value }));
  };

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

    const { summary, description, eventDate, startTimeStr, endTimeStr } = calendarEventDetails;

    if (!summary || !eventDate || !startTimeStr || !endTimeStr) {
      setError("Please fill in all required fields for the calendar event: Summary, Date, Start Time, End Time.");
      setIsLoading(false);
      return;
    }

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
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reminders: {
          useDefault: useDefaultReminders,
          overrides: !useDefaultReminders && reminderOverrides.length > 0 ? reminderOverrides : undefined,
        },
      };

      const appAuthToken = localStorage.getItem('id_token'); // Using 'id_token'
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
      // Optionally reset parts of the form or redirect

    } catch (err: any) {
      if (!error) {
        setError(err.message || 'An unexpected error occurred while creating the calendar event.');
      }
      console.error("Error in handleCalendarSubmit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting maintenance details:", maintenanceDetails);
    alert("Maintenance details submitted to application (mock).");
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Schedule Maintenance & Set Calendar Reminder</h1>
      
      <form onSubmit={handleMaintenanceFormSubmit} style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Maintenance Details</h2>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="customerName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Customer Name:</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={maintenanceDetails.customerName}
            onChange={handleMaintenanceChange}
            placeholder="Enter customer name"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="vehicleType" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vehicle Type (Manual Entry):</label>
          <input
            type="text"
            id="vehicleType"
            name="vehicleType"
            value={maintenanceDetails.vehicleType}
            onChange={handleMaintenanceChange}
            placeholder="e.g., Sedan, SUV (if not selecting from list)"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="maintenanceDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Maintenance Date:</label>
          <input
            type="date"
            id="maintenanceDate"
            name="maintenanceDate"
            value={maintenanceDetails.maintenanceDate}
            onChange={handleMaintenanceChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Submit Maintenance Request (App Only)
        </button>
      </form>

      <form onSubmit={handleCalendarSubmit} style={{ padding: '20px', border: '1px solid #28a745', borderRadius: '8px' }}>
        <h2>Set Google Calendar Reminder</h2>

        {vehiclesLoading && <p>Loading your vehicles...</p>}
        {vehiclesError && <p style={{color: 'red'}}>Error loading vehicles: {vehiclesError.message}</p>}
        
        {vehiclesData?.myVehicles && vehiclesData.myVehicles.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="selectedVehicle" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Your Vehicle:</label>
            <select
              id="selectedVehicle"
              name="selectedVehicle" // Important for the handler
              value={selectedVehicleId}
              onChange={handleCalendarEventChange}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Select a Vehicle --</option>
              {vehiclesData.myVehicles.map((vehicle: Vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Optional: Message if user has no vehicles */}
        {vehiclesData && vehiclesData.myVehicles && vehiclesData.myVehicles.length === 0 && !vehiclesLoading && (
            <p style={{ marginBottom: '15px' }}>No vehicles found. You can add vehicles to your profile or use the manual entry above.</p>
        )}
        
        <p>Fill in the details below to add this maintenance appointment to your Google Calendar.</p>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="summary" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Event Summary (Title):</label>
          <input 
            type="text" id="summary" name="summary" 
            value={calendarEventDetails.summary} onChange={handleCalendarEventChange} required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description (Optional):</label>
          <textarea 
            id="description" name="description" 
            value={calendarEventDetails.description} onChange={handleCalendarEventChange} 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}/>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div style={{flex: 1}}>
                <label htmlFor="eventDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Event Date:</label>
                <input 
                  type="date" id="eventDate" name="eventDate" 
                  value={calendarEventDetails.eventDate} onChange={handleCalendarEventChange} required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
            </div>
            <div style={{flex: 1}}>
                <label htmlFor="startTimeStr" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Time:</label>
                <input 
                  type="time" id="startTimeStr" name="startTimeStr" 
                  value={calendarEventDetails.startTimeStr} onChange={handleCalendarEventChange} required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
            </div>
            <div style={{flex: 1}}>
                <label htmlFor="endTimeStr" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Time:</label>
                <input 
                  type="time" id="endTimeStr" name="endTimeStr" 
                  value={calendarEventDetails.endTimeStr} onChange={handleCalendarEventChange} required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
            </div>
        </div>

        <h4 style={{ marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }}>Reminders:</h4>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={useDefaultReminders}
              onChange={e => setUseDefaultReminders(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Use Google Calendar default reminders
          </label>
        </div>
        {!useDefaultReminders && (
          <>
            {reminderOverrides.map((reminder, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                <select
                  value={reminder.method}
                  onChange={e => handleReminderChange(index, 'method', e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px' }}
                >
                  <option value="popup">Popup</option>
                  <option value="email">Email</option>
                </select>
                <input
                  type="number"
                  value={reminder.minutes}
                  onChange={e => handleReminderChange(index, 'minutes', e.target.value)}
                  min="0"
                  style={{ padding: '8px', borderRadius: '4px', width: '80px' }}
                /> minutes before
                <button type="button" onClick={() => handleRemoveReminder(index)} 
                        style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddReminder} 
                    style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
              Add Custom Reminder
            </button>
          </>
        )}

        {error && <p style={{color: 'red', marginTop: '15px', fontWeight: 'bold'}}>Error: {error}</p>}
        {successMessage && <p style={{color: 'green', marginTop: '15px', fontWeight: 'bold'}}>{successMessage}</p>}

        <div style={{ marginTop: '25px' }}>
          <button 
            type="submit" 
            disabled={isLoading || vehiclesLoading} // Disable button if vehicles are loading too
            style={{ padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            {isLoading ? 'Saving to Calendar...' : (vehiclesLoading ? 'Loading Vehicles...' : 'Save to Google Calendar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenancePage;