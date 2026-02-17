import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    // 1. Find users who are NOT verified yet
    const q = query(collection(db, "users"), where("isVerified", "==", false));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const approveUser = async (userId) => {
    const userRef = doc(db, "users", userId);
    try {
      await updateDoc(userRef, { isVerified: true });
      alert("User Approved! They can now list items safely.");
    } catch (error) {
      alert("Error approving user.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin: Identity Verification Queue</h1>
      <p>Review CNICs and approve vendors for the Pakistan market.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={tdStyle}>CNIC Number</th>
            <th style={tdStyle}>Document</th>
            <th style={tdStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={tdStyle}>{user.cnic}</td>
              <td style={tdStyle}>
                <a href={user.cnicImageUrl} target="_blank" rel="noreferrer">View CNIC Image</a>
              </td>
              <td style={tdStyle}>
                <button onClick={() => approveUser(user.id)} style={approveBtn}>Approve Vendor</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pendingUsers.length === 0 && <p style={{ marginTop: '20px' }}>No pending verifications. Good job!</p>}
    </div>
  );
};

const tdStyle = { padding: '12px', border: '1px solid #ddd' };
const approveBtn = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' };

export default AdminPanel;