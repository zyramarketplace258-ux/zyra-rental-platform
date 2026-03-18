import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid px-0">
      {/* Premium Hero Section */}
      <div className="position-relative overflow-hidden" style={{ 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1500&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container position-relative z-index-1">
          <div className="row justify-content-center text-center text-white">
            <div className="col-lg-8">
              <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 shadow-sm animate__animated animate__fadeInDown">
                🚀 Pakistan's #1 P2P Rental Platform
              </span>
              <h1 className="display-2 fw-bold mb-4" style={{ letterSpacing: '-1px' }}>
                Rent Smart. <span className="text-primary">Earn Easy.</span>
              </h1>
              <p className="lead fs-4 mb-5 opacity-90 fw-light">
                Unlock the value of your machinery or get the tools you need without the heavy price tag. Secure, verified, and community-driven.
              </p>
              <div className="d-flex justify-content-center flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/marketplace')} 
                  className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg transform-hover"
                >
                  Browse Machinery
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="btn btn-glass btn-lg px-5 py-3 rounded-pill fw-bold shadow-sm"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white'
                  }}
                >
                  List Your Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Essential for FYP */}
      <div className="container py-5 mt-5">
        <div className="text-center mb-5">
          <h6 className="text-primary fw-bold text-uppercase ls-2">Process</h6>
          <h2 className="display-5 fw-bold">Simple 3-Step Rental</h2>
        </div>
        <div className="row g-4 justify-content-center">
          {[
            { step: '01', title: 'Search', text: 'Find the machine you need in our verified marketplace.', icon: 'bi-search' },
            { step: '02', title: 'Verify & Chat', text: 'Complete CNIC verification and chat directly with the owner.', icon: 'bi-chat-dots' },
            { step: '03', title: 'Rent & Return', text: 'Secure payment and hassle-free returns on your terms.', icon: 'bi-check-circle' }
          ].map((item, idx) => (
            <div key={idx} className="col-md-4">
              <div className="card border-0 text-center p-4 h-100">
                <div className="display-4 text-light mb-0 fw-bold position-absolute top-0 start-50 translate-middle-x opacity-25">{item.step}</div>
                <div className="card-body pt-5">
                  <h4 className="fw-bold mb-3">{item.title}</h4>
                  <p className="text-muted">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-light py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="display-6 fw-bold mb-4 text-dark">Built for <span className="text-primary">Reliability</span></h2>
              <div className="d-flex align-items-start mb-4">
                <div className="bg-white p-3 rounded-circle shadow-sm me-3 text-primary"><i className="bi bi-shield-check fs-4"></i></div>
                <div>
                  <h5 className="fw-bold">Identity Verification</h5>
                  <p className="text-muted">Every user is vetted via CNIC to prevent fraud and ensure accountability.</p>
                </div>
              </div>
              <div className="d-flex align-items-start mb-4">
                <div className="bg-white p-3 rounded-circle shadow-sm me-3 text-success"><i className="bi bi-cash-stack fs-4"></i></div>
                <div>
                  <h5 className="fw-bold">No Hidden Fees</h5>
                  <p className="text-muted">Transparent pricing set by the owners. No middleman markups.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 bg-white rounded-5 shadow-lg border-start border-primary border-5">
                <h4 className="fw-bold mb-3">Ready to start?</h4>
                <p>Join thousands of users in Gujrat and across Pakistan who are transforming how equipment is shared.</p>
                <button onClick={() => navigate('/signup')} className="btn btn-primary w-100 py-3 rounded-pill fw-bold mt-2">Create Free Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;