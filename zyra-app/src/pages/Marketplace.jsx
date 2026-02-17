import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const listingsRef = collection(db, "listings");
    let q = query(listingsRef);

    if (category !== 'All') {
      q = query(listingsRef, where("category", "==", category));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side filtering for search and city
      if (city !== 'All') {
        items = items.filter(item => item.location === city);
      }
      if (searchTerm) {
        items = items.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setListings(items);
    });

    return () => unsubscribe();
  }, [category, city, searchTerm]);

  return (
    <div className="container-fluid px-lg-5 mt-4">
      {/* Header Section */}
      <div className="row mb-4 align-items-center">
        <div className="col-lg-6">
          <h1 className="fw-bold text-dark display-5">Explore Rentals</h1>
          <p className="text-muted fs-5">Premium machinery and equipment available across Pakistan.</p>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-2">
            <div className="row g-2">
              <div className="col-md-7">
                <input 
                  type="text" 
                  className="form-control form-control-lg border-0 bg-light" 
                  placeholder="Search for items (e.g. Generator, Crane)..." 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <select className="form-select form-select-lg border-0 bg-light" onChange={(e) => setCity(e.target.value)}>
                  <option value="All">All of Pakistan</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Gujrat">Gujrat</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-5 overflow-auto">
        <div className="d-flex gap-2 pb-2">
          {['All', 'Tools', 'Machinery', 'Furniture', 'Vehicle', 'Equipment'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)} 
              className={`btn btn-lg px-4 rounded-pill fw-semibold transition-all ${
                category === cat ? 'btn-primary shadow' : 'btn-outline-secondary border-0'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="row g-4">
        {listings.length > 0 ? (
          listings.map(item => (
            <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 border-0 shadow-sm item-card">
                <div className="position-relative">
                  <img 
                    src={item.imageUrl} 
                    className="card-img-top" 
                    alt={item.title} 
                    style={{ height: '220px', objectFit: 'cover', borderRadius: '10px 10px 0 0' }} 
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-white text-dark shadow-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <div className="card-body d-flex flex-column p-4">
                  <h5 className="card-title fw-bold text-dark text-truncate">{item.title}</h5>
                  <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
                    <span className="text-primary fw-bold fs-5">Rs. {item.price} <small className="text-muted fw-normal" style={{fontSize: '12px'}}>/ day</small></span>
                    <span className="small text-muted"><i className="bi bi-geo-alt"></i> {item.location}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/item/${item.id}`)} 
                    className="btn btn-dark w-100 py-2 fw-bold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="py-5 bg-white rounded-4 shadow-sm">
              <h3 className="text-muted">No items found in {city}</h3>
              <p>Try searching for something else or change your location.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;