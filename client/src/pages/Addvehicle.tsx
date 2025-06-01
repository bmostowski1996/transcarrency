import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER_VEHICLE } from '../utils/mutations';
import { useNavigate } from 'react-router-dom';
import Auth from '../utils/auth';
import makeIcon from '../assets/icons/make.png';
import modelIcon from '../assets/icons/model.png';
import yearIcon from '../assets/icons/year.png';
import vinIcon from '../assets/icons/vin.png';
import speedometerIcon from '../assets/icons/speedometer.png';

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mileage: '',
    vehicleModel: '',
    vehicleMake: '',
    vehicleYear: '',
    vin: '',
    notes: '',
    image: null as File | null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [registerVehicle] = useMutation(REGISTER_VEHICLE);

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const currentYear = new Date().getFullYear();

    if (!formData.vehicleMake.trim()) newErrors.vehicleMake = 'Make is required';
    if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Model is required';

    const year = parseInt(formData.vehicleYear);
    if (!year || isNaN(year)) {
      newErrors.vehicleYear = 'Valid year is required';
    } else if (year < 1900 || year > currentYear + 1) {
      newErrors.vehicleYear = `Year must be between 1900 and ${currentYear + 1}`;
    }

    const mileage = parseInt(formData.mileage);
    if (!mileage || isNaN(mileage)) {
      newErrors.mileage = 'Valid mileage is required';
    } else if (mileage < 0) {
      newErrors.mileage = 'Mileage must be a positive number';
    }

    if (!formData.vin.trim()) {
      newErrors.vin = 'VIN is required';
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userId = Auth.getUser()?.data?._id;
      await registerVehicle({
        variables: {
          ownerId: userId,
          input: {
            make: formData.vehicleMake,
            model: formData.vehicleModel,
            year: parseInt(formData.vehicleYear),
            vin: formData.vin,
            mileage: parseInt(formData.mileage),
            notes: formData.notes,
          },
        },
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className='bg-dashboard mx-auto w-7/8 items-center p-6'>
      <div className="gap-6 min-h-screen bg-gradient-to-b from-white to-green-300 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-10">
          <div className="bg-black text-center text-4xl font-bold text-white mb-10">Add A New Vehicle</div>

          <form onSubmit={handleSubmit}>
            <div className="bg-gray-100 p-6 rounded-lg mb-8 text-center text-lg">
              <label htmlFor="imageUpload" className="cursor-pointer bg-gray-300 h-40 w-full rounded-md flex items-center justify-center text-gray-600">
                {formData.image ? formData.image.name : 'Upload Image of Vehicle'}
                <input type="file" id="imageUpload" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { name: 'mileage', type: 'number', label: 'Mileage', placeholder: 'Enter Mileage', icon: speedometerIcon },
                { name: 'vehicleModel', type: 'text', label: 'Vehicle Model', placeholder: 'Enter Vehicle Model', icon: modelIcon },
                { name: 'vehicleMake', type: 'text', label: 'Vehicle Make', placeholder: 'Enter Vehicle Make', icon: makeIcon },
                { name: 'vehicleYear', type: 'number', label: 'Vehicle Year', placeholder: 'Enter Year', icon: yearIcon },
              ].map(({ name, type, label, placeholder, icon }) => (
                <div key={name} className="bg-green-100 p-5 rounded-xl">
                  <img src={icon} alt={`${label} Icon`} className="w-24 h-24 mb-4 mx-auto object-contain" />
                  <label className="block text-lg font-semibold mb-2 text-gray-800">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 text-md"
                  />
                  {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
                </div>
              ))}

              <div className="col-span-2 bg-green-100 p-5 rounded-xl">
                <img src={vinIcon} alt="VIN Icon" className="w-24 h-24 mb-4 mx-auto object-contain" />
                <label className="block text-lg font-semibold mb-2 text-gray-800">VIN</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  placeholder="Enter VIN"
                  className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 text-md"
                />
                {errors.vin && <p className="text-red-500 text-sm mt-1">{errors.vin}</p>}
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
                Add New Vehicle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;

