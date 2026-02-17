import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4 card shadow p-4">
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" className="form-control mb-3" required onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="form-control mb-3" required onChange={(e) => setPassword(e.target.value)} />
            <button className="btn btn-success w-100">Login</button>
          </form>
          <p className="mt-3 text-center">New to Zyra? <Link to="/signup">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;