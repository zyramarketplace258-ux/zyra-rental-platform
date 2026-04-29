import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../logo/Zyra1.png'; // Updated to match your logo path
import loginBg from '../assets/login-bg.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert("Invalid login details");
    }
  };

return (
  <div style={{
    position: 'fixed', // This is the secret to covering the whole screen
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10000, // Stay on top of everything
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    /* Inside your return's first <div> style object: */
    
  //  backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url('/src/assets/login-bg.jpg')`,
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${loginBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#0f172a' // Dark fallback
  }}>
    <div className="glass-card text-center" style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '400px',
      width: '90%',
      color: 'white'
    }}>
     
      <h2 className="fw-bold mb-2">Welcome</h2>
      <p className="text-white-50 small mb-4">Rental Management</p>


      <form onSubmit={handleLogin}>
        <input 
          type="emailchange" 
          placeholder="Email" 
          className="form-control mb-3" 
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="form-control mb-4" 
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="btn btn-primary w-100 fw-bold py-2">Sign In</button>
      </form>
      <p className="mt-4 small text-white-50">
        New to Zyra? <Link to="/signup" className="text-primary fw-bold text-decoration-none">Create Account</Link>
      </p>
      <p className="mt-4 small text-white-50">
        <Link to="/marketplace" className="text-primary fw-bold text-decoration-none">Browse Items</Link>
      </p>
      

     
    </div>
  </div>
);
};

export default Login;