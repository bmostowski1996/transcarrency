import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutations';
import Auth from '../utils/auth';
import tclogo from '../assets/tclogo_transparent.png';
import gicon from '../assets/gi-transparent.png'; // Adjust the path as necessary

// const Login = () => {
//   const [formState, setFormState] = useState({ email: '', password: '' });
//   const [login, { error, data }] = useMutation(LOGIN_USER);
//   const navigate = useNavigate();

//   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = event.target;
//     setFormState({
//       ...formState,
//       [name]: value,
//     });
//   };

//   const handleFormSubmit = async (event: FormEvent) => {
//     event.preventDefault();
//     try {
//       const { data } = await login({
//         variables: { ...formState },
//       });
//       Auth.login(data.login.token);
//     } catch (e) {
//       console.error(e);
//     }
//     setFormState({
//       email: '',
//       password: '',
//     });
//   };

//   return (
//     <div className="login-background">
//       <button className="back-btn" onClick={() => navigate(-1)}>
//         <span style={{ fontSize: '2rem', marginRight: '8px' }}>←</span> Back
//       </button>
//       <img src={tclogo} alt="TransCARrency Logo" className="logo" style={{ textAlign: 'center', minHeight: '30vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} /> 
//       <h2 className="login-title">
//         Welcome to TransCARrency! Please enter your username or email to login.
//       </h2>
//       {data ? (
//         <div className="login-success">
//           Success! You may now head <Link to="/">back to the homepage.</Link>
//         </div>
//       ) : (
//         <form className="login-form" onSubmit={handleFormSubmit}>
//           <input
//             className="login-input"
//             placeholder="Username or email"
//             name="email"
//             type="text"
//             value={formState.email}
//             onChange={handleChange}
//             autoComplete="username"
//           />
//           <input
//             className="login-input"
//             placeholder="Password"
//             name="password"
//             type="password"
//             value={formState.password}
//             onChange={handleChange}
//             autoComplete="current-password"
//           />
//           <button className="login-btn" type="submit" style={{ marginTop: '20px', boxShadow: '0 0 0 4px #fff, 0 4px 24px rgba(0,0,0,0.2)', background: '#000', color: '#fff', fontWeight: 'bold', padding: '0.5em 2em', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
//             Log In
            
//           </button>
//         </form>
//       )}
//       {error && (
//         <div className="login-error">
//           {error.message}
//         </div>
//       )}
//       <div className="login-google-label">Log In With Google</div>
//       <button className="google-btn" type="button">
//         <img src={gicon} alt="Google" className="google-icon" /> Google Login
//       </button>
//     </div>
//   );
// };

// export default Login;

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { error, data }] = useMutation(LOGIN_USER);
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await login({
        variables: { ...formState },
      });
      Auth.login(data.login.token);
    } catch (e) {
      console.error(e);
    }
    setFormState({
      email: '',
      password: '',
    });
  };

  return (
    <div
      className="login-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #00bcd4, #000)',
        padding: '1em',
        color: '#fff',
        textAlign: 'center',
      }}
    >
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '2rem', marginRight: '8px' }}>←</span> Back
      </button>

      <img
        src={tclogo}
        alt="TransCARrency Logo"
        className="logo"
        style={{ width: '50vh', marginBottom: '1rem'}}
      />

      <h2 className="login-title" style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
        Welcome to TransCARrency! Please enter your username or email to login.
      </h2>

      {data ? (
        <div className="login-success" style={{ color: '#0f0' }}>
          Success! You may now head <Link to="/">back to the homepage.</Link>
        </div>
      ) : (
        <form
          className="login-form"
          onSubmit={handleFormSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '600px',
            gap: '1em',
          }}
        >
          <input
            className="login-input"
            placeholder="Username or email"
            name="email"
            type="text"
            value={formState.email}
            onChange={handleChange}
            autoComplete="username"
            style={{
              width: '100%',
              padding: '0.75em',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1em',
            }}
          />
          <input
            className="login-input"
            placeholder="Password"
            name="password"
            type="password"
            value={formState.password}
            onChange={handleChange}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '0.75em',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1em',
            }}
          />
          <button
            className="login-btn"
            type="submit"
            style={{
              marginTop: '1em',
              boxShadow: '0 0 0 4px #fff, 0 4px 24px rgba(0,0,0,0.2)',
              background: '#000',
              color: '#fff',
              fontWeight: 'bold',
              padding: '0.5em 2em',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Log In
          </button>
        </form>
      )}

      {error && (
        <div className="login-error" style={{ color: 'red', marginTop: '1em' }}>
          {error.message}
        </div>
      )}

      <div className="login-google-label" style={{ marginTop: '2em', fontWeight: 'bold' }}>
        Log In With Google
      </div>

      <button
        className="google-btn"
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          color: '#000',
          padding: '0.75em 1.5em',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          marginTop: '0.5em',
          fontSize: '1em',
        }}
      >
        <img
          src={gicon}
          alt="Google"
          className="google-icon"
          style={{ width: '24px', height: '24px', marginRight: '8px' }}
        />{' '}
        Google Login
      </button>

      <footer style={{ marginTop: '2rem', fontSize: '0.9em' }}>
        © 2025 - TransCARrency
      </footer>
    </div>
  );
};

export default Login;