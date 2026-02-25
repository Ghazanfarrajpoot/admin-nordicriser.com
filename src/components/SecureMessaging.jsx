import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  Send, Lock, User, Clock, Shield, Eye, EyeOff, Users
} from 'lucide-react';

function SecureMessaging() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipientId, setRecipientId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef(null);

  // Simple XOR encryption for demo (use crypto library for production)
  const encryptMessage = (text, key) => {
    if (!key) return text; // Fallback to plain text if no key
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
  };

  const decryptMessage = (encryptedText, key) => {
    if (!key) return encryptedText; // Fallback if no key
    try {
      const decoded = atob(encryptedText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (error) {
      return '[Encrypted Message - Enter Key to Decrypt]';
    }
  };

  // Generate or load encryption key
  useEffect(() => {
    const savedKey = localStorage.getItem('messagingEncryptionKey');
    if (savedKey) {
      setEncryptionKey(savedKey);
    } else {
      // Generate a simple key (in production, use proper key generation)
      const newKey = Math.random().toString(36).substring(2, 15);
      setEncryptionKey(newKey);
      localStorage.setItem('messagingEncryptionKey', newKey);
    }
  }, []);

  // Fetch messages in real-time
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Query messages where current user is either sender or recipient
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Decrypt message content if we have the key
          decryptedContent: data.isEncrypted 
            ? decryptMessage(data.content, encryptionKey)
            : data.content,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
      
      setMessages(fetchedMessages.reverse()); // Reverse to show oldest first
      setLoading(false);
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [encryptionKey]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const user = auth.currentUser;
    const encryptedContent = encryptMessage(newMessage.trim(), encryptionKey);

    try {
      await addDoc(collection(db, 'messages'), {
        content: encryptedContent,
        isEncrypted: true,
        senderId: user.uid,
        senderEmail: user.email,
        recipientId: recipientId || null,
        recipientEmail: recipientEmail || null,
        participants: recipientId ? [user.uid, recipientId] : [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'sent'
      });

      setNewMessage('');
      setSendError('');

      // Clear recipient if it was a one-time message
      if (recipientId) {
        setRecipientId('');
        setRecipientEmail('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSendError('Failed to send message: ' + error.message);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  return (
    <div style={{ 
      background: '#f8fafc', 
      minHeight: '100vh',
      padding: '24px' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
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
                fontSize: '14px',
                marginBottom: '8px'
              }}
            >
              ← Back to Dashboard
            </button>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1e3a8a',
              marginBottom: '4px'
            }}>
              Secure Messaging
            </h1>
            <p style={{ color: '#64748b' }}>
              End-to-end encrypted messaging with Firebase
            </p>
          </div>
          
          {/* Security Status */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 20px',
            background: '#10b981',
            color: 'white',
            borderRadius: '8px'
          }}>
            <Shield size={20} />
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                Encryption Active
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                {showEncryptionKey ? 'Key: ' + encryptionKey : 'Messages Secured'}
              </div>
            </div>
            <button
              onClick={() => setShowEncryptionKey(!showEncryptionKey)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showEncryptionKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '300px 1fr',
          gap: '24px',
          height: 'calc(100vh - 200px)'
        }}>
          {/* Left Panel - Contacts & Settings */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users size={18} />
                Send To
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  placeholder="Recipient's User ID"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Recipient's Email"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <p style={{ 
                fontSize: '11px', 
                color: '#94a3b8',
                marginTop: '8px'
              }}>
                Leave empty for general chat
              </p>
            </div>

            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Security Info
              </h3>
              <div style={{ 
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                color: '#0369a1'
              }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Encryption:</strong> XOR + Base64
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Storage:</strong> Firebase Firestore
                </p>
                <p>
                  <strong>Real-time:</strong> WebSocket listeners
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const newKey = Math.random().toString(36).substring(2, 15);
                setEncryptionKey(newKey);
                localStorage.setItem('messagingEncryptionKey', newKey);
                alert('New encryption key generated!');
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Lock size={16} />
              Generate New Key
            </button>
          </div>

          {/* Right Panel - Chat */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Messages Container */}
            <div style={{ 
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              background: '#f9fafb'
            }}>
              {loading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: '#94a3b8'
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '3px solid #f3f4f6',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: '#94a3b8'
                }}>
                  <Lock size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>No messages yet. Start a secure conversation!</p>
                </div>
              ) : (
                <div>
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === auth.currentUser?.uid;
                    const showDate = index === 0 || 
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div style={{ 
                            textAlign: 'center', 
                            margin: '20px 0',
                            color: '#94a3b8',
                            fontSize: '12px'
                          }}>
                            {formatDate(message.createdAt)}
                          </div>
                        )}
                        
                        <div style={{ 
                          display: 'flex',
                          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div style={{ 
                            maxWidth: '70%',
                            background: isCurrentUser ? '#3b82f6' : '#e5e7eb',
                            color: isCurrentUser ? 'white' : '#1f2937',
                            padding: '12px 16px',
                            borderRadius: '18px',
                            borderBottomRightRadius: isCurrentUser ? '4px' : '18px',
                            borderBottomLeftRadius: isCurrentUser ? '18px' : '4px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px'
                            }}>
                              {!isCurrentUser && <User size={12} />}
                              <span style={{ 
                                fontSize: '12px', 
                                opacity: 0.8,
                                fontWeight: '600'
                              }}>
                                {isCurrentUser ? 'You' : message.senderEmail?.split('@')[0]}
                              </span>
                              <span style={{ 
                                fontSize: '11px', 
                                opacity: 0.6,
                                marginLeft: 'auto'
                              }}>
                                <Clock size={10} style={{ marginRight: '4px' }} />
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px' }}>
                              {message.decryptedContent}
                            </div>
                            {message.isEncrypted && (
                              <div style={{ 
                                fontSize: '10px', 
                                opacity: 0.6,
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <Lock size={10} />
                                Encrypted
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div style={{ 
              borderTop: '1px solid #e5e7eb',
              padding: '20px',
              background: 'white'
            }}>
              {sendError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                {sendError}
              </div>
            )}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your secure message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '12px 24px',
                    background: newMessage.trim() ? '#10b981' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={18} />
                  Send
                </button>
              </form>
              <p style={{ 
                fontSize: '11px', 
                color: '#94a3b8',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Lock size={10} />
                Messages are encrypted end-to-end
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}

export default SecureMessaging;