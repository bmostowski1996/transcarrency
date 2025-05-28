import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useMutation } from '@apollo/client';
import { ADD_PROFILE } from '../utils/mutations';

import Auth from '../utils/auth';

// You may need to adjust the import path for your logo
import logo from '../assets/tclogo_simple.png'; // <-- Update this path as needed

const Signup = () => {
  
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [addProfile, { error, data }] = useMutation(ADD_PROFILE);
  const navigate = useNavigate();

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

  const handleGoogleLogin = () => {
    alert('Google login not implemented');
  };

  return (
    <div className= 'home-background' style={{    
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 40,
      position: 'relative',
    }}>
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={{
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
      }}>
        <span style={{ fontSize: 28, marginRight: 6 }}>← Back </span>
      </button>

      {/* Logo and Title */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <img src={logo} alt="TransCCarrency Logo" style={{ width: 550, marginBottom: 4 }} />
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '3em' }}>
          {/* Trans<span style={{ color: '#00e6e6' }}>Carrency</span> */}
        </h1>
      </div>

      {/* Welcome Message */}
      <div style={{
        color: '#fff',
        textAlign: 'center',
        maxWidth: 500,
        marginBottom: 24,
        fontSize: '2em',
        lineHeight: 1.4,
      }}>
        Welcome to TransCarrency! If this is your first time, please enter your email, choose a username, and a password, to continue.
        {/* <br />Alternatively, use your Google account to sign in. */}
      </div>

      {/* Signup Box */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 32,
        width: 360,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '1.2em',
      }}>
        {data ? (
          <p style={{ color: '#fff' }}>
            Success! You may now head <Link to="/">back to the homepage.</Link>
          </p>
        ) : (
          <form onSubmit={handleFormSubmit} style={{ width: '150%' }}>
            <input
              placeholder="Username"
              name="name"
              type="text"
              value={formState.name}
              onChange={handleChange}
              style={inputStyle}
              
            />
            <input
              placeholder="Email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              style={inputStyle}
              
            />
            <input
              placeholder="Password"
              name="password"
              type="password"
              value={formState.password}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 12 }}
            />
            <input
              placeholder="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formState.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* Password Requirements */}
            <ul style={{
              color: '#fff',
              fontSize: '1.3em',
              listStyle: 'none',
              paddingLeft: 0,
              marginBottom: 20,
            }}>
              {passwordChecks.map((check, idx) => (
                <li key={idx} style={{
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: check.valid ? '#00e6e6' : '#fff',
                    border: '2px solid #00e6e6',
                    marginRight: 8,
                  }} />
                  {check.label}
                </li>
              ))}
            </ul>

            <button type="submit" style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              background: '#000',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.8em',
              border: '2px solid #fff',
              cursor: 'pointer',
              marginBottom: 16,
            }}>
              Log In
            </button>
          </form>
        )}

        {error && (
          <div style={{
            backgroundColor: '#d9534f',
            color: 'white',
            padding: '10px 14px',
            borderRadius: 8,
            marginTop: 12,
            fontSize: 14,
          }}>
            {error.message}
          </div>
        )}

        {/* Google Login
        <div style={{ width: '100%', marginTop: 10 }}>
          <div style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>
            Log In With Google
          </div>
          <button onClick={handleGoogleLogin} style={{
            width: '100%',
            background: '#fff',
            color: '#444',
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            fontSize: 18,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              style={{ width: 24, height: 24 }}
            />
            Google Login
          </button>
        </div> */}
      </div>
    </div>
  );
};

// 💅 Input field style
const inputStyle: React.CSSProperties = {
  
  width: '100%',
  padding: '20px 18px',
  marginBottom: 16,
  borderRadius: 10,
  border: 'none',
  fontSize: 24,
  background: '#e0e0e0',
};

export default Signup;