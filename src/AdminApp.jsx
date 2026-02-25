import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import {
  getDoc, doc, collection, getDocs, query, orderBy, limit, where
} from 'firebase/firestore';
import {
  LogOut, Shield, Users, FileText, MessageSquare, BarChart3,
  Mail, ChevronRight, Clock, CheckCircle, AlertCircle, RefreshCw,
  Search, Eye
} from 'lucide-react';

// ============= ADMIN CRM =============
function AdminCRM({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ clients: 0, cases: 0, messages: 0 });
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut(auth);
  };

  const fetchStats = async () => {
    setLoadingData(true);
    try {
      const [usersSnap, casesSnap, msgSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'cases')),
        getDocs(collection(db, 'messages'))
      ]);

      const userDocs = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const caseDocs = casesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStats({
        clients: userDocs.filter(u => u.role !== 'admin').length,
        cases: caseDocs.length,
        messages: msgSnap.size
      });
      setClients(userDocs.filter(u => u.role !== 'admin'));
      setCases(caseDocs);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Clients', value: stats.clients, icon: Users, color: '#3b82f6' },
    { label: 'Active Cases', value: stats.cases, icon: FileText, color: '#10b981' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: '#8b5cf6' },
    { label: 'Revenue', value: '€0', icon: BarChart3, color: '#f59e0b' }
  ];

  const filteredClients = clients.filter(c =>
    !searchQuery ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = ['dashboard', 'clients', 'cases'];

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #1f2937, #111827)', padding: '20px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <Shield size={28} />
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Nordic Riser Admin Portal</h1>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>Administrative Dashboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{user?.email}</p>
              <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Email verification banner */}
      {!user?.emailVerified && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #f59e0b', padding: '12px 24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Mail size={20} color="#92400e" />
          <span style={{ fontSize: '14px', color: '#92400e' }}>
            Please verify your email for full admin access.
          </span>
          <button
            onClick={async () => { await sendEmailVerification(user); alert('Verification email sent!'); }}
            style={{ padding: '6px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
          >
            Resend
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '4px' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px',
                background: 'none',
                border: 'none',
                borderBottom: `3px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`,
                color: activeTab === tab ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'dashboard' ? '📊 Dashboard' : tab === 'clients' ? '👥 Clients' : '📋 Cases'}
            </button>
          ))}
          <button
            onClick={fetchStats}
            style={{ marginLeft: 'auto', padding: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div style={{ width: '48px', height: '48px', background: `${stat.color}18`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={24} color={stat.color} />
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{stat.label}</p>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                      {loadingData ? '...' : stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recent Clients */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Recent Members</h2>
                <button onClick={() => setActiveTab('clients')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  View All →
                </button>
              </div>
              {loadingData ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading...</div>
              ) : clients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p>No members registered yet</p>
                </div>
              ) : (
                <div style={{ padding: '8px' }}>
                  {clients.slice(0, 5).map(client => (
                    <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6', margin: '8px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#3b82f6', fontSize: '16px', flexShrink: 0 }}>
                        {(client.firstName || client.email || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                          {client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : client.email}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>{client.email} {client.country ? `• ${client.country}` : ''}</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0 }}>
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Feature Status */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Feature Status</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { name: 'Client Management', status: 'active', desc: 'View & search members' },
                  { name: 'Case Pipeline', status: 'active', desc: 'View all cases' },
                  { name: 'Document Approval', status: 'coming', desc: 'Review uploads' },
                  { name: 'Financial Reports', status: 'coming', desc: 'Revenue analytics' },
                  { name: 'Team Management', status: 'coming', desc: 'Staff accounts' },
                  { name: 'System Settings', status: 'coming', desc: 'Portal configuration' }
                ].map((f, i) => (
                  <div key={i} style={{ padding: '16px', border: `1px solid ${f.status === 'active' ? '#a7f3d0' : '#e5e7eb'}`, background: f.status === 'active' ? '#f0fdf4' : '#fafafa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{f.name}</p>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', background: f.status === 'active' ? '#d1fae5' : '#fef3c7', color: f.status === 'active' ? '#065f46' : '#92400e' }}>
                        {f.status === 'active' ? 'Active' : 'Soon'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>
                Member Clients ({filteredClients.length})
              </h2>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '10px 16px 10px 36px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', width: '280px', outline: 'none' }}
                />
              </div>
            </div>

            {loadingData ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading clients...</div>
            ) : filteredClients.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#9ca3af', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                <p style={{ fontSize: '18px', fontWeight: '500' }}>No clients found</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Member</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Country</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Goals</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Joined</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(client => (
                      <tr key={client.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#3b82f6', fontSize: '14px', flexShrink: 0 }}>
                              {(client.firstName || client.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', marginBottom: '2px' }}>
                                {client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : 'No Name'}
                              </p>
                              <p style={{ fontSize: '12px', color: '#6b7280' }}>{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{client.country || '—'}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                          {client.goals?.slice(0, 2).join(', ') || '—'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: '#d1fae5', color: '#065f46' }}>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
              Case Pipeline ({cases.length})
            </h2>
            {loadingData ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading cases...</div>
            ) : cases.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#9ca3af', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                <p style={{ fontSize: '18px', fontWeight: '500' }}>No cases in the system</p>
                <p style={{ fontSize: '14px' }}>Cases will appear here when members file applications</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Case</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', marginBottom: '2px' }}>{c.title || c.id}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>{c.advisor ? `Advisor: ${c.advisor}` : ''}</p>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{c.type || '—'}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: c.status === 'completed' ? '#d1fae5' : c.status === 'in-progress' ? '#dbeafe' : '#fef3c7', color: c.status === 'completed' ? '#065f46' : c.status === 'in-progress' ? '#1e40af' : '#92400e' }}>
                            {c.status || 'Unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '4px', height: '6px' }}>
                              <div style={{ background: '#3b82f6', height: '100%', borderRadius: '4px', width: `${c.progress || 0}%` }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0 }}>{c.progress || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============= ADMIN LOGIN =============
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      let msg = 'Login failed.';
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
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Shield size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px' }}>Nordic Riser AB</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Admin Portal — Authorized Access Only</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@nordicriser.com"
              required
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '24px' }}>
          Member access?{' '}
          <a href="https://portal.nordicriser.com" style={{ color: '#3b82f6', fontWeight: '600' }}>
            Go to Member Portal
          </a>
        </p>
      </div>
    </div>
  );
}

// ============= MAIN ADMIN APP =============
export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role || 'member';
            setUserRole(role);
            if (role !== 'admin') {
              setAccessError('Access Denied: Administrator credentials required.');
            }
          } else {
            // Check email domain fallback
            const isAdmin = currentUser.email?.endsWith('@nordicriser.com') || currentUser.email?.includes('admin');
            setUserRole(isAdmin ? 'admin' : 'member');
            if (!isAdmin) setAccessError('Access Denied: Administrator credentials required.');
          }
        } catch (err) {
          console.error('Role check error:', err);
          setUserRole('member');
          setAccessError('Unable to verify admin permissions.');
        }
      } else {
        setUser(null);
        setUserRole(null);
        setAccessError('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1f2937, #111827)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: '56px', height: '56px', border: '4px solid rgba(255,255,255,0.2)', borderTop: '4px solid white', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '18px', fontWeight: '500' }}>Loading Admin Portal...</p>
          <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '6px' }}>Verifying credentials</p>
        </div>
        <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (accessError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Shield size={32} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '12px' }}>Access Restricted</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{accessError}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => signOut(auth)}
              style={{ padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Sign Out
            </button>
            <button
              onClick={() => window.location.href = 'https://portal.nordicriser.com'}
              style={{ padding: '12px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Member Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminCRM user={user} />;
}
