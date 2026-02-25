import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  Eye, 
  Filter, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  BarChart3,
  Plus,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

const PaymentCenter = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const user = auth.currentUser;

  // Mock data - in real app, fetch from Firestore
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      description: 'Immigration Consultation Services',
      amount: 2500,
      currency: 'EUR',
      status: 'paid',
      category: 'Consultation',
      paidDate: '2024-01-20'
    },
    {
      id: 'INV-2024-002',
      date: '2024-02-01',
      dueDate: '2024-03-01',
      description: 'Document Processing Fees',
      amount: 1500,
      currency: 'EUR',
      status: 'pending',
      category: 'Processing',
      paidDate: null
    },
    {
      id: 'INV-2024-003',
      date: '2024-02-15',
      dueDate: '2024-03-15',
      description: 'Legal Documentation Review',
      amount: 3200,
      currency: 'EUR',
      status: 'overdue',
      category: 'Legal',
      paidDate: null
    },
    {
      id: 'INV-2024-004',
      date: '2024-01-10',
      dueDate: '2024-02-10',
      description: 'Initial Business Setup Consultation',
      amount: 1800,
      currency: 'EUR',
      status: 'paid',
      category: 'Consultation',
      paidDate: '2024-01-12'
    },
    {
      id: 'INV-2024-005',
      date: '2024-03-01',
      dueDate: '2024-04-01',
      description: 'Visa Application Processing',
      amount: 2750,
      currency: 'EUR',
      status: 'pending',
      category: 'Visa',
      paidDate: null
    }
  ];

  const mockTransactions = [
    {
      id: 'TXN-001',
      date: '2024-01-20',
      description: 'Payment for INV-2024-001',
      amount: 2500,
      currency: 'EUR',
      type: 'credit',
      method: 'Bank Transfer',
      status: 'completed'
    },
    {
      id: 'TXN-002',
      date: '2024-01-12',
      description: 'Payment for INV-2024-004',
      amount: 1800,
      currency: 'EUR',
      type: 'credit',
      method: 'Credit Card',
      status: 'completed'
    },
    {
      id: 'TXN-003',
      date: '2024-02-28',
      description: 'Partial Payment',
      amount: 800,
      currency: 'EUR',
      type: 'credit',
      method: 'Bank Transfer',
      status: 'pending'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In real app, fetch from Firestore
      setTimeout(() => {
        setInvoices(mockInvoices);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'overdue': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  const calculateStats = () => {
    const paid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const pending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
    const overdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
    const total = invoices.reduce((sum, i) => sum + i.amount, 0);
    
    return { paid, pending, overdue, total };
  };

  const handleMakePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.amount.toString());
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    if (!paymentAmount || isNaN(paymentAmount)) {
      alert('Please enter a valid amount');
      return;
    }

    // In real app, integrate with Stripe/Payment gateway
    alert(`Payment of ${formatCurrency(parseFloat(paymentAmount), selectedInvoice?.currency)} initiated for invoice ${selectedInvoice?.id}`);
    
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    
    // Simulate payment processing
    setTimeout(() => {
      alert('Payment processed successfully!');
      fetchData(); // Refresh data
    }, 2000);
  };

  const stats = calculateStats();

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
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>Payment Center</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={fetchData}
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

      {/* Stats Overview */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
            borderRadius: '12px', 
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Total Balance</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(stats.total)}</p>
              </div>
              <DollarSign size={32} opacity={0.8} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Paid</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>{formatCurrency(stats.paid)}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Pending</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>{formatCurrency(stats.pending)}</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#10b98115', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Paid Invoices</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{invoices.filter(i => i.status === 'paid').length}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpRight size={16} color="#10b981" />
              <span style={{ fontSize: '12px', color: '#10b981' }}>All payments up to date</span>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#f59e0b15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} color="#f59e0b" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Pending</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{formatCurrency(stats.pending)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#f59e0b" />
              <span style={{ fontSize: '12px', color: '#f59e0b' }}>{invoices.filter(i => i.status === 'pending').length} invoices pending</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {['overview', 'invoices', 'transactions', 'payment-methods'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '16px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`,
                  color: activeTab === tab ? '#3b82f6' : '#6b7280',
                  fontWeight: activeTab === tab ? '600' : '400',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Recent Invoices</h3>
                  <button 
                    style={{ 
                      padding: '10px 20px', 
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
                    }}
                  >
                    <Plus size={16} />
                    New Invoice Request
                  </button>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Invoice #</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Description</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.slice(0, 5).map(invoice => (
                          <tr key={invoice.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{invoice.id}</td>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{invoice.date}</td>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{invoice.description}</td>
                            <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{formatCurrency(invoice.amount, invoice.currency)}</td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '6px 12px', 
                                background: `${getStatusColor(invoice.status)}15`, 
                                color: getStatusColor(invoice.status), 
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {getStatusIcon(invoice.status)}
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleMakePayment(invoice)}
                                  style={{ 
                                    padding: '8px 16px', 
                                    background: invoice.status === 'paid' ? '#e5e7eb' : 'linear-gradient(135deg, #10b981, #059669)', 
                                    color: invoice.status === 'paid' ? '#9ca3af' : 'white', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: invoice.status === 'paid' ? 'default' : 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                  disabled={invoice.status === 'paid'}
                                >
                                  {invoice.status === 'paid' ? 'Paid' : 'Pay Now'}
                                </button>
                                <button 
                                  style={{ 
                                    padding: '8px', 
                                    background: '#f3f4f6', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Eye size={16} color="#6b7280" />
                                </button>
                                <button 
                                  style={{ 
                                    padding: '8px', 
                                    background: '#f3f4f6', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Download size={16} color="#6b7280" />
                                </button>
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

            {activeTab === 'invoices' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>All Invoices</h3>
                {/* Full invoices table would go here */}
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Full invoice management interface</p>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Transaction History</h3>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '24px' }}>
                  {mockTransactions.map(transaction => (
                    <div key={transaction.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{transaction.description}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>{transaction.date} • {transaction.method}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                          fontWeight: '600', 
                          color: transaction.type === 'credit' ? '#10b981' : '#ef4444',
                          marginBottom: '4px'
                        }}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '4px 8px', 
                          background: transaction.status === 'completed' ? '#10b98115' : '#f59e0b15', 
                          color: transaction.status === 'completed' ? '#10b981' : '#f59e0b', 
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {transaction.status === 'completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payment-methods' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Payment Methods</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <CreditCard size={24} color="#3b82f6" />
                      <div style={{ 
                        padding: '4px 8px', 
                        background: '#10b98115', 
                        color: '#10b981', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        Default
                      </div>
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>•••• •••• •••• 4242</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Visa • Expires 12/25</p>
                    <button style={{ 
                      padding: '8px 16px', 
                      background: '#f3f4f6', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      Update Card
                    </button>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', 
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '12px', 
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Plus size={32} color="#9ca3af" style={{ marginBottom: '12px' }} />
                    <p style={{ fontWeight: '600', color: '#4b5563' }}>Add Payment Method</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Make Payment</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Invoice #{selectedInvoice.id}</p>
            
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#6b7280' }}>Amount Due:</span>
                <span style={{ fontWeight: '600', color: '#1f2937' }}>{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#6b7280' }}>Due Date:</span>
                <span style={{ color: '#1f2937' }}>{selectedInvoice.dueDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Description:</span>
                <span style={{ color: '#1f2937', textAlign: 'right' }}>{selectedInvoice.description}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Payment Amount</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                placeholder="Enter amount"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  setPaymentAmount('');
                }}
                style={{ 
                  flex: 1,
                  padding: '14px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                style={{ 
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

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

export default PaymentCenter;