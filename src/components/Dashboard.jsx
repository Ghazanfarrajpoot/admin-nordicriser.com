import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, MessageSquare, Shield, Home } from 'lucide-react';

function Dashboard() {
  return (
    <div style={{ 
      background: '#f8fafc', 
      minHeight: '100vh',
      padding: '24px' 
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1e3a8a',
            marginBottom: '12px'
          }}>
            Nordic Riser Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Secure document management and messaging platform
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {/* Document Vault Card */}
          <Link to="/documents" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: '2px solid transparent',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderColor: '#3b82f6'
              }
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#eff6ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Folder size={32} color="#3b82f6" />
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Document Vault
              </h3>
              <p style={{ 
                color: '#64748b',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Securely store and manage your important documents with Firebase Storage and Firestore.
              </p>
              <div style={{ 
                marginTop: '20px',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Go to Documents →
              </div>
            </div>
          </Link>

          {/* Secure Messaging Card */}
          <Link to="/messages" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: '2px solid transparent',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderColor: '#10b981'
              }
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#d1fae5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <MessageSquare size={32} color="#10b981" />
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Secure Messaging
              </h3>
              <p style={{ 
                color: '#64748b',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                End-to-end encrypted messaging with real-time updates using Firebase Firestore.
              </p>
              <div style={{ 
                marginTop: '20px',
                color: '#10b981',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Go to Messages →
              </div>
            </div>
          </Link>
        </div>

        {/* Stats/Info */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
              🔒
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              End-to-End Encryption
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
              ⚡
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Real-time Updates
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
              ☁️
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Firebase Powered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;