import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase'; // Import Firebase
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [hasNotification, setHasNotification] = useState(false);
  const [activeRentalId, setActiveRentalId] = useState(null);

  // REAL-TIME NOTIFICATION LISTENER
  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for 'Approved' rentals for the current user
    const q = query(
      collection(db, "rentals"),
      where("renterId", "==", auth.currentUser.uid),
      where("status", "==", "Approved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setHasNotification(true);
        setActiveRentalId(snapshot.docs[0].id); // Get ID of the approved rental
      } else {
        setHasNotification(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container-fluid px-0">
      
      {/* 1. TOP ALERT BAR (Only shows when approved) */}
      {hasNotification && (
        <div className="bg-primary text-white py-2 px-3 shadow-sm border-bottom border-white border-opacity-25 animate__animated animate__slideInDown">
          <div className="container d-flex justify-content-between align-items-center">
            <small className="fw-bold">
              <i className="bi bi-bell-fill me-2"></i> 
              Your rental request was approved! Start negotiating now.
            </small>
            <button 
              onClick={() => navigate(`/chat/${activeRentalId}`)} 
              className="btn btn-light btn-sm rounded-pill px-3 fw-bold shadow-sm"
              style={{ fontSize: '12px' }}
            >
              Open Chat
            </button>
          </div>
        </div>
      )}

      {/* 2. SIMPLE HEADER (Where the Red Dot lives) */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent position-absolute w-100 z-index-2 pt-4">
        <div className="container">
          <a className="navbar-brand fw-bold fs-3" href="/">ZYRA</a>
          <div className="d-flex gap-3">
            <button onClick={() => navigate('/marketplace')} className="btn btn-link text-white text-decoration-none">Marketplace</button>
            
            {/* DASHBOARD BUTTON WITH RED DOT */}
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-outline-light rounded-pill px-4 position-relative"
            >
              Dashboard
              {hasNotification && (
                <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle shadow-sm">
                  <span className="visually-hidden">New Approval</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Premium Hero Section */}
      <div className="position-relative overflow-hidden" style={{ 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1500&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container position-relative z-index-1 mt-5">
          <div className="row justify-content-center text-center text-white">
            <div className="col-lg-8">
              <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 shadow-sm">
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
                  className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg"
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

      {/* ... rest of your How It Works and Features sections ... */}

    </div>
  );
};

export default Home;