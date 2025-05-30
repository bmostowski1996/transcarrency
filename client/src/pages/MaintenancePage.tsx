import React, { useState } from 'react';
import ServiceEventModal from '../components/ServiceEventModal';
import { format, parseISO } from 'date-fns';

const MaintenancePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenanceDate, setSelectedMaintenanceDate] = useState<Date | undefined>(new Date());
  const [maintenanceTitleForEvent, setMaintenanceTitleForEvent] = useState("Vehicle Maintenance Reminder");

  const handleOpenModal = (dateToSet?: Date) => {
    setSelectedMaintenanceDate(dateToSet || new Date());
    setIsModalOpen(true);
  };

  const handleEventCreated = (eventData: any) => {
    console.log('Google Calendar Event Created:', eventData);
    alert(`Event "${eventData.summary}" (ID: ${eventData.id}) created in Google Calendar!`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Schedule Maintenance / Set Reminder</h1>
      <p>
        Select a date for your maintenance and click the button to set a reminder in your Google Calendar.
      </p>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
        <h3>Maintenance Details</h3>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="customerName" style={{ marginRight: '10px', fontWeight: 'bold' }}>Customer Name:</label>
          <input type="text" id="customerName" placeholder="Enter customer name" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="vehicleType" style={{ marginRight: '10px', fontWeight: 'bold' }}>Vehicle Type:</label>
          <input type="text" id="vehicleType" placeholder="e.g., Sedan, SUV" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="maintenanceDateInput" style={{ fontWeight: 'bold' }}>Maintenance Date:</label>
          <input
            type="date"
            id="maintenanceDateInput"
            value={selectedMaintenanceDate ? format(selectedMaintenanceDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setSelectedMaintenanceDate(e.target.value ? parseISO(e.target.value) : undefined)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            onClick={() => handleOpenModal(selectedMaintenanceDate)}
            style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Set Google Calendar Reminder
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Submit Maintenance Request (App Only)
        </button>
      </div>

      <ServiceEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedMaintenanceDate}
        serviceTitle={maintenanceTitleForEvent}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default MaintenancePage;