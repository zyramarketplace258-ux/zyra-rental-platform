import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import dashboardBg from '../assets/back.webp'; // Use your preferred image

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

  const deleteRequest = async (requestId) => {
  try {
    // This executes immediately without asking the user
    await deleteDoc(doc(db, "rentals", requestId));
  } catch (error) {
    // Log the error to the console instead of an alert for a cleaner UI
    console.error("Error deleting request:", error.message);
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
    <div style={{
    minHeight: '100vh',
    width: '100%',
    backgroundImage: `linear-gradient(rgba(59, 84, 184, 0), rgba(15, 23, 42, 0.8)), url(${dashboardBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // This keeps the image from scrolling with the content
    paddingTop: '20px'
  }}>
            
            <div className="container mt-4 pb-5">
              {/* Top Profile Bar */}
              <div className="bg-b rounded-4 shadow-sm p-4 mb-4 d-flex justify-content-between align-items-center"style={{
          background: 'rgba(37, 140, 204, 0.84)', // Deep slate with transparency
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
                <div>
          {/* Changed text-muted to text-white and added opacity for that "muted" look if desired */}
          <h5 className="text-white opacity-75 mb-1 small text-uppercase fw-bold">
            Account
          </h5>
          
          {/* Added text-white here */}
          <h2 className="text-white fw-bold mb-0">
            {user?.displayName || "Zyra User"}
          </h2>
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
          <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
  <div className="card-header border-0 py-3" style={{ background: 'rgba(37, 140, 204, 0.84)', color: 'white' }}>
    <h5 className="fw-bold mb-0 text-white"><i className="bi bi-download me-2"></i>Incoming Requests</h5>
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
          <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
  <div className="card-header border-0 py-3" style={{ background: 'rgba(37, 140, 204, 0.84)' }}>
    <h5 className="fw-bold mb-0 text-white"><i className="bi bi-send me-2"></i>My Bookings (Sent)</h5>
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
          {/* 3. INVENTORY */}
<div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: 'rgba(37, 140, 204, 0.84)', border: '1px solid rgba(3, 19, 249, 0.3)' }}>
  <h5 className="fw-bold mb-3 text-white">Inventory</h5>
  <div className="row g-3">
    {myItems.map(item => (
      <div key={item.id} className="col-md-6">
        <div className="d-flex align-items-center border-0 rounded-4 p-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <img src={item.imageUrl} alt="" className="rounded-3" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
          <div className="ms-3 flex-grow-1 overflow-hidden">
            <h6 className="mb-0 text-truncate fw-bold small text-white">{item.title}</h6>
          </div>
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
    </div>
  );
};

export default Dashboard;