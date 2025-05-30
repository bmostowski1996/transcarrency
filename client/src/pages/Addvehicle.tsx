import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOS from '../assets/icons-two/2014.png'; // Adjust the path as necessary


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
   <div className='bg-dashboard mx-auto w-7/8 items-center p-6'>
    <div className=" gap-6 min-h-screen bg-gradient-to-b from-sky-100 to-green-100 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-10">
        <div className="text-center text-4xl font-bold text-black mb-10">Add Vehicle</div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Add A New Vehicle</h2>
          <button className="bg-green-500 hover:bg-green-600 text-black px-5 py-2 rounded-full text-md font-semibold">
            + Add a Vehicle
          </button>
        </div>              

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-100 p-6 rounded-lg mb-8 text-center text-lg">
            <label htmlFor="imageUpload" className="cursor-pointer bg-gray-300 h-40 w-full rounded-md flex items-center justify-center text-gray-600">
              {formData.image ? formData.image.name : 'Upload Image of Vehicle'}
              <input type="file" id="imageUpload" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { name: 'serviceDate', type: 'date', label: 'Date of Service' },
              { name: 'mileage', type: 'number', label: 'Mileage', placeholder: 'Enter Mileage' },
              { name: 'serviceType', type: 'text', label: 'Type of Service', placeholder: 'Enter Type of Service' },
              { name: 'shopName', type: 'text', label: 'Shop Name', placeholder: 'Enter Shop Name' },
              { name: 'vehicleModel', type: 'text', label: 'Vehicle Model', placeholder: 'Enter Vehicle Model' },
              { name: 'vehicleMake', type: 'text', label: 'Vehicle Make', placeholder: 'Enter Vehicle Make' },
              { name: 'cost', type: 'number', label: 'Cost', placeholder: 'Enter Cost' },
              { name: 'vehicleYear', type: 'number', label: 'Vehicle Year', placeholder: 'Enter Year' },
            ].map(({ name, type, label, placeholder }) => (
              <div key={name} className="bg-green-100 p-5 rounded-xl">
                <label className="block text-lg font-semibold mb-2 text-gray-800">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 text-md"
                />
              </div>
            ))}

            <div className="col-span-2 bg-green-100 p-5 rounded-xl">
              <label className="block text-lg font-semibold mb-2 text-gray-800">VIN</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                placeholder="Enter VIN"
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 text-md"
              />
            </div>

            <div className="col-span-2 bg-green-100 p-5 rounded-xl">
              <label className="block text-lg font-semibold mb-2 text-gray-800">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter Notes of Service"
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 text-md"
              />
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 text-lg font-bold rounded-full hover:bg-gray-800"
            >
              Add Vehicle Report
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Addvehicle;
