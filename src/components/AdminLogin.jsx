// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Failed to log in.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Try again later.';
      } else {
        msg = err.message.replace('Firebase: ', '');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Portal Login</h2>
        <p className="admin-warning">⚠️ Administrator Access Only</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@nordicriser.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-admin"
          >
            {loading ? 'Authenticating...' : 'Login as Admin'}
          </button>
        </form>
        
        <div className="admin-login-note">
          <p>Member access? <a href="https://portal.nordicriser.com">Go to Member Portal</a></p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;