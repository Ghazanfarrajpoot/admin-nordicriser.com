import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Folder, MessageSquare, LogOut } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

function Navbar() {
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        {/* Logo/Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            NR
          </div>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1e3a8a'
          }}>
            Nordic Riser
          </span>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px',
              background: location.pathname === '/' ? '#eff6ff' : 'transparent',
              color: location.pathname === '/' ? '#3b82f6' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Home size={16} />
              Dashboard
            </button>
          </Link>
          
          <Link to="/documents" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px',
              background: location.pathname === '/documents' ? '#eff6ff' : 'transparent',
              color: location.pathname === '/documents' ? '#3b82f6' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Folder size={16} />
              Documents
            </button>
          </Link>
          
          <Link to="/messages" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px',
              background: location.pathname === '/messages' ? '#eff6ff' : 'transparent',
              color: location.pathname === '/messages' ? '#3b82f6' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <MessageSquare size={16} />
              Messages
            </button>
          </Link>
        </div>

        {/* User/Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            {auth.currentUser?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;