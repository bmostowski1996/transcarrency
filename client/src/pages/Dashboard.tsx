 import { useState, useEffect } from 'react';
// import { useQuery } from '@apollo/client';

// import SkillsList from '../components/SkillsList';
// import SkillForm from '../components/SkillForm';

// import { QUERY_SINGLE_PROFILE, QUERY_ME } from '../utils/queries';

// import Auth from '../utils/auth';

// TODO: This page is intended for logged in users. We should redirect the user to the login page if they try to access
// this page without being logged in

import ford_mustang from '../assets/ford_mustang.png';

interface ServiceReportData {
  serviceDate: Date;
  serviceType: 'Oil Change' | 'Brake Replacement' | 'Tire Rotation' | 'Battery Replacement' | 'Inspection' | 'Other';
  mileage: number;
  notes: string[];
  cost: number;
  shopName: string | null;
}

const Dashboard = () => {

  const [serviceReport, setServiceReport] = useState<ServiceReportData>({});

  // Dummy data for testing purposes
  useEffect(() => {
    // TODO: Check if the user is logged in. If they aren't, redirect them to the login page.
    // We should probably review past lessons on authentication with graphQL...

    setServiceReport({
      serviceDate: new Date(`2025-05-26`),
      mileage: 50000,
      serviceType: 'Oil Change',
      notes: [
        'Car owner drinks way too much Pepsi'
      ],
      cost: 115,
      shopName: null
    });
  },[]);


  return (
    <div className='bg-dashboard mx-auto w-7/8 items-center'>
      {/* Displays current vehicles */}
      {/* TODO: Add arrows which let you move between vehicles */}
      <h2 className='font-dashboard'>Dashboard</h2>
      <h3 className='font-dashboard-h3'>My Vehicles</h3>
      <img src={ford_mustang} alt="Ford Mustang" className="w-[25vh] mx-auto" />
      <h3 className='font-dashboard-h3'>1971 Ford Mustang</h3>
      
      {/* Displays the most recent service report recorded for the vehicle */}
      <div className='service-report mx-auto w-7/8'>
        <h3 className='font-dashboard-h3'>Most Recent Service Report</h3>
        {/* Grid of service report details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-mint-100 rounded-xl">
          <h3 className='font-dashboard-h3'>Service Date: {String(serviceReport.serviceDate)}</h3>
          <h3 className='font-dashboard-h3'>Service Type: {serviceReport.serviceType}</h3>
          <h3 className='font-dashboard-h3'>Service Cost: {serviceReport.cost}</h3>
          <h3 className='font-dashboard-h3'>Repair Shop: {serviceReport.shopName || 'None'}</h3>
          <h3 className='font-dashboard-h3'>Car Mileage: {serviceReport.mileage}</h3>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
