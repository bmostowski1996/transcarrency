import React, { useState } from 'react';
import ServiceEventModal from '../components/ServiceCalendar/ServiceEventModal'; // Adjust path if your components folder is different
import { format, parseISO } from 'date-fns';

const MaintenancePage: React.FC = () => { // Renamed component function
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenanceDate, setSelectedMaintenanceDate] = useState<Date | undefined>(new Date()); // Renamed state variable for clarity
  const [maintenanceTitleForEvent, setMaintenanceTitleForEvent] = useState("Vehicle Maintenance Reminder"); // Renamed state variable

  const handleOpenModal = (dateToSet?: Date) => {
    setSelectedMaintenanceDate(dateToSet || new Date());
    // You can dynamically set the title based on context if needed
    // setMaintenanceTitleForEvent(`Maintenance for ${someVehicleData.plate}`);
    setIsModalOpen(true);
  };

  const handleEventCreated = (eventData: any) => {
    console.log('Google Calendar Event Created:', eventData);
    alert(`Event "${eventData.summary}" (ID: ${eventData.id}) created in Google Calendar!`);
    // Potentially update your application's state here
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Book a Service</h1>
      <p>Click the button next to the date to set a Google Calendar reminder.</p>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label htmlFor="serviceDateInput" style={{ marginRight: '10px' }}>Service Date:</label>
        <input
          type="date"
          id="serviceDateInput"
          value={selectedServiceDate ? format(selectedServiceDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setSelectedServiceDate(e.target.value ? parseISO(e.target.value) : undefined)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={() => handleOpenModal(selectedServiceDate)}>
          Set Google Calendar Reminder
        </button>
      </div>

      {/* Imagine other booking form fields here */}
      <div>
        <label htmlFor="customerName">Customer Name:</label>
        <input type="text" id="customerName" style={{ marginLeft: '5px', marginBottom: '10px' }} />
      </div>

      <div style={{ marginTop: '30px' }}>
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Submit Maintenance Request (App Only) {/* Updated button text */}
        </button>
      </div>

      <ServiceEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedMaintenanceDate}
        serviceTitle={maintenanceTitleForEvent} // Pass the renamed state variable
        onEventCreated={handleEventCreated}
      />

      {/* Basic CSS for Modal (add to your App.css or a specific CSS file) */}
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          min-width: 350px;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .modal-content h3 {
          margin-top: 0;
        }
        .modal-content div {
          margin-bottom: 10px;
        }
        .modal-content label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .modal-content input[type="text"],
        .modal-content input[type="date"],
        .modal-content input[type="time"],
        .modal-content textarea,
        .modal-content select {
          width: calc(100% - 16px);
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .modal-content textarea {
          min-height: 60px;
        }
        .reminder-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }
        .reminder-item select,
        .reminder-item input[type="number"] {
          width: auto;
          flex-grow: 1;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .modal-actions button {
          padding: 8px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .modal-actions button[type="submit"] {
          background-color: #007bff;
          color: white;
        }
        .modal-actions button[type="button"] {
          background-color: #f0f0f0;
        }
        .error-message {
          color: red;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage; // Updated export