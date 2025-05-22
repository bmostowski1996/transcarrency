import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useMutation } from '@apollo/client';
import { ADD_PROFILE } from '../utils/mutations';

import Auth from '../utils/auth';

// You may need to adjust the import path for your logo
// import logo from '../assets/logo.png'; // <-- Update this path as needed

const Signup = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [addProfile, { error, data }] = useMutation(ADD_PROFILE);
  const navigate = useNavigate();

  // Password validation checks
  const password = formState.password;
  const passwordChecks = [
    { label: 'Minimum 6 characters', valid: password.length >= 6 },
    { label: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: 'One number', valid: /\d/.test(password) },
    { label: 'One upper case and one lower case letter', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  ];

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
      const { data } = await addProfile({
        variables: { input: { ...formState } },
      });
      Auth.login(data.addProfile.token);
    } catch (e) {
      console.error(e);
    }
  };

  // Placeholder for Google login
  const handleGoogleLogin = () => {
    // Implement Google login logic here
    alert('Google login not implemented');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #0f2027, #2c5364 80%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '40px 0',
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 28, marginRight: 6 }}>←</span> Back
      </button>

      {/* Logo and App Name */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={logo} alt="TransCARrency Logo" style={{ width: 120, marginBottom: 8 }} />
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 32, margin: 0 }}>
          Trans<span style={{ color: '#00e6e6' }}>Car</span>rency
        </h1>
      </div>

      {/* Welcome Message */}
      <div style={{ color: '#fff', textAlign: 'center', maxWidth: 500, marginBottom: 24, fontSize: 20 }}>
        Welcome to TransCARrency! If this is your first time, please enter your email, choose a username, and a password, to continue.<br />
        Alternatively, use your Google account to sign in.
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 16,
        padding: 32,
        width: 350,
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {data ? (
          <p style={{ color: '#fff' }}>
            Success! You may now head <Link to="/">back to the homepage.</Link>
          </p>
        ) : (
          <form onSubmit={handleFormSubmit} style={{ width: '100%' }}>
            <input
              className="form-input"
              placeholder="Username"
              name="name"
              type="text"
              value={formState.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: 16,
                borderRadius: 10,
                border: 'none',
                fontSize: 18,
                background: '#eaeaea',
              }}
            />
            <input
              className="form-input"
              placeholder="Email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: 16,
                borderRadius: 10,
                border: 'none',
                fontSize: 18,
                background: '#eaeaea',
              }}
            />
            <input
              className="form-input"
              placeholder="Password"
              name="password"
              type="password"
              value={formState.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: 12,
                borderRadius: 10,
                border: 'none',
                fontSize: 18,
                background: '#eaeaea',
              }}
            />
            {/* Password requirements */}
            <ul style={{ color: '#fff', fontSize: 14, marginBottom: 20, listStyle: 'none', paddingLeft: 0 }}>
              {passwordChecks.map((check, idx) => (
                <li key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: check.valid ? '#00e6e6' : '#fff',
                      border: '2px solid #00e6e6',
                      marginRight: 8,
                    }}
                  ></span>
                  {check.label}
                </li>
              ))}
            </ul>
            <button
              className="btn btn-block btn-info"
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 8,
                background: '#000',
                color: '#fff',
                fontWeight: 700,
                fontSize: 22,
                border: '2px solid #fff',
                marginBottom: 18,
                cursor: 'pointer',
              }}
              type="submit"
            >
              Log In
            </button>
          </form>
        )}

        {error && (
          <div className="my-3 p-3 bg-danger text-white" style={{ borderRadius: 8 }}>
            {error.message}
          </div>
        )}

        {/* Google Login Section */}
        <div style={{ width: '100%', marginTop: 10 }}>
          <div style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Log In With Google</div>
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              background: '#fff',
              color: '#444',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontSize: 20,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: 0,
              cursor: 'pointer',
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              style={{ width: 28, height: 28, marginRight: 8 }}
            />
            Google Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;