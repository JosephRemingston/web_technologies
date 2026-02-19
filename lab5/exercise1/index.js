// Employee Management System - Local Storage Implementation
// Note: Since local XML files cannot be modified via AJAX due to browser security,
// we'll load initial data from XML and manage it in memory/localStorage

let employeesData = [];
let nextEmployeeId = 6; // Start from 6 as we have 5 initial employees

// DOM Elements
const employeeForm = document.getElementById('employeeForm');
const employeeTableBody = document.getElementById('employeeTableBody');
const messageBox = document.getElementById('messageBox');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyMessage = document.getElementById('emptyMessage');
const refreshBtn = document.getElementById('refreshBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEmployeesFromXML();
    
    // Event Listeners
    employeeForm.addEventListener('submit', handleFormSubmit);
    refreshBtn.addEventListener('click', loadEmployeesFromXML);
    cancelBtn.addEventListener('click', resetForm);
});

/**
 * Load employees from XML file using AJAX
 */
function loadEmployeesFromXML() {
    showLoading(true);
    showMessage('Loading employee data...', 'info');
    
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    parseXMLResponse(xhr.responseXML);
                    showMessage('Employee data loaded successfully!', 'success');
                } catch (error) {
                    handleXMLError(error);
                }
            } else if (xhr.status === 0) {
                // File not found or CORS issue
                showMessage('Error: Unable to load XML file. Make sure employees.xml exists and you\'re running on a web server.', 'error');
                checkLocalStorage();
            } else {
                showMessage('Error loading XML file. Status: ' + xhr.status, 'error');
                checkLocalStorage();
            }
            showLoading(false);
        }
    };
    
    xhr.onerror = function() {
        showMessage('Network error occurred while loading XML file.', 'error');
        checkLocalStorage();
        showLoading(false);
    };
    
    xhr.open('GET', 'employees.xml', true);
    xhr.send();
}

/**
 * Parse XML response using responseXML and getElementsByTagName()
 */
function parseXMLResponse(xmlDoc) {
    if (!xmlDoc) {
        throw new Error('Invalid or malformed XML document');
    }
    
    // Clear existing data
    employeesData = [];
    
    // Get all employee nodes using getElementsByTagName
    const employees = xmlDoc.getElementsByTagName('employee');
    
    if (employees.length === 0) {
        showMessage('No employees found in XML file.', 'warning');
        displayEmployees();
        return;
    }
    
    // Parse each employee
    for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        
        // Get employee ID from attribute
        const id = employee.getAttribute('id');
        
        // Get employee data using getElementsByTagName
        const nameNodes = employee.getElementsByTagName('name');
        const departmentNodes = employee.getElementsByTagName('department');
        const salaryNodes = employee.getElementsByTagName('salary');
        
        // Validate required fields
        if (!nameNodes.length || !departmentNodes.length || !salaryNodes.length) {
            console.warn(`Employee ${id} has missing fields, skipping...`);
            continue;
        }
        
        // Extract text content
        const employeeObj = {
            id: parseInt(id),
            name: nameNodes[0].textContent || nameNodes[0].innerText,
            department: departmentNodes[0].textContent || departmentNodes[0].innerText,
            salary: parseFloat(salaryNodes[0].textContent || salaryNodes[0].innerText)
        };
        
        employeesData.push(employeeObj);
        
        // Update next ID
        if (employeeObj.id >= nextEmployeeId) {
            nextEmployeeId = employeeObj.id + 1;
        }
    }
    
    // Save to localStorage as backup
    saveToLocalStorage();
    
    // Display employees
    displayEmployees();
}

/**
 * Check and load from localStorage if XML fails
 */
function checkLocalStorage() {
    const stored = localStorage.getItem('employeesData');
    if (stored) {
        employeesData = JSON.parse(stored);
        displayEmployees();
        showMessage('Loaded data from local storage.', 'info');
    } else {
        displayEmployees();
    }
}

/**
 * Save employees to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('employeesData', JSON.stringify(employeesData));
}

/**
 * Display all employees in the table
 */
function displayEmployees() {
    employeeTableBody.innerHTML = '';
    
    if (employeesData.length === 0) {
        emptyMessage.style.display = 'block';
        document.getElementById('employeeTable').style.display = 'none';
        return;
    }
    
    emptyMessage.style.display = 'none';
    document.getElementById('employeeTable').style.display = 'table';
    
    employeesData.forEach(employee => {
        const row = createEmployeeRow(employee);
        employeeTableBody.appendChild(row);
    });
}

/**
 * Create a table row for an employee
 */
function createEmployeeRow(employee) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', employee.id);
    
    row.innerHTML = `
        <td>${employee.id}</td>
        <td>${escapeHtml(employee.name)}</td>
        <td>${escapeHtml(employee.department)}</td>
        <td>$${employee.salary.toLocaleString()}</td>
        <td class="actions">
            <button class="btn btn-edit" onclick="editEmployee(${employee.id})">Edit</button>
            <button class="btn btn-delete" onclick="deleteEmployee(${employee.id})">Delete</button>
        </td>
    `;
    
    return row;
}

/**
 * Handle form submission (Create or Update)
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('employeeId').value;
    const name = document.getElementById('employeeName').value.trim();
    const department = document.getElementById('employeeDepartment').value;
    const salary = parseFloat(document.getElementById('employeeSalary').value);
    
    // Validate input
    if (!name || !department || !salary || salary < 0) {
        showMessage('Please fill all fields with valid data.', 'error');
        return;
    }
    
    if (id) {
        // Update existing employee
        updateEmployee(parseInt(id), name, department, salary);
    } else {
        // Create new employee
        createEmployee(name, department, salary);
    }
}

/**
 * CREATE - Add new employee
 */
function createEmployee(name, department, salary) {
    const newEmployee = {
        id: nextEmployeeId++,
        name: name,
        department: department,
        salary: salary
    };
    
    employeesData.push(newEmployee);
    saveToLocalStorage();
    displayEmployees();
    
    showMessage(`Employee "${name}" added successfully!`, 'success');
    resetForm();
}

/**
 * UPDATE - Modify existing employee
 */
function updateEmployee(id, name, department, salary) {
    const index = employeesData.findIndex(emp => emp.id === id);
    
    if (index === -1) {
        showMessage('Employee not found!', 'error');
        return;
    }
    
    employeesData[index] = {
        id: id,
        name: name,
        department: department,
        salary: salary
    };
    
    saveToLocalStorage();
    displayEmployees();
    
    showMessage(`Employee "${name}" updated successfully!`, 'success');
    resetForm();
}

/**
 * DELETE - Remove employee
 */
function deleteEmployee(id) {
    const employee = employeesData.find(emp => emp.id === id);
    
    if (!employee) {
        showMessage('Employee not found!', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${employee.name}?`)) {
        return;
    }
    
    employeesData = employeesData.filter(emp => emp.id !== id);
    saveToLocalStorage();
    displayEmployees();
    
    showMessage(`Employee "${employee.name}" deleted successfully!`, 'success');
}

/**
 * Load employee data into form for editing
 */
function editEmployee(id) {
    const employee = employeesData.find(emp => emp.id === id);
    
    if (!employee) {
        showMessage('Employee not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('employeeId').value = employee.id;
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeeDepartment').value = employee.department;
    document.getElementById('employeeSalary').value = employee.salary;
    
    // Update UI
    formTitle.textContent = 'Update Employee';
    submitBtn.textContent = 'Update Employee';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset form to initial state
 */
function resetForm() {
    employeeForm.reset();
    document.getElementById('employeeId').value = '';
    formTitle.textContent = 'Add New Employee';
    submitBtn.textContent = 'Add Employee';
    cancelBtn.style.display = 'none';
}

/**
 * Show message to user
 */
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `message-box message-${type}`;
    messageBox.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

/**
 * Handle XML parsing errors
 */
function handleXMLError(error) {
    console.error('XML Parsing Error:', error);
    showMessage('Error: Malformed XML document. ' + error.message, 'error');
    checkLocalStorage();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
