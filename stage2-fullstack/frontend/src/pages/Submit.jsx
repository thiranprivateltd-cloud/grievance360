import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Submit() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('University'); // 'University', 'Hostel', 'Bus'
  const [subcategory, setSubcategory] = useState(''); // Specific type based on category
  
  // Student common fields
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    department: '',
    email: '',
    phone: '',
    date: '',
    description: ''
  });

  // Hostel specific fields
  const [hostelData, setHostelData] = useState({
    roomSharing: '',
    roomType: '',
    hostelName: '',
    hostelBlock: '',
    roomNumber: ''
  });

  // Bus specific fields
  const [busData, setBusData] = useState({
    busRoute: '',
    busType: '',
    busNumber: ''
  });

  const [attachment, setAttachment] = useState(null);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successId, setSuccessId] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleHostelChange = (e) => {
    setHostelData({
      ...hostelData,
      [e.target.id]: e.target.value
    });
  };

  const handleBusChange = (e) => {
    setBusData({
      ...busData,
      [e.target.id]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    } else {
      setAttachment(null);
    }
  };

  const changeCategory = (cat) => {
    setSelectedCategory(cat);
    setSubcategory('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('isAnonymous', isAnonymous);
    submissionData.append('department', formData.department);
    submissionData.append('category', selectedCategory); // University, Hostel, or Bus
    submissionData.append('subcategory', subcategory); // Grievance type
    submissionData.append('date', formData.date);
    submissionData.append('description', formData.description);

    if (!isAnonymous) {
      submissionData.append('name', formData.name);
      submissionData.append('registerNumber', formData.registerNumber);
      submissionData.append('email', formData.email);
      submissionData.append('phone', formData.phone);
    }

    // Append Category Specific Details
    if (selectedCategory === 'Hostel') {
      submissionData.append('roomSharing', hostelData.roomSharing);
      submissionData.append('roomType', hostelData.roomType);
      submissionData.append('hostelName', hostelData.hostelName);
      submissionData.append('hostelBlock', hostelData.hostelBlock);
      submissionData.append('roomNumber', hostelData.roomNumber);
    } else if (selectedCategory === 'Bus') {
      submissionData.append('busRoute', busData.busRoute);
      submissionData.append('busType', busData.busType);
      submissionData.append('busNumber', busData.busNumber);
    }

    if (attachment) {
      submissionData.append('attachment', attachment);
    }

    try {
      const res = await axios.post('/api/complaints', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessId(res.data.complaintId);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit complaint. Please check fields or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {successId ? (
            <div className="glass-card p-5 text-center border-success">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle p-3 mb-4 shadow" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-check-lg fs-1"></i>
              </div>
              <h2 className="mb-3 text-success">Submission Successful!</h2>
              <p className="fs-5 mb-4">Your {selectedCategory} grievance has been received and saved securely in our database.</p>
              
              <div className="alert alert-warning py-3 max-w-sm mx-auto mb-4">
                <p className="mb-1 text-muted text-uppercase small fw-bold">Your Unique Tracking ID</p>
                <h2 className="fw-bold text-dark mb-0">{successId}</h2>
              </div>
              <p className="text-muted small mb-5">Please write down or screenshot this ID. You will need it to track resolution status & view comments.</p>

              <div className="d-flex justify-content-center gap-3">
                <Link to={`/track?id=${successId}`} className="btn btn-primary px-4">
                  <i className="bi bi-search me-2"></i>Track Status
                </Link>
                <Link to="/" className="btn btn-outline-secondary px-4">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card p-4 p-md-5">
              <h2 className="mb-4 text-center">
                <i className="bi bi-file-earmark-plus text-secondary me-2"></i>Submit a Grievance
              </h2>
              <p className="text-muted text-center mb-4">
                Select the appropriate section to route your complaint to the correct administrative department.
              </p>

              {/* Grid Selector for University, Hostel, and Bus */}
              <div className="row g-3 mb-5">
                <div className="col-md-4">
                  <button 
                    type="button"
                    onClick={() => changeCategory('University')}
                    className={`btn w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center border-2 ${selectedCategory === 'University' ? 'btn-primary border-primary shadow' : 'btn-outline-primary border-secondary-subtle text-dark'}`}
                  >
                    <i className="bi bi-bank fs-2 mb-2"></i>
                    <span className="fw-bold">University</span>
                    <small className="opacity-75 text-center mt-1" style={{ fontSize: '0.75rem' }}>Academics & college issues</small>
                  </button>
                </div>
                <div className="col-md-4">
                  <button 
                    type="button"
                    onClick={() => changeCategory('Hostel')}
                    className={`btn w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center border-2 ${selectedCategory === 'Hostel' ? 'btn-primary border-primary shadow' : 'btn-outline-primary border-secondary-subtle text-dark'}`}
                  >
                    <i className="bi bi-building fs-2 mb-2"></i>
                    <span className="fw-bold">Hostel</span>
                    <small className="opacity-75 text-center mt-1" style={{ fontSize: '0.75rem' }}>Rooms, mess, facilities</small>
                  </button>
                </div>
                <div className="col-md-4">
                  <button 
                    type="button"
                    onClick={() => changeCategory('Bus')}
                    className={`btn w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center border-2 ${selectedCategory === 'Bus' ? 'btn-primary border-primary shadow' : 'btn-outline-primary border-secondary-subtle text-dark'}`}
                  >
                    <i className="bi bi-bus-front fs-2 mb-2"></i>
                    <span className="fw-bold">Bus</span>
                    <small className="opacity-75 text-center mt-1" style={{ fontSize: '0.75rem' }}>Routes, bus issues</small>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate>
                
                {/* Anonymous Switch */}
                <div className="form-check form-switch mb-4 p-3 bg-light rounded border border-warning-subtle">
                  <input 
                    className="form-check-input ms-0 me-2" 
                    type="checkbox" 
                    id="isAnonymousToggle"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold text-dark" htmlFor="isAnonymousToggle">
                    <i className="bi bi-incognito me-1 text-warning"></i> Submit Anonymously
                  </label>
                  <div className="form-text text-muted">
                    Hides your personal identifiers from administrators.
                  </div>
                </div>

                {/* Submitter details group */}
                <div style={{ opacity: isAnonymous ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">Full Name {!isAnonymous && <span className="text-danger">*</span>}</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        placeholder="e.g. Alice"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isAnonymous}
                        required={!isAnonymous}
                      />
                      <div className="invalid-feedback">Full Name is required.</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="registerNumber" className="form-label fw-semibold">VTU Number {!isAnonymous && <span className="text-danger">*</span>}</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="registerNumber" 
                        placeholder="e.g. VTU12345"
                        value={formData.registerNumber}
                        onChange={handleChange}
                        disabled={isAnonymous}
                        required={!isAnonymous}
                      />
                      <div className="invalid-feedback">Register Number is required.</div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">Email Address {!isAnonymous && <span className="text-danger">*</span>}</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        placeholder="e.g. vtuxxxxx@veltech.edu.in"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isAnonymous}
                        required={!isAnonymous}
                      />
                      <div className="invalid-feedback">A valid email address is required.</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label fw-semibold">Phone Number {!isAnonymous && <span className="text-danger">*</span>}</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="phone" 
                        placeholder="e.g. 9876543210"
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isAnonymous}
                        required={!isAnonymous}
                      />
                      <div className="invalid-feedback">A valid 10-digit phone number is required.</div>
                    </div>
                  </div>
                </div>

                {/* Common Fields */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="department" className="form-label fw-semibold">Department <span className="text-danger">*</span></label>
                    <select 
                      className="form-select" 
                      id="department" 
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Choose your department...</option>
                      <option value="CSE">Computer Science & Engineering</option>
                      <option value="ECE">Electronics & Communication Engineering</option>
                      <option value="EEE">Electrical & Electronics Engineering</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                      <option value="MBA">School of Management</option>
                      <option value="SCIENCES">Arts & Science</option>
                    </select>
                    <div className="invalid-feedback">Please select a department.</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="date" className="form-label fw-semibold">Date of Incident <span class="text-danger">*</span></label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="date" 
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Please choose the date.</div>
                  </div>
                </div>

                {/* UNIVERSITY CONDITIONAL FORM */}
                {selectedCategory === 'University' && (
                  <div className="p-3 mb-4 bg-light rounded border border-primary-subtle">
                    <h5 className="mb-3 text-primary fw-bold"><i className="bi bi-bank-fill me-2"></i>University Specific Details</h5>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="universitySubcategory" className="form-label fw-semibold">Grievance Type <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          id="universitySubcategory"
                          value={subcategory}
                          onChange={(e) => setSubcategory(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select grievance type...</option>
                          <option value="Academic">Academic (Exams, Classes, Syllabus)</option>
                          <option value="Administration">Administration (Fees, Certificates, ID Card)</option>
                          <option value="Infrastructure">Infrastructure (Labs, Classrooms, Buildings)</option>
                          <option value="Harassment/Ragging">Harassment / Anti-Ragging</option>
                          <option value="IT Services">IT Services (WiFi, Portal, Labs)</option>
                          <option value="Other">Other University Issue</option>
                        </select>
                        <div className="invalid-feedback">Please select the type of university complaint.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* HOSTEL CONDITIONAL FORM */}
                {selectedCategory === 'Hostel' && (
                  <div className="p-3 mb-4 bg-light rounded border border-info-subtle">
                    <h5 className="mb-3 text-info fw-bold"><i className="bi bi-house-door me-2"></i>Hostel Specific Details</h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="hostelSubcategory" className="form-label fw-semibold">Grievance Type <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          id="hostelSubcategory"
                          value={subcategory}
                          onChange={(e) => setSubcategory(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select issue type...</option>
                          <option value="AC Complaint">AC Complaint</option>
                          <option value="Food">Food / Mess Quality</option>
                          <option value="Housekeeping">Housekeeping / Cleaning</option>
                          <option value="Electrical">Electrical (Lights, Fan, Socket)</option>
                          <option value="Plumbing">Plumbing (Water, Taps, Washroom)</option>
                          <option value="WiFi">WiFi / Internet Services</option>
                          <option value="Other">Other Room Issue</option>
                        </select>
                        <div className="invalid-feedback">Please select the type of hostel complaint.</div>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="hostelName" className="form-label fw-semibold">Hostel Name <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          id="hostelName"
                          value={hostelData.hostelName}
                          onChange={handleHostelChange}
                          required
                        >
                          <option value="" disabled>Select hostel...</option>
                          <option value="B3">B3</option>
                          <option value="Prince">Prince</option>
                          <option value="Queens">Queens</option>
                          <option value="IGH">IGH</option>
                          <option value="Padmavathi">Padmavathi</option>
                          <option value="Leaders">Leaders</option>
                          <option value="Vel Vinayaga">Vel Vinayaga</option>
                          <option value="Kings">Kings</option>
                          <option value="MultiTech">MultiTech</option>
                        </select>
                        <div className="invalid-feedback">Please select your hostel.</div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="roomSharing" className="form-label fw-semibold">Room Sharing <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          id="roomSharing"
                          value={hostelData.roomSharing}
                          onChange={handleHostelChange}
                          required
                        >
                          <option value="" disabled>Select sharing...</option>
                          <option value="2 in 1">2 in 1</option>
                          <option value="3 in 1">3 in 1</option>
                          <option value="4 in 1">4 in 1</option>
                          <option value="5 in 1">5 in 1</option>
                          <option value="6 in 1">6 in 1</option>
                          <option value="8 in 1">8 in 1</option>
                        </select>
                        <div className="invalid-feedback">Please select room sharing.</div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="roomType" className="form-label fw-semibold">Room Type <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          id="roomType"
                          value={hostelData.roomType}
                          onChange={handleHostelChange}
                          required
                        >
                          <option value="" disabled>Select type...</option>
                          <option value="AC">AC</option>
                          <option value="Non-AC">Non-AC</option>
                        </select>
                        <div className="invalid-feedback">Please select room type.</div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="hostelBlock" className="form-label fw-semibold">Block <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="hostelBlock" 
                          placeholder="e.g. A Block"
                          value={hostelData.hostelBlock}
                          onChange={handleHostelChange}
                          required
                        />
                        <div className="invalid-feedback">Please specify the block.</div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-0">
                        <label htmlFor="roomNumber" className="form-label fw-semibold">Room Number <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="roomNumber" 
                          placeholder="e.g. 302"
                          value={hostelData.roomNumber}
                          onChange={handleHostelChange}
                          required
                        />
                        <div className="invalid-feedback">Please enter room number.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BUS CONDITIONAL FORM */}
                {selectedCategory === 'Bus' && (
                  <div className="p-3 mb-4 bg-light rounded border border-success-subtle">
                    <h5 className="mb-3 text-success fw-bold"><i className="bi bi-bus-front me-2"></i>Transport Specific Details</h5>
                    
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="busSubcategory" className="form-label fw-semibold">Grievance Type <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          id="busSubcategory"
                          value={subcategory}
                          onChange={(e) => setSubcategory(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select issue type...</option>
                          <option value="Delay / Punctuality">Delay / Punctuality</option>
                          <option value="Driver/Conductor Behavior">Driver/Conductor Behavior</option>
                          <option value="AC Malfunction">AC Malfunction</option>
                          <option value="Rash Driving">Rash Driving</option>
                          <option value="Overcrowding">Overcrowding</option>
                          <option value="Maintenance / Cleanliness">Maintenance / Cleanliness</option>
                          <option value="Other">Other Bus Issue</option>
                        </select>
                        <div className="invalid-feedback">Please select the type of bus complaint.</div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="busRoute" className="form-label fw-semibold">Bus Route / Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="busRoute" 
                          placeholder="e.g. Tambaram"
                          value={busData.busRoute}
                          onChange={handleBusChange}
                          required
                        />
                        <div className="invalid-feedback">Please enter the bus route.</div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="busType" className="form-label fw-semibold">Bus Type <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          id="busType"
                          value={busData.busType}
                          onChange={handleBusChange}
                          required
                        >
                          <option value="" disabled>Select type...</option>
                          <option value="AC">AC</option>
                          <option value="Non-AC">Non-AC</option>
                        </select>
                        <div className="invalid-feedback">Please select bus type.</div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="busNumber" className="form-label fw-semibold">Bus Number <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="busNumber" 
                          placeholder="e.g. 201"
                          value={busData.busNumber}
                          onChange={handleBusChange}
                          required
                        />
                        <div className="invalid-feedback">Please specify the bus number.</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label htmlFor="attachment" className="form-label fw-semibold">Attachment (Optional)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      id="attachment" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    <div className="form-text text-muted">PDF, JPG, PNG up to 5MB.</div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label fw-semibold">Detailed Description <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-control" 
                    id="description" 
                    rows="5" 
                    placeholder="Provide detailed facts, locations, and any relevant info..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <div className="invalid-feedback">Please describe your grievance.</div>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>Submit Complaint
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Submit;
