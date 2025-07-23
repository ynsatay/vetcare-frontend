import React from 'react';
import { Link } from 'react-router-dom';
import MenuLogo from '../assets/images/logos/vc2.png';

const Logo = ({ size = '50px' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <Link 
        to="/" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontFamily: "'Poppins', sans-serif", 
          fontWeight: 600, 
          fontSize: '1.5rem', 
          color: '#59018b', 
          textDecoration: 'none', 
          gap: '5px'
        }}
      >
        <img src={MenuLogo} alt="Logo" style={{ height: size }} />
        <span>VetCare</span>
      </Link>
    </div>
  );
};

export default Logo;
