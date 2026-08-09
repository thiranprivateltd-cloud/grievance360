/**
 * Grievance360 - Client-side Interactive Logic & local Database Mocking
 * Designed & Developed by Varshith G S
 */

// Initial Seed Data for Grievance360 to demonstrate dashboard features
const SEED_COMPLAINTS = [
  {
    id: "VT-2026-0001",
    fullName: "Aditya Kumar",
    registerNo: "VTU82736",
    department: "CSE",
    email: "aditya.k@student.veltech.edu.in",
    phone: "9876543210",
    category: "Academic",
    description: "End semester results for the theory paper 'Design and Analysis of Algorithms' have not been updated on the student portal yet, although other branches received them last week.",
    incidentDate: "2026-08-01",
    isAnonymous: false,
    status: "Resolved",
    priority: "Medium",
    adminRemarks: "The marks database has been synchronized. All CSE students should now be able to view their results on the student portal.",
    createdAt: "2026-08-01T10:15:30Z"
  },
  {
    id: "VT-2026-0002",
    fullName: "Anonymous",
    registerNo: "",
    department: "MECH",
    email: "",
    phone: "",
    category: "Hostel",
    description: "Block B hot water geysers are malfunctioning for the past 3 days. It is extremely inconvenient during morning hours.",
    incidentDate: "2026-08-05",
    isAnonymous: true,
    status: "Under Review",
    priority: "High",
    adminRemarks: "Maintenance department has been notified. The technician is scheduled to visit tomorrow morning.",
    createdAt: "2026-08-06T08:22:15Z"
  },
  {
    id: "VT-2026-0003",
    fullName: "Pooja Hegde",
    registerNo: "VTU98212",
    department: "ECE",
    email: "pooja.h@student.veltech.edu.in",
    phone: "8765432109",
    category: "Harassment/Ragging",
    description: "Seniors gathering near the main canteen are constantly passing comments and ragging first-year students during evening hours (around 5:30 PM). Immediate patrol is requested.",
    incidentDate: "2026-08-07",
    isAnonymous: false,
    status: "Pending",
    priority: "High",
    adminRemarks: "",
    createdAt: "2026-08-07T14:40:00Z"
  }
];

// Helper to initialize and retrieve complaints database
function getComplaints() {
  let db = localStorage.getItem("g360_complaints");
  if (!db) {
    localStorage.setItem("g360_complaints", JSON.stringify(SEED_COMPLAINTS));
    return SEED_COMPLAINTS;
  }
  return JSON.parse(db);
}

function saveComplaints(complaints) {
  localStorage.setItem("g360_complaints", JSON.stringify(complaints));
}

// -------------------------------------------------------------------------
// Page Specific Logic Dispatcher
// -------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  if (currentPath.includes("submit.html")) {
    initSubmitPage();
  } else if (currentPath.includes("track.html")) {
    initTrackPage();
  } else if (currentPath.includes("admin-login.html")) {
    initLoginPage();
  } else if (currentPath.includes("admin-dashboard.html")) {
    initDashboardPage();
  }
});

// -------------------------------------------------------------------------
// STAGE 1: SUBMIT COMPLAINT PAGE
// -------------------------------------------------------------------------
function initSubmitPage() {
  const form = document.getElementById("complaintForm");
  const isAnonSwitch = document.getElementById("isAnonymous");
  const studentDetails = document.getElementById("studentDetails");
  const studentFields = studentDetails.querySelectorAll("input");

  // Handle Anonymous toggle state change
  isAnonSwitch.addEventListener("change", () => {
    if (isAnonSwitch.checked) {
      studentDetails.style.opacity = "0.5";
      studentFields.forEach(field => {
        field.disabled = true;
        field.required = false;
        field.value = "";
      });
    } else {
      studentDetails.style.opacity = "1";
      studentFields.forEach(field => {
        field.disabled = false;
        field.required = true;
      });
    }
  });

  // Handle Form Submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    // Load DB
    const complaints = getComplaints();

    // Generate unique ID in the format VT-2026-0001
    let nextNum = 1;
    if (complaints.length > 0) {
      const ids = complaints.map(c => parseInt(c.id.split("-")[2]));
      nextNum = Math.max(...ids) + 1;
    }
    const formattedId = `VT-2026-${String(nextNum).padStart(4, "0")}`;

    // Get field values
    const isAnonymous = isAnonSwitch.checked;
    const newComplaint = {
      id: formattedId,
      fullName: isAnonymous ? "Anonymous" : document.getElementById("fullName").value,
      registerNo: isAnonymous ? "" : document.getElementById("registerNo").value,
      department: document.getElementById("department").value,
      email: isAnonymous ? "" : document.getElementById("email").value,
      phone: isAnonymous ? "" : document.getElementById("phone").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
      incidentDate: document.getElementById("incidentDate").value,
      isAnonymous: isAnonymous,
      status: "Pending",
      priority: "Medium",
      adminRemarks: "",
      createdAt: new Date().toISOString()
    };

    // Save
    complaints.push(newComplaint);
    saveComplaints(complaints);

    // Show Confirmation Modal
    document.getElementById("generatedId").innerText = formattedId;
    const confirmationModal = new bootstrap.Modal(document.getElementById("confirmationModal"));
    confirmationModal.show();
  });
}

// -------------------------------------------------------------------------
// STAGE 1: TRACK COMPLAINT PAGE
// -------------------------------------------------------------------------
function initTrackPage() {
  const form = document.getElementById("trackForm");
  const notFoundAlert = document.getElementById("notFoundAlert");
  const resultContainer = document.getElementById("resultContainer");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const idInput = document.getElementById("complaintIdInput").value.trim().toUpperCase();

    if (!idInput) return;

    const complaints = getComplaints();
    const match = complaints.find(c => c.id === idInput);

    if (!match) {
      notFoundAlert.classList.remove("d-none");
      resultContainer.classList.add("d-none");
    } else {
      notFoundAlert.classList.add("d-none");
      resultContainer.classList.remove("d-none");

      // Update values in domestic DOM Elements
      document.getElementById("displayId").innerText = match.id;
      document.getElementById("displayDate").innerText = new Date(match.createdAt).toLocaleDateString();
      document.getElementById("displayCategory").innerText = match.category;
      document.getElementById("displaySubmitter").innerText = match.isAnonymous
        ? "Anonymous"
        : `${match.fullName} (${match.registerNo})`;
      document.getElementById("displayDescription").innerText = match.description;

      // Status Badge config
      const statusBadge = document.getElementById("displayStatus");
      statusBadge.innerText = match.status;
      statusBadge.className = "badge px-3 py-2 fs-6 rounded-pill";
      if (match.status === "Pending") statusBadge.classList.add("badge-pending");
      else if (match.status === "Under Review") statusBadge.classList.add("badge-review");
      else if (match.status === "Resolved") statusBadge.classList.add("badge-resolved");
      else if (match.status === "Rejected") statusBadge.classList.add("badge-rejected");

      // Priority Badge config
      const priorityBadge = document.getElementById("displayPriority");
      priorityBadge.innerText = match.priority;
      priorityBadge.className = "badge px-3 py-2 fs-6 rounded-pill";
      if (match.priority === "Low") priorityBadge.classList.add("badge-priority-low");
      else if (match.priority === "Medium") priorityBadge.classList.add("badge-priority-medium");
      else if (match.priority === "High") priorityBadge.classList.add("badge-priority-high");

      // Remarks display
      const remarksDiv = document.getElementById("displayRemarks");
      if (match.adminRemarks) {
        remarksDiv.innerText = match.adminRemarks;
        remarksDiv.className = "p-3 border rounded bg-light text-dark";
      } else {
        remarksDiv.innerText = "No remarks added yet. Please check back later.";
        remarksDiv.className = "p-3 border rounded bg-warning-subtle text-dark";
      }
    }
  });
}

// -------------------------------------------------------------------------
// STAGE 1: ADMIN LOGIN PAGE
// -------------------------------------------------------------------------
function initLoginPage() {
  const form = document.getElementById("loginForm");
  const loginAlert = document.getElementById("loginAlert");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "admin123") {
      sessionStorage.setItem("g360_admin_token", "authenticated_stage1");
      window.location.href = "admin-dashboard.html";
    } else {
      loginAlert.classList.remove("d-none");
    }
  });
}

// -------------------------------------------------------------------------
// STAGE 1: ADMIN DASHBOARD PAGE
// -------------------------------------------------------------------------
let currentSelectedComplaint = null;

function initDashboardPage() {
  // Auth Check
  if (sessionStorage.getItem("g360_admin_token") !== "authenticated_stage1") {
    window.location.href = "admin-login.html";
    return;
  }

  // Bind Log Out
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("g360_admin_token");
    window.location.href = "admin-login.html";
  });

  // Setup Event Listeners for Filters
  document.getElementById("searchQuery").addEventListener("input", renderDashboardTable);
  document.getElementById("filterCategory").addEventListener("change", renderDashboardTable);
  document.getElementById("filterStatus").addEventListener("change", renderDashboardTable);
  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("searchQuery").value = "";
    document.getElementById("filterCategory").value = "All";
    document.getElementById("filterStatus").value = "All";
    renderDashboardTable();
  });

  // Modal changes save handler
  document.getElementById("saveModalChanges").addEventListener("click", () => {
    if (!currentSelectedComplaint) return;
    
    const complaints = getComplaints();
    const targetIdx = complaints.findIndex(c => c.id === currentSelectedComplaint.id);

    if (targetIdx !== -1) {
      complaints[targetIdx].status = document.getElementById("modalStatusSelect").value;
      complaints[targetIdx].priority = document.getElementById("modalPrioritySelect").value;
      complaints[targetIdx].adminRemarks = document.getElementById("modalRemarksInput").value;

      saveComplaints(complaints);
      renderDashboardTable();

      // Dismiss modal
      const modalEl = document.getElementById("detailsModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    }
  });

  // Render Table
  renderDashboardTable();
}

function renderDashboardTable() {
  const complaints = getComplaints();
  
  // Calculate Metrics
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const review = complaints.filter(c => c.status === "Under Review").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;

  document.getElementById("metricTotal").innerText = total;
  document.getElementById("metricPending").innerText = pending;
  document.getElementById("metricReview").innerText = review;
  document.getElementById("metricResolved").innerText = resolved;

  // Retrieve Search & Filter Inputs
  const searchVal = document.getElementById("searchQuery").value.toLowerCase().trim();
  const categoryFilter = document.getElementById("filterCategory").value;
  const statusFilter = document.getElementById("filterStatus").value;

  const tbody = document.getElementById("complaintsTableBody");
  tbody.innerHTML = "";

  const filtered = complaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchVal) ||
      c.fullName.toLowerCase().includes(searchVal) ||
      c.description.toLowerCase().includes(searchVal);
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5 text-muted">
          <i class="bi bi-folder-x fs-1 d-block mb-2"></i> No matching complaints found.
        </td>
      </tr>
    `;
    return;
  }

  // Populate Table
  filtered.forEach(c => {
    const tr = document.createElement("tr");

    // Submitter display
    const submitterName = c.isAnonymous ? "Anonymous" : c.fullName;

    // Status Badge Markup
    let statusClass = "badge-pending";
    if (c.status === "Under Review") statusClass = "badge-review";
    else if (c.status === "Resolved") statusClass = "badge-resolved";
    else if (c.status === "Rejected") statusClass = "badge-rejected";

    // Priority Badge Markup
    let priorityClass = "badge-priority-medium";
    if (c.priority === "Low") priorityClass = "badge-priority-low";
    else if (c.priority === "High") priorityClass = "badge-priority-high";

    tr.innerHTML = `
      <td class="ps-4 fw-bold text-primary">${c.id}</td>
      <td class="fw-semibold">${submitterName}</td>
      <td>${c.category}</td>
      <td>${new Date(c.incidentDate).toLocaleDateString()}</td>
      <td><span class="badge ${priorityClass} px-2.5 py-1.5 rounded-pill">${c.priority}</span></td>
      <td><span class="badge ${statusClass} px-2.5 py-1.5 rounded-pill">${c.status}</span></td>
      <td class="pe-4 text-end">
        <button class="btn btn-outline-primary btn-sm view-details-btn" data-id="${c.id}">
          <i class="bi bi-pencil-square me-1"></i>Action
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Attach Detail Event Listeners to Buttons
  document.querySelectorAll(".view-details-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const compId = btn.getAttribute("data-id");
      const matched = complaints.find(c => c.id === compId);
      if (matched) {
        openDetailsModal(matched);
      }
    });
  });
}

function openDetailsModal(complaint) {
  currentSelectedComplaint = complaint;

  document.getElementById("modalId").innerText = complaint.id;
  document.getElementById("modalDate").innerText = new Date(complaint.createdAt).toLocaleString();
  document.getElementById("modalSubmitter").innerText = complaint.isAnonymous ? "Anonymous Submit" : complaint.fullName;
  document.getElementById("modalContact").innerText = complaint.isAnonymous 
    ? "Protected Identity" 
    : `${complaint.email} | ${complaint.phone}`;
  document.getElementById("modalDept").innerText = complaint.department;
  document.getElementById("modalCategory").innerText = complaint.category;
  document.getElementById("modalDescription").innerText = complaint.description;

  // Set inputs
  document.getElementById("modalStatusSelect").value = complaint.status;
  document.getElementById("modalPrioritySelect").value = complaint.priority;
  document.getElementById("modalRemarksInput").value = complaint.adminRemarks;

  // Open the Modal
  const modalEl = document.getElementById("detailsModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
