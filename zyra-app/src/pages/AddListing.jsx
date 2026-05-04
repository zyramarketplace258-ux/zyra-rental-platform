import React, { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import loginBg from '../assets/login-bg.jpg';

const AddListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tools',
    price: '',
    description: '',
    location: 'Gujrat' // Set Gujrat as default for your FYP
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Added for UX
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Image Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please upload an image of the item.");
    if (!auth.currentUser) return alert("You must be logged in to list an item.");
    
    setLoading(true);

    try {
      const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);

      await addDoc(collection(db, "listings"), {
        ...formData,
        price: Number(formData.price),
        imageUrl: url,
        ownerId: auth.currentUser.uid,
        ownerName: auth.currentUser.displayName || "Verified Owner",
        status: "available",
        createdAt: serverTimestamp()
      });

      alert("Success! Your item is now live on Zyra.");
      navigate('/marketplace'); 
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  };


  return (
    /* WRAPPER: This provides the solid background */
    <div style={{
    position: 'fixed', // This is the secret to covering the whole screen
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10000, // Stay on top of everything
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    /* Inside your return's first <div> style object: */
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${loginBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#dfe0e4' // Dark fallback
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10"> {/* Widened slightly for better split-view */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: '#474b8695' }}>
              <div className="row g-0">
                
                {/* Left Side: Image Preview / Instructions */}
                <div className="col-md-5 bg-dark d-flex align-items-center justify-content-center p-4">
                  {imagePreview ? (
                    <div className="text-center">
                      <img src={imagePreview} className="img-fluid rounded-3 mb-3 shadow" style={{ maxHeight: '350px', width: '100%', objectFit: 'cover' }} alt="Preview" />
                      <p className="text-white-50 small">Looking good! Ready to publish?</p>
                    </div>
                  ) : (
                    <div className="text-center text-white p-3">
                      {/* Using a simple circle for the camera icon if Bootstrap Icons aren't loading */}
                      <div className="mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '2rem' }}>📸</span>
                      </div>
                      <h4 className="fw-bold">Show it off!</h4>
                      <p className="small opacity-75 ">Upload a clear photo of your item to attract more renters.</p>
                    </div>
                  )}
                </div>

                {/* Right Side: The Form */}
                <div className="col-md-7 p-4 p-md-5">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary rounded-circle me-3" style={{ width: '20px', height: '20px' }}></div>
                    <h2 className="m-0 fw-bold text-white">List an Item</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-secondary small text-white">What are you renting?</label>
                      <input type="text" className="form-control bg-light border-0 py-2" placeholder="e.g. DSLR Camera, Ladder, Drill" required 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-secondary small text-white">Category</label>
                        <select className="form-select bg-light border-0 py-2" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                          <option value="Tools">Tools</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Household">Household</option>
                          <option value="Vehicle">Vehicle</option>
                          <option value="Event/Party">Event/Party</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold text-secondary small text-white">Price / Day (Rs.)</label>
                        <input type="number" className="form-control bg-light border-0 py-2" placeholder="500" required 
                          onChange={(e) => setFormData({...formData, price: e.target.value})} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-secondary small text-white">Pickup City</label>
                      <select className="form-select bg-light border-0 py-2" defaultValue="Gujrat" onChange={(e) => setFormData({...formData, location: e.target.value})}>
                        <option value="Gujrat">Gujrat</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-secondary small text-white">Quick Description</label>
                      <textarea className="form-control bg-light border-0" rows="3" placeholder="Condition, items included, or special rules..." 
                        onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small text-white">Upload Photo</label>
                      <input type="file" className="form-control border-0 bg-light py-2" accept="image/*" required 
                        onChange={handleImageChange} />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Publishing...</>
                      ) : "List Item Now"}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;