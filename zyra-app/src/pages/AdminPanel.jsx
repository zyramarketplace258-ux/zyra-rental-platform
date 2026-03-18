import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const AdminPanel = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

 const toggleApprove = async (userId, currentStatus) => {
  const action = !currentStatus ? "Approve" : "Revoke";
  if (window.confirm(`Are you sure you want to ${action} this user and update all their listings?`)) {
    try {
      // 1. Update the User Document
      await updateDoc(doc(db, "users", userId), { 
        isVerified: !currentStatus,
        verificationStatus: !currentStatus ? "Approved" : "Revoked" 
      });

      // 2. Update ALL Listings belonging to this user
      const { getDocs, where, query, collection, writeBatch } = await import("firebase/firestore");
      const q = query(collection(db, "listings"), where("ownerId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((listingDoc) => {
        batch.update(listingDoc.ref, { ownerVerified: !currentStatus });
      });
      
      await batch.commit(); // This updates everything in one go!
      
      alert(`User and all their listings have been ${action}d.`);
    } catch (error) {
      alert("Admin Error: " + error.message);
    }
  }
};

  // Filter Logic
  const filteredUsers = allUsers.filter(user => {
    if (user.email === 'shahzadraza909@gmail.com') return false;
    if (filter === 'pending') return !user.isVerified;
    if (filter === 'verified') return user.isVerified;
    return true;
  });

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '80vh'}}>
      <div className="spinner-grow text-primary mb-3"></div>
      <h5 className="text-muted fw-light">Accessing Secure Records...</h5>
    </div>
  );

  return (
    <div className="container py-5">
      {/* Stats Overview */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-primary border-5">
            <h6 className="text-muted small fw-bold">TOTAL USERS</h6>
            <h2 className="fw-bold mb-0">{allUsers.length-1}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-warning border-5">
            <h6 className="text-muted small fw-bold">PENDING VERIFICATION</h6>
            <h2 className="fw-bold mb-0 text-warning">{allUsers.filter(u => !u.isVerified).length}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white">
            <h6 className="opacity-50 small fw-bold">VERIFIED VENDORS</h6>
            <h2 className="fw-bold mb-0 text-success">{allUsers.filter(u => u.isVerified).length-1}</h2>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="bg-primary p-4 d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 className="mb-0 fw-bold text-white">Verification Queue</h2>
            <p className="mb-0 text-white opacity-75">Review CNIC documents for platform safety</p>
          </div>
          {/* Filter Controls */}
          <div className="btn-group bg-white p-1 rounded-pill mt-3 mt-lg-0 shadow-sm">
            {['all', 'pending', 'verified'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn-sm rounded-pill px-4 fw-bold text-capitalize ${filter === f ? 'btn-primary shadow' : 'btn-white border-0 text-muted'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3">User Profile</th>
                <th>Identity Document</th>
                <th>Status</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5">No users found in this category.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="ps-4 py-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-3 me-3 text-primary fw-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark fs-5">{user.name || "Unnamed User"}</div>
                          <div className="small text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-secondary mb-1">
                        <i className="bi bi-person-vcard me-2"></i>{user.cnic || "No CNIC Entered"}
                      </div>
                      {user.cnicImageUrl ? (
                        <a 
                          href={user.cnicImageUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-sm btn-info text-white rounded-pill px-3 py-1 fw-bold fs-7 shadow-sm"
                        >
                          <i className="bi bi-eye-fill me-1"></i> Preview Image
                        </a>
                      ) : (
                        <span className="badge bg-light text-muted border px-3">No Document</span>
                      )}
                    </td>
                    <td>
                      {user.isVerified ? 
                        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
                          <i className="bi bi-check-circle-fill me-1"></i> Verified
                        </span> : 
                        <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-2 rounded-pill">
                          <i className="bi bi-clock-history me-1"></i> Under Review
                        </span>
                      }
                    </td>
                    <td className="text-end pe-4">
                      <button 
                        onClick={() => toggleApprove(user.id, user.isVerified)} 
                        className={`btn btn-sm fw-bold rounded-pill px-4 py-2 transition-all ${user.isVerified ? 'btn-outline-danger' : 'btn-success shadow-sm'}`}
                      >
                        {user.isVerified ? "Revoke Access" : "Approve Identity"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;