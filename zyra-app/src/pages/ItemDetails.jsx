import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { 
  doc, getDoc, addDoc, collection, serverTimestamp, 
  query, where, getDocs, onSnapshot, orderBy 
} from 'firebase/firestore';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States for Item & Owner
  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for Rental Logic
  const [requestStatus, setRequestStatus] = useState(null);
  const [rentalId, setRentalId] = useState(null);

  // States for Review System
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchItemAndStatus = async () => {
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const itemData = docSnap.data();
        setItem(itemData);

        if (itemData.ownerId) {
          const ownerRef = doc(db, "users", itemData.ownerId);
          const ownerSnap = await getDoc(ownerRef);
          if (ownerSnap.exists()) setOwner(ownerSnap.data());
        }

        if (auth.currentUser) {
          const q = query(
            collection(db, "rentals"),
            where("itemId", "==", id),
            where("renterId", "==", auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const rentalDoc = querySnapshot.docs[0];
            setRequestStatus(rentalDoc.data().status);
            setRentalId(rentalDoc.id);
          }
        }
      }
      setLoading(false);
    };

    // Real-time listener for Reviews
    const qReviews = query(
      collection(db, "reviews"),
      where("itemId", "==", id),
      orderBy("createdAt", "desc")
    );

    const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    fetchItemAndStatus();
    return () => unsubscribeReviews();
  }, [id]);

  const handleRequest = async () => {
    if (!auth.currentUser) {
      alert("Please login to rent this item.");
      return navigate('/login');
    }
    if (auth.currentUser.uid === item.ownerId) {
      return alert("This is your own listing!");
    }

    try {
      const docRef = await addDoc(collection(db, "rentals"), {
        itemId: id,
        itemTitle: item.title,
        ownerId: item.ownerId,
        renterId: auth.currentUser.uid,
        renterName: auth.currentUser.displayName || "Zyra Customer",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      
      setRequestStatus("pending");
      setRentalId(docRef.id);
      alert("Request Sent!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login to leave a review.");
    if (!newComment.trim()) return alert("Please write a comment.");

    setSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        itemId: id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Zyra User",
        rating: Number(newRating),
        comment: newComment,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      alert("Review error: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="text-center mt-5 py-5"><div className="spinner-border text-primary"></div></div>;
  if (!item) return <div className="container mt-5 text-center"><h3>Item not found.</h3></div>;

  return (
    <div className="container mt-5 pb-5">
      <div className="row g-5">
        {/* Left Side: Product Image & Description */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm overflow-hidden rounded-4">
            <div style={{ aspectRatio: '4 / 3', width: '100%', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
              <img 
                src={item.imageUrl || 'https://via.placeholder.com/800x600'} 
                className="img-fluid w-100 h-100" 
                alt={item.title} 
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-light rounded-4 border border-white shadow-sm">
            <h5 className="fw-bold mb-3"><i className="bi bi-info-circle me-2 text-primary"></i>Description</h5>
            <p className="text-muted lh-lg" style={{ whiteSpace: 'pre-line' }}>{item.description}</p>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="col-lg-5">
          <div className="p-4 bg-white shadow-sm rounded-4 border sticky-top" style={{ top: '20px' }}>
            <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill mb-2">
              {item.category}
            </span>
            <h1 className="fw-bold h2 mb-3 text-dark">{item.title}</h1>
            
            <div className="d-flex align-items-center mb-4">
              <h2 className="text-primary fw-bold mb-0">Rs. {item.price}</h2>
              <span className="text-muted ms-2">/ per day</span>
            </div>

            {/* Verification Badge from owner profile */}
            <div className="card bg-light border-0 rounded-4 p-3 mb-4">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                <span className="fw-medium">{item.location}, Pakistan</span>
              </div>
              <div className="d-flex align-items-center">
                <i className={`bi ${item.ownerVerified ? 'bi-patch-check-fill text-success' : 'bi-patch-exclamation text-muted'} me-2`}></i>
                <span className="text-muted small">
                  {item.ownerVerified ? 'Identity Verified Owner' : 'Identity Verification Pending'}
                </span>
              </div>
            </div>

            {/* Owner Snippet */}
            <div className="d-flex align-items-center p-3 mb-4 border rounded-4 bg-white shadow-sm">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '50px', height: '50px'}}>
                {item.ownerName?.charAt(0) || "U"}
              </div>
              <div className="ms-3">
                <div className="fw-bold text-dark">{item.ownerName || "Owner"}</div>
                <div className="small text-muted">Active Listings: 1</div>
              </div>
            </div>

            {/* Request Buttons */}
            {!requestStatus ? (
              <button onClick={handleRequest} className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-pill shadow mb-3">
                Request to Rent
              </button>
            ) : requestStatus === 'pending' ? (
              <button className="btn btn-warning btn-lg w-100 py-3 fw-bold rounded-pill shadow mb-3" disabled>
                <i className="bi bi-clock-history me-2"></i> Pending Approval
              </button>
            ) : requestStatus === 'Approved' ? (
              <button onClick={() => navigate(`/chat/${rentalId}`)} className="btn btn-success btn-lg w-100 py-3 fw-bold rounded-pill shadow mb-3 text-white">
                <i className="bi bi-chat-fill me-2"></i> Accepted! Start Chat
              </button>
            ) : (
              <button className="btn btn-danger btn-lg w-100 py-3 fw-bold rounded-pill shadow mb-3" disabled>Declined</button>
            )}
          </div>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="mt-5 border-top pt-5">
        <div className="row">
          <div className="col-lg-7">
            <div className="d-flex align-items-center mb-4">
              <h4 className="fw-bold mb-0">Community Reviews</h4>
              <span className="badge bg-dark ms-3 rounded-pill">{reviews.length}</span>
            </div>
            
            {/* Review Form */}
            {auth.currentUser ? (
              <div className="card border-0 bg-light rounded-4 p-4 mb-5 shadow-sm">
                <h6 className="fw-bold mb-3">Rate your experience</h6>
                <form onSubmit={handleReviewSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <select className="form-select border-0 shadow-sm rounded-3" value={newRating} onChange={(e) => setNewRating(e.target.value)}>
                        <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                        <option value="4">⭐⭐⭐⭐ 4/5</option>
                        <option value="3">⭐⭐⭐ 3/5</option>
                        <option value="2">⭐⭐ 2/5</option>
                        <option value="1">⭐ 1/5</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <textarea 
                        className="form-control border-0 shadow-sm rounded-3" 
                        rows="3" 
                        placeholder="Was the item in good condition? Was the owner helpful?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-dark rounded-pill px-4 fw-bold" disabled={submittingReview}>
                        {submittingReview ? "Posting..." : "Submit Review"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="alert alert-warning rounded-4 border-0">Please login to write a review.</div>
            )}

            {/* Review List */}
            <div className="review-feed">
              {reviews.length > 0 ? reviews.map((rev) => (
                <div key={rev.id} className="p-4 mb-3 bg-white border rounded-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" style={{width: '32px', height: '32px', fontSize: '12px'}}>
                        {rev.userName?.charAt(0)}
                      </div>
                      <span className="fw-bold text-dark">{rev.userName}</span>
                    </div>
                    <span className="text-warning">
                      {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </span>
                  </div>
                  <p className="text-muted small mb-0">{rev.comment}</p>
                </div>
              )) : (
                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                  <i className="bi bi-chat-dots text-muted display-6"></i>
                  <p className="text-muted mt-2">No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;