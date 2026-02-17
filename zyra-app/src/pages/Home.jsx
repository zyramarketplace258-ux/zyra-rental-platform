import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid px-0">
      {/* Hero Section */}
      <div className="bg-dark text-white py-5 mb-5" style={{ 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?auto=format&fit=crop&w=1350&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container text-center">
          <h1 className="display-3 fw-bold mb-3">Rent Anything, Anywhere</h1>
          <p className="lead mb-4">Pakistan's first secure peer-to-peer rental marketplace for machinery, tools, and equipment.</p>
          <div className="d-flex justify-content-center gap-3">
            <button onClick={() => navigate('/Marketplace')} className="btn btn-primary btn-lg px-5 py-3 fw-bold">Browse Marketplace</button>
            <button onClick={() => navigate('/signup')} className="btn btn-outline-light btn-lg px-5 py-3 fw-bold">Start Earning</button>
          </div>
        </div>
      </div>

      {/* Why Choose Zyra Section */}
      <div className="container py-5">
        <h2 className="text-center fw-bold mb-5">Why Zyra?</h2>
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="p-4 shadow-sm rounded-4 bg-white h-100">
              <div className="fs-1 mb-3">🛡️</div>
              <h4>Verified Users</h4>
              <p className="text-muted">CNIC-based verification ensures you only deal with real people.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 shadow-sm rounded-4 bg-white h-100">
              <div className="fs-1 mb-3">💰</div>
              <h4>Cost Effective</h4>
              <p className="text-muted">Rent high-end machinery for a fraction of the purchase price.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 shadow-sm rounded-4 bg-white h-100">
              <div className="fs-1 mb-3">🤝</div>
              <h4>Community Trust</h4>
              <p className="text-muted">Transparent rating system for both owners and renters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;