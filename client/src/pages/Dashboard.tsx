import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';

// Placeholder code while the login screen is still being put together
import { DELETE_VEHICLE, REMOVE_SERVICE_RECORD } from '../utils/mutations';
import { QUERY_ME } from '../utils/queries'

import Auth from '../utils/auth';

// Import icons
import calendarIcon from '../assets/icons-two/calendar_icon.png';
import serviceIcon from '../assets/icons-two/service_icon.png';
import speedometerIcon from '../assets/icons-two/speedometer_icon.png';
import clipboardIcon from '../assets/icons-two/notes_icon.png';
import carServiceIcon from '../assets/icons-two/car_service_icon.png';
import moneyIcon from '../assets/icons-two/money_icon.png';
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

  const [deleteVehicle] = useMutation(DELETE_VEHICLE);
  const [removeServiceReport] = useMutation(REMOVE_SERVICE_RECORD);
  const { loading, error, data } = useQuery(QUERY_ME);

  if (!loading) {
    console.log(data.me.vehicles);
  }

  // We are going to slowly and slowly phase out dummy data for proper data
  // TODO: Modify seeding so that one user *always* gets multiple vehicles for testing purposes

  const navigate = useNavigate();

  // Determines the current vehicle to display in the dashboard
  const [vehicleIndex, setVehicleIndex] = useState<number>(0);
  
  // Determine the current service report to display in the dashboard
  const [serviceReportIndex, setServiceReportIndex] = useState<number>(0);

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
  ];

  function formatDate(date: Date): string {
    console.log(`Formatting date: ${date}`);
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    console.log(`Formatted date: ${yyyy}-${mm}-${dd}`);
    return `${yyyy}-${mm}-${dd}`;
  }

  // Whenever the vehicle index is changed, we *also* need to update the most recent service report too!
  useEffect(() => {
    if (loading || error || !data) return;

    try {

      const vehicle = data.me.vehicles[vehicleIndex];
      const serviceReports = vehicle.serviceRecords;

      setServiceReport(serviceReports[serviceReportIndex]);
      console.log(`Set Service Report: ${JSON.stringify(serviceReports[serviceReportIndex])}`);

    } catch {

      setServiceReport({
        date: null,
        type: null,
        mileage: null,
        notes: null,
        cost: null,
        shopName: null
      })
    };
    

  }, [serviceReportIndex, loading, error]);

  // For when we first log in...
  useEffect(() => {

    // Check if the user is logged in. If they aren't, redirect them to the login page.
    if (!Auth.loggedIn() || Auth.isTokenExpired(Auth.getToken())) {
      console.log('User is not logged in!');
      navigate('/login');
    };

    setVehicleIndex(0);
    setServiceReportIndex(0);

  },[]);
  
  const getVehicleName = () => {
    if (data.me.vehicles.length > 0) {
      const vehicle = data.me.vehicles[vehicleIndex];
      return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    } else {
      return ' '
    }
  };

  // For buttons handling previous and next vehicles
  function handlePrevVehicle(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    let val = vehicleIndex - 1;
    if (val < 0) {
      val = data.me.vehicles.length - 1;
    }
    setVehicleIndex(val);
    setServiceReportIndex(0); // Reset service report index when changing vehicle
  }

  function handleNextVehicle(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    let val = vehicleIndex + 1;
    if (val >= data.me.vehicles.length) {
      val = 0;
    }
    setVehicleIndex(val);
    setServiceReportIndex(0); // Reset service report index when changing vehicle
  }

  // For buttons handling previous and next service reports
  function handlePrevServiceReport(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    let val = serviceReportIndex - 1;
    if (val < 0) {
      val = data.me.vehicles[vehicleIndex].serviceRecords.length - 1;
    }
    setServiceReportIndex(val);
  }

  function handleNextServiceReport(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    let val = serviceReportIndex + 1;
    if (val >= data.me.vehicles[vehicleIndex].serviceRecords.length) {
      val = 0;
    }
    setServiceReportIndex(val);  
  }

  const handleDeleteServiceReport = async (): Promise<void> => {
    if (loading || error || !data) return;

    try {
      const vehicle = data.me.vehicles[vehicleIndex];

      console.log(`Deleting service report for vehicle: ${vehicle._id}`);
      console.log(`Service record ID: ${data.me.vehicles[vehicleIndex].serviceRecords[serviceReportIndex]._id}`);

      if (!vehicle) {
        console.error('Error: handleDeleteServiceReport: Vehicle not found');
        return;
      };

      await removeServiceReport({
        variables: {
          vehicleId: data.me.vehicles[vehicleIndex]._id,
          recordId: data.me.vehicles[vehicleIndex].serviceRecords[serviceReportIndex]._id
        },
        refetchQueries: [{ query: QUERY_ME }]
      });
      setServiceReportIndex(0);
    } catch (err) {
      console.error('Error deleting service report:', err);
    };

  }

  const handleDeleteVehicle = async () => {
    // Here, we need to call a mutation and update the server
    await deleteVehicle({
      variables: {vehicleId: data.me.vehicles[vehicleIndex]._id},
      refetchQueries: [{ query: QUERY_ME }],
    });
    if (vehicleIndex > 0) {
      setVehicleIndex(vehicleIndex - 1);
    } else {
      setVehicleIndex(0);
    }
  };
  
  const vehicleSelect = () => {
    if (loading || error || !data) return;

    return (data.me.vehicles && data.me.vehicles.length > 0) ? (<div className="flex items-center justify-center mb-6 gap-10">
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
    </div>) : (<p className='font-dashboard'>No vehicles found. Please add a vehicle.</p>);
  };
  
  const showServiceReport = () => {
    if (loading || error || !data) return;

    if(!data.me.vehicles || 
      !data.me.vehicles[vehicleIndex] || 
      !data.me.vehicles[vehicleIndex].serviceRecords || 
      data.me.vehicles[vehicleIndex].serviceRecords.length < 1) {
      
      return (<div className='service-report mx-auto w-7/8'>
        <h4 className="text-black text-center"> No service reports to display</h4>
        </div>);
    }

    const displayValue = (item: any) => {
      const date = item.value;

      if (!date) return;

      if (item.parameter === 'Date of Service') {
        const parsedDate = typeof date === 'string' && /^\d+$/.test(date)
        ? new Date(Number(date))
        : new Date(date);
        return formatDate(parsedDate);
      } else {
        return date;
      }
    }
    
    // For now, just try to place the buttons in there...
    // We'll modify their locations later.
    return (
      <div className='service-report mx-auto w-7/8'>
        <h3 className='font-dashboard-h3'>Most Recent Service Report</h3>
        {/* Grid of service report details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-mint-100 rounded-xl">
          
          {serviceReportData.map(item => (
            <div className='flex flex-col items-center text-center' key={item.parameter}>
              <h3 className="service-report-text">{item.parameter}</h3>
              <img src={item.icon} style={{height: '15vh'}}></img>
              <p className="text-xl text-black">{displayValue(item)}</p>
            </div>
          ))}
          
        </div>
        
        {/* Buttons to navigate between service reports */}
        <div className='flex justify-center p-6 gap-4'>
          <button className='bg-black text-white p-2 rounded-lg hover:bg-gray-500' onClick={handlePrevServiceReport}>
            Previous Service Report
          </button>
          <button className='bg-black text-white p-2 rounded-lg hover:bg-gray-500' onClick={handleNextServiceReport}>
            Next Service Report
          </button>
        </div>
        
        {/* Buttons to add or delete service reports */}
        <div className='flex justify-center p-6 gap-4'>
          <button className='bg-black text-white p-2 rounded-lg hover:bg-gray-500' onClick={() => navigate('/servicereport')}>
            Add New Service Report
          </button>
          <button className='bg-red-500 text-white p-2 rounded-lg hover:bg-red-200' onClick={() => {
            if (window.confirm('Are you sure you wish to delete this service report?')) {
              handleDeleteServiceReport();
            }
             }}>
            Delete Service Report
          </button>
        </div>
      </div>);
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
      
      {vehicleSelect()}
      
      <h3 className='font-dashboard-h3'>{getVehicleName()}</h3>
      
      {/* Displays the most recent service report recorded for the vehicle */}
      {showServiceReport()}

      <div className="col-span-full flex justify-center mt-4">
           <button
            className='bg-red-500 text-black p-2 rounded-lg hover:bg-red-200'
            onClick={() => {
            if (window.confirm('Are you sure you wish to delete this vehicle?')) {
             handleDeleteVehicle();
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
