import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [myItems, setMyItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // 1. Fetch User Profile for Verification Status
    const userRef = doc(db, "users", user.uid);
    const unsubProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) setProfile(docSnap.data());
    });

    // 2. Fetch My Listings (Items I own)
    const qItems = query(collection(db, "listings"), where("ownerId", "==", user.uid));
    const unsubItems = onSnapshot(qItems, (snap) => {
      setMyItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Fetch Incoming Rental Requests (People wanting my stuff)
    const qReq = query(collection(db, "rentals"), where("ownerId", "==", user.uid));
    const unsubReq = onSnapshot(qReq, (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProfile(); unsubItems(); unsubReq(); };
  }, [user]);

  // Handle Accept/Decline logic
  const handleStatus = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, "rentals", requestId), { status: newStatus });
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  // Delete a specific request record (Cleanup)
  const deleteRequest = async (requestId) => {
    if (window.confirm("Remove this request record from your history?")) {
      try {
        await deleteDoc(doc(db, "rentals", requestId));
      } catch (error) {
        alert("Error deleting request: " + error.message);
      }
    }
  };

  // Delete an entire listing
  const deleteListing = async (itemId) => {
    if (window.confirm("Are you sure you want to permanently remove this listing from Zyra?")) {
      try {
        await deleteDoc(doc(db, "listings", itemId));
      } catch (error) {
        alert("Error deleting listing: " + error.message);
      }
    }
  };

  return (
    <div className="container mt-4 pb-5">
      {/* --- TOP PROFILE BAR --- */}
      <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border-0 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="text-muted mb-1 small text-uppercase fw-bold ls-1">User Account</h5>
          <h2 className="fw-bold mb-0">{user?.displayName || "Zyra User"}</h2>
        </div>
        <div>
          {profile?.isVerified ? (
            <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill shadow-sm">
              <i className="bi bi-patch-check-fill me-1"></i> Verified Vendor
            </span>
          ) : (
            <button onClick={() => navigate('/verify')} className="btn btn-warning btn-sm rounded-pill px-3 shadow-sm fw-bold">
              Verify Identity Now
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* --- LEFT COLUMN: REQUESTS & LISTINGS --- */}
        <div className="col-lg-8">
          
          {/* Incoming Requests Section */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-arrow-down-left-circle me-2 text-primary"></i>Incoming Requests
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th className="ps-4">Item Name</th>
                      <th>Interested Renter</th>
                      <th>Current Status</th>
                      <th className="text-end pe-4">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-5 text-muted">No rental requests found.</td></tr>
                    ) : (
                      requests.map(req => (
                        <tr key={req.id}>
                          <td className="ps-4">
                            <div className="fw-bold text-dark">{req.itemTitle}</div>
                            <small className="text-muted">ID: {req.id.substring(0,6)}...</small>
                          </td>
                          <td className="text-secondary">{req.renterName}</td>
                          <td>
                            <span className={`badge rounded-pill px-3 ${
                              req.status === 'pending' ? 'bg-warning-subtle text-warning border border-warning' : 
                              req.status === 'Approved' ? 'bg-success-subtle text-success border border-success' : 
                              'bg-light text-muted border'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="text-end pe-4">
  <div className="d-flex justify-content-end align-items-center gap-3">
    
    {/* 1. THE STATUS ACTIONS (Left side of the cell) */}
    {req.status === 'pending' ? (
      <div className="btn-group shadow-sm rounded-3">
        <button onClick={() => handleStatus(req.id, 'Approved')} className="btn btn-success btn-sm" title="Approve">
          <i className="bi bi-check-lg"></i>
        </button>
        <button onClick={() => handleStatus(req.id, 'Declined')} className="btn btn-outline-danger btn-sm" title="Decline">
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    ) : (
      <button onClick={() => navigate(`/chat/${req.id}`)} className="btn btn-outline-primary btn-sm rounded-pill px-3">
        <i className="bi bi-chat-dots me-1"></i> Chat
      </button>
    )}

    {/* 2. THE SEPARATE TRASH BUTTON (Always visible for cleanup) */}
 <button 
  onClick={() => deleteRequest(req.id)} 
  className="btn btn-light btn-sm text-danger rounded-circle border" 
  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  title="Remove from history"
>
  <i className="bi bi-trash-fill"></i> 
</button>

  </div>
</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* My Items Grid */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Your Rental Inventory</h5>
              <button onClick={() => navigate('/add-listing')} className="btn btn-primary btn-sm rounded-pill px-3">+ Add New</button>
            </div>
            <div className="row g-3 p-3">
              {myItems.length === 0 ? (
                <div className="col-12 text-center py-4 text-muted small">You haven't listed any items for rent yet.</div>
              ) : (
                myItems.map(item => (
                  <div key={item.id} className="col-md-6">
                    <div className="d-flex align-items-center border rounded-4 p-2 bg-light bg-opacity-50 hover-shadow transition-all">
                      <img src={item.imageUrl} alt="" className="rounded-3 shadow-sm" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                      <div className="ms-3 flex-grow-1 overflow-hidden">
                        <h6 className="mb-0 text-truncate fw-bold">{item.title}</h6>
                        <p className="mb-0 text-primary small fw-bold">Rs. {item.price}/day</p>
                      </div>
                      <button onClick={() => deleteListing(item.id)} className="btn btn-link text-danger p-2"><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: STATS --- */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-dark text-white p-4 rounded-4 mb-4 overflow-hidden position-relative shadow">
            <div className="position-relative z-1">
              <h6 className="opacity-50 fw-bold small text-uppercase mb-3">Live Listings</h6>
              <h1 className="display-4 fw-bold">{myItems.length}</h1>
              <div className="mt-3 pt-3 border-top border-secondary">
                <p className="small mb-0 text-primary fw-bold">
                  Potential Revenue: <span className="text-white">Rs. {myItems.reduce((acc, curr) => acc + Number(curr.price), 0)} / day</span>
                </p>
              </div>
            </div>
            <i className="bi bi-lightning-charge position-absolute bottom-0 end-0 p-3 opacity-10 display-1"></i>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white border">
            <div className="bg-primary-subtle text-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
              <i className="bi bi-shield-lock-fill fs-3"></i>
            </div>
            <h6 className="fw-bold">Trust & Safety</h6>
            <p className="small text-muted mb-4">Verification increases your chances of getting rental requests by 80%.</p>
            {!profile?.isVerified && (
              <button onClick={() => navigate('/verify')} className="btn btn-primary btn-sm rounded-pill w-100 py-2">Start Verification</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;