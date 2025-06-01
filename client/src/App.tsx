import './App.css';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apolloClient';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Error from './pages/Error';
import MaintenancePage from './pages/MaintenancePage';
import ServiceReport from './pages/ServiceReport';

import LayoutWithHeader from './layouts/LayoutHeader';
import LayoutNoHeader from './layouts/LayoutNoHeader';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AddVehicle from './pages/Addvehicle';

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
      { path: '/maintenance', element: <MaintenancePage />},
    ]
  },
  {
    // Define routing for pages that *do* use a header
    path: '/',
    element: <LayoutWithHeader />,
    errorElement: <Error />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/addvehicle', element: <AddVehicle /> },
      { path: '/servicereport', element: <ServiceReport />}
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
