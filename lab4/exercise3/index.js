// Global variables
let studentsData = [];
let isEditMode = false;
let editingStudentId = null;

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTableBody');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const messageIcon = document.getElementById('messageIcon');
const loadingOverlay = document.getElementById('loadingOverlay');
const totalCount = document.getElementById('totalCount');
const httpStatus = document.getElementById('httpStatus');
const formMode = document.getElementById('formMode');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const cancelBtn = document.getElementById('cancelBtn');

// Event Listeners
studentForm.addEventListener('submit', handleFormSubmit);
document.getElementById('studentId').addEventListener('input', validateStudentId);

// Initialize - Load students on page load
window.addEventListener('load', () => {
    showMessage('Click "Reload Data" button to load student records', 'info');
});

// ==================== CREATE Operation ====================
function createStudent(student) {
    showLoading();
    
    // Simulate AJAX POST request
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'students.json', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        hideLoading();
        
        // Simulate HTTP status codes
        const simulatedStatus = 201; // Created
        updateHttpStatus(simulatedStatus, 'POST');
        
        if (simulatedStatus === 201) {
            // Check for duplicate Student ID
            if (studentsData.some(s => s.studentId === student.studentId)) {
                showMessage(`Error: Student ID ${student.studentId} already exists!`, 'error');
                updateHttpStatus(409, 'POST'); // Conflict
                return;
            }
            
            // Add to local data
            studentsData.push(student);
            
            // Refresh table
            renderTable();
            
            // Show success message
            showMessage(`Student ${student.name} added successfully! (HTTP 201 - Created)`, 'success');
            
            // Reset form
            studentForm.reset();
        } else {
            handleHttpError(simulatedStatus, 'create student');
        }
    };
    
    xhr.onerror = function() {
        hideLoading();
        updateHttpStatus(500, 'POST');
        showMessage('Network error occurred while creating student (HTTP 500)', 'error');
    };
    
    // Simulate sending request
    setTimeout(() => {
        xhr.onload();
    }, 500);
}

// ==================== READ Operation ====================
function loadStudents() {
    showLoading();
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'students.json', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        hideLoading();
        
        // Handle different HTTP status codes
        if (xhr.status === 200 || xhr.status === 0) {
            updateHttpStatus(200, 'GET');
            
            try {
                const data = JSON.parse(xhr.responseText);
                
                // Validate JSON structure
                if (!data || !data.students || !Array.isArray(data.students)) {
                    throw new Error('Invalid JSON structure');
                }
                
                studentsData = data.students;
                renderTable();
                showMessage(`Successfully loaded ${studentsData.length} student(s) (HTTP 200 - OK)`, 'success');
                
            } catch (error) {
                updateHttpStatus(500, 'GET');
                showMessage('JSON Parsing Error: ' + error.message + ' (HTTP 500)', 'error');
                console.error('Parse Error:', error);
            }
        } else if (xhr.status === 404) {
            updateHttpStatus(404, 'GET');
            showMessage('Student data not found (HTTP 404 - Not Found)', 'error');
        } else if (xhr.status >= 500) {
            updateHttpStatus(xhr.status, 'GET');
            showMessage(`Server error occurred (HTTP ${xhr.status})`, 'error');
        } else {
            updateHttpStatus(xhr.status, 'GET');
            showMessage(`Request failed with status ${xhr.status}`, 'error');
        }
    };
    
    xhr.onerror = function() {
        hideLoading();
        updateHttpStatus(500, 'GET');
        showMessage('Network error: Unable to fetch student data (HTTP 500)', 'error');
    };
    
    xhr.send();
}

// ==================== UPDATE Operation ====================
function updateStudent(student) {
    showLoading();
    
    // Simulate AJAX PUT request
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `students.json/${student.studentId}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        hideLoading();
        
        // Simulate HTTP status codes
        const index = studentsData.findIndex(s => s.studentId === editingStudentId);
        
        if (index === -1) {
            updateHttpStatus(404, 'PUT');
            showMessage(`Student ${editingStudentId} not found (HTTP 404 - Not Found)`, 'error');
            return;
        }
        
        updateHttpStatus(200, 'PUT');
        
        // Update local data
        studentsData[index] = student;
        
        // Refresh table
        renderTable();
        
        // Show success message
        showMessage(`Student ${student.name} updated successfully! (HTTP 200 - OK)`, 'success');
        
        // Reset form
        exitEditMode();
    };
    
    xhr.onerror = function() {
        hideLoading();
        updateHttpStatus(500, 'PUT');
        showMessage('Network error occurred while updating student (HTTP 500)', 'error');
    };
    
    // Simulate sending request
    setTimeout(() => {
        xhr.onload();
    }, 500);
}

// ==================== DELETE Operation ====================
function deleteStudent(studentId) {
    const student = studentsData.find(s => s.studentId === studentId);
    
    if (!student) {
        showMessage(`Student ${studentId} not found`, 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
        return;
    }
    
    showLoading();
    
    // Simulate AJAX DELETE request
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `students.json/${studentId}`, true);
    
    xhr.onload = function() {
        hideLoading();
        
        const index = studentsData.findIndex(s => s.studentId === studentId);
        
        if (index === -1) {
            updateHttpStatus(404, 'DELETE');
            showMessage(`Student ${studentId} not found (HTTP 404 - Not Found)`, 'error');
            return;
        }
        
        updateHttpStatus(200, 'DELETE');
        
        // Remove from local data
        studentsData.splice(index, 1);
        
        // If deleting the student being edited, exit edit mode
        if (isEditMode && editingStudentId === studentId) {
            exitEditMode();
        }
        
        // Refresh table
        renderTable();
        
        // Show success message
        showMessage(`Student ${student.name} deleted successfully! (HTTP 200 - OK)`, 'success');
    };
    
    xhr.onerror = function() {
        hideLoading();
        updateHttpStatus(500, 'DELETE');
        showMessage('Network error occurred while deleting student (HTTP 500)', 'error');
    };
    
    // Simulate sending request
    setTimeout(() => {
        xhr.onload();
    }, 500);
}

// ==================== Form Handling ====================
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const studentId = document.getElementById('studentId').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const department = document.getElementById('department').value;
    const marks = parseInt(document.getElementById('marks').value);
    
    // Validate input
    if (!validateInput(studentId, name, department, marks)) {
        return;
    }
    
    // Create student object
    const student = {
        studentId: studentId,
        name: name,
        department: department,
        marks: marks
    };
    
    if (isEditMode) {
        // UPDATE operation
        updateStudent(student);
    } else {
        // CREATE operation
        createStudent(student);
    }
}

// Edit student - populate form
function editStudent(studentId) {
    const student = studentsData.find(s => s.studentId === studentId);
    
    if (!student) {
        showMessage('Student not found', 'error');
        return;
    }
    
    // Enter edit mode
    isEditMode = true;
    editingStudentId = studentId;
    
    // Populate form
    document.getElementById('studentId').value = student.studentId;
    document.getElementById('studentId').readOnly = true; // Prevent ID change
    document.getElementById('studentName').value = student.name;
    document.getElementById('department').value = student.department;
    document.getElementById('marks').value = student.marks;
    
    // Update UI
    formMode.textContent = 'Update';
    submitText.textContent = 'Update Student';
    submitBtn.className = 'btn btn-warning';
    submitBtn.querySelector('.btn-icon').textContent = '✓';
    cancelBtn.style.display = 'inline-flex';
    
    // Scroll to form
    studentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showMessage('Edit mode: Modify student details and click Update', 'info');
}

// Cancel edit mode
function cancelEdit() {
    exitEditMode();
    studentForm.reset();
    showMessage('Edit cancelled', 'info');
}

// Exit edit mode
function exitEditMode() {
    isEditMode = false;
    editingStudentId = null;
    document.getElementById('studentId').readOnly = false;
    formMode.textContent = 'Create';
    submitText.textContent = 'Add Student';
    submitBtn.className = 'btn btn-primary';
    submitBtn.querySelector('.btn-icon').textContent = '+';
    cancelBtn.style.display = 'none';
}

// ==================== Validation ====================
function validateInput(studentId, name, department, marks) {
    if (!studentId.match(/^S\d{3}$/)) {
        showMessage('Invalid Student ID format. Use S001, S002, etc.', 'error');
        return false;
    }
    
    if (name.length < 2) {
        showMessage('Name must be at least 2 characters long', 'error');
        return false;
    }
    
    if (!department) {
        showMessage('Please select a department', 'error');
        return false;
    }
    
    if (isNaN(marks) || marks < 0 || marks > 100) {
        showMessage('Marks must be between 0 and 100', 'error');
        return false;
    }
    
    return true;
}

function validateStudentId(e) {
    const input = e.target;
    const value = input.value.toUpperCase();
    input.value = value;
    
    if (value && !value.match(/^S\d{0,3}$/)) {
        input.setCustomValidity('Format: S followed by 3 digits (e.g., S001)');
    } else {
        input.setCustomValidity('');
    }
}

// ==================== Table Rendering ====================
function renderTable() {
    studentsTableBody.innerHTML = '';
    
    if (studentsData.length === 0) {
        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-content">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <p>No students found. Add students using the form above.</p>
                    </div>
                </td>
            </tr>
        `;
        totalCount.textContent = '0 Students';
        return;
    }
    
    studentsData.forEach(student => {
        const row = createTableRow(student);
        studentsTableBody.appendChild(row);
    });
    
    totalCount.textContent = `${studentsData.length} Student${studentsData.length !== 1 ? 's' : ''}`;
}

function createTableRow(student) {
    const tr = document.createElement('tr');
    const grade = calculateGrade(student.marks);
    const status = student.marks >= 40 ? 'Pass' : 'Fail';
    const statusClass = student.marks >= 40 ? 'pass' : 'fail';
    
    tr.innerHTML = `
        <td><strong>${escapeHtml(student.studentId)}</strong></td>
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(student.department)}</td>
        <td><strong>${student.marks}</strong></td>
        <td><span class="grade-badge grade-${grade.toLowerCase()}">${grade}</span></td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>
            <button class="btn-action btn-edit" onclick="editStudent('${student.studentId}')" title="Edit">
                ✏️
            </button>
            <button class="btn-action btn-delete" onclick="deleteStudent('${student.studentId}')" title="Delete">
                🗑️
            </button>
        </td>
    `;
    
    return tr;
}

// ==================== Helper Functions ====================
function calculateGrade(marks) {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
}

function showMessage(message, type) {
    messageText.textContent = message;
    messageBox.className = `message-box ${type}`;
    
    // Set icon based on type
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
        warning: '⚠'
    };
    messageIcon.textContent = icons[type] || 'ℹ';
    
    messageBox.classList.remove('hidden');
    
    // Auto-hide after 5 seconds for success/info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 5000);
    }
}

function closeMessage() {
    messageBox.classList.add('hidden');
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function updateHttpStatus(status, method) {
    const statusClasses = {
        200: 'success',
        201: 'created',
        404: 'not-found',
        409: 'conflict',
        500: 'error'
    };
    
    const statusMessages = {
        200: 'OK',
        201: 'Created',
        404: 'Not Found',
        409: 'Conflict',
        500: 'Internal Server Error'
    };
    
    const className = statusClasses[status] || 'error';
    const message = statusMessages[status] || 'Unknown';
    
    httpStatus.innerHTML = `
        <span class="http-badge ${className}">
            ${method} ${status} - ${message}
        </span>
    `;
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        httpStatus.innerHTML = '';
    }, 10000);
}

function handleHttpError(status, operation) {
    const errorMessages = {
        404: `Resource not found while trying to ${operation}`,
        500: `Server error occurred while trying to ${operation}`,
        default: `Request failed while trying to ${operation}`
    };
    
    const message = errorMessages[status] || errorMessages.default;
    showMessage(`${message} (HTTP ${status})`, 'error');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
