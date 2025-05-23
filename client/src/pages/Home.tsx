import React from 'react';
import { useNavigate } from 'react-router-dom';
import tclogo from '../assets/tclogo_transparent.png';

const Home = () => {

  const navigate = useNavigate();

  const handleLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
    // your logic here
    event.preventDefault();
    navigate('/login');
  };

  const handleSignup = (event: React.MouseEvent<HTMLButtonElement>) => {
    // your logic here
    event.preventDefault();
    navigate('/signup');
  };

  return (
    <main className="home-background" style={{ textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <img src={tclogo} alt="TransCARrency Logo" style={{ width: '50vh' }} />
      <h1 style={{ fontSize: '3rem', color: '#fff', margin: 0 }}>
        Welcome!
      </h1>
      <button
        className="login-btn"
        style={{
          marginTop: 40,
          marginBottom: 20,
          fontSize: '2rem',
          padding: '0.5em 2em',
          borderRadius: 12,
          border: 'none',
          background: '#000',
          color: '#fff',
          fontWeight: 'bold',
          boxShadow: '0 0 0 4px #fff, 0 4px 24px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }}
        onClick={handleLogin}
      >
        Login
      </button>
      
      <h1 style={{ fontSize: '3rem', color: '#fff', margin: 0 }}>
        Or
      </h1>

      <button
        className="login-btn"
        style={{
          marginTop: 40,
          fontSize: '2rem',
          padding: '0.5em 2em',
          borderRadius: 12,
          border: 'none',
          background: '#000',
          color: '#fff',
          fontWeight: 'bold',
          boxShadow: '0 0 0 4px #fff, 0 4px 24px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }}
        onClick={handleSignup}
      >
        Sign-Up
      </button>
    </main>
  );
};

export default Home;