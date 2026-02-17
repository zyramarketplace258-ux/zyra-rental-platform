import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

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

      // Update Firebase Profile Name
      await updateProfile(user, { displayName: name });

      // Create User entry in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        isVerified: false,
        createdAt: new Date()
      });

      alert("Account Created!");
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4 card shadow p-4">
          <h2 className="text-center mb-4">Join Zyra</h2>
          <form onSubmit={handleSignup}>
            <input type="text" placeholder="Full Name" className="form-control mb-3" required onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" className="form-control mb-3" required onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="form-control mb-3" required onChange={(e) => setPassword(e.target.value)} />
            <button className="btn btn-primary w-100">Sign Up</button>
          </form>
          <p className="mt-3 text-center">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;