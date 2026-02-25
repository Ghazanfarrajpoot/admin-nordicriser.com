// src/components/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [userRole, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login(email, password);
      
      if (result.success) {
        // Check if user is admin (based on email)
        if (!email.includes('admin') && !email.includes('@nordicriser.com')) {
          // Not an admin email - log them out
          const { logout } = useAuth();
          await logout();
          setError('Administrator access only. Please use admin credentials.');
          return;
        }
        
        navigate('/admin/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to log in');
    }
    
    setLoading(false);
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