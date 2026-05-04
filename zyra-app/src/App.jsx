import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, query, collection, where } from 'firebase/firestore';

// Import All Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import AddListing from './pages/AddListing';
import VerifyIdentity from './pages/VerifyIdentity';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Chat from './pages/Chat';
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import logo from './logo/Zyra1.png';

// CSS Imports
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'; 

function App() {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasNotification, setHasNotification] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsVerified(data.isVerified || false);
            setIsAdmin(data.role === 'admin');
          }
        });

        const q = query(
          collection(db, "rentals"),
          where("renterId", "==", currentUser.uid),
          where("status", "==", "Approved")
        );
        
        const unsubNotify = onSnapshot(q, (snapshot) => {
          setHasNotification(!snapshot.empty);
        });

        setLoading(false);
        return () => { unsubDoc(); unsubNotify(); };
      } else {
        setIsVerified(false);
        setIsAdmin(false);
        setHasNotification(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error("Logout Error:", error); }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // --- ADDED LOGIC FOR GLOSSY LOOK ---
  // This detects if the user is on the Login or Signup page
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

  return (
    <Router>
      {/* MODULE: CONDITIONAL NAVBAR */}
      {/* We hide the navbar on Auth pages so the background looks seamless */}
      {!isAuthPage && (
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top p-0">
          <div className="container-fluid px-lg-5">
            <Link className="navbar-brand d-flex align-items-center fw-bold fs-3 text-primary m-0 p-0" to="/">
              <img src={logo} alt="Zyra Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#zyraNav">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="zyraNav">
              <div className="navbar-nav ms-auto align-items-center">
                <Link className="nav-link px-3" to="/marketplace">Browse Items</Link>
                
                {user ? (
                  <>
                    <Link className="nav-link px-3" to="/add-listing">List an Item</Link>
                    
                    <div className="nav-item px-2 position-relative d-flex align-items-center">
                      <Link to="/dashboard" className="text-decoration-none">
                         <i className={`bi fs-4 ${hasNotification ? 'bi-bell-fill text-warning bell-ring' : 'bi-bell text-white'}`}></i>
                         {hasNotification && (
                           <span className="position-absolute p-1 bg-danger border border-light rounded-circle notification-dot"></span>
                         )}
                      </Link>
                    </div>

                    <Link className="nav-link px-3" to="/dashboard">My Dashboard</Link>

                    {isAdmin && (
                      <Link className="nav-link px-3 text-warning fw-bold" to="/admin">Admin</Link>
                    )}
                    
                    {!isVerified ? (
                      <Link className="btn btn-outline-primary btn-sm ms-lg-2 px-3" to="/verify">Verify</Link>
                    ) : (
                      <span className="badge bg-success ms-lg-2 px-3 py-2 rounded-pill">✅ Verified</span>
                    )}
                    
                    <button className="btn btn-link nav-link text-danger ms-2" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link className="nav-link px-3" to="/login">Login</Link>
                    <Link className="btn btn-primary ms-lg-3 px-4 rounded-pill" to="/signup">Join Zyra</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* MODULE: ROUTING SYSTEM */}
      <main className="container-fluid p-0" style={{ minHeight: isAuthPage ? '100vh' : '85vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/add-listing" element={user ? <AddListing /> : <Navigate to="/login" />} />
          <Route path="/verify" element={user ? <VerifyIdentity /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
          <Route path="/chat/:chatId" element={user ? <Chat /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      {/* Hide footer on auth pages for a cleaner look */}
      {!isAuthPage && (
        <footer className="bg-white border-top py-4 mt-5 text-center w-100">
          <p className="text-muted small mb-0">© 2026 Zyra Platform. University of Gujrat FYP.</p>
        </footer>
      )}
    </Router>
  );
}

export default App;