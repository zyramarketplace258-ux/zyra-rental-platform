import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ItemDetails = () => {
const { id } = useParams();
const navigate = useNavigate();
const [item, setItem] = useState(null);
const [owner, setOwner] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchItemAndOwner = async () => {
const docRef = doc(db, "listings", id);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
const itemData = docSnap.data();
setItem(itemData);
// Fetch Owner's specific details (to show verification status)
if (itemData.ownerId) {
const ownerRef = doc(db, "users", itemData.ownerId);
const ownerSnap = await getDoc(ownerRef);
if (ownerSnap.exists()) setOwner(ownerSnap.data());
}
}
setLoading(false);
};
fetchItemAndOwner();
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
await addDoc(collection(db, "rentals"), {
itemId: id,
itemTitle: item.title,
ownerId: item.ownerId,
renterId: auth.currentUser.uid,
renterName: auth.currentUser.displayName || "Zyra Customer",
status: "pending",
createdAt: serverTimestamp(),
});
alert("Request Sent! The owner will contact you shortly.");
} catch (err) {
alert("Error: " + err.message);
}
};

if (loading) return <div className="text-center mt-5 py-5"><div className="spinner-border text-primary"></div></div>;
if (!item) return <div className="container mt-5 text-center"><h3>Item not found.</h3></div>;

return (
<div className="container mt-5 pb-5">
<div className="row g-5">
{/* Left Side: Product Image */}
<div className="col-lg-7">
  <div className="card border-0 shadow-sm overflow-hidden rounded-4">
    <div style={{ 
      aspectRatio: '4 / 3', // Forces a standard shape (e.g., 4:3 or 16:9)
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#f8f9fa' // Optional: subtle background for transparent images
    }}>
      <img 
        src={item.imageUrl || 'https://via.placeholder.com/800x600'} 
        className="img-fluid w-100 h-100" 
        alt={item.title} 
        style={{ 
          objectFit: 'cover', // Fills the area without stretching
          objectPosition: 'center' // Keeps the focus in the middle
        }}
      />
    </div>
  </div>

  <div className="mt-4 p-4 bg-light rounded-4 border border-white shadow-sm">
    <h5 className="fw-bold mb-3">
      <i className="bi bi-info-circle me-2 text-primary"></i>Description
    </h5>
    <p className="text-muted lh-lg" style={{ whiteSpace: 'pre-line' }}>
      {item.description}
    </p>
  </div>
</div>

{/* Right Side: Details & Actions */}
<div className="col-lg-5">
<div className="p-4 bg-white shadow-sm rounded-4 border">
<span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill mb-2">
{item.category}
</span>
<h1 className="fw-bold display-6 mb-3 text-dark">{item.title}</h1>
<div className="d-flex align-items-center mb-4">
<h2 className="text-primary fw-bold mb-0">Rs. {item.price}</h2>
<span className="text-muted ms-2">/ per day</span>
</div>

<div className="card bg-light border-0 rounded-4 p-3 mb-4">
<div className="d-flex align-items-center mb-2">
<i className="bi bi-geo-alt-fill text-danger me-2"></i>
<span className="fw-medium">{item.location}, Pakistan</span>
</div>
<div className="d-flex align-items-center">
<i className="bi bi-shield-check text-success me-2"></i>
<span className="text-muted small">Identity Verified Listing</span>
</div>
</div>

{/* Owner Profile Snippet */}
<div className="d-flex align-items-center p-3 mb-4 border rounded-4 bg-white shadow-sm">
<div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{width: '50px', height: '50px'}}>
{owner?.name?.charAt(0) || "Z"}
</div>
<div className="ms-3">
<div className="fw-bold text-dark">{owner?.name || "Verified Owner"}</div>
<div className="small text-muted">
{owner?.isVerified ? '✅ Trusted Vendor' : 'Member since 2026'}
</div>
</div>
</div>

<button 
onClick={handleRequest} 
className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-pill shadow mb-3"
>
Request to Rent
</button>
<button className="btn btn-outline-dark btn-lg w-100 py-3 fw-bold rounded-pill shadow-sm">
<i className="bi bi-chat-text me-2"></i>Message Owner
</button>

<div className="mt-4 p-3 border-top">
<p className="small text-muted text-center mb-0">
<i className="bi bi-lock me-1"></i> Your security is our priority. Deal only through ZYRA.
</p>
</div>
</div>
</div>
</div>
</div>
);
};

export default ItemDetails;
