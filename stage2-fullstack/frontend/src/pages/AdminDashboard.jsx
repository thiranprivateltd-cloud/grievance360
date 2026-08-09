import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  // Modal / Action States
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionStatus, setActionStatus] = useState('Pending');
  const [actionPriority, setActionPriority] = useState('Medium');
  const [actionRemarks, setActionRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  // Check auth token
  const getHeaders = () => {
    const token = localStorage.getItem('g360_admin_token');
    if (!token) {
      navigate('/admin/login');
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };
  const fetchComplaints = async () => {
    const headers = getHeaders();
    if (!headers) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get('/api/complaints', headers);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('g360_admin_token');
        navigate('/admin/login');
      } else {
        setErrorMsg('Failed to fetch complaints list.');
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchComplaints();
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem('g360_admin_token');
    localStorage.removeItem('g360_admin_user');
    navigate('/admin/login');
  };
  // Open Edit Action Modal
  const openActionModal = (complaint) => {
    setSelectedComplaint(complaint);
    setActionStatus(complaint.status);
    setActionPriority(complaint.priority);
    setActionRemarks(complaint.adminRemarks || '');
    // Bootstrap trigger
    const modalEl = document.getElementById('detailsModal');
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };
  const handleSaveAction = async () => {
    if (!selectedComplaint) return;
    const headers = getHeaders();
    if (!headers) return;
    setUpdating(true);
    try {
      await axios.patch(`/api/complaints/${selectedComplaint.complaintId}/status`, {
        status: actionStatus,
        priority: actionPriority,
        adminRemarks: actionRemarks
      }, headers);
      // Close modal
      const modalEl = document.getElementById('detailsModal');
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      // Refresh list
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update complaint status.');
    } finally {
      setUpdating(false);
    }
  };
  // Calculate Metrics
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const review = complaints.filter(c => c.status === 'Under Review').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
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
    <div className="container-fluid px-md-5 my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2><i className="bi bi-speedometer2 text-secondary me-2"></i>Dashboard Overview</h2>
        <div className="d-flex align-items-center gap-3">
          <span className="d-none d-md-inline text-muted">
            <i className="bi bi-person-circle me-1"></i> Admin Portal
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>Logout
          </button>
        </div>
      </div>
      {/* Metrics Row */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-start border-primary border-4">
            <p className="text-muted small mb-1 fw-bold">TOTAL COMPLAINTS</p>
            <h2 className="display-6 fw-bold mb-0 text-primary">{total}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-start border-warning border-4">
            <p className="text-muted small mb-1 fw-bold">PENDING</p>
            <h2 class="display-6 fw-bold mb-0 text-warning">{pending}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-start border-info border-4">
            <p className="text-muted small mb-1 fw-bold">UNDER REVIEW</p>
            <h2 className="display-6 fw-bold mb-0 text-info">{review}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-start border-success border-4">
            <p className="text-muted small mb-1 fw-bold">RESOLVED</p>
            <h2 className="display-6 fw-bold mb-0 text-success">{resolved}</h2>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="glass-card p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-semibold"><i className="bi bi-search me-1"></i>Search</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by ID, submitter or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold"><i class="bi bi-tag me-1"></i>Filter Category</label>
            <select 
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Hostel">Hostel</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Administration">Administration</option>
              <option value="Harassment/Ragging">Harassment / Ragging</option>
              <option value="Mess/Food">Mess & Food</option>
              <option value="IT Services">IT Services</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold"><i className="bi bi-check-circle me-1"></i>Filter Status</label>
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('All');
                setFilterStatus('All');
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>
      {errorMsg && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
        </div>
      )}
      {/* Complaints Table */}
      <div className="glass-card p-0 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th scope="col" className="ps-4 py-3">ID</th>
                <th scope="col" className="py-3">Submitter</th>
                <th scope="col" className="py-3">Category</th>
                <th scope="col" className="py-3">Date</th>
                <th scope="col" className="py-3">Priority</th>
                <th scope="col" className="py-3">Status</th>
                <th scope="col" className="pe-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colspan="7" className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading complaints database...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colspan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-folder-x fs-1 d-block mb-2"></i> No complaints found.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c.complaintId}>
                    <td className="ps-4 fw-bold text-primary">{c.complaintId}</td>
                    <td className="fw-semibold">
                      {c.isAnonymous ? (
                        <span className="text-warning"><i className="bi bi-incognito me-1"></i>Anonymous</span>
                      ) : (
                        c.name
                      )}
                    </td>
                    <td>{c.category}</td>
                    <td>{new Date(c.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(c.priority)} px-2.5 py-1.5 rounded-pill`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(c.status)} px-2.5 py-1.5 rounded-pill`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => openActionModal(c)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>Action
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Action / Detail Modal */}
      <div className="modal fade" id="detailsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title"><i className="bi bi-info-circle me-2"></i>Complaint Details & Action Panel</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            {selectedComplaint && (
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <span className="text-muted small d-block">ID</span>
                    <h5 className="fw-bold text-primary">{selectedComplaint.complaintId}</h5>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Date of Submission</span>
                    <h5 className="fw-bold">{new Date(selectedComplaint.createdAt).toLocaleString()}</h5>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Submitter</span>
                    <h5 className="fw-bold">
                      {selectedComplaint.isAnonymous ? 'Anonymous Submit' : selectedComplaint.name}
                    </h5>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Contact Info</span>
                    <h5 className="fw-bold text-wrap">
                      {selectedComplaint.isAnonymous ? 'Protected Identity' : `${selectedComplaint.email} | ${selectedComplaint.phone}`}
                    </h5>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Department</span>
                    <h5 className="fw-bold">{selectedComplaint.department}</h5>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Category</span>
                    <h5 className="fw-bold">{selectedComplaint.category}</h5>
                  </div>
                </div>
                {selectedComplaint.category === 'University' && (
                  <div className="alert alert-primary py-2 mb-3">
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}><i className="bi bi-bank-fill me-1"></i>University Grievance Details</h6>
                    <div className="row g-1 small">
                      <div className="col-sm-12"><strong>Grievance Type:</strong> {selectedComplaint.subcategory}</div>
                    </div>
                  </div>
                )}
                {selectedComplaint.category === 'Hostel' && (
                  <div className="alert alert-info py-2 mb-3">
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}><i className="bi bi-house-door-fill me-1"></i>Hostel Grievance Details</h6>
                    <div className="row g-1 small">
                      <div className="col-sm-6"><strong>Grievance Type:</strong> {selectedComplaint.subcategory}</div>
                      <div className="col-sm-6"><strong>Hostel Name:</strong> {selectedComplaint.hostelName}</div>
                      <div className="col-sm-6"><strong>Room Type:</strong> {selectedComplaint.roomType} ({selectedComplaint.roomSharing} sharing)</div>
                      <div className="col-sm-6"><strong>Location:</strong> {selectedComplaint.hostelBlock}, Room {selectedComplaint.roomNumber}</div>
                    </div>
                  </div>
                )}
                {selectedComplaint.category === 'Bus' && (
                  <div className="alert alert-success py-2 mb-3">
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}><i className="bi bi-bus-front-fill me-1"></i>Transport Grievance Details</h6>
                    <div className="row g-1 small">
                      <div className="col-sm-6"><strong>Grievance Type:</strong> {selectedComplaint.subcategory}</div>
                      <div className="col-sm-6"><strong>Bus Route/Name:</strong> {selectedComplaint.busRoute}</div>
                      <div className="col-sm-6"><strong>Bus Type:</strong> {selectedComplaint.busType}</div>
                      <div className="col-sm-6"><strong>Bus Plate No:</strong> {selectedComplaint.busNumber}</div>
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <span className="text-muted small d-block mb-1">Grievance Description</span>
                  <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedComplaint.description}
                  </div>
                </div>
                {selectedComplaint.fileUrl && (
                  <div className="mb-4">
                    <span className="text-muted small d-block mb-1">Attachment File</span>
                    <a 
                      href={`http://localhost:5000${selectedComplaint.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="bi bi-paperclip me-1"></i>View File
                    </a>
                  </div>
                )}
                <hr />
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="modalPrioritySelect" className="form-label fw-semibold">Assign Priority</label>
                      <select 
                        className="form-select" 
                        id="modalPrioritySelect"
                        value={actionPriority}
                        onChange={(e) => setActionPriority(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="modalStatusSelect" className="form-label fw-semibold">Update Status</label>
                      <select 
                        className="form-select" 
                        id="modalStatusSelect"
                        value={actionStatus}
                        onChange={(e) => setActionStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="modalRemarksInput" className="form-label fw-semibold">Administrative Remarks / Action Description</label>
                    <textarea 
                      className="form-control" 
                      id="modalRemarksInput" 
                      rows="4" 
                      placeholder="Add administrative details, resolution report, or instructions..."
                      value={actionRemarks}
                      onChange={(e) => setActionRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </form>
              </div>
            )}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSaveAction}
                disabled={updating}
              >
                {updating ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <><i className="bi bi-save me-1"></i>Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
