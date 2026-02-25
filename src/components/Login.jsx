// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // DEBUG LOGS
    console.log('🔐 LOGIN FORM SUBMITTED');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    console.log('🌐 Current URL:', window.location.href);
    console.log('📍 Hostname:', window.location.hostname);
    console.log('🔄 Loading state:', loading);
    
    try {
      setError('');
      setLoading(true);
      
      console.log('📞 Calling AuthContext login function...');
      
      const result = await login(email, password);
      
      console.log('📨 AuthContext login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful! Redirecting to /dashboard');
        navigate('/dashboard'); // Redirect to member dashboard
      } else {
        console.log('❌ Login failed from AuthContext:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('💥 Unexpected error in handleSubmit:', err);
      console.error('Error stack:', err.stack);
      setError('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
      console.log('🏁 Login process finished. Loading:', loading);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Member Login</h2>
        
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
            <br />
            <small style={{ fontSize: '12px', opacity: 0.8 }}>
              Check browser console (F12) for details
            </small>
          </div>
        )}
        
        {/* DEBUG INFO PANEL */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '12px',
          color: '#0369a1'
        }}>
          <strong>🔧 Debug Info:</strong>
          <div>Host: {window.location.hostname}</div>
          <div>Port: {window.location.port}</div>
          <div>Emulator: {window.location.hostname.includes('localhost') ? '✅ Local' : '❌ Production'}</div>
          <button 
            type="button"
            onClick={() => {
              console.log('🛠️ Manual debug check:');
              console.log('- window.location:', window.location);
              console.log('- process.env.NODE_ENV:', process.env.NODE_ENV);
              console.log('- import.meta.env:', import.meta.env);
            }}
            style={{
              background: 'transparent',
              border: '1px solid #0369a1',
              color: '#0369a1',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              marginTop: '8px',
              cursor: 'pointer'
            }}
          >
            Check Environment
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="test@test.com"
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="123456 (test password)"
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{
              position: 'relative',
              opacity: loading ? 0.7 : 1,
              width: '100%',
              marginBottom: '10px'
            }}
          >
            {loading ? (
              <>
                <span>Logging in...</span>
                <span style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  width: '12px',
                  height: '12px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
              </>
            ) : 'Sign In'}
          </button>
          
          {/* TEST BUTTONS */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            gap: '8px',
            fontSize: '12px'
          }}>
            <button
              type="button"
              onClick={() => {
                setEmail('test@test.com');
                setPassword('123456');
                console.log('🧪 Test credentials filled');
              }}
              style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                color: '#0369a1',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Fill Test Credentials
            </button>
            
            <button
              type="button"
              onClick={() => {
                console.clear();
                console.log('🧹 Console cleared');
              }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Clear Console
            </button>
          </div>
        </form>
        
        {/* DIRECT EMULATOR TEST BUTTON - ADDED HERE */}
        <button
          type="button"
          onClick={async () => {
            console.log('🧪 Testing direct emulator login...');
            
            // Test direct API call to emulator
            try {
              const response = await fetch(
                'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key-for-emulator',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: 'test@test.com',
                    password: '123456',
                    returnSecureToken: true
                  })
                }
              );
              
              const data = await response.json();
              console.log('📨 Direct emulator response:', data);
              
              if (data.idToken) {
                console.log('✅ Direct login successful!');
                alert('Direct emulator login works! Token: ' + data.idToken.substring(0, 20) + '...');
              } else {
                console.log('❌ Direct login failed:', data);
                alert('Error: ' + (data.error?.message || 'Unknown error'));
              }
            } catch (error) {
              console.error('💥 Direct test error:', error);
            }
          }}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '6px',
            marginTop: '10px',
            width: '100%',
            cursor: 'pointer'
          }}
        >
          Test Direct Emulator Login
        </button>
        
        <div className="login-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Create Account</Link>
        </div>
        
        {/* EMULATOR QUICK LINKS */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '11px',
          color: '#6b7280'
        }}>
          <strong>Emulator Links:</strong>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <a 
              href="http://127.0.0.1:4000/auth" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6' }}
            >
              Auth Emulator
            </a>
            <a 
              href="http://127.0.0.1:4000" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6' }}
            >
              Emulator UI
            </a>
            <a 
              href="http://127.0.0.1:9199" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6' }}
            >
              Storage Emulator
            </a>
          </div>
        </div>
      </div>
      
      {/* INLINE STYLES FOR LOADING ANIMATION */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;