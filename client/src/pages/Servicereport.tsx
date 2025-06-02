
import React, { useState, ChangeEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_ME } from '../utils/queries'

import { ADD_SERVICE_RECORD } from '../utils/mutations';


interface ServiceReportData {
  date: Date | null;
  type: null | 'Oil Change' | 'Brake Replacement' | 'Tire Rotation' | 'Battery Replacement' | 'Inspection' | 'Other';
  mileage: null | number;
  notes: null | string;
  cost: null | number;
  shop: string | null;
  // receipt?: File | null;
}

const ServiceReport: React.FC = () => {
  const [formData, setFormData] = useState<ServiceReportData>({
    date: null,
    type: null,
    mileage: null,
    notes: null,
    cost: null,
    shop: null
  });

  const { loading, error, data } = useQuery(QUERY_ME);

  const [addServiceRecord] = useMutation(ADD_SERVICE_RECORD);
   
  if (!loading) {
    console.log(data.me.vehicles);
  }

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const handleVehicleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicleId(e.target.value);
  };

  const [customServiceType, setCustomServiceType] = useState('');


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value as ServiceReportData['type'],
      }));
      // Reset custom service type if not "Other"
      if (value !== 'Other') setCustomServiceType('');
    } else if (name === 'mileage' || name === 'cost') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // const Header: React.FC = () => (
  //   <div className="bg-black text-white flex items-center justify-between p-4">
  //     <div className="flex items-center">
  //       <img src="/logo.png" alt="Logo" className="h-10 mr-4" />
  //       <h1 className="text-lg font-bold">TransCarney</h1>
  //     </div>
  //     <nav className="space-x-6">
  //       <a href="#" className="hover:underline">Dashboard</a>
  //       <a href="#" className="hover:underline">My Vehicles</a>
  //       <a href="#" className="hover:underline font-bold">Service Reports</a>
  //     </nav>
  //     <button className="text-white">
  //       <i className="fas fa-bars"></i>
  //     </button>
  //   </div>
  // );

  // Handle custom service type input
  
  const handleCustomServiceTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomServiceType(e.target.value);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      date: e.target.value ? new Date(e.target.value) : null,
    }));
  };

  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setFormData(prev => ({
  //     ...prev,
  //     receipt: file,
  //   }));
  // };

  function formatDate(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use customServiceType if "Other" is selected
    const dataToSubmit = {
      ...formData,
      date: formatDate(formData.date as Date),
      type: formData.type === 'Other' ? customServiceType : formData.type,
    };
    console.log('Record data:', dataToSubmit);
    console.log('Vehicle ID:', selectedVehicleId);

    // You can integrate backend submission logic here
    const { data } = await addServiceRecord({
      variables: {
        vehicleId: selectedVehicleId,
        record: {
          ...dataToSubmit
        }
      }
    });

    console.log(data);

  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you wish to eliminate this service report?")) {
      // Add your delete logic here
      console.log("Service report deleted.");
      // Optionally, reset form or navigate away
    }
  };

  return (
    
    // This is a form
    <form onSubmit={handleSubmit}>

      <div className='bg-dashboard mx-auto w-7/8 items-center p-6'>
        <h2 className="text-xl font-bold text-center bg-cyan-200 text-black py-2 px-4 rounded w-fit mx-auto mt-6">
          Service Reports
        </h2>

        {/* Div block for selecting vehicles */}
        <div>
          <label className="block mb-1 font-medium text-black">Select Vehicle</label>
          <select
            value={selectedVehicleId}
            onChange={handleVehicleChange}
            className="w-full border p-2 rounded text-black"
            required
            disabled={loading || !data}
          >
        
            <option value="">Select a vehicle</option>
            {!loading && !error && data?.me?.vehicles?.map((vehicle: any) => (
            <option key={vehicle._id} value={vehicle._id}>
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle._id === '683bc9d84e75b038d3cec82c' ? ' (Default)' : ''}
                {vehicle._id === '683bc9d84e75b038d3cec82d' ? ' (Default)' : ''}
            </option>
            ))}
          </select>
            {loading && <p className="text-gray-500 text-sm mt-1">Loading vehicles...</p>}
            {error && <p className="text-red-500 text-sm mt-1">Failed to load vehicles.</p>}
        </div>
      
        {/* Uploading an image of a vehicle */}
        <div className="flex justify-center items-center flex-col mb-6">
        <label className="block font-medium mb-2">Upload Image of Vehicle</label>
          <div className="w-40 h-40 border-2 border-dashed rounded cursor-pointer bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex justify-center items-center">
            <input type="file" accept="image/*" onChange={() => {}} className="hidden" id="vehicleImage" />
                <label htmlFor="vehicleImage" className="text-center text-gray-700 cursor-pointer">
                <i className="fas fa-image text-4xl mb-2"></i>
                  <p>Select from your Vehicles</p>
                </label>
          </div>
        </div>
        
        {/* Specify service date */}
        <div className="bg-white p-4 rounded shadow mb-6 border border-gray-300 text-bold">
          {/* Specify service date */}
          <div>
            <label className="block mb-1 font-medium text-black">Service Date</label>
            <input
              type="date"
              name="date"
              onChange={handleDateChange}
              className="w-full border p-2 rounded text-black"
            />
        </div>
        
        {/* Specify service type */}
        <div>
          <label className="block mb-1 font-medium text-black">Service Type</label>
          <select
            name="type"
            value={formData.type ?? ''}
            onChange={handleChange}
            className="w-full border p-2 rounded text-black"
          >
            <option value="">Select a type</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Brake Replacement">Brake Replacement</option>
            <option value="Tire Rotation">Tire Rotation</option>
            <option value="Battery Replacement">Battery Replacement</option>
            <option value="Inspection">Inspection</option>
            <option value="Other">Other</option>
          </select>
          {formData.type === "Other" && (
            <input
              type="text"
              maxLength={80}
              placeholder="Enter custom service type"
              value={customServiceType}
              onChange={handleCustomServiceTypeChange}
              className="mt-2 w-full border p-2 rounded text-black"
            />
          )}
        </div>
      
        {/* Specify mileage */}
        <div>
          <label className="block mb-1 font-medium text-black">Mileage</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage ?? ''}
            onChange={handleChange}
            className="w-full border p-2 rounded text-black"
          />
        </div>
      
        {/* This looks out of place */}
        <input
          type="date"
          name="nextServiceDate"
          placeholder="Date Of Next Service"
          className="w-full border p-2 rounded text-black"
          />
        </div>

        {/* Enter notes */}
        <div>
          <label className="block mb-1 font-medium text-black">Notes</label>
          <textarea
            name="notes"
            value={formData.notes ?? ''}
            onChange={handleChange}
            className="w-full border p-2 rounded text-black"
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-black">Cost</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="cost"
              value={formData.cost ?? ''}
              onChange={handleChange}
              className="w-full border p-2 pl-5 rounded text-black"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-black">Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={formData.shop ?? ''}
            onChange={handleChange}
            className="w-full border p-2 rounded text-black"
          />
        </div>

        {/* <div>
          <label className="block mb-1 font-medium text-black">Upload Receipt (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded text-black"
          />
          {formData.receipt && (
            <p className="text-sm mt-1 text-green-600">Receipt uploaded: {formData.receipt.name}</p>
          )}
        </div> */}

      {/* <div className="flex justify-center space-x-9 mt-4">
        <button className="flex justify-center bg-black text-white py-2 px-4 rounded mt-2">Add To Reminders</button>
      </div> */}

        <div className="flex justify-center space-x-9 mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Submit Report
          </button>
          <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              onClick={handleDelete}
            >
              Delete Report
          </button>
        </div>
      </div>
    </form>
  );
};

export default ServiceReport;
