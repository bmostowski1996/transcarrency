
import React, { useState, ChangeEvent } from 'react';


interface ServiceReportData {
  serviceDate: Date | null;
  serviceType: null | 'Oil Change' | 'Brake Replacement' | 'Tire Rotation' | 'Battery Replacement' | 'Inspection' | 'Other';
  mileage: null | number;
  notes: null | string;
  cost: null | number;
  shopName: string | null;
  receipt?: File | null;
}

const ServiceReport: React.FC = () => {
  const [formData, setFormData] = useState<ServiceReportData>({
    serviceDate: null,
    serviceType: null,
    mileage: null,
    notes: null,
    cost: null,
    shopName: null,
    receipt: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'mileage' || name === 'cost' ? Number(value) : value,
    }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      serviceDate: e.target.value ? new Date(e.target.value) : null,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      receipt: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted data:', formData);
    // You can integrate backend submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-gradient-to-b from-white to-green-300 shadow-lg rounded-lg space-y-4">
      <h2 className="text-2xl text-black font-bold mb-4">Service Report</h2>

      <div>
        <label className="block mb-1 font-medium text-black">Service Date</label>
        <input
          type="date"
          name="serviceDate"
          onChange={handleDateChange}
          className="w-full border p-2 rounded text-black"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-black">Service Type</label>
        <select
          name="serviceType"
          value={formData.serviceType ?? ''}
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
      </div>

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
        <input
          type="number"
          name="cost"
          value={formData.cost ?? ''}
          onChange={handleChange}
          className="w-full border p-2 rounded text-black"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-black">Shop Name</label>
        <input
          type="text"
          name="shopName"
          value={formData.shopName ?? ''}
          onChange={handleChange}
          className="w-full border p-2 rounded text-black"
        />
      </div>

      <div>
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
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-black py-2 px-4 rounded"
      >
        Submit Report
      </button>
    </form>
  );
};

export default ServiceReport;
