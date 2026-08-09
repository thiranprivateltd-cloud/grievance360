import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="d-flex flex-column my-auto py-5">
      {/* Hero Section */}
      <header className="text-center py-4">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-8">
              <div className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm">
                <i className="bi bi-stars me-1"></i> Transparent & Fast Resolution
              </div>
              <h1 className="display-4 mb-3 text-dark fw-bold">Grievance Redressal, Simplified.</h1>
              <p className="lead text-secondary mb-4 fs-5">
                Vel Tech University's official student grievance portal. Submit your complaints securely, choose to remain anonymous, and track the live resolution status from start to finish.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/submit" className="btn btn-primary btn-lg shadow-sm">
                  <i className="bi bi-plus-circle me-2"></i> Submit a Complaint
                </Link>
                <Link to="/track" className="btn btn-outline-primary btn-lg">
                  <i className="bi bi-search me-2"></i> Track Existing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-5 bg-white border-top border-bottom mt-5">
        <div className="container py-2">
          <div className="text-center mb-5">
            <h2 className="h1 mb-2">How Grievance360 Works</h2>
            <p className="text-muted">A clear, simple, and trackable process for all university grievances.</p>
          </div>
          <div className="row g-4 justify-content-center">
            {/* Step 1 */}
            <div className="col-md-4">
              <div className="flow-step">
                <div className="flow-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </div>
                <h4>1. Submit Securely</h4>
                <p class="text-muted">Fill out the detailed complaint form. Choose to upload files and select whether you want to submit anonymously.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="col-md-4">
              <div className="flow-step">
                <div className="flow-icon">
                  <i className="bi bi-clock-history"></i>
                </div>
                <h4>2. Live Tracking</h4>
                <p class="text-muted">Receive a unique tracking ID instantly (e.g., VT-2026-0001). Check the dashboard for status updates & admin remarks.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="col-md-4">
              <div className="flow-step">
                <div className="flow-icon">
                  <i className="bi bi-patch-check"></i>
                </div>
                <h4>3. Timely Resolution</h4>
                <p class="text-muted">University administration reviews, assigns priority, and updates comments transparently until the issue is resolved.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
