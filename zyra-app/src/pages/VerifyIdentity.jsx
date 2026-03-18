import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const VerifyIdentity = () => {
  const [cnic, setCnic] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  const handleVerify = async (e) => {
    e.preventDefault();
    
    // CNIC Validation: Must be 13 digits
    if (cnic.length !== 13 || isNaN(cnic)) {
      return alert("Please enter a valid 13-digit CNIC number without dashes.");
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User session expired. Please login again.");

      // 1. Upload CNIC Image
      const storageRef = ref(storage, `verifications/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Reference the User Document
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const verificationData = {
        cnic: cnic,
        cnicImageUrl: downloadURL,
        verificationStatus: "pending",
        isVerified: false,
        submittedAt: serverTimestamp()
      };

      // 3. Smart Write: Create or Update
      if (userSnap.exists()) {
        await updateDoc(userRef, verificationData);
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Zyra User",
          ...verificationData
        });
      }

      alert("CNIC Submitted! Our team will review your identity shortly.");
      navigate('/dashboard');

    } catch (error) {
      console.error("Verification Error:", error);
      alert("System Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header with Security Icon */}
            <div className="bg-dark p-4 text-center text-white">
              <div className="bg-primary d-inline-flex p-3 rounded-circle mb-3 shadow-sm">
                <i className="bi bi-shield-lock-fill fs-2"></i>
              </div>
              <h3 className="fw-bold mb-0">Identity Verification</h3>
              <p className="opacity-75 small mb-0 mt-2">Required for Pakistan's First Secure Rental Hub</p>
            </div>

            <div className="card-body p-4 p-md-5 bg-white">
              <form onSubmit={handleVerify}>
                {/* CNIC Input */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase ls-1">CNIC Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><i className="bi bi-person-badge"></i></span>
                    <input 
                      type="text" 
                      className="form-control form-control-lg bg-light border-0 fs-6" 
                      placeholder="e.g. 3520112345678" 
                      maxLength="13"
                      required 
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                    />
                  </div>
                  <div className="form-text mt-2 small">
                    <i className="bi bi-info-circle me-1"></i> Enter your 13-digit identity number without dashes.
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase ls-1">Front-Side CNIC Photo</label>
                  <div className={`border-2 border-dashed rounded-4 p-4 text-center transition-all ${imagePreview ? 'border-primary bg-primary-subtle' : 'bg-light border-secondary-subtle'}`}>
                    {imagePreview ? (
                      <div className="position-relative">
                        <img src={imagePreview} className="img-fluid rounded-3 shadow-sm mb-2" style={{maxHeight: '150px'}} alt="CNIC Preview" />
                        <p className="text-primary fw-bold small mb-0">File Selected ✓</p>
                      </div>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up display-5 text-muted mb-2"></i>
                        <p className="text-muted small mb-3">Upload a clear photo where text is readable.</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="form-control mt-2 opacity-0 position-absolute" 
                      style={{zIndex: -1}}
                      id="cnicUpload"
                      accept="image/*" 
                      required 
                      onChange={handleImageChange} 
                    />
                    <label htmlFor="cnicUpload" className="btn btn-outline-dark btn-sm rounded-pill px-4">Choose File</label>
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-sm mt-2" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                  ) : "Submit for Verification"}
                </button>
              </form>

              <div className="mt-4 p-3 bg-light rounded-3">
                <p className="small text-muted mb-0">
                  <i className="bi bi-lock-fill me-1"></i> 
                  <strong>Privacy Note:</strong> Your data is encrypted and used only for marketplace trust. We do not share your documents with other users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;