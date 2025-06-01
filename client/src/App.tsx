import './App.css';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apolloClient';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Error from './pages/Error';
import MaintenancePage from './pages/MaintenancePage';


import LayoutWithHeader from './layouts/LayoutHeader';
import LayoutNoHeader from './layouts/LayoutNoHeader';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
<<<<<<< HEAD
import Addvehicle from './pages/Addvehicle';
import ServiceReport from './pages/Servicereport';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

=======
import AddVehicle from './pages/Addvehicle';
>>>>>>> 6e3c258b508a57c11f3a52fe64bcd14843080dc3

const router = createBrowserRouter([
  {
    // Define routing for pages that *don't* use a header
    path: '/',
    element: <LayoutNoHeader />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: '/login', element: <Login />},
      { path: '/signup', element: <Signup />},
      {path: '/maintenance', element: <MaintenancePage />},
    ]
  },
  {
    // Define routing for pages that *do* use a header
    path: '/',
    element: <LayoutWithHeader />,
    errorElement: <Error />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
<<<<<<< HEAD
      { path: '/addvehicle', element: <Addvehicle /> },
      { path: '/servicereport', element: <ServiceReport /> },
=======
      { path: '/addvehicle', element: <AddVehicle /> },
>>>>>>> 6e3c258b508a57c11f3a52fe64bcd14843080dc3
      // { path: '/maintanence', element: <MaintenancePage />} // Reusing Dashboard for Add Vehicle for now
    ]
  }
]);

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
}
