import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import {
  collection, query, where, getDocs, addDoc, serverTimestamp
} from 'firebase/firestore';
import {
  Clock, CheckCircle, AlertCircle, FileText, Calendar, Upload,
  MessageSquare, ChevronRight, ChevronDown, Search, Download,
  Eye, RefreshCw, TrendingUp, Target, Globe, Home, Briefcase, GraduationCap
} from 'lucide-react';

const SEED_CASES = [
  {
    title: 'Business Visa Application',
    type: 'Visa',
    status: 'in-progress',
    progress: 65,
    startDate: '2024-01-15',
    estimatedCompletion: '2024-04-15',
    advisor: 'Emma Johnson',
    priority: 'high',
    lastUpdate: '2024-03-10',
    description: 'Business establishment and investor visa process for Sweden',
    timeline: [
      { id: 1, title: 'Initial Consultation', date: '2024-01-15', status: 'completed', description: 'Meeting with immigration advisor' },
      { id: 2, title: 'Document Collection', date: '2024-01-22', status: 'completed', description: 'Submitted all required documents' },
      { id: 3, title: 'Business Plan Review', date: '2024-02-10', status: 'completed', description: 'Business plan approved' },
      { id: 4, title: 'Visa Application Submission', date: '2024-02-28', status: 'in-progress', description: 'Application submitted to embassy' },
      { id: 5, title: 'Interview Scheduling', date: '2024-03-25', status: 'pending', description: 'Embassy interview to be scheduled' },
      { id: 6, title: 'Final Approval', date: '2024-04-15', status: 'pending', description: 'Expected visa approval' }
    ],
    documents: [
      { id: 1, name: 'Passport Copy', status: 'uploaded', dueDate: '2024-01-20', uploadedDate: '2024-01-18' },
      { id: 2, name: 'Business Plan', status: 'uploaded', dueDate: '2024-01-25', uploadedDate: '2024-01-22' },
      { id: 3, name: 'Financial Statements', status: 'uploaded', dueDate: '2024-02-01', uploadedDate: '2024-01-28' },
      { id: 4, name: 'Proof of Funds', status: 'pending', dueDate: '2024-03-15', uploadedDate: null },
      { id: 5, name: 'Health Insurance', status: 'pending', dueDate: '2024-03-20', uploadedDate: null },
      { id: 6, name: 'Embassy Forms', status: 'in-review', dueDate: '2024-03-01', uploadedDate: '2024-02-28' }
    ]
  },
  {
    title: 'Company Registration',
    type: 'Business',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-10',
    estimatedCompletion: '2024-02-28',
    advisor: 'David Chen',
    priority: 'medium',
    lastUpdate: '2024-02-28',
    description: 'AB company registration and tax setup in Sweden',
    timeline: [
      { id: 1, title: 'Company Name Reservation', date: '2024-01-10', status: 'completed', description: 'Company name approved' },
      { id: 2, title: 'Articles of Association', date: '2024-01-20', status: 'completed', description: 'Legal documents prepared' },
      { id: 3, title: 'Bank Account Setup', date: '2024-02-01', status: 'completed', description: 'Corporate bank account opened' },
      { id: 4, title: 'Tax Registration', date: '2024-02-15', status: 'completed', description: 'Registered for VAT and corporate tax' },
      { id: 5, title: 'Final Registration', date: '2024-02-28', status: 'completed', description: 'Company officially registered' }
    ],
    documents: [
      { id: 1, name: 'Identity Documents', status: 'uploaded', dueDate: '2024-01-12', uploadedDate: '2024-01-11' },
      { id: 2, name: 'Articles of Association', status: 'uploaded', dueDate: '2024-01-22', uploadedDate: '2024-01-20' },
      { id: 3, name: 'Bank Account Proof', status: 'uploaded', dueDate: '2024-02-03', uploadedDate: '2024-02-01' }
    ]
  },
  {
    title: 'Family Relocation',
    type: 'Relocation',
    status: 'pending',
    progress: 30,
    startDate: '2024-02-01',
    estimatedCompletion: '2024-06-01',
    advisor: 'Sarah Williams',
    priority: 'high',
    lastUpdate: '2024-03-05',
    description: 'Family visa and housing arrangement in Stockholm',
    timeline: [
      { id: 1, title: 'Initial Assessment', date: '2024-02-01', status: 'completed', description: 'Family situation assessed' },
      { id: 2, title: 'Document Checklist', date: '2024-02-10', status: 'completed', description: 'Required documents listed' },
      { id: 3, title: 'Application Preparation', date: '2024-03-01', status: 'in-progress', description: 'Preparing family visa applications' },
      { id: 4, title: 'Submission', date: '2024-04-01', status: 'pending', description: 'Submit applications to migration board' },
      { id: 5, title: 'Housing Arrangement', date: '2024-05-01', status: 'pending', description: 'Coordinate housing options' },
      { id: 6, title: 'Relocation Complete', date: '2024-06-01', status: 'pending', description: 'Family settled in Sweden' }
    ],
    documents: [
      { id: 1, name: 'Marriage Certificate', status: 'uploaded', dueDate: '2024-02-15', uploadedDate: '2024-02-12' },
      { id: 2, name: "Children's Birth Certificates", status: 'pending', dueDate: '2024-03-10', uploadedDate: null },
      { id: 3, name: 'Sponsor Documents', status: 'pending', dueDate: '2024-03-15', uploadedDate: null }
    ]
  }
];

const CaseTracking = () => {
  const navigate = useNavigate();
  const [activeCase, setActiveCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  const user = auth.currentUser;

  const fetchCases = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Seed with sample data
        const seedPromises = SEED_CASES.map(c =>
          addDoc(collection(db, 'cases'), { ...c, userId: user.uid, createdAt: serverTimestamp() })
        );
        await Promise.all(seedPromises);
        // Re-fetch
        const snap2 = await getDocs(query(collection(db, 'cases'), where('userId', '==', user.uid)));
        const fetched = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
        setCases(fetched);
        setActiveCase(fetched[0] || null);
      } else {
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setCases(fetched);
        setActiveCase(prev => prev ? fetched.find(c => c.id === prev.id) || fetched[0] : fetched[0]);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setCases(SEED_CASES.map((c, i) => ({ id: `mock-${i}`, ...c })));
      setActiveCase({ id: 'mock-0', ...SEED_CASES[0] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const getStatusColor = (status) => ({ completed: '#10b981', 'in-progress': '#3b82f6', pending: '#f59e0b' }[status] || '#6b7280');
  const getPriorityColor = (p) => ({ high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[p] || '#6b7280');
  const getCaseTypeIcon = (type) => ({ Visa: <Globe size={20} />, Business: <Briefcase size={20} />, Relocation: <Home size={20} />, Education: <GraduationCap size={20} /> }[type] || <FileText size={20} />);
  const getStatusIcon = (s) => ({ completed: <CheckCircle size={16} />, 'in-progress': <Clock size={16} />, pending: <AlertCircle size={16} /> }[s] || <Clock size={16} />);

  const stats = {
    completed: cases.filter(c => c.status === 'completed').length,
    inProgress: cases.filter(c => c.status === 'in-progress').length,
    pending: cases.filter(c => c.status === 'pending').length,
    avgProgress: cases.length ? Math.round(cases.reduce((s, c) => s + (c.progress || 0), 0) / cases.length) : 0
  };

  const filteredCases = cases.filter(c =>
    !searchQuery ||
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProgressBar = (progress, height = 8) => (
    <div style={{ width: '100%', height, background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>← Back to Portal</button>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>Case Tracking</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" placeholder="Search cases..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '9px 14px 9px 32px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', width: '180px', outline: 'none' }} />
            </div>
            <button onClick={fetchCases} style={{ padding: '9px 14px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '12px', padding: '24px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div><p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Overall Progress</p><p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.avgProgress}%</p></div>
              <TrendingUp size={28} opacity={0.8} />
            </div>
            {renderProgressBar(stats.avgProgress, 6)}
          </div>
          {[
            { label: 'Completed', value: stats.completed, color: '#10b981', icon: <CheckCircle size={22} color="#10b981" /> },
            { label: 'In Progress', value: stats.inProgress, color: '#3b82f6', icon: <Clock size={22} color="#3b82f6" /> },
            { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: <Target size={22} color="#f59e0b" /> }
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', background: `${s.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div><p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>{s.label}</p><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{s.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          {/* Case List */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>Your Cases</h3>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>{filteredCases.length} case(s)</p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ width: '30px', height: '30px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : filteredCases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>
                <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>No cases found</p>
              </div>
            ) : (
              <div style={{ padding: '8px', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
                {filteredCases.map(c => (
                  <div key={c.id} onClick={() => setActiveCase(c)} style={{ padding: '16px', background: activeCase?.id === c.id ? '#eff6ff' : 'white', border: `1px solid ${activeCase?.id === c.id ? '#3b82f6' : '#f3f4f6'}`, borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', background: `${getStatusColor(c.status)}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStatusColor(c.status), flexShrink: 0 }}>
                          {getCaseTypeIcon(c.type)}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', marginBottom: '2px' }}>{c.title}</p>
                          <p style={{ fontSize: '12px', color: '#9ca3af' }}>{c.type} {c.advisor ? `• ${c.advisor}` : ''}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', padding: '3px 7px', borderRadius: '10px', fontWeight: '700', background: `${getPriorityColor(c.priority)}15`, color: getPriorityColor(c.priority), textTransform: 'uppercase', flexShrink: 0 }}>{c.priority}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>{c.progress}%</span>
                      </div>
                      {renderProgressBar(c.progress, 6)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
                      <span>Started {c.startDate}</span>
                      <span>Updated {c.lastUpdate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Case Detail */}
          <div>
            {!activeCase ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '80px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#9ca3af' }}>
                <FileText size={56} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                <p style={{ fontSize: '18px', fontWeight: '500' }}>Select a case to view details</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {/* Case Header */}
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>{activeCase.title}</h2>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: `${getStatusColor(activeCase.status)}15`, color: getStatusColor(activeCase.status), borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                          {getStatusIcon(activeCase.status)}{activeCase.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p style={{ color: '#1e40af', marginBottom: '6px', fontSize: '14px' }}>{activeCase.description}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#1e40af', flexWrap: 'wrap' }}>
                        {activeCase.advisor && <span>Advisor: {activeCase.advisor}</span>}
                        <span>Started: {activeCase.startDate}</span>
                        {activeCase.estimatedCompletion && <span>Est. completion: {activeCase.estimatedCompletion}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', color: '#1e40af', marginBottom: '4px' }}>Progress</p>
                      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px' }}>{activeCase.progress}%</p>
                      <div style={{ width: '120px' }}>{renderProgressBar(activeCase.progress, 8)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Timeline Section */}
                  <div>
                    <div onClick={() => setExpandedSection(expandedSection === 'timeline' ? null : 'timeline')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f9fafb', borderRadius: '8px', cursor: 'pointer', marginBottom: expandedSection === 'timeline' ? '16px' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={18} color="#3b82f6" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Case Timeline</span>
                      </div>
                      {expandedSection === 'timeline' ? <ChevronDown size={18} color="#6b7280" /> : <ChevronRight size={18} color="#6b7280" />}
                    </div>

                    {expandedSection === 'timeline' && (
                      <div style={{ padding: '0 8px' }}>
                        {(activeCase.timeline || []).length === 0 ? (
                          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No timeline data available</p>
                        ) : (
                          (activeCase.timeline || []).map((item, index) => (
                            <div key={item.id || index} style={{ display: 'flex', gap: '16px', marginBottom: '20px', position: 'relative' }}>
                              <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: item.status === 'completed' ? '#10b981' : item.status === 'in-progress' ? '#3b82f6' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                  {item.status === 'completed' ? <CheckCircle size={18} /> : item.id || index + 1}
                                </div>
                                {index < (activeCase.timeline || []).length - 1 && (
                                  <div style={{ position: 'absolute', left: '18px', top: '38px', bottom: '-20px', width: '2px', background: '#e5e7eb' }} />
                                )}
                              </div>
                              <div style={{ flex: 1, paddingBottom: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{item.title}</h4>
                                  <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.date}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>{item.description}</p>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: item.status === 'completed' ? '#10b98115' : item.status === 'in-progress' ? '#3b82f615' : '#f3f4f6', color: item.status === 'completed' ? '#10b981' : item.status === 'in-progress' ? '#3b82f6' : '#6b7280', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                  {item.status === 'completed' ? 'Completed' : item.status === 'in-progress' ? 'In Progress' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div>
                    <div onClick={() => setExpandedSection(expandedSection === 'documents' ? null : 'documents')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f9fafb', borderRadius: '8px', cursor: 'pointer', marginBottom: expandedSection === 'documents' ? '16px' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#3b82f6" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Required Documents</span>
                        <span style={{ padding: '2px 8px', background: '#3b82f615', color: '#3b82f6', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          {(activeCase.documents || []).filter(d => d.status === 'uploaded').length}/{(activeCase.documents || []).length} uploaded
                        </span>
                      </div>
                      {expandedSection === 'documents' ? <ChevronDown size={18} color="#6b7280" /> : <ChevronRight size={18} color="#6b7280" />}
                    </div>

                    {expandedSection === 'documents' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                        {(activeCase.documents || []).map((docItem, i) => (
                          <div key={docItem.id || i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', background: docItem.status === 'uploaded' ? '#f0fdf4' : 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                              <div>
                                <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', marginBottom: '3px' }}>{docItem.name}</p>
                                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Due: {docItem.dueDate}</p>
                              </div>
                              <span style={{ padding: '3px 8px', background: docItem.status === 'uploaded' ? '#10b98115' : docItem.status === 'in-review' ? '#3b82f615' : '#fef3c7', color: docItem.status === 'uploaded' ? '#10b981' : docItem.status === 'in-review' ? '#3b82f6' : '#92400e', borderRadius: '10px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                {docItem.status === 'uploaded' ? 'Uploaded' : docItem.status === 'in-review' ? 'In Review' : 'Pending'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {docItem.status === 'pending' ? (
                                <button onClick={() => navigate('/documents')} style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Upload size={13} /> Upload
                                </button>
                              ) : (
                                <p style={{ fontSize: '12px', color: '#10b981' }}>Uploaded {docItem.uploadedDate}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => navigate('/messages')} style={{ padding: '11px 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={15} /> Message Advisor
                      </button>
                      <button onClick={() => navigate('/documents')} style={{ padding: '11px 20px', background: 'white', color: '#3b82f6', border: '2px solid #3b82f6', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={15} /> Upload Documents
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default CaseTracking;
