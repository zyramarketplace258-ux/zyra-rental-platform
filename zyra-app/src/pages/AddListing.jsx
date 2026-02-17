import React, { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AddListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tools',
    price: '',
    description: '',
    location: 'Lahore'
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please upload an image of the item.");
    setLoading(true);

    try {
      // 1. Upload Image to Firebase Storage
      const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);

      // 2. Save Data to Firestore
      await addDoc(collection(db, "listings"), {
        ...formData,
        price: Number(formData.price),
        imageUrl: url,
        ownerId: auth.currentUser?.uid || "anonymous",
        status: "available",
        createdAt: serverTimestamp()
      });

      alert("Item Listed Successfully!");
      navigate('/'); // Go back to Marketplace
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 shadow p-4 rounded bg-white">
          <h2 className="mb-4 fw-bold text-center">List Your Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Item Name</label>
              <input type="text" className="form-control" placeholder="e.g. Honda Civic or Drill Machine" required 
                onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="Tools">Tools</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Price / Day (Rs.)</label>
                <input type="number" className="form-control" placeholder="500" required 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Location (City)</label>
              <select className="form-select" onChange={(e) => setFormData({...formData, location: e.target.value})}>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Gujrat">Gujrat</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" placeholder="Describe the condition of the item..." 
                onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            <div className="mb-4">
              <label className="form-label">Item Image</label>
              <input type="file" className="form-control" accept="image/*" required 
                onChange={(e) => setImage(e.target.files[0])} />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : "Post Listing Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListing;