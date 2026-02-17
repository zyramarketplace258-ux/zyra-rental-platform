import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Dashboard = () => {
  const [myItems, setMyItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null); // To store isVerified status
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // 1. Fetch User Profile (for Verification Status)
    const userRef = doc(db, "users", user.uid);
    const unsubProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    });

    // 2. Fetch My Listings
    const qItems = query(collection(db, "listings"), where("ownerId", "==", user.uid));
    const unsubItems = onSnapshot(qItems, (snap) => {
      setMyItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Fetch Incoming Rental Requests
    const qReq = query(collection(db, "rentals"), where("ownerId", "==", user.uid));
    const unsubReq = onSnapshot(qReq, (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { 
      unsubProfile(); 
      unsubItems(); 
      unsubReq(); 
    };
  }, [user]);

  const handleStatus = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, "rentals", requestId), { status: newStatus });
      alert(`Request ${newStatus}`);
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header with Verification Tick */}
      <div className="d-flex align-items-center mb-4">
        <h2 className="fw-bold m-0">User Dashboard</h2>
        {profile?.isVerified ? (
          <span className="ms-3 badge bg-success rounded-pill px-3">
            <i className="bi bi-patch-check-fill me-1"></i> Verified Vendor
          </span>
        ) : (
          <span className="ms-3 badge bg-warning text-dark rounded-pill px-3">
            Verification Pending
          </span>
        )}
      </div>
      
      <div className="row">
        {/* Section 1: Incoming Requests */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-white py-3 border-bottom-0">
              <h5 className="mb-0 fw-bold">Rental Requests Received</h5>
            </div>
            <div className="card-body">
              {requests.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No rental requests yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Item Name</th>
                        <th>Renter Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => (
                        <tr key={req.id}>
                          <td className="fw-semibold">{req.itemTitle}</td>
                          <td>{req.renterName}</td>
                          <td>
                            <span className={`badge rounded-pill bg-${
                              req.status === 'pending' ? 'warning text-dark' : 
                              req.status === 'Approved' ? 'success' : 'danger'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td>
                            {req.status === 'pending' && (
                              <div className="btn-group">
                                <button onClick={() => handleStatus(req.id, 'Approved')} className="btn btn-sm btn-success">Accept</button>
                                <button onClick={() => handleStatus(req.id, 'Declined')} className="btn btn-sm btn-outline-danger">Decline</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Quick Stats */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-primary text-white p-4 mb-4 rounded-4">
            <h5 className="opacity-75">My Active Listings</h5>
            <h1 className="display-3 fw-bold mb-0">{myItems.length}</h1>
          </div>
          
          {!profile?.isVerified && (
            <div className="alert alert-info border-0 shadow-sm rounded-4 p-4">
              <h6><strong>Identity Status</strong></h6>
              <p className="small mb-2">Your identity is being reviewed. Verified users get higher trust in the marketplace.</p>
              <button className="btn btn-info btn-sm w-100" disabled>Pending Approval</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;