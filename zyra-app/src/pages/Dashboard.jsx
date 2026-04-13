import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [myItems, setMyItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) setProfile(docSnap.data());
    });

    const unsubItems = onSnapshot(query(collection(db, "listings"), where("ownerId", "==", user.uid)), (snap) => {
      setMyItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubReq = onSnapshot(query(collection(db, "rentals"), where("ownerId", "==", user.uid)), (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBookings = onSnapshot(query(collection(db, "rentals"), where("renterId", "==", user.uid)), (snap) => {
      setMyBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProfile(); unsubItems(); unsubReq(); unsubBookings(); };
  }, [user]);

  const handleStatus = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, "rentals", requestId), { status: newStatus });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const deleteRequest = async (requestId, type) => {
    const message = type === 'sent' ? "Cancel this rental request?" : "Remove this request from your history?";
    if (window.confirm(message)) {
      try {
        await deleteDoc(doc(db, "rentals", requestId));
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  const deleteListing = async (itemId) => {
    if (window.confirm("Permanently delete this item from the marketplace?")) {
      try {
        await deleteDoc(doc(db, "listings", itemId));
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  return (
    <div className="container mt-4 pb-5">
      {/* Top Profile Bar */}
      <div className="bg-white rounded-4 shadow-sm p-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="text-muted mb-1 small text-uppercase fw-bold">Account</h5>
          <h2 className="fw-bold mb-0">{user?.displayName || "Zyra User"}</h2>
        </div>
        <div>
          {profile?.isVerified ? (
            <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill shadow-sm">
              Verified Vendor
            </span>
          ) : (
            <button onClick={() => navigate('/verify')} className="btn btn-warning btn-sm rounded-pill px-3 fw-bold">Verify Identity</button>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          
          {/* 1. INCOMING REQUESTS (FOR OWNER) */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0 text-primary"><i className="bi bi-download me-2"></i>Incoming Requests</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-4">Item</th>
                      <th>Renter</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No requests yet.</td></tr>
                    ) : (
                      requests.map(req => (
                        <tr key={req.id}>
                          <td className="ps-4 fw-bold">{req.itemTitle}</td>
                          <td className="text-muted">{req.renterName}</td>
                          <td>
                            <span className={`badge rounded-pill ${req.status === 'Approved' ? 'bg-success' : req.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              {req.status === 'pending' && (
                                <>
                                  <button onClick={() => handleStatus(req.id, 'Approved')} className="btn btn-success btn-sm"><i className="bi bi-check-lg"></i></button>
                                  <button onClick={() => handleStatus(req.id, 'Declined')} className="btn btn-outline-danger btn-sm"><i className="bi bi-x-lg"></i></button>
                                </>
                              )}
                              {req.status === 'Approved' && (
                                <button onClick={() => navigate(`/chat/${req.id}`)} className="btn btn-primary btn-sm rounded-pill px-3">Chat</button>
                              )}
                              {/* DELETE BUTTON FOR OWNER */}
                              <button onClick={() => deleteRequest(req.id, 'received')} className="btn btn-light btn-sm text-danger border"><i className="bi bi-trash"></i></button>
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

          {/* 2. MY RENTAL BOOKINGS (FOR RENTER) */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0 text-info"><i className="bi bi-send me-2"></i>My Bookings (Sent)</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <tbody>
                    {myBookings.length === 0 ? (
                      <tr><td className="text-center py-4 text-muted">You haven't requested anything.</td></tr>
                    ) : (
                      myBookings.map(book => (
                        <tr key={book.id}>
                          <td className="ps-4 fw-bold">{book.itemTitle}</td>
                          <td>
                            <span className={`badge rounded-pill ${book.status === 'Approved' ? 'bg-success' : 'bg-secondary'}`}>{book.status}</span>
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              {book.status === 'Approved' && (
                                <button onClick={() => navigate(`/chat/${book.id}`)} className="btn btn-primary btn-sm rounded-pill px-3">Chat</button>
                              )}
                              {/* DELETE/CANCEL BUTTON FOR RENTER */}
                              <button onClick={() => deleteRequest(book.id, 'sent')} className="btn btn-outline-danger btn-sm rounded-pill px-3 border-0">
                                <i className="bi bi-trash-fill"></i> {book.status === 'pending' ? 'Cancel' : 'Remove'}
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

          {/* 3. INVENTORY */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3">Inventory</h5>
            <div className="row g-3">
              {myItems.map(item => (
                <div key={item.id} className="col-md-6">
                  <div className="d-flex align-items-center border rounded-4 p-2 bg-light">
                    <img src={item.imageUrl} alt="" className="rounded-3" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                    <div className="ms-3 flex-grow-1 overflow-hidden">
                      <h6 className="mb-0 text-truncate fw-bold small">{item.title}</h6>
                    </div>
                    {/* DELETE BUTTON FOR LISTING */}
                    <button onClick={() => deleteListing(item.id)} className="btn btn-link text-danger p-1"><i className="bi bi-trash-fill"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Stats Column */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-dark text-white p-4 rounded-4 mb-4">
            <h6 className="opacity-50 small fw-bold mb-2">My Items</h6>
            <h1 className="fw-bold text-primary">{myItems.length}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;