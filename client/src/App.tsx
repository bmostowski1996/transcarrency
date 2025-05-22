import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

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

const client = new ApolloClient({
  // Set up our client to execute the `authLink` middleware prior to making the request to our GraphQL API
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="flex-column justify-flex-start min-100-vh">
        <Header />
        <div className="container">
          <Outlet />
        </div>
        <Footer />
      </div>
    </ApolloProvider>
  );
}

// function Login() {
//   return (
//     <div className="login-background">
//       <button className="back-btn">← Back</button>
//       <img src="/logo.png" alt="TransCARrency Logo" className="logo" />
//       <h2>Welcome to TransCARrency! Please enter your username or email to login.</h2>
//       <input type="text" placeholder="Username or email" />
//       <input type="password" placeholder="Password" />
//       <button className="login-btn">Log In</button>
//       <div>Log In With Google</div>
//       <button className="google-btn">
//         <img src="/google-icon.svg" alt="Google" /> Google Login
//       </button>
//     </div>
//   );
// }

export default App;
// export { Login };
