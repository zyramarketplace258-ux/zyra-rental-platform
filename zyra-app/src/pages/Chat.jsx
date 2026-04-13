import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const Chat = () => {
  const { chatId } = useParams(); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(); // To auto-scroll to bottom

  useEffect(() => {
    if (!chatId) return;

    // Listen for messages in this specific rental/chat room
    const q = query(
      collection(db, "rentals", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatId]);

  // Auto-scroll logic
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "rentals", chatId, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "User"
      });
      setNewMessage('');
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          
          {/* --- CHAT HEADER --- */}
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-primary p-3 d-flex align-items-center justify-content-between text-white">
              <div className="d-flex align-items-center">
                <button onClick={() => navigate('/dashboard')} className="btn btn-link text-white p-0 me-3">
                  <i className="bi bi-arrow-left fs-4"></i>
                </button>
                <div>
                  <h6 className="fw-bold mb-0">Secure Negotiation</h6>
                  <small className="opacity-75">Order ID: {chatId?.substring(0, 8)}</small>
                </div>
              </div>
              <div className="bg-white bg-opacity-25 rounded-pill px-3 py-1 small">
                <i className="bi bi-shield-fill-check me-1"></i> Encrypted
              </div>
            </div>

            {/* --- MESSAGES AREA --- */}
            <div className="card-body bg-light overflow-auto p-4" style={{ height: '60vh', minHeight: '400px' }}>
              {messages.length === 0 ? (
                <div className="text-center mt-5 text-muted">
                  <i className="bi bi-chat-quote display-4 opacity-25"></i>
                  <p className="mt-2">Start the conversation! <br/> Discuss pickup time or negotiate the price.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === auth.currentUser?.uid;
                  return (
                    <div key={msg.id} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`p-3 rounded-4 shadow-sm position-relative ${
                        isMe ? 'bg-primary text-white' : 'bg-white text-dark'
                      }`} style={{ maxWidth: '80%' }}>
                        <p className="mb-1 small fw-medium">{msg.text}</p>
                        <div className={`text-uppercase ls-1 opacity-50 ${isMe ? 'text-white' : 'text-muted'}`} style={{ fontSize: '9px' }}>
                          {msg.senderName} • {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* --- INPUT AREA --- */}
            <div className="card-footer bg-white border-0 p-3">
              <form onSubmit={sendMessage} className="input-group">
                <input 
                  type="text"
                  className="form-control border-0 bg-light rounded-pill-start px-4 py-2" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type your message..." 
                  autoFocus
                />
                <button type="submit" className="btn btn-primary rounded-pill-end px-4 shadow-sm">
                  <i className="bi bi-send-fill"></i>
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-muted mt-3 small">
            <i className="bi bi-lock-fill me-1"></i>
            Never share your OTP or bank details in the chat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;