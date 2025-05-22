import React, { useState } from 'react';

const Home = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <main className="home-background">
      <div className="role-card">
        <h2 className="role-title">Please Select A Role:</h2>
        <div className="role-options">
          <div
            className={`role-option${selectedRole === 'owner' ? ' selected' : ''}`}
            onClick={() => setSelectedRole('owner')}
          >
            <img src="/car-icon.svg" alt="Vehicle Owner" className="role-icon" />
            <div>Vehicle Owner</div>
          </div>
          <div
            className={`role-option${selectedRole === 'shop' ? ' selected' : ''}`}
            onClick={() => setSelectedRole('shop')}
          >
            <img src="/shop-icon.svg" alt="Repair Shop" className="role-icon" />
            <div>Repair Shop</div>
          </div>
        </div>
        <button className="proceed-btn" disabled={!selectedRole}>
          Proceed
        </button>
      </div>
    </main>
  );
};

export default Home;