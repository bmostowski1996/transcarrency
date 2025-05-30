import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { format, parseISO, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
const MaintenancePage = () => {
    const initialMaintenanceDate = format(new Date(), 'yyyy-MM-dd');
    const [maintenanceDetails, setMaintenanceDetails] = useState({
        customerName: '',
        vehicleType: '',
        maintenanceDate: initialMaintenanceDate,
    });
    const [calendarEventDetails, setCalendarEventDetails] = useState({
        summary: 'Vehicle Maintenance Reminder',
        description: '',
        eventDate: initialMaintenanceDate,
        startTimeStr: '09:00',
        endTimeStr: '10:00',
    });
    // Other state variables (not part of the primary form data objects)
    const [useDefaultReminders, setUseDefaultReminders] = useState(false);
    const [reminderOverrides, setReminderOverrides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // Effect to sync maintenanceDate to calendarEventDetails.eventDate
    useEffect(() => {
        setCalendarEventDetails(prev => ({
            ...prev,
            eventDate: maintenanceDetails.maintenanceDate,
            summary: `Maintenance for ${maintenanceDetails.vehicleType || 'Vehicle'} on ${maintenanceDetails.maintenanceDate ? format(parseISO(maintenanceDetails.maintenanceDate), 'MM/dd/yyyy') : ''}`
        }));
    }, [maintenanceDetails.maintenanceDate, maintenanceDetails.vehicleType]);
    const handleMaintenanceChange = (e) => {
        const { name, value } = e.target;
        setMaintenanceDetails(prev => ({ ...prev, [name]: value }));
    };
    const handleCalendarEventChange = (e) => {
        const { name, value } = e.target;
        setCalendarEventDetails(prev => ({ ...prev, [name]: value }));
    };
    const handleAddReminder = () => {
        setReminderOverrides(prev => [...prev, { method: 'popup', minutes: 30 }]);
    };
    const handleReminderChange = (index, field, value) => {
        const newReminders = [...reminderOverrides];
        if (field === 'minutes' && typeof value === 'string') {
            newReminders[index][field] = parseInt(value, 10) || 0;
        }
        else if (field === 'method' && (value === 'email' || value === 'popup')) {
            newReminders[index][field] = value;
        }
        setReminderOverrides(newReminders);
    };
    const handleRemoveReminder = (index) => {
        setReminderOverrides(prev => prev.filter((_, i) => i !== index));
    };
    const handleCalendarSubmit = async (e) => {
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
            const appAuthToken = localStorage.getItem('yourAppAuthToken');
            const headers = { 'Content-Type': 'application/json' };
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
        }
        catch (err) {
            if (!error) {
                setError(err.message || 'An unexpected error occurred while creating the calendar event.');
            }
            console.error("Error in handleCalendarSubmit:", err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleMaintenanceFormSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting maintenance details:", maintenanceDetails);
        alert("Maintenance details submitted to application (mock).");
        // Here you would typically send maintenanceDetails to your app's backend
    };
    return (_jsxs("div", { style: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }, children: [_jsx("h1", { children: "Schedule Maintenance & Set Calendar Reminder" }), _jsxs("form", { onSubmit: handleMaintenanceFormSubmit, style: { marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }, children: [_jsx("h2", { children: "Maintenance Details" }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { htmlFor: "customerName", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "Customer Name:" }), _jsx("input", { type: "text", id: "customerName", name: "customerName", value: maintenanceDetails.customerName, onChange: handleMaintenanceChange, placeholder: "Enter customer name", style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { htmlFor: "vehicleType", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "Vehicle Type:" }), _jsx("input", { type: "text", id: "vehicleType", name: "vehicleType", value: maintenanceDetails.vehicleType, onChange: handleMaintenanceChange, placeholder: "e.g., Sedan, SUV", style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { htmlFor: "maintenanceDate", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "Maintenance Date:" }), _jsx("input", { type: "date", id: "maintenanceDate", name: "maintenanceDate", value: maintenanceDetails.maintenanceDate, onChange: handleMaintenanceChange, style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' } })] }), _jsx("button", { type: "submit", style: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Submit Maintenance Request (App Only)" })] }), _jsxs("form", { onSubmit: handleCalendarSubmit, style: { padding: '20px', border: '1px solid #28a745', borderRadius: '8px' }, children: [_jsx("h2", { children: "Set Google Calendar Reminder" }), _jsx("p", { children: "Fill in the details below to add this maintenance appointment to your Google Calendar." }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { htmlFor: "summary", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "Event Summary (Title):" }), _jsx("input", { type: "text", id: "summary", name: "summary", value: calendarEventDetails.summary, onChange: handleCalendarEventChange, required: true, style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' } })] }), " ", _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { htmlFor: "description", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "Description (Optional):" }), _jsx("textarea", { id: "description", name: "description", value: calendarEventDetails.description, onChange: handleCalendarEventChange, style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' } })] }), _jsxs("div", { style: { display: 'flex', gap: '20px', marginBottom: '15px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { htmlFor: "eventDate", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "Event Date:" }), _jsx("input", { type: "date", id: "eventDate", name: "eventDate", value: calendarEventDetails.eventDate, onChange: handleCalendarEventChange, required: true, style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { htmlFor: "startTimeStr", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "Start Time:" }), _jsx("input", { type: "time", id: "startTimeStr", name: "startTimeStr", value: calendarEventDetails.startTimeStr, onChange: handleCalendarEventChange, required: true, style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { htmlFor: "endTimeStr", style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, children: "End Time:" }), _jsx("input", { type: "time", id: "endTimeStr", name: "endTimeStr", value: calendarEventDetails.endTimeStr, onChange: handleCalendarEventChange, required: true, style: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' } })] })] }), _jsx("h4", { style: { marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }, children: "Reminders:" }), _jsx("div", { style: { marginBottom: '10px' }, children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: useDefaultReminders, onChange: e => setUseDefaultReminders(e.target.checked), style: { marginRight: '8px' } }), "Use Google Calendar default reminders"] }) }), !useDefaultReminders && (_jsxs(_Fragment, { children: [reminderOverrides.map((reminder, index) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }, children: [_jsxs("select", { value: reminder.method, onChange: e => handleReminderChange(index, 'method', e.target.value), style: { padding: '8px', borderRadius: '4px' }, children: [_jsx("option", { value: "popup", children: "Popup" }), _jsx("option", { value: "email", children: "Email" })] }), _jsx("input", { type: "number", value: reminder.minutes, onChange: e => handleReminderChange(index, 'minutes', e.target.value), min: "0", style: { padding: '8px', borderRadius: '4px', width: '80px' } }), " minutes before", _jsx("button", { type: "button", onClick: () => handleRemoveReminder(index), style: { padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Remove" })] }, index))), _jsx("button", { type: "button", onClick: handleAddReminder, style: { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }, children: "Add Custom Reminder" })] })), error && _jsxs("p", { style: { color: 'red', marginTop: '15px', fontWeight: 'bold' }, children: ["Error: ", error] }), successMessage && _jsx("p", { style: { color: 'green', marginTop: '15px', fontWeight: 'bold' }, children: successMessage }), _jsxs("div", { style: { marginTop: '25px' }, children: [" ", _jsxs("button", { type: "submit", disabled: isLoading, style: { padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }, children: [" ", isLoading ? 'Saving to Calendar...' : 'Save to Google Calendar'] })] }), " "] }), " "] }) // This is the main page div
    );
};
export default MaintenancePage;
