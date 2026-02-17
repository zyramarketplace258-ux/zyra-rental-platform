import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const Chat = () => {
  const { chatId } = useParams(); // Gets the unique chat ID from the URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // 1. Reference the messages inside this specific chat
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    // 2. Listen for new messages in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: newMessage,
      createdAt: serverTimestamp(),
      senderId: auth.currentUser?.uid || "Anonymous",
      senderName: auth.currentUser?.displayName || "User"
    });

    setNewMessage('');
  };

  return (
    <div style={containerStyle}>
      <div style={chatBoxStyle}>
        {messages.map((msg) => (
          <div key={msg.id} style={msg.senderId === auth.currentUser?.uid ? myMsgStyle : theirMsgStyle}>
            <p style={{ margin: 0 }}>{msg.text}</p>
            <small style={{ fontSize: '10px' }}>{msg.senderName}</small>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={formStyle}>
        <input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Negotiate price..." 
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>Send</button>
      </form>
    </div>
  );
};

// Simple Styles
const containerStyle = { maxWidth: '500px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '8px' };
const chatBoxStyle = { height: '400px', overflowY: 'scroll', padding: '20px', background: '#f9f9f9' };
const myMsgStyle = { textAlign: 'right', background: '#dcf8c6', padding: '10px', borderRadius: '10px', marginBottom: '10px', marginLeft: '20%' };
const theirMsgStyle = { textAlign: 'left', background: '#fff', padding: '10px', borderRadius: '10px', marginBottom: '10px', marginRight: '20%', border: '1px solid #eee' };
const formStyle = { display: 'flex', padding: '10px', borderTop: '1px solid #ddd' };
const inputStyle = { flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };
const btnStyle = { marginLeft: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' };

export default Chat;