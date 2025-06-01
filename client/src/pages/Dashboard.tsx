import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';

// Placeholder code while the login screen is still being put together
// import { LOGIN_USER } from '../utils/mutations';
import { QUERY_ME } from '../utils/queries'

import Auth from '../utils/auth';

// Import icons
import calendarIcon from '../assets/service_icons/calendar_icon.png';
import serviceIcon from '../assets/service_icons/service_icon.png';
import speedometerIcon from '../assets/service_icons/speedometer_icon.png';
import clipboardIcon from '../assets/service_icons/notes_icon.png';
import carServiceIcon from '../assets/service_icons/car_service_icon.png';
import moneyIcon from '../assets/service_icons/money_icon.png';
import ford_mustang from '../assets/ford_mustang.png';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface ServiceReportData {
  date: Date | null;
  type: null | 'Oil Change' | 'Brake Replacement' | 'Tire Rotation' | 'Battery Replacement' | 'Inspection' | 'Other';
  mileage: null | number;
  notes: null | string;
  cost: null | number;
  shopName: string | null;
}

const Dashboard = () => {

  const { loading, error, data } = useQuery(QUERY_ME);

  if (!loading) {
    console.log(data.me.vehicles);
  }

  // We are going to slowly and slowly phase out dummy data for proper data
  // TODO: Modify seeding so that one user *always* gets multiple vehicles for testing purposes

  const navigate = useNavigate();

  // Determines the current vehicle to display in the dashboard
  const [vehicleIndex, setVehicleIndex] = useState<number>(0);
  const [serviceReport, setServiceReport] = useState<ServiceReportData>({
    date: null,
    type: null,
    mileage: null,
    notes: null,
    cost: null,
    shopName: null

  });

  const serviceReportData = [
    {parameter: 'Date of Service', icon: calendarIcon, value: serviceReport.date},
    {parameter: 'Service Type', icon: serviceIcon, value: serviceReport.type},
    {parameter: 'Mileage', icon: speedometerIcon, value: serviceReport.mileage},
    {parameter: 'Notes', icon: clipboardIcon, value: serviceReport.notes},
    {parameter: 'Cost', icon: moneyIcon, value: serviceReport.cost},
    {parameter: 'Shop Name', icon: carServiceIcon, value: serviceReport.shopName}
  ]

  // Whenever the vehicle index is changed, we *also* need to update the most recent service report too!
  useEffect(() => {
    if (loading || error || !data) return;
    const vehicle = data.me.vehicles[vehicleIndex];
    const serviceReports = vehicle.serviceRecords;
    
    const mostRecent = serviceReports.reduce((latest: any, current: any) => {
      const parseDate = (str: string) => {
        const [day, month, year] = str.split('-').map(Number);
        return new Date(year, month - 1, day); // months are 0-based
      };

      return parseDate(current.date) > parseDate(latest.date) ? current : latest;
    });

    console.log(mostRecent);
    setServiceReport(mostRecent);

  }, [vehicleIndex, data, loading, error]);

  // Dummy data for testing purposes
  useEffect(() => {

    // Check if the user is logged in. If they aren't, redirect them to the login page.
    if (!Auth.loggedIn() || Auth.isTokenExpired(Auth.getToken())) {
      console.log('User is not logged in!');
      navigate('/login');
    };

    // Now that we've verified that the user is logged in, let's retrieve information about them...

    setVehicleIndex(0);
  },[]);
  
  const getVehicleName = () => {
    const vehicle = data.me.vehicles[vehicleIndex];
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  function handlePrevVehicle(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    let val = vehicleIndex - 1;
    if (val < 0) {
      val = data.me.vehicles.length - 1;
    }
    setVehicleIndex(val);
  }

  function handleNextVehicle(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    let val = vehicleIndex + 1;
    if (val >= data.me.vehicles.length) {
      val = 0;
    }
    setVehicleIndex(val);
  }

  const deleteVehicle = () => {

  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className='bg-dashboard mx-auto w-7/8 items-center p-6'>
      {/* Displays current vehicles */}
      {/* TODO: Add arrows which let you move between vehicles */}
      <h2 className='font-dashboard'>Dashboard</h2>
      <h3 className='font-dashboard-h3'>My Vehicles</h3>
      <div className="flex justify-center mb-4 gap-2">
      <button className='bg-green-100 text-black p-2 rounded-lg hover:bg-mint-200' onClick={() => navigate('/addvehicle')}>Add Vehicle</button>
      <button className='bg-green-100 text-black p-2 rounded-lg hover:bg-mint-200' onClick={() => navigate('/addvehicle')}>Edit Vehicle</button>
      {/* <button className='bg-green-100 text-black p-2 rounded-lg hover:bg-mint-200' onClick={() => deleteVehicle()}>Delete Vehicle</button>
       */}
      </div>
      <div className="flex items-center justify-center mb-6 gap-10">
      <button
        className="p-2 rounded-full bg-gray-500 hover:bg-gray-300"
        aria-label="Previous Vehicle"
        onClick={handlePrevVehicle} // implement this function
      >
        <FaChevronLeft size={32} />
      </button>
      <img src={ford_mustang} alt="Ford Mustang" className="w-[25vh] " />
      <button
        className="p-2 rounded-full bg-gray-500 hover:bg-gray-300"
        aria-label="Next Vehicle"
        onClick={handleNextVehicle} // implement this function
      >
        <FaChevronRight size={32} />
      </button>
    </div>
      <h3 className='font-dashboard-h3'>{getVehicleName()}</h3>
      
      {/* Displays the most recent service report recorded for the vehicle */}
      <div className='service-report mx-auto w-7/8'>
        <h3 className='font-dashboard-h3'>Most Recent Service Report</h3>
        {/* Grid of service report details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-mint-100 rounded-xl">
          
          {serviceReportData.map(item => (
            <div className='flex flex-col items-center text-center'>
              <h3 className="service-report-text">{item.parameter}</h3>
              <img src={item.icon} style={{height: '15vh'}}></img>
              <p className="text-xl text-black">{item.value instanceof Date ? item.value.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}) : item.value}</p>
            </div>
          ))}
          
        </div>
        
      </div>
      <div className="col-span-full flex justify-center mt-4">
           <button
            className='bg-red-500 text-black p-2 rounded-lg hover:bg-red-200'
            onClick={() => {
            if (window.confirm('Are you sure you wish to delete this vehicle?')) {
             deleteVehicle();
              }
             }}
             >
            Delete Vehicle
            </button>
          </div>
    </div>
  );
};

export default Dashboard;
