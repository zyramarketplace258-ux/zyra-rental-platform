import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const listingsRef = collection(db, "listings");
    let q = listingsRef;

    if (category !== 'All') {
      q = query(listingsRef, where("category", "==", category));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter by city
      if (city !== 'All') {
        items = items.filter(item => item.location === city);
      }
      
      // Filter by search term
      if (searchTerm) {
        items = items.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setListings(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category, city, searchTerm]);

  return (
    <div className="container-fluid px-lg-5 mt-4 pb-5">
      {/* Search & Breadcrumb Header */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-5 border border-light">
        <div className="row align-items-center g-3">
          <div className="col-lg-4">
            <h2 className="fw-bold mb-1">Marketplace</h2>
            <p className="text-muted small mb-0">Explore items available in {city === 'All' ? 'Pakistan' : city}</p>
          </div>
          <div className="col-lg-8">
            <div className="row g-2">
              <div className="col-md-7">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-0 bg-light fs-6" 
                    placeholder="Search anything (e.g. Camera, Drill)..." 
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-5">
                <select className="form-select form-select-lg border-0 bg-light fs-6 fw-medium text-dark" onChange={(e) => setCity(e.target.value)}>
                  <option value="All">📍 All Pakistan</option>
                  <option value="Gujrat">Gujrat</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-4 overflow-auto d-flex gap-2 py-2 no-scrollbar">
        {['All', 'Tools', 'Electronics', 'Vehicles', 'Furniture', 'Machinery'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)} 
            className={`btn px-4 rounded-pill fw-bold transition-all btn-sm ${
              category === cat ? 'btn-primary shadow-sm' : 'btn-white border bg-white text-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row g-4">
          {listings.length > 0 ? (
            listings.map(item => (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <div 
                  className="card h-100 border-0 shadow-hover transition-all rounded-4 overflow-hidden bg-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  <div className="position-relative">
                    <img 
                      src={item.imageUrl || 'https://via.placeholder.com/400x300'} 
                      className="card-img-top" 
                      alt={item.title} 
                      style={{ height: '200px', objectFit: 'cover' }} 
                    />
                    <div className="position-absolute top-0 start-0 m-3">
                      <span className="badge bg-dark bg-opacity-75 backdrop-blur px-3 py-2 rounded-pill small">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0 text-dark text-truncate" style={{maxWidth: '65%'}}>{item.title}</h6>
                      
                      {/* FIX: Dynamic Verification Badge */}
                      {item.ownerVerified ? (
                        <span className="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-3 small" style={{fontSize: '10px'}}>
                           <i className="bi bi-patch-check-fill me-1"></i>Verified
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-2 py-1 rounded-3 small" style={{fontSize: '10px'}}>
                            <i className="bi bi-question-circle me-1"></i> Unverified
                            </span>
                      )}
                    </div>
                    
                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-1"></i>{item.location}</p>
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                      <div>
                        <span className="fw-bold fs-5 text-primary">Rs.{item.price}</span>
                        <small className="text-muted">/day</small>
                      </div>
                      <button className="btn btn-outline-primary btn-sm rounded-circle shadow-sm">
                        <i className="bi bi-arrow-right-short fs-5"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <div className="py-5 bg-white rounded-5 shadow-sm border border-dashed border-2">
                <i className="bi bi-search display-1 text-light mb-3"></i>
                <h3 className="fw-bold text-dark">No Items Found</h3>
                <p className="text-muted">Try a different search or clear your filters.</p>
                <button onClick={() => {setCategory('All'); setCity('All');}} className="btn btn-primary rounded-pill px-4 mt-2">Clear All</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;