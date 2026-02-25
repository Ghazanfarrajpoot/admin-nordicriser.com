import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import DocumentVault from './components/DocumentVault';
import SecureMessaging from './components/SecureMessaging';
import Dashboard from './components/Dashboard';
import PaymentCenter from './components/PaymentCenter';
import CaseTracking from './components/CaseTracking';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { 
  Home, 
  LogOut, 
  Shield, 
  Users, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  ChevronRight, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  GraduationCap
} from 'lucide-react';

// Import your Firebase config
import { auth, db } from './firebase/config';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Auth object:', auth);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'member');
          } else {
            const email = currentUser.email.toLowerCase();
            setUserRole(email.includes('admin') || email.endsWith('@nordicriser.com') ? 'admin' : 'member');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('member');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    const checkAuthAfterVerification = async () => {
      try {
        await auth.currentUser?.reload();
      } catch (error) {
        console.log('No user to reload or error:', error);
      }
    };
    
    checkAuthAfterVerification();
    
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
          <div style={{ fontSize: '20px' }}>Loading Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Protected Member Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MemberPortal user={user} />
          </ProtectedRoute>
        } />
        
        <Route path="/documents" element={
          <ProtectedRoute>
            <DocumentVault />
          </ProtectedRoute>
        } />

        <Route path="/messages" element={
          <ProtectedRoute>
            <SecureMessaging />
          </ProtectedRoute>
        } />

        <Route path="/payments" element={
          <ProtectedRoute>
            <PaymentCenter />
          </ProtectedRoute>
        } />

        <Route path="/tracking" element={
          <ProtectedRoute>
            <CaseTracking />
          </ProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminCRM user={user} />
          </ProtectedRoute>
        } />
        
        {/* Default redirect - based on auth state */}
        <Route path="/" element={
          user ? (
            userRole === 'admin' ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

// ============= AUTH PAGE =============
function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    goals: [],
    services: [],
    hearAbout: '',
    message: ''
  });

  const goalOptions = [
    { id: 'business', label: 'Business Establishment', icon: Briefcase },
    { id: 'investment', label: 'Investment Visa', icon: BarChart3 },
    { id: 'family', label: 'Family Relocation', icon: Home },
    { id: 'student', label: 'Student Pathway', icon: GraduationCap }
  ];

  const serviceOptions = [
    { id: 'company', label: 'Company Registration', icon: Briefcase },
    { id: 'residence', label: 'Residence Planning', icon: Home },
    { id: 'legal', label: 'Legal Coordination', icon: Shield },
    { id: 'education', label: 'Education Support', icon: GraduationCap }
  ];

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    // Clear any existing errors
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      throw new Error('Please enter both email and password');
    }
    
    console.log('Attempting login with:', formData.email);
    
    const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
    
    console.log('Login successful:', userCredential.user);
    
    // Check if email is verified (only in production)
    const isUsingEmulator = window.location.hostname === 'localhost' || import.meta.env.VITE_USE_EMULATOR === 'true';
    
    if (!isUsingEmulator && !userCredential.user.emailVerified) {
      setError('Please verify your email before logging in. Check your inbox.');
      await signOut(auth);
      setLoading(false);
      return;
    }
    
    // If verified or using emulator, proceed with login
    console.log('Login successful, redirecting to dashboard');
    
    // Small delay to ensure state updates
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
    
  } catch (err) {
    console.error('Login error details:', err);
    
    let errorMessage = 'Login failed. ';
    
    if (err.code) {
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage += 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage += 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage += 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          errorMessage += 'Too many login attempts. Try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage += 'Network error. Check your connection.';
          break;
        default:
          errorMessage += err.message.replace('Firebase: ', '').replace('Error ', '');
      }
    } else {
      errorMessage += err.message || 'Unknown error occurred.';
    }
    
    setError(errorMessage);
    
    // If it's a network error, suggest using emulator
    if (err.code === 'auth/network-request-failed' || err.message.includes('Failed to fetch')) {
      setError(prev => prev + ' Are you trying to use emulators? Make sure they are running.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await sendEmailVerification(userCredential.user);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        goals: formData.goals,
        services: formData.services,
        hearAbout: formData.hearAbout,
        message: formData.message,
        role: 'member',
        createdAt: new Date().toISOString(),
        emailVerified: false,
        profileComplete: true
      });
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace('Error ', ''));
      setLoading(false);
    }
  };

  const toggleGoal = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId) 
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const toggleService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  if (!isRegistering) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '450px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(59,130,246,0.3)' }}>
              <Shield size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px' }}>Nordic Riser AB</h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Secure Member Portal</p>
          </div>

          {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>⚠️ {error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
  <div>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
      Email Address
    </label>
    <input 
      type="email" 
      value={formData.email} 
      onChange={(e) => setFormData({...formData, email: e.target.value})} 
      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px' }} 
      placeholder="your@email.com" 
      required 
      autocomplete="email"
    />
  </div>

  <div>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
      Password
    </label>
    <input 
      type="password" 
      value={formData.password} 
      onChange={(e) => setFormData({...formData, password: e.target.value})} 
      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px' }} 
      placeholder="••••••••" 
      required 
      minLength={6}
      autocomplete="current-password"
    />
  </div>

  <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>
    {loading ? 'Signing in...' : 'Sign In'}
  </button>
</form>

          <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Don't have an account?{' '}
              <button onClick={() => { setIsRegistering(true); setError(''); }} style={{ color: '#3b82f6', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                Register Now
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '500px', padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={48} color="white" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Registration Successful! 🎉</h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>Welcome to Nordic Riser AB! We've sent a verification email to <strong>{formData.email}</strong></p>
          <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '12px' }}><strong>Next Steps:</strong></p>
            <p style={{ fontSize: '14px', color: '#1e40af' }}>1. Check your email inbox<br/>2. Click the verification link<br/>3. Return here to access your portal</p>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Redirecting to your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '600px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px' }}>Create Your Account</h2>
          <p style={{ color: '#64748b' }}>Join Nordic Riser AB Portal</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step >= s ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e5e7eb', color: step >= s ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '8px', transition: 'all 0.3s' }}>
                {step > s ? <CheckCircle size={20} /> : s}
              </div>
              <span style={{ fontSize: '12px', color: step >= s ? '#3b82f6' : '#9ca3af', fontWeight: step === s ? '600' : '400' }}>{s === 1 ? 'Personal' : s === 2 ? 'Goals' : 'Complete'}</span>
            </div>
          ))}
          <div style={{ position: 'absolute', top: '20px', left: '20%', right: '20%', height: '2px', background: '#e5e7eb', zIndex: 0 }}>
            <div style={{ height: '100%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', width: `${((step - 1) / 2) * 100}%`, transition: 'width 0.3s' }}></div>
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>⚠️ {error}</div>}

        <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); setStep(step + 1); }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>First Name *</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }} required /></div>
                <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Last Name *</label><input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }} required /></div>
              </div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Email Address *</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password *</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }} minLength={6} required /></div>
                <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Confirm Password *</label><input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }} required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }} required /></div>
                <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Country *</label>
                  <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }} required>
                    <option value="">Select...</option><option value="US">United States</option><option value="UK">United Kingdom</option><option value="IN">India</option><option value="CN">China</option><option value="PK">Pakistan</option><option value="BD">Bangladesh</option><option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>What are your goals? (Select all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {goalOptions.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = formData.goals.includes(goal.id);
                    return (
                      <div key={goal.id} onClick={() => toggleGoal(goal.id)} style={{ padding: '16px', border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`, background: isSelected ? '#eff6ff' : 'white', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: isSelected ? '#3b82f6' : '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color={isSelected ? 'white' : '#6b7280'} /></div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: isSelected ? '#1e40af' : '#374151' }}>{goal.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Which services interest you? (Select all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {serviceOptions.map((service) => {
                    const Icon = service.icon;
                    const isSelected = formData.services.includes(service.id);
                    return (
                      <div key={service.id} onClick={() => toggleService(service.id)} style={{ padding: '16px', border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`, background: isSelected ? '#eff6ff' : 'white', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: isSelected ? '#3b82f6' : '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color={isSelected ? 'white' : '#6b7280'} /></div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: isSelected ? '#1e40af' : '#374151' }}>{service.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>How did you hear about us?</label>
                <select value={formData.hearAbout} onChange={(e) => setFormData({...formData, hearAbout: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }}>
                  <option value="">Select an option...</option><option value="google">Google Search</option><option value="social">Social Media</option><option value="referral">Referral</option><option value="other">Other</option>
                </select>
              </div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Tell us about your needs (Optional)</label>
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', minHeight: '100px', resize: 'vertical' }} placeholder="Tell us more about your business goals or questions..." />
              </div>
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '10px' }}>
                <p style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}><strong>📋 Review Your Information:</strong><br/>• Name: {formData.firstName} {formData.lastName}<br/>• Email: {formData.email}<br/>• Country: {formData.country}<br/>• Goals: {formData.goals.length} selected<br/>• Services: {formData.services.length} selected</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '14px', border: '2px solid #e5e7eb', background: 'white', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#374151' }}><ArrowLeft size={20} />Back</button>}
            <button type="submit" disabled={loading || (step === 1 && formData.password !== formData.confirmPassword)} style={{ flex: 1, padding: '14px', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? 'Processing...' : step === 3 ? 'Complete Registration' : 'Continue'}{!loading && step < 3 && <ChevronRight size={20} />}
            </button>
          </div>

          {step === 1 && formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>⚠️ Passwords do not match</p>}
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Already have an account? <button onClick={() => { setIsRegistering(false); setStep(1); setError(''); }} style={{ color: '#3b82f6', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Sign In</button></p>
        </div>
      </div>
    </div>
  );
}

// ============= MEMBER PORTAL =============
function MemberPortal({ user }) {
  const [activeFeature, setActiveFeature] = useState(null);
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  const features = [
    { 
      icon: FileText, 
      title: 'Document Vault', 
      desc: 'Upload and manage documents', 
      status: 'Active', 
      onClick: () => window.location.href = '/documents'
    },
    { 
      icon: MessageSquare, 
      title: 'Secure Messaging', 
      desc: 'Chat with advisors', 
      status: 'Active', 
      onClick: () => window.location.href = '/messages'
    },
    { 
      icon: CreditCard, 
      title: 'Payment Center', 
      desc: 'View invoices and payments', 
      status: 'Active', 
      onClick: () => window.location.href = '/payments'
    },
    { 
      icon: Clock, 
      title: 'Case Tracking', 
      desc: 'Track application progress', 
      status: 'Active', 
      onClick: () => window.location.href = '/tracking'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '4px' }}>Member Portal</h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Nordic Riser AB</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{user.email}</p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Member Account</p>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {!user.emailVerified && (
          <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <Mail size={24} color="#92400e" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                  Please Verify Your Email
                </h3>
                <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '12px' }}>
                  We've sent a verification link to <strong>{user.email}</strong>. Please check your inbox and verify your email to access all features.
                </p>
                <button
                  onClick={async () => {
                    await sendEmailVerification(user);
                    alert('Verification email sent! Please check your inbox.');
                  }}
                  style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>Welcome to Your Portal! 🎉</h2>
          <p style={{ fontSize: '16px', opacity: 0.95 }}>All features are now active and ready to use!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isActive = feature.status === 'Active';
            return (
              <div 
                key={idx} 
                onClick={feature.onClick}
                style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                  border: `2px solid ${isActive ? '#3b82f6' : '#e5e7eb'}`,
                  cursor: isActive ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '48px', height: '48px', background: isActive ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={24} color={isActive ? "#3b82f6" : "#9ca3af"} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: isActive ? '#1f2937' : '#9ca3af', marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: isActive ? '#6b7280' : '#d1d5db', marginBottom: '12px' }}>{feature.desc}</p>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  background: isActive ? '#d1fae5' : '#fef3c7', 
                  color: isActive ? '#065f46' : '#92400e', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  borderRadius: '6px' 
                }}>
                  {isActive ? '✓ Active' : feature.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============= ADMIN CRM =============
function AdminCRM({ user }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  const stats = [
    { label: 'Total Clients', value: '0', icon: Users, color: '#3b82f6' },
    { label: 'Active Cases', value: '0', icon: FileText, color: '#10b981' },
    { label: 'Messages', value: '0', icon: MessageSquare, color: '#8b5cf6' },
    { label: 'Revenue', value: '€0', icon: BarChart3, color: '#f59e0b' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <header style={{ background: 'linear-gradient(135deg, #1f2937, #111827)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Shield size={28} />
              <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Admin CRM</h1>
            </div>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>Nordic Riser AB - Management Portal</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>{user.email}</p>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Administrator</p>
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: `${stat.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} color={stat.color} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>+0%</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{stat.label}</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Admin Dashboard</h2>
          <div style={{ padding: '32px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '12px', textAlign: 'center' }}>
            <Shield size={64} color="#3b82f6" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af', marginBottom: '12px' }}>Admin Portal Active</h3>
            <p style={{ fontSize: '16px', color: '#1e40af', marginBottom: '24px' }}>Full CRM features coming soon. You have admin access.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' }}>
              {['Client Management', 'Case Pipeline', 'Document Approval', 'Financial Reports', 'Team Management', 'System Settings'].map((feature, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                  <p style={{ fontWeight: '600', color: '#1f2937' }}>{feature}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Coming Soon</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;