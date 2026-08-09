import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
function Track() {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Check URL query parameters on load (e.g. ?id=VT-2026-0001)
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setComplaintId(idParam);
      fetchComplaint(idParam);
    }
  }, [searchParams]);
  const fetchComplaint = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    setErrorMsg('');
    setComplaint(null);
    try {
      const res = await axios.get(`/api/complaints/${idToFetch.toUpperCase()}`);
      setComplaint(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Complaint ID not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    fetchComplaint(complaintId.trim());
  };
  // Helper classes for badges
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Under Review': return 'badge-review';
      case 'Resolved': return 'badge-resolved';
      case 'Rejected': return 'badge-rejected';
      default: return 'bg-secondary';
    }
  };
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Low': return 'badge-priority-low';
      case 'Medium': return 'badge-priority-medium';
      case 'High': return 'badge-priority-high';
      default: return 'bg-secondary';
    }
  };
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="glass-card p-4 p-md-5 mb-4">
            <h2 className="mb-4 text-center">
              <i className="bi bi-search text-secondary me-2"></i>Track Your Complaint
            </h2>
            <p className="text-muted text-center mb-4">
              Enter your tracking ID (e.g., VT-2026-0001) to look up live status logs and resolution history.
            </p>
            <form onSubmit={handleTrackSubmit}>
              <div className="input-group mb-3">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-hash"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="VT-2026-0001"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  required 
                />
                <button 
                  className="btn btn-primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <><i className="bi bi-search me-1"></i>Track</>
                  )}
                </button>
              </div>
            </form>
            {errorMsg && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Result Panel */}
      {complaint && (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass-card p-4 p-md-5 border-primary">
              
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4 flex-wrap gap-2">
                <div>
                  <span className="text-muted small">COMPLAINT ID</span>
                  <h3 className="fw-bold text-primary mb-0">{complaint.complaintId}</h3>
                </div>
                <div className="text-md-end">
                  <span className="text-muted small d-block">SUBMITTED ON</span>
                  <span className="fw-semibold">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <p className="text-muted small mb-1">CATEGORY</p>
                  <h5 className="fw-bold">{complaint.category}</h5>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">SUBMITTER</p>
                  <h5 className="fw-bold">
                    {complaint.isAnonymous ? (
                      <span className="text-warning"><i className="bi bi-incognito me-1"></i>Anonymous</span>
                    ) : (
                      `${complaint.name} (${complaint.registerNumber})`
                    )}
                  </h5>
                </div>
              </div>
              {/* Conditional Category Specific Info Panel */}
              {complaint.category === 'University' && (
                <div className="alert alert-primary py-3 mb-4">
                  <h6 className="fw-bold mb-2"><i className="bi bi-bank-fill me-1"></i>University Grievance Details</h6>
                  <div className="row g-2 small">
                    <div className="col-sm-12"><strong>Grievance Type:</strong> {complaint.subcategory}</div>
                  </div>
                </div>
              )}
              {complaint.category === 'Hostel' && (
                <div className="alert alert-info py-3 mb-4">
                  <h6 className="fw-bold mb-2"><i className="bi bi-house-door-fill me-1"></i>Hostel Grievance Details</h6>
                  <div className="row g-2 small">
                    <div className="col-sm-6"><strong>Grievance Type:</strong> {complaint.subcategory}</div>
                    <div className="col-sm-6"><strong>Hostel Name:</strong> {complaint.hostelName}</div>
                    <div className="col-sm-6"><strong>Room Type:</strong> {complaint.roomType} ({complaint.roomSharing} sharing)</div>
                    <div className="col-sm-6"><strong>Location:</strong> {complaint.hostelBlock}, Room {complaint.roomNumber}</div>
                  </div>
                </div>
              )}
              {complaint.category === 'Bus' && (
                <div className="alert alert-success py-3 mb-4">
                  <h6 className="fw-bold mb-2"><i className="bi bi-bus-front-fill me-1"></i>Transport Grievance Details</h6>
                  <div className="row g-2 small">
                    <div className="col-sm-6"><strong>Grievance Type:</strong> {complaint.subcategory}</div>
                    <div className="col-sm-6"><strong>Bus Route/Name:</strong> {complaint.busRoute}</div>
                    <div className="col-sm-6"><strong>Bus Type:</strong> {complaint.busType}</div>
                    <div className="col-sm-6"><strong>Bus Number:</strong> {complaint.busNumber}</div>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <p className="text-muted small mb-1">DESCRIPTION</p>
                <div className="p-3 bg-light rounded text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                  {complaint.description}
                </div>
              </div>
              {complaint.fileUrl && (
                <div className="mb-4">
                  <p className="text-muted small mb-1">ATTACHMENT</p>
                  <a 
                    href={`http://localhost:5000${complaint.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <i className="bi bi-paperclip me-1"></i>View Uploaded File
                  </a>
                </div>
              )}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <p className="text-muted small mb-1">STATUS</p>
                  <span className={`badge px-3 py-2 fs-6 rounded-pill ${getStatusBadgeClass(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">PRIORITY</p>
                  <span className={`badge px-3 py-2 fs-6 rounded-pill ${getPriorityBadgeClass(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <div className="border-top pt-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-chat-right-text text-secondary me-2"></i>Admin Remarks
                </h5>
                {complaint.adminRemarks ? (
                  <div className="p-3 border rounded bg-light text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                    {complaint.adminRemarks}
                  </div>
                ) : (
                  <div className="p-3 border rounded bg-warning-subtle text-dark">
                    No remarks added yet. Please check back later for administrator response.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Track;
