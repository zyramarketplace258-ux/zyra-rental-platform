import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../logo/Zyra1.png'; // Ensure path is correct
import loginBg from '../assets/login-bg.jpg';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        isVerified: false,
        createdAt: new Date()
      });

      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      // Change 'my-bg.jpg' to match your chosen image filename
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#0f172a'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '40px',
        width: '90%',
        maxWidth: '420px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
       
        <h2 style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '25px' }}>
          Join the Zyra premium rental community
        </p>

        <form onSubmit={handleSignup}>
          <input 
            type="text" 
            placeholder="Full Name" 
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            required 
            onChange={(e) => setName(e.target.value)} 
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            required 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password (min 6 chars)" 
            style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            required 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button style={{ 
            width: '100%', 
            padding: '14px', 
            backgroundColor: '#0d6efd', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            transition: '0.3s'
          }}>
            Create My Account
          </button>
        </form>

        <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
        </p>
         <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
         <Link to="/marketplace" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>Browse Items</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;