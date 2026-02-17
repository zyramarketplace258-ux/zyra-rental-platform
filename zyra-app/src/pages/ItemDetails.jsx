import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setItem(docSnap.data());
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  const handleRequest = async () => {
    if (!auth.currentUser) return alert("Please login to rent this item.");
    
    try {
      await addDoc(collection(db, "rentals"), {
        itemId: id,
        itemTitle: item.title,
        ownerId: item.ownerId, // The ID of the person who posted it
        renterId: auth.currentUser.uid,
        renterName: auth.currentUser.displayName || "Interested Customer",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Success! The owner has been notified of your request.");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading details...</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-7">
          <img src={item.imageUrl} className="img-fluid rounded shadow" alt={item.title} />
        </div>
        <div className="col-md-5">
          <h2 className="fw-bold">{item.title}</h2>
          <p className="badge bg-primary fs-6">{item.category}</p>
          <h3 className="text-success my-3">Rs. {item.price} <small className="text-muted">/ day</small></h3>
          <p className="text-muted">{item.description}</p>
          <hr />
          <p><strong>Location:</strong> {item.location}</p>
          <button onClick={handleRequest} className="btn btn-dark btn-lg w-100 py-3 mt-3">Request to Rent</button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;