import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  Calendar,
  Upload,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Filter,
  Search,
  Download,
  Eye,
  RefreshCw,
  BarChart3,
  Target,
  TrendingUp,
  Award,
  Shield,
  Globe,
  Home,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const CaseTracking = () => {
  const navigate = useNavigate();
  const [activeCase, setActiveCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('documents');

  const user = auth.currentUser;

  // Mock data - in real app, fetch from Firestore
  const mockCases = [
    {
      id: 'CASE-2024-001',
      title: 'Business Visa Application',
      type: 'Visa',
      status: 'in-progress',
      progress: 65,
      startDate: '2024-01-15',
      estimatedCompletion: '2024-04-15',
      advisor: 'Emma Johnson',
      priority: 'high',
      lastUpdate: '2024-03-10',
      description: 'Business establishment and investor visa process for Sweden'
    },
    {
      id: 'CASE-2024-002',
      title: 'Company Registration',
      type: 'Business',
      status: 'completed',
      progress: 100,
      startDate: '2024-01-10',
      completionDate: '2024-02-28',
      advisor: 'David Chen',
      priority: 'medium',
      lastUpdate: '2024-02-28',
      description: 'AB company registration and tax setup'
    },
    {
      id: 'CASE-2024-003',
      title: 'Family Relocation',
      type: 'Relocation',
      status: 'pending',
      progress: 30,
      startDate: '2024-02-01',
      estimatedCompletion: '2024-06-01',
      advisor: 'Sarah Williams',
      priority: 'high',
      lastUpdate: '2024-03-05',
      description: 'Family visa and housing arrangement'
    },
    {
      id: 'CASE-2024-004',
      title: 'Student Visa Process',
      type: 'Education',
      status: 'in-progress',
      progress: 45,
      startDate: '2024-02-15',
      estimatedCompletion: '2024-05-30',
      advisor: 'Michael Brown',
      priority: 'medium',
      lastUpdate: '2024-03-08',
      description: 'University admission and student visa application'
    }
  ];

  const caseTimelines = {
    'CASE-2024-001': [
      { id: 1, title: 'Initial Consultation', date: '2024-01-15', status: 'completed', description: 'Meeting with immigration advisor' },
      { id: 2, title: 'Document Collection', date: '2024-01-22', status: 'completed', description: 'Submitted all required documents' },
      { id: 3, title: 'Business Plan Review', date: '2024-02-10', status: 'completed', description: 'Business plan approved' },
      { id: 4, title: 'Visa Application Submission', date: '2024-02-28', status: 'in-progress', description: 'Application submitted to embassy' },
      { id: 5, title: 'Interview Scheduling', date: '2024-03-25', status: 'pending', description: 'Embassy interview to be scheduled' },
      { id: 6, title: 'Final Approval', date: '2024-04-15', status: 'pending', description: 'Expected visa approval' }
    ],
    'CASE-2024-002': [
      { id: 1, title: 'Company Name Reservation', date: '2024-01-10', status: 'completed', description: 'Company name approved' },
      { id: 2, title: 'Articles of Association', date: '2024-01-20', status: 'completed', description: 'Legal documents prepared' },
      { id: 3, title: 'Bank Account Setup', date: '2024-02-01', status: 'completed', description: 'Corporate bank account opened' },
      { id: 4, title: 'Tax Registration', date: '2024-02-15', status: 'completed', description: 'Registered for VAT and corporate tax' },
      { id: 5, title: 'Final Registration', date: '2024-02-28', status: 'completed', description: 'Company officially registered' }
    ]
  };

  const requiredDocuments = [
    { id: 1, name: 'Passport Copy', status: 'uploaded', dueDate: '2024-01-20', uploadedDate: '2024-01-18' },
    { id: 2, name: 'Business Plan', status: 'uploaded', dueDate: '2024-01-25', uploadedDate: '2024-01-22' },
    { id: 3, name: 'Financial Statements', status: 'uploaded', dueDate: '2024-02-01', uploadedDate: '2024-01-28' },
    { id: 4, name: 'Proof of Funds', status: 'pending', dueDate: '2024-03-15', uploadedDate: null },
    { id: 5, name: 'Health Insurance', status: 'pending', dueDate: '2024-03-20', uploadedDate: null },
    { id: 6, name: 'Embassy Forms', status: 'in-review', dueDate: '2024-03-01', uploadedDate: '2024-02-28' }
  ];

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      // In real app, fetch from Firestore
      setTimeout(() => {
        setCases(mockCases);
        if (mockCases.length > 0 && !activeCase) {
          setActiveCase(mockCases[0]);
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'in-progress': return <Clock size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCaseTypeIcon = (type) => {
    switch(type) {
      case 'Visa': return <Globe size={20} />;
      case 'Business': return <Briefcase size={20} />;
      case 'Relocation': return <Home size={20} />;
      case 'Education': return <GraduationCap size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const calculateStats = () => {
    const completed = cases.filter(c => c.status === 'completed').length;
    const inProgress = cases.filter(c => c.status === 'in-progress').length;
    const pending = cases.filter(c => c.status === 'pending').length;
    const avgProgress = cases.length > 0 
      ? cases.reduce((sum, c) => sum + c.progress, 0) / cases.length 
      : 0;
    
    return { completed, inProgress, pending, avgProgress };
  };

  const stats = calculateStats();

  const renderProgressBar = (progress) => (
    <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
      <div 
        style={{ 
          width: `${progress}%`, 
          height: '100%', 
          background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} 
      />
    </div>
  );

  const renderTimelineItem = (item) => (
    <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: item.status === 'completed' ? '#10b981' : 
                     item.status === 'in-progress' ? '#3b82f6' : '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600'
        }}>
          {item.status === 'completed' ? <CheckCircle size={20} /> : item.id}
        </div>
      </div>
      <div style={{ flex: 1, paddingBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{item.title}</h4>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{item.date}</span>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{item.description}</p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: item.status === 'completed' ? '#10b98115' : 
                     item.status === 'in-progress' ? '#3b82f615' : '#f3f4f6',
          color: item.status === 'completed' ? '#10b981' : 
                 item.status === 'in-progress' ? '#3b82f6' : '#6b7280',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {item.status === 'completed' ? 'Completed' : 
           item.status === 'in-progress' ? 'In Progress' : 'Pending'}
        </div>
      </div>
      {item.id < (caseTimelines[activeCase?.id]?.length || 0) && (
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '40px',
          bottom: '-24px',
          width: '2px',
          background: '#e5e7eb',
          zIndex: 0
        }} />
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              ← Back to Portal
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>Case Tracking</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search cases..."
                style={{
                  padding: '10px 16px 10px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '200px'
                }}
              />
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af' }} />
            </div>
            <button 
              onClick={fetchCases}
              style={{ 
                padding: '10px 16px', 
                background: '#f3f4f6', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px' }}>
        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
            borderRadius: '12px', 
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Overall Progress</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.avgProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp size={32} opacity={0.8} />
            </div>
            {renderProgressBar(stats.avgProgress)}
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#10b98115', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Completed</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.completed}</p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Cases successfully closed</p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#3b82f615', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>In Progress</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.inProgress}</p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>Active cases being processed</p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#f59e0b15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={24} color="#f59e0b" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>On Track</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>92%</p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>Cases meeting deadlines</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Cases List */}
          <div style={{ width: '400px', flexShrink: 0 }}>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Your Cases</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{cases.length} total cases</p>
              </div>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : (
                <div style={{ padding: '8px' }}>
                  {cases.map(caseItem => (
                    <div
                      key={caseItem.id}
                      onClick={() => setActiveCase(caseItem)}
                      style={{
                        padding: '16px',
                        background: activeCase?.id === caseItem.id ? '#eff6ff' : 'white',
                        border: `1px solid ${activeCase?.id === caseItem.id ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            background: getStatusColor(caseItem.status) + '15', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getCaseTypeIcon(caseItem.type)}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{caseItem.title}</h4>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>{caseItem.type} • {caseItem.advisor}</p>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '4px 8px', 
                          background: getPriorityColor(caseItem.priority) + '15', 
                          color: getPriorityColor(caseItem.priority), 
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {caseItem.priority}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>{caseItem.progress}%</span>
                        </div>
                        {renderProgressBar(caseItem.progress)}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                        <span>Started: {caseItem.startDate}</span>
                        <span>Updated: {caseItem.lastUpdate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Case Details */}
          <div style={{ flex: 1 }}>
            {activeCase ? (
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
                  borderTopLeftRadius: '12px', 
                  borderTopRightRadius: '12px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>{activeCase.title}</h2>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '6px 12px', 
                          background: getStatusColor(activeCase.status) + '15', 
                          color: getStatusColor(activeCase.status), 
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {getStatusIcon(activeCase.status)}
                          {activeCase.status.replace('-', ' ').toUpperCase()}
                        </div>
                      </div>
                      <p style={{ color: '#1e40af', marginBottom: '4px' }}>{activeCase.description}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#1e40af' }}>
                        <span>Case ID: {activeCase.id}</span>
                        <span>•</span>
                        <span>Advisor: {activeCase.advisor}</span>
                        <span>•</span>
                        <span>Started: {activeCase.startDate}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '4px' }}>Overall Progress</p>
                      <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>{activeCase.progress}%</p>
                      {renderProgressBar(activeCase.progress)}
                    </div>
                  </div>
                </div>

                {/* Case Details Sections */}
                <div style={{ padding: '24px' }}>
                  {/* Timeline Section */}
                  <div style={{ marginBottom: '32px' }}>
                    <div 
                      onClick={() => setExpandedSection(expandedSection === 'timeline' ? null : 'timeline')}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: expandedSection === 'timeline' ? '16px' : 0
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar size={20} color="#3b82f6" />
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Case Timeline</h3>
                      </div>
                      {expandedSection === 'timeline' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    
                    {expandedSection === 'timeline' && (
                      <div style={{ padding: '16px' }}>
                        {caseTimelines[activeCase.id] ? (
                          <div>
                            {caseTimelines[activeCase.id].map(renderTimelineItem)}
                          </div>
                        ) : (
                          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                            Timeline data not available for this case
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div style={{ marginBottom: '32px' }}>
                    <div 
                      onClick={() => setExpandedSection(expandedSection === 'documents' ? null : 'documents')}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: expandedSection === 'documents' ? '16px' : 0
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={20} color="#3b82f6" />
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Required Documents</h3>
                        <span style={{ 
                          padding: '2px 8px', 
                          background: '#3b82f615', 
                          color: '#3b82f6', 
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {requiredDocuments.filter(d => d.status === 'uploaded').length}/{requiredDocuments.length} uploaded
                        </span>
                      </div>
                      {expandedSection === 'documents' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    
                    {expandedSection === 'documents' && (
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                          {requiredDocuments.map(doc => (
                            <div key={doc.id} style={{ 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px', 
                              padding: '16px',
                              background: doc.status === 'uploaded' ? '#f0f9ff' : 'white'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div>
                                  <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{doc.name}</p>
                                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Due: {doc.dueDate}</p>
                                </div>
                                <div style={{ 
                                  padding: '4px 8px', 
                                  background: doc.status === 'uploaded' ? '#10b98115' : 
                                             doc.status === 'in-review' ? '#3b82f615' : '#fef3c7',
                                  color: doc.status === 'uploaded' ? '#10b981' : 
                                         doc.status === 'in-review' ? '#3b82f6' : '#92400e',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  {doc.status === 'uploaded' ? 'Uploaded' : 
                                   doc.status === 'in-review' ? 'In Review' : 'Pending'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {doc.status === 'pending' ? (
                                  <button style={{ 
                                    padding: '8px 16px', 
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <Upload size={14} />
                                    Upload
                                  </button>
                                ) : doc.uploadedDate && (
                                  <p style={{ fontSize: '12px', color: '#10b981' }}>
                                    Uploaded on: {doc.uploadedDate}
                                  </p>
                                )}
                                <button style={{ 
                                  padding: '8px 12px', 
                                  background: '#f3f4f6', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <Eye size={14} color="#6b7280" />
                                  View
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button style={{ 
                        padding: '12px 24px', 
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <MessageSquare size={16} />
                        Message Advisor
                      </button>
                      <button style={{ 
                        padding: '12px 24px', 
                        background: 'white', 
                        color: '#3b82f6', 
                        border: '2px solid #3b82f6', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Calendar size={16} />
                        Schedule Meeting
                      </button>
                      <button style={{ 
                        padding: '12px 24px', 
                        background: '#f3f4f6', 
                        color: '#374151', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Download size={16} />
                        Export Case Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '80px 24px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <FileText size={64} color="#d1d5db" style={{ marginBottom: '24px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Select a Case</h3>
                <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                  Choose a case from the list to view detailed progress, timeline, and required documents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CaseTracking;