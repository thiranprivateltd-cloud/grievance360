import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem('g360_admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

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

    try {
      const res = await axios.post('/api/auth/login', { username, password });
      
      localStorage.setItem('g360_admin_token', res.data.token);
      localStorage.setItem('g360_admin_user', res.data.username);
      
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-auto py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="glass-card p-4">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle p-3 mb-3 shadow" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-lock-fill fs-3"></i>
              </div>
              <h4>Portal Administrator</h4>
              <p className="text-muted small">Sign in to manage student grievances</p>
            </div>

            <form onSubmit={handleSubmit} className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate>
              <div className="mb-3">
                <label htmlFor="username" class="form-label fw-semibold">Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-person"></i></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0" 
                    id="username" 
                    placeholder="e.g. admin" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                  <div className="invalid-feedback">Username is required.</div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" class="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-key"></i></span>
                  <input 
                    type="password" 
                    className="form-control border-start-0 ps-0" 
                    id="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <div className="invalid-feedback">Password is required.</div>
                </div>
              </div>

              {errorMsg && (
                <div className="alert alert-danger mt-2 mb-3 py-2 text-center" role="alert">
                  <small><i className="bi bi-x-circle-fill me-1"></i> {errorMsg}</small>
                </div>
              )}

              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <><i className="bi bi-box-arrow-in-right me-2"></i>Login</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
