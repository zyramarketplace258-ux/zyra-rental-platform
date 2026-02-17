import React, { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const VerifyIdentity = () => {
  const [cnic, setCnic] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleVerify = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Check Auth again
    const user = auth.currentUser;
    if (!user) throw new Error("User session expired. Please login again.");

    // 2. Upload Image (You said this part is working)
    const storageRef = ref(storage, `verifications/${user.uid}`);
    await uploadBytes(storageRef, image);
    const downloadURL = await getDownloadURL(storageRef);

    // 3. Update Firestore (The likely crash point)
    const userRef = doc(db, "users", user.uid);
    
    await updateDoc(userRef, {
      cnic: cnic,
      cnicImageUrl: downloadURL,
      verificationStatus: "pending", // Ensure this matches your Admin Panel logic
      isVerified: false
    }).catch(async (error) => {
      // If updateDoc fails because the document doesn't exist, use setDoc instead
      if (error.code === 'not-found') {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          cnic: cnic,
          cnicImageUrl: downloadURL,
          verificationStatus: "pending",
          isVerified: false
        });
      } else {
        throw error;
      }
    });

    alert("CNIC Submitted Successfully!");
    navigate('/dashboard');

  } catch (error) {
    console.error("Full Error Object:", error);
    // This alert helps us see the REAL error, not just "No Internet"
    alert("System Error: " + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5 card shadow p-4 border-0">
          <h2 className="text-center fw-bold mb-3">Identity Verification</h2>
          <p className="text-muted text-center small mb-4">
            To ensure safety in the Pakistani rental market, please provide your CNIC details.
          </p>
          
          <form onSubmit={handleVerify}>
            <div className="mb-3">
              <label className="form-label">CNIC Number (without dashes)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="35201XXXXXXXX" 
                maxLength="13"
                required 
                onChange={(e) => setCnic(e.target.value)} 
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Upload Front Side of CNIC</label>
              <input 
                type="file" 
                className="form-control" 
                accept="image/*" 
                required 
                onChange={(e) => setImage(e.target.files[0])} 
              />
              <div className="form-text">Ensure the text is clearly visible.</div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : "Submit for Verification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;