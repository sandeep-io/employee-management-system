const API_URL = "/api/employees";

const form = document.getElementById("employeeForm");
const tableBody = document.getElementById("employeeTableBody");
const formError = document.getElementById("formError");
const pageMessage = document.getElementById("pageMessage");
const searchInput = document.getElementById("searchInput");
const employeeCount = document.getElementById("employeeCount");
const resultCount = document.getElementById("resultCount");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const refreshButton = document.getElementById("refreshButton");
const apiStatus = document.getElementById("apiStatus");
const statusDot = document.querySelector(".status-dot");
const deleteDialog = document.getElementById("deleteDialog");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");

let employees = [];
let editingId = null;
let employeePendingDelete = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function setApiStatus(online, message) {
  apiStatus.textContent = message;
  statusDot.classList.toggle("online", online);
  statusDot.classList.toggle("offline", !online);
}

function showPageMessage(message, isError = false) {
  pageMessage.textContent = message;
  pageMessage.classList.toggle("error", isError);
  pageMessage.hidden = !message;
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

async function readResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function errorMessage(payload, status) {
  if (!payload) return `Request failed (${status}). Please try again.`;
  const lines = [];
  if (payload.validationErrors && typeof payload.validationErrors === "object") {
    Object.entries(payload.validationErrors).forEach(([field, message]) => {
      lines.push(`${field}: ${message}`);
    });
  }
  if (Array.isArray(payload.errors)) {
    payload.errors.forEach((item) => lines.push(item.defaultMessage || item.message || String(item)));
  }
  if (lines.length) return lines.join("\n");
  return payload.message || payload.detail || payload.error || `Request failed (${status}). Please try again.`;
}

async function apiRequest(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    setApiStatus(false, "API unavailable");
    throw new Error("Could not connect to the backend. Make sure Spring Boot is running on port 8080.");
  }

  const payload = await readResponse(response);
  if (!response.ok) {
    if (response.status >= 500) setApiStatus(false, "API error");
    throw new Error(errorMessage(payload, response.status));
  }
  setApiStatus(true, "API connected");
  return payload;
}

function formatSalary(salary) {
  const amount = Number(salary);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(amount);
}

function renderEmployees() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = employees.filter((employee) => {
    const text = [employee.id, employee.firstName, employee.lastName, employee.email, employee.department]
      .map((value) => String(value ?? "").toLowerCase()).join(" ");
    return text.includes(query);
  });

  employeeCount.textContent = String(employees.length);
  resultCount.textContent = query
    ? `Showing ${filtered.length} of ${employees.length} employees`
    : `${employees.length} employee${employees.length === 1 ? "" : "s"} total`;

  if (!filtered.length) {
    const message = employees.length === 0
      ? "No employees yet. Use the form to add your first employee."
      : "No employees match your search. Try another keyword.";
    tableBody.innerHTML = `<tr><td colspan="5" class="table-state"><strong>No records found</strong>${escapeHtml(message)}</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map((employee) => `
    <tr>
      <td class="id-cell">#${escapeHtml(employee.id)}</td>
      <td class="employee-cell">
        <span class="employee-name">${escapeHtml(employee.firstName)} ${escapeHtml(employee.lastName)}</span>
        <span class="employee-email">${escapeHtml(employee.email)}</span>
      </td>
      <td><span class="department-pill">${escapeHtml(employee.department)}</span></td>
      <td class="salary-cell">${escapeHtml(formatSalary(employee.salary))}</td>
      <td>
        <div class="row-actions">
          <button type="button" class="action-button" data-action="edit" data-id="${escapeHtml(employee.id)}" aria-label="Edit ${escapeHtml(employee.firstName)}">Edit</button>
          <button type="button" class="action-button delete" data-action="delete" data-id="${escapeHtml(employee.id)}" aria-label="Delete ${escapeHtml(employee.firstName)}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function loadEmployees({ quiet = false } = {}) {
  if (!quiet) {
    tableBody.innerHTML = '<tr><td colspan="5" class="table-state">Loading employees…</td></tr>';
  }
  try {
    const data = await apiRequest(API_URL);
    if (!Array.isArray(data)) throw new Error("The employee API did not return a list. Check GET /api/employees.");
    employees = data;
    renderEmployees();
    if (!quiet) showPageMessage("");
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="5" class="table-state"><strong>Could not load employees</strong>${escapeHtml(error.message)}</td></tr>`;
    employeeCount.textContent = "—";
    resultCount.textContent = "Unable to load records";
    if (!quiet) showPageMessage(error.message, true);
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  showFormError("");
  document.getElementById("formTitle").textContent = "Add employee";
  document.getElementById("formEyebrow").textContent = "NEW RECORD";
  submitButton.textContent = "Save employee";
  cancelEditButton.hidden = true;
}

function startEditing(employee) {
  editingId = employee.id;
  form.elements.firstName.value = employee.firstName ?? "";
  form.elements.lastName.value = employee.lastName ?? "";
  form.elements.email.value = employee.email ?? "";
  form.elements.department.value = employee.department ?? "";
  form.elements.salary.value = employee.salary ?? "";
  showFormError("");
  document.getElementById("formTitle").textContent = `Edit employee #${employee.id}`;
  document.getElementById("formEyebrow").textContent = "UPDATE RECORD";
  submitButton.textContent = "Save changes";
  cancelEditButton.hidden = false;
  document.getElementById("firstName").focus();
  if (window.matchMedia("(max-width: 780px)").matches) {
    document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showFormError("");

  if (!form.reportValidity()) return;
  const salary = Number(form.elements.salary.value);
  if (!Number.isFinite(salary) || salary < 0) {
    showFormError("Salary must be a number greater than or equal to zero.");
    return;
  }

  const employee = {
    firstName: form.elements.firstName.value.trim(),
    lastName: form.elements.lastName.value.trim(),
    email: form.elements.email.value.trim(),
    department: form.elements.department.value.trim(),
    salary
  };

  submitButton.disabled = true;
  submitButton.textContent = editingId === null ? "Saving…" : "Updating…";
  try {
    const url = editingId === null ? API_URL : `${API_URL}/${encodeURIComponent(editingId)}`;
    const method = editingId === null ? "POST" : "PUT";
    await apiRequest(url, { method, body: JSON.stringify(employee) });
    showPageMessage(editingId === null ? "Employee created successfully." : "Employee updated successfully.");
    resetForm();
    await loadEmployees({ quiet: true });
  } catch (error) {
    showFormError(error.message);
  } finally {
    submitButton.disabled = false;
    if (editingId === null) submitButton.textContent = "Save employee";
    else submitButton.textContent = "Save changes";
  }
});

cancelEditButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderEmployees);
refreshButton.addEventListener("click", () => loadEmployees());

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const employee = employees.find((item) => String(item.id) === String(id));
  if (!employee) return;

  if (button.dataset.action === "edit") {
    startEditing(employee);
  } else if (button.dataset.action === "delete") {
    employeePendingDelete = employee;
    if (typeof deleteDialog.showModal === "function") deleteDialog.showModal();
    else if (window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) deleteEmployee(employee);
  }
});

async function deleteEmployee(employee) {
  confirmDeleteButton.disabled = true;
  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(employee.id)}`, { method: "DELETE" });
    if (String(editingId) === String(employee.id)) resetForm();
    showPageMessage(`Employee ${employee.firstName} ${employee.lastName} deleted successfully.`);
    await loadEmployees({ quiet: true });
  } catch (error) {
    showPageMessage(error.message, true);
  } finally {
    confirmDeleteButton.disabled = false;
    employeePendingDelete = null;
  }
}

confirmDeleteButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const employee = employeePendingDelete;
  if (!employee) {
    deleteDialog.close();
    return;
  }
  await deleteEmployee(employee);
  deleteDialog.close();
});

// Spring Boot serves this page and the API from the same host, so no CORS setup is needed.
loadEmployees();
