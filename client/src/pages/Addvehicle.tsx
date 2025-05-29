import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOS from '.src/assets/icons-two/2014.png'; // Adjust the path as necessary

const Addvehicle: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serviceDate: '',
    mileage: '',
    serviceType: '',
    shopName: '',
    vehicleModel: '',
    vehicleMake: '',
    cost: '',
    vehicleYear: '',
    vin: '',
    notes: '',
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // handle form submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-4">
        <div className="text-center text-2xl font-bold text-black mb-4">Add Vehicle</div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add A New Vehicle</h2>
          <button className="bg-green-500 hover:bg-green-600 text-black px-3 py-1 rounded-full text-sm">
            + Add a Vehicle
          </button>
        </div>              
        <form onSubmit={handleSubmit}>
        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-center">
            <label htmlFor="imageUpload" className="cursor-pointer bg-gray-300 h-32 w-full rounded-md flex items-center justify-center text-gray-600">
            {formData.image ? formData.image.name : 'Upload Image of Vehicle'}
            <input type="file" id="imageUpload" onChange={handleImageChange} className="hidden" />
            </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* <div className="bg-green-100 p-3 rounded-md">
            <img src={DOS} alt="Date of Service Icon" className="mx-auto mb-2 h-8 w-8" />
            <label className="block text-sm font-medium mb-1 text-gray-800">Date of Service</label>
            <input type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div> */}
            
            

            <div className="bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Mileage</label>
            <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="Enter Mileage" className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>

            <div className="bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Type of Service</label>
            <input type="text" name="serviceType" value={formData.serviceType} onChange={handleChange} placeholder="Enter Type of Service" className="w-full p-1 rounded-md border border-grey-300 text-gray-800" />
            </div>

            <div className="bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Shop Name</label>
            <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Enter Shop Name" className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>

            <div className="bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Vehicle Model</label>
            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Enter Vehicle Model" className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>

            <div className="bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Vehicle Make</label>
            <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="Enter Vehicle Make" className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>

            <div className="bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Cost</label>
            <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="Enter Cost" className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>

            <div className="bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Vehicle Year</label>
            <input type="number" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} placeholder="Enter Year" className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>

            <div className="col-span-2 bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">VIN</label>
            <input type="text" name="vin" value={formData.vin} onChange={handleChange} placeholder="Enter VIN" className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>

            <div className="col-span-2 bg-green-100 p-3 rounded-md">
            <label className="block text-sm font-medium mb-1 text-gray-800">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Enter Notes of Service" rows={3} className="w-full p-1 rounded-md border border-gray-300 text-gray-800" />
            </div>
        </div>

        <div className="mt-4 text-center">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
            Add Vehicle Report
            </button>
        </div>
        </form>

      </div>
    </div>
  );
};

export default Addvehicle;
