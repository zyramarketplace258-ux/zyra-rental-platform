import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

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
import 'bootstrap-icons/font/bootstrap-icons.css';



function App() {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loading, setLoading] = useState(true);

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
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setIsVerified(false);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Zyra...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top p-0"> {/* Added p-0 here */}
<div className="container-fluid px-lg-5">
<Link
className="navbar-brand d-flex align-items-center fw-bold fs-3 text-primary m-0 p-0"
to="/"
style={{ lineHeight: '0' }} // Prevents text-based spacing
>
<img
src={logo}
alt="Zyra Logo"
style={{
height: '80px', // Increase this to make the logo fill the whole bar height
width: '60px',
objectFit: 'contain',
margin: '0', // Forced zero margin
padding: '0', // Forced zero padding
display: 'block'
}}
/>
<span className="ms-2"></span>
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
                  <Link className="nav-link px-3" to="/dashboard">My Dashboard</Link>
                  
                  {isAdmin && (
                    <Link className="nav-link px-3 text-warning fw-bold" to="/admin">Admin Panel</Link>
                  )}
                  
                  {!isVerified ? (
                    <Link className="btn btn-outline-primary btn-sm ms-lg-3 px-3" to="/verify">Verify CNIC</Link>
                  ) : (
                    <span className="badge bg-success ms-lg-3 px-3 py-2 rounded-pill shadow-sm">✅ Verified</span>
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

      <main style={{ minHeight: '85vh' }}>
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

      <footer className="bg-white border-top py-4 mt-5 text-center">
        <p className="text-muted small mb-0">© 2026 Zyra Platform. University of Gujrat FYP.</p>
      </footer>
    </Router>
  );
}

export default App;