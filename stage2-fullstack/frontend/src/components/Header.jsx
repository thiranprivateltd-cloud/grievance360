import React from 'react';
import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-shield-check text-warning me-2 fs-2"></i>
          <div>
            <span className="d-block fw-bold text-white lh-1">Grievance360</span>
            <small className="text-warning fw-semibold fs-7" style={{ fontSize: '0.75rem' }}>Vel Tech University</small>
          </div>
        </NavLink>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-2 mt-2 mt-lg-0">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link text-white active fw-semibold" : "nav-link text-white-50"} 
                to="/"
              >
                <i className="bi bi-house-door me-1"></i> Home
              </NavLink>
            </li>
            <li class="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link text-white active fw-semibold" : "nav-link text-white-50"} 
                to="/submit"
              >
                <i className="bi bi-file-earmark-plus me-1"></i> Submit Complaint
              </NavLink>
            </li>
            <li class="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link text-white active fw-semibold" : "nav-link text-white-50"} 
                to="/track"
              >
                <i className="bi bi-search me-1"></i> Track Complaint
              </NavLink>
            </li>
            <li class="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link text-white active fw-semibold" : "nav-link text-white-50"} 
                to="/admin/login"
              >
                <i className="bi bi-person-lock me-1"></i> Admin Login
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
