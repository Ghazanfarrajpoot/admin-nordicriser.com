import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import {
  collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import {
  CreditCard, DollarSign, Download, Eye, Calendar, CheckCircle,
  Clock, AlertCircle, FileText, Plus, RefreshCw, ArrowUpRight
} from 'lucide-react';

const SEED_INVOICES = [
  { invoiceNum: 'INV-2024-001', date: '2024-01-15', dueDate: '2024-02-15', description: 'Immigration Consultation Services', amount: 2500, currency: 'EUR', status: 'paid', category: 'Consultation', paidDate: '2024-01-20' },
  { invoiceNum: 'INV-2024-002', date: '2024-02-01', dueDate: '2024-03-01', description: 'Document Processing Fees', amount: 1500, currency: 'EUR', status: 'pending', category: 'Processing', paidDate: null },
  { invoiceNum: 'INV-2024-003', date: '2024-02-15', dueDate: '2024-03-15', description: 'Legal Documentation Review', amount: 3200, currency: 'EUR', status: 'overdue', category: 'Legal', paidDate: null },
  { invoiceNum: 'INV-2024-004', date: '2024-01-10', dueDate: '2024-02-10', description: 'Initial Business Setup Consultation', amount: 1800, currency: 'EUR', status: 'paid', category: 'Consultation', paidDate: '2024-01-12' },
  { invoiceNum: 'INV-2024-005', date: '2024-03-01', dueDate: '2024-04-01', description: 'Visa Application Processing', amount: 2750, currency: 'EUR', status: 'pending', category: 'Visa', paidDate: null }
];

const SEED_TRANSACTIONS = [
  { txnNum: 'TXN-001', date: '2024-01-20', description: 'Payment for INV-2024-001', amount: 2500, currency: 'EUR', type: 'credit', method: 'Bank Transfer', status: 'completed' },
  { txnNum: 'TXN-002', date: '2024-01-12', description: 'Payment for INV-2024-004', amount: 1800, currency: 'EUR', type: 'credit', method: 'Credit Card', status: 'completed' },
  { txnNum: 'TXN-003', date: '2024-02-28', description: 'Partial Payment', amount: 800, currency: 'EUR', type: 'credit', method: 'Bank Transfer', status: 'pending' }
];

const PaymentCenter = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const user = auth.currentUser;

  const seedData = async () => {
    const invoicePromises = SEED_INVOICES.map(inv =>
      addDoc(collection(db, 'invoices'), { ...inv, userId: user.uid, createdAt: serverTimestamp() })
    );
    const txnPromises = SEED_TRANSACTIONS.map(tx =>
      addDoc(collection(db, 'transactions'), { ...tx, userId: user.uid, createdAt: serverTimestamp() })
    );
    const [invoiceDocs] = await Promise.all([Promise.all(invoicePromises), Promise.all(txnPromises)]);
    return invoiceDocs;
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [invSnap, txnSnap] = await Promise.all([
        getDocs(query(collection(db, 'invoices'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'transactions'), where('userId', '==', user.uid)))
      ]);

      if (invSnap.empty) {
        await seedData();
        // Re-fetch after seeding
        const [inv2, txn2] = await Promise.all([
          getDocs(query(collection(db, 'invoices'), where('userId', '==', user.uid))),
          getDocs(query(collection(db, 'transactions'), where('userId', '==', user.uid)))
        ]);
        setInvoices(inv2.docs.map(d => ({ id: d.id, ...d.data() })));
        setTransactions(txn2.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setInvoices(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTransactions(txnSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setInvoices(SEED_INVOICES.map((inv, i) => ({ id: `mock-${i}`, ...inv })));
      setTransactions(SEED_TRANSACTIONS.map((tx, i) => ({ id: `mock-tx-${i}`, ...tx })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getStatusColor = (status) => ({ paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444' }[status] || '#6b7280');
  const getStatusIcon = (status) => ({ paid: <CheckCircle size={15} />, pending: <Clock size={15} />, overdue: <AlertCircle size={15} /> }[status] || <Clock size={15} />);

  const formatCurrency = (amount, currency = 'EUR') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const calculateStats = () => {
    const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
    return { paid, pending, overdue, total: paid + pending + overdue };
  };

  const handleMakePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.amount.toString());
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount)) return;
    setProcessingPayment(true);
    try {
      // Update invoice status in Firestore
      if (selectedInvoice.id && !selectedInvoice.id.startsWith('mock-')) {
        await updateDoc(doc(db, 'invoices', selectedInvoice.id), {
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0]
        });
        // Add transaction record
        await addDoc(collection(db, 'transactions'), {
          txnNum: `TXN-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: `Payment for ${selectedInvoice.invoiceNum}`,
          amount: parseFloat(paymentAmount),
          currency: selectedInvoice.currency || 'EUR',
          type: 'credit',
          method: 'Online Payment',
          status: 'completed',
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
      await fetchData();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed: ' + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const stats = calculateStats();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              ← Back to Portal
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>Payment Center</h1>
          </div>
          <button onClick={fetchData} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      <div style={{ padding: '24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '12px', padding: '24px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Total Balance</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(stats.total)}</p>
              </div>
              <DollarSign size={32} opacity={0.8} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div><p style={{ fontSize: '12px', opacity: 0.8 }}>Paid</p><p style={{ fontSize: '16px', fontWeight: '600' }}>{formatCurrency(stats.paid)}</p></div>
              <div><p style={{ fontSize: '12px', opacity: 0.8 }}>Pending</p><p style={{ fontSize: '16px', fontWeight: '600' }}>{formatCurrency(stats.pending)}</p></div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#10b98115', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>Paid Invoices</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{invoices.filter(i => i.status === 'paid').length}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpRight size={14} color="#10b981" />
              <span style={{ fontSize: '12px', color: '#10b981' }}>{formatCurrency(stats.paid)} collected</span>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: stats.overdue > 0 ? '#ef444415' : '#f59e0b15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stats.overdue > 0 ? <AlertCircle size={24} color="#ef4444" /> : <Clock size={24} color="#f59e0b" />}
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>{stats.overdue > 0 ? 'Overdue' : 'Pending'}</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{formatCurrency(stats.overdue > 0 ? stats.overdue : stats.pending)}</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: stats.overdue > 0 ? '#ef4444' : '#f59e0b' }}>
              {invoices.filter(i => i.status === (stats.overdue > 0 ? 'overdue' : 'pending')).length} invoice(s) outstanding
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {['overview', 'invoices', 'transactions', 'payment-methods'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`, color: activeTab === tab ? '#3b82f6' : '#6b7280', fontWeight: activeTab === tab ? '600' : '400', cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize' }}>
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Recent Invoices</h3>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <InvoiceTable invoices={invoices.slice(0, 5)} formatCurrency={formatCurrency} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} onPay={handleMakePayment} />
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>All Invoices ({invoices.length})</h3>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : invoices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                    <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                    <p>No invoices yet</p>
                  </div>
                ) : (
                  <InvoiceTable invoices={invoices} formatCurrency={formatCurrency} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} onPay={handleMakePayment} />
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Transaction History ({transactions.length})</h3>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transactions.map(tx => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div>
                          <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{tx.description}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>{tx.date} • {tx.method}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '600', color: tx.type === 'credit' ? '#10b981' : '#ef4444', marginBottom: '4px' }}>
                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                          </p>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: '600', background: tx.status === 'completed' ? '#10b98115' : '#f59e0b15', color: tx.status === 'completed' ? '#10b981' : '#f59e0b' }}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment-methods' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Payment Methods</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <CreditCard size={24} color="#3b82f6" />
                      <span style={{ padding: '4px 8px', background: '#10b98115', color: '#10b981', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Default</span>
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>•••• •••• •••• 4242</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Visa • Expires 12/26</p>
                  </div>
                  <div style={{ background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '140px' }}>
                    <Plus size={28} color="#9ca3af" style={{ marginBottom: '10px' }} />
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>Make Payment</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>Invoice #{selectedInvoice.invoiceNum}</p>
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#6b7280' }}>Amount Due</span><span style={{ fontWeight: '600' }}>{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#6b7280' }}>Due Date</span><span>{selectedInvoice.dueDate}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Description</span><span style={{ textAlign: 'right', maxWidth: '200px' }}>{selectedInvoice.description}</span></div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Payment Amount</label>
              <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={processPayment} disabled={processingPayment} style={{ flex: 1, padding: '14px', background: processingPayment ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: processingPayment ? 'not-allowed' : 'pointer' }}>
                {processingPayment ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

function InvoiceTable({ invoices, formatCurrency, getStatusColor, getStatusIcon, onPay }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            {['Invoice #', 'Date', 'Description', 'Amount', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{inv.invoiceNum}</td>
              <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{inv.date}</td>
              <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{inv.description}</td>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{formatCurrency(inv.amount, inv.currency)}</td>
              <td style={{ padding: '16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: `${getStatusColor(inv.status)}15`, color: getStatusColor(inv.status), borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {getStatusIcon(inv.status)}{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
              </td>
              <td style={{ padding: '16px' }}>
                <button
                  onClick={() => inv.status !== 'paid' && onPay(inv)}
                  disabled={inv.status === 'paid'}
                  style={{ padding: '7px 14px', background: inv.status === 'paid' ? '#f3f4f6' : 'linear-gradient(135deg, #10b981, #059669)', color: inv.status === 'paid' ? '#9ca3af' : 'white', border: 'none', borderRadius: '6px', cursor: inv.status === 'paid' ? 'default' : 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                  {inv.status === 'paid' ? 'Paid' : 'Pay Now'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentCenter;
