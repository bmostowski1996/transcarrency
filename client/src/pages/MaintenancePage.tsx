import React, { useState, useEffect } from 'react';
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { useQuery } from '@apollo/client';
import { QUERY_MY_VEHICLES } from '../utils/auth';

// Interfaces
interface ReminderOverride {
  method: 'email' | 'popup';
  minutes: number;
}

interface MaintenanceDetailsData {
  vehicleType: string; // This can serve as a manual fallback
  maintenanceDate: string; // Store as 'yyyy-MM-dd' string
}

interface CalendarEventDetailsData {
  summary: string;
  description: string;
  eventDate: string;
  startTimeStr: string;
  endTimeStr: string;
}

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
}

const MaintenancePage: React.FC = () => {
  const initialMaintenanceDate = format(new Date(), 'yyyy-MM-dd');

  const [maintenanceDetails, setMaintenanceDetails] = useState<MaintenanceDetailsData>({
    vehicleType: '',
    maintenanceDate: initialMaintenanceDate,
  });

  const [calendarEventDetails, setCalendarEventDetails] = useState<CalendarEventDetailsData>({
    summary: 'Schedule Maintenance',
    description: '',
    eventDate: initialMaintenanceDate,
    startTimeStr: '09:00',
    endTimeStr: '10:00',
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { data: vehiclesData, loading: vehiclesLoading, error: vehiclesError } = useQuery<{ myVehicles: Vehicle[] }>(QUERY_MY_VEHICLES);

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
        newSummary += ` on ${format(new Date(dateForSummary), 'MM/dd/yyyy')}`;
      } catch (e) {
        console.warn("Invalid date format for summary:", dateForSummary);
        // Keep newSummary as is if date is invalid
      }
    }
    
    setCalendarEventDetails((prev: CalendarEventDetailsData) => ({
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
      setCalendarEventDetails((prev: CalendarEventDetailsData) => ({
        ...prev,
        eventDate: maintenanceDetails.maintenanceDate,
      }));
    }
  }, [maintenanceDetails.maintenanceDate]);


  const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMaintenanceDetails((prev: MaintenanceDetailsData) => ({ ...prev, [name]: value }));
  };

  const handleCalendarEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "selectedVehicle") {
      setSelectedVehicleId(value);
    } else {
      setCalendarEventDetails((prev: CalendarEventDetailsData) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddReminder = () => {
    setReminderOverrides((prev: ReminderOverride[]) => [...prev, { method: 'popup', minutes: 30 }]);
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
    setReminderOverrides((prev: ReminderOverride[]) => prev.filter((_: ReminderOverride, i: number) => i !== index));
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
      const baseDate = new Date(eventDate); // Replaced parseISO
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
    // Mock submission
    setSuccessMessage("Maintenance details submitted to application (mock).");
    // Reset form or provide other feedback as needed
  };

  const inputClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const buttonPrimaryClasses = "w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50";
  const buttonSecondaryClasses = "px-3 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50";
  const buttonDangerClasses = "px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1";
  const buttonNeutralClasses = "px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">Schedule Maintenance & Set Calendar Reminder</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          
          <section>
            <form onSubmit={handleMaintenanceFormSubmit} className="space-y-6 p-6 bg-gray-50 rounded-lg shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 border-b pb-3">Maintenance Details</h2>
              
              <div>
                <label htmlFor="vehicleType" className={labelClasses}>Vehicle Type (Manual Entry):</label>
                <input type="text" id="vehicleType" name="vehicleType" value={maintenanceDetails.vehicleType} onChange={handleMaintenanceChange} placeholder="e.g., Sedan, SUV" className={inputClasses} />
              </div>
              
              <div>
                <label htmlFor="maintenanceDate" className={labelClasses}>Maintenance Date:</label>
                <input type="date" id="maintenanceDate" name="maintenanceDate" value={maintenanceDetails.maintenanceDate} onChange={handleMaintenanceChange} className={inputClasses} />
              </div>
              
              <button type="submit" className={buttonPrimaryClasses}>
                Submit Maintenance Request (App Only)
              </button>
            </form>
          </section>

          <section>
            <form onSubmit={handleCalendarSubmit} className="space-y-6 p-6 bg-gray-50 rounded-lg shadow-md">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 border-b pb-3">Set Google Calendar Reminder</h2>

              {vehiclesLoading && <p className="text-sm text-gray-500">Loading your vehicles...</p>}
              {vehiclesError && <p className="text-sm text-red-600">Error loading vehicles: {vehiclesError.message}</p>}
              
              {vehiclesData?.myVehicles && vehiclesData.myVehicles.length > 0 && (
                <div>
                  <label htmlFor="selectedVehicle" className={labelClasses}>Select Your Vehicle:</label>
                  <select id="selectedVehicle" name="selectedVehicle" value={selectedVehicleId} onChange={handleCalendarEventChange} className={inputClasses}>
                    <option value="">-- Select a Vehicle --</option>
                    {vehiclesData.myVehicles.map((vehicle: Vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {vehiclesData && vehiclesData.myVehicles && vehiclesData.myVehicles.length === 0 && !vehiclesLoading && (
                  <p className="text-sm text-gray-500">No vehicles found. You can add vehicles to your profile or use the manual entry above.</p>
              )}
              
              <p className="text-xs text-gray-600 pt-2">Fill in the details below to add this maintenance appointment to your Google Calendar.</p>

              <div>
                <label htmlFor="summary" className={labelClasses}>Event Summary (Title):</label>
                <input type="text" id="summary" name="summary" value={calendarEventDetails.summary} onChange={handleCalendarEventChange} required className={inputClasses}/>
              </div>

              <div>
                <label htmlFor="description" className={labelClasses}>Description (Optional):</label>
                <textarea id="description" name="description" value={calendarEventDetails.description} onChange={handleCalendarEventChange} className={`${inputClasses} min-h-[80px]`}/>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                      <label htmlFor="eventDate" className={labelClasses}>Event Date:</label>
                      <input type="date" id="eventDate" name="eventDate" value={calendarEventDetails.eventDate} onChange={handleCalendarEventChange} required className={inputClasses}/>
                  </div>
                  <div>
                      <label htmlFor="startTimeStr" className={labelClasses}>Start Time:</label>
                      <input type="time" id="startTimeStr" name="startTimeStr" value={calendarEventDetails.startTimeStr} onChange={handleCalendarEventChange} required className={inputClasses}/>
                  </div>
                  <div>
                      <label htmlFor="endTimeStr" className={labelClasses}>End Time:</label>
                      <input type="time" id="endTimeStr" name="endTimeStr" value={calendarEventDetails.endTimeStr} onChange={handleCalendarEventChange} required className={inputClasses}/>
                  </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-700 mt-2 mb-2">Reminders:</h4>
                <div className="mb-3">
                  <label className="flex items-center text-sm text-gray-700">
                    <input type="checkbox" checked={useDefaultReminders} onChange={(e) => setUseDefaultReminders(e.target.checked)} className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                    Use Google Calendar default reminders
                  </label>
                </div>
                {!useDefaultReminders && (
                  <div className="space-y-3">
                    {reminderOverrides.map((reminder, index) => (
                      <div key={index} className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-md bg-white">
                        <select value={reminder.method} onChange={(e) => handleReminderChange(index, 'method', e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm text-xs flex-grow sm:flex-grow-0">
                          <option value="popup">Popup</option>
                          <option value="email">Email</option>
                        </select>
                        <input type="number" value={reminder.minutes} onChange={(e) => handleReminderChange(index, 'minutes', e.target.value)} min="0" className="p-2 border border-gray-300 rounded-md shadow-sm text-xs w-20 flex-grow sm:flex-grow-0"/>
                        <span className="text-xs text-gray-600">minutes before</span>
                        <button type="button" onClick={() => handleRemoveReminder(index)} className={`${buttonDangerClasses} ml-auto`}>
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddReminder} className={`${buttonNeutralClasses} text-xs`}>
                      Add Custom Reminder
                    </button>
                  </div>
                )}
              </div>

              {error && <p className="mt-4 text-sm font-semibold text-red-600">Error: {error}</p>}
              {successMessage && <p className="mt-4 text-sm font-semibold text-green-600">{successMessage}</p>}

              <div className="mt-6">
                <button type="submit" disabled={isLoading || vehiclesLoading} className={`${buttonSecondaryClasses} w-full`}>
                  {isLoading ? 'Saving to Calendar...' : (vehiclesLoading ? 'Loading Vehicles...' : 'Save to Google Calendar')}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;