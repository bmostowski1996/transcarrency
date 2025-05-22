import React from 'react';

const Home = () => {
  return (
    <main className="home-background" style={{ textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <img src="/tclogo.png" alt="TransCARrency Logo" style={{ width: 300, marginBottom: 24 }} />
      <h1 style={{ fontSize: '3rem', color: '#fff', margin: 0 }}>
        Welcome!
      </h1>
      <button
        className="get-started-btn"
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
      >
        Get Started
      </button>
    </main>
  );
};

export default Home;