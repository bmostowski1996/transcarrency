import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Error from './pages/Error';

import LayoutWithHeader from './layouts/LayoutHeader';
import LayoutNoHeader from './layouts/LayoutNoHeader';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const httpLink = createHttpLink({
  uri: '/graphql',
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutNoHeader />, // Home route uses no-header layout
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: '/login', element: <Login />},
      { path: '/login', element: <Signup />}
    ]
  },
  {
    path: '/',
    element: <LayoutWithHeader />, // All other pages get the header
    errorElement: <Error />,
    children: [
      { path: 'dashboard', element: <Dashboard /> }
    ]
  }
]);

const client = new ApolloClient({
  // Set up our client to execute the `authLink` middleware prior to making the request to our GraphQL API
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
}
