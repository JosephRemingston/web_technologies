// Student Record System - Using Fetch API and JSON
// Implements CRUD operations with local JSON file

let studentsData = [];
let filteredStudents = [];
let nextStudentId = 11; // Start from 11 as we have 10 initial students

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentTableBody = document.getElementById('studentTableBody');
const alertBox = document.getElementById('alertBox');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const tableWrapper = document.getElementById('tableWrapper');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const cancelBtn = document.getElementById('cancelBtn');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const gradeFilter = document.getElementById('gradeFilter');

// Statistics elements
const totalStudentsEl = document.getElementById('totalStudents');
const averageMarksEl = document.getElementById('averageMarks');
const excellentStudentsEl = document.getElementById('excellentStudents');
const totalCoursesEl = document.getElementById('totalCourses');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadStudentsFromJSON();
    
    // Event Listeners
    studentForm.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetForm);
    cancelBtn.addEventListener('click', cancelEdit);
    refreshBtn.addEventListener('click', loadStudentsFromJSON);
    searchInput.addEventListener('input', applyFilters);
    courseFilter.addEventListener('change', applyFilters);
    gradeFilter.addEventListener('change', applyFilters);
});

/**
 * Load students from JSON file using Fetch API
 */
async function loadStudentsFromJSON() {
    showLoading(true);
    showAlert('Loading student records...', 'info');
    
    try {
        // Use Fetch API to retrieve JSON data
        const response = await fetch('students.json?t=' + new Date().getTime());
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse JSON response using response.json()
        const data = await response.json();
        
        // Validate JSON structure
        if (!data || !data.students || !Array.isArray(data.students)) {
            throw new Error('Invalid JSON structure: missing or invalid "students" array');
        }
        
        // Process student data
        processStudentData(data.students);
        
        showAlert('Student records loaded successfully!', 'success');
        
    } catch (error) {
        handleJSONError(error);
    } finally {
        showLoading(false);
    }
}

/**
 * Process and validate student data from JSON
 */
function processStudentData(students) {
    // Clear existing data
    studentsData = [];
    
    if (students.length === 0) {
        showAlert('No students found in JSON file.', 'warning');
        updateDisplay();
        return;
    }
    
    // Validate and process each student
    students.forEach((student, index) => {
        try {
            // Validate required fields
            if (!validateStudentData(student)) {
                console.warn(`Student at index ${index} has invalid data, skipping...`);
                return;
            }
            
            // Add to students array
            studentsData.push({
                id: parseInt(student.id),
                name: String(student.name).trim(),
                course: String(student.course).trim(),
                marks: parseFloat(student.marks)
            });
            
            // Update next ID
            if (student.id >= nextStudentId) {
                nextStudentId = student.id + 1;
            }
            
        } catch (error) {
            console.error(`Error processing student at index ${index}:`, error);
        }
    });
    
    // Save to localStorage as backup
    saveToLocalStorage();
    
    // Update course filter options
    updateCourseFilter();
    
    // Update display
    updateDisplay();
}

/**
 * Validate student data
 */
function validateStudentData(student) {
    // Check required fields exist
    if (!student.id || student.id <= 0) {
        console.warn('Invalid or missing ID:', student);
        return false;
    }
    
    if (!student.name || String(student.name).trim().length < 2) {
        console.warn('Invalid or missing name:', student);
        return false;
    }
    
    if (!student.course || String(student.course).trim().length === 0) {
        console.warn('Invalid or missing course:', student);
        return false;
    }
    
    if (student.marks === undefined || student.marks === null) {
        console.warn('Invalid or missing marks:', student);
        return false;
    }
    
    const marks = parseFloat(student.marks);
    if (isNaN(marks) || marks < 0 || marks > 100) {
        console.warn('Marks out of range (0-100):', student);
        return false;
    }
    
    return true;
}

/**
 * Handle form submission (Create or Update)
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const id = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value.trim();
    const course = document.getElementById('studentCourse').value;
    const marks = parseFloat(document.getElementById('studentMarks').value);
    
    // Additional validation
    if (name.length < 2) {
        showAlert('Name must be at least 2 characters long.', 'error');
        return;
    }
    
    if (!course) {
        showAlert('Please select a course.', 'error');
        return;
    }
    
    if (isNaN(marks) || marks < 0 || marks > 100) {
        showAlert('Marks must be between 0 and 100.', 'error');
        return;
    }
    
    const studentData = { name, course, marks };
    
    if (id) {
        // Update existing student
        updateStudent(parseInt(id), studentData);
    } else {
        // Create new student
        createStudent(studentData);
    }
}

/**
 * CREATE - Add new student object
 */
function createStudent(studentData) {
    const newStudent = {
        id: nextStudentId++,
        name: studentData.name,
        course: studentData.course,
        marks: studentData.marks
    };
    
    // Add to students array
    studentsData.push(newStudent);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update course filter
    updateCourseFilter();
    
    // Update display
    updateDisplay();
    
    // Show success message
    showAlert(`Student "${newStudent.name}" added successfully!`, 'success');
    
    // Reset form
    resetForm();
}

/**
 * UPDATE - Modify existing student's marks or course
 */
function updateStudent(id, studentData) {
    const index = studentsData.findIndex(student => student.id === id);
    
    if (index === -1) {
        showAlert('Student not found!', 'error');
        return;
    }
    
    // Update student data
    studentsData[index] = {
        id: id,
        name: studentData.name,
        course: studentData.course,
        marks: studentData.marks
    };
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update course filter
    updateCourseFilter();
    
    // Update display
    updateDisplay();
    
    // Show success message
    showAlert(`Student "${studentData.name}" updated successfully!`, 'success');
    
    // Reset form
    resetForm();
}

/**
 * DELETE - Remove student object
 */
function deleteStudent(id) {
    const student = studentsData.find(s => s.id === id);
    
    if (!student) {
        showAlert('Student not found!', 'error');
        return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
        return;
    }
    
    // Remove from array
    studentsData = studentsData.filter(s => s.id !== id);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update course filter
    updateCourseFilter();
    
    // Update display
    updateDisplay();
    
    // Show success message
    showAlert(`Student "${student.name}" deleted successfully!`, 'success');
}

/**
 * Load student data into form for editing
 */
function editStudent(id) {
    const student = studentsData.find(s => s.id === id);
    
    if (!student) {
        showAlert('Student not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('studentId').value = student.id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentCourse').value = student.course;
    document.getElementById('studentMarks').value = student.marks;
    
    // Update UI
    formTitle.textContent = 'Edit Student Record';
    submitBtn.innerHTML = '<span class="icon">💾</span> Update Student';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset form to add mode
 */
function resetForm() {
    studentForm.reset();
    document.getElementById('studentId').value = '';
    formTitle.textContent = 'Add New Student';
    submitBtn.innerHTML = '<span class="icon">➕</span> Add Student';
    cancelBtn.style.display = 'none';
}

/**
 * Cancel edit and return to add mode
 */
function cancelEdit() {
    resetForm();
    showAlert('Edit cancelled.', 'info');
}

/**
 * Apply search and filters
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCourse = courseFilter.value;
    const selectedGrade = gradeFilter.value;
    
    filteredStudents = studentsData.filter(student => {
        // Search filter
        const matchesSearch = 
            student.name.toLowerCase().includes(searchTerm) ||
            student.course.toLowerCase().includes(searchTerm);
        
        // Course filter
        const matchesCourse = !selectedCourse || student.course === selectedCourse;
        
        // Grade filter
        const matchesGrade = !selectedGrade || checkGradeMatch(student.marks, selectedGrade);
        
        return matchesSearch && matchesCourse && matchesGrade;
    });
    
    displayStudents();
}

/**
 * Check if marks match grade filter
 */
function checkGradeMatch(marks, gradeFilter) {
    switch (gradeFilter) {
        case 'excellent':
            return marks >= 90;
        case 'good':
            return marks >= 75 && marks < 90;
        case 'average':
            return marks >= 60 && marks < 75;
        case 'below-average':
            return marks < 60;
        default:
            return true;
    }
}

/**
 * Update entire display
 */
function updateDisplay() {
    updateStatistics();
    applyFilters();
}

/**
 * Update statistics dashboard
 */
function updateStatistics() {
    const total = studentsData.length;
    
    // Calculate average marks
    const average = total > 0 
        ? (studentsData.reduce((sum, s) => sum + s.marks, 0) / total).toFixed(1)
        : 0;
    
    // Count excellent students (90+)
    const excellent = studentsData.filter(s => s.marks >= 90).length;
    
    // Count unique courses
    const courses = new Set(studentsData.map(s => s.course)).size;
    
    // Update UI
    totalStudentsEl.textContent = total;
    averageMarksEl.textContent = average;
    excellentStudentsEl.textContent = excellent;
    totalCoursesEl.textContent = courses;
}

/**
 * Update course filter dropdown
 */
function updateCourseFilter() {
    const uniqueCourses = [...new Set(studentsData.map(s => s.course))].sort();
    
    // Store current selection
    const currentSelection = courseFilter.value;
    
    // Clear and rebuild options
    courseFilter.innerHTML = '<option value="">All Courses</option>';
    
    uniqueCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseFilter.appendChild(option);
    });
    
    // Restore selection if still valid
    if (uniqueCourses.includes(currentSelection)) {
        courseFilter.value = currentSelection;
    }
}

/**
 * Display students in table
 */
function displayStudents() {
    studentTableBody.innerHTML = '';
    
    const studentsToDisplay = filteredStudents.length > 0 || searchInput.value || courseFilter.value || gradeFilter.value
        ? filteredStudents
        : studentsData;
    
    if (studentsToDisplay.length === 0) {
        emptyState.style.display = 'block';
        tableWrapper.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    tableWrapper.style.display = 'block';
    
    studentsToDisplay.forEach(student => {
        const row = createStudentRow(student);
        studentTableBody.appendChild(row);
    });
}

/**
 * Create table row for student
 */
function createStudentRow(student) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', student.id);
    
    const grade = calculateGrade(student.marks);
    const gradeClass = grade.class;
    
    row.innerHTML = `
        <td class="student-id">${student.id}</td>
        <td class="student-name">${escapeHtml(student.name)}</td>
        <td class="student-course">${escapeHtml(student.course)}</td>
        <td class="student-marks">
            <span class="marks-value">${student.marks}</span>
        </td>
        <td>
            <span class="grade-badge grade-${gradeClass}">
                ${grade.letter}
            </span>
        </td>
        <td class="actions">
            <button class="btn-action btn-edit" onclick="editStudent(${student.id})" title="Edit">
                ✏️ Edit
            </button>
            <button class="btn-action btn-delete" onclick="deleteStudent(${student.id})" title="Delete">
                🗑️ Delete
            </button>
        </td>
    `;
    
    return row;
}

/**
 * Calculate grade from marks
 */
function calculateGrade(marks) {
    if (marks >= 90) return { letter: 'A+', class: 'excellent' };
    if (marks >= 85) return { letter: 'A', class: 'excellent' };
    if (marks >= 80) return { letter: 'B+', class: 'good' };
    if (marks >= 75) return { letter: 'B', class: 'good' };
    if (marks >= 70) return { letter: 'C+', class: 'average' };
    if (marks >= 60) return { letter: 'C', class: 'average' };
    if (marks >= 50) return { letter: 'D', class: 'below-average' };
    return { letter: 'F', class: 'fail' };
}

/**
 * Show alert/notification
 */
function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert-box alert-${type} show`;
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 4000);
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
    loadingState.style.display = show ? 'flex' : 'none';
}

/**
 * Handle JSON parsing errors
 */
function handleJSONError(error) {
    console.error('JSON Error:', error);
    
    let errorMessage = 'Error loading student records: ';
    
    if (error.message.includes('HTTP error')) {
        errorMessage += 'Unable to load students.json. Make sure you\'re running on a web server.';
    } else if (error.message.includes('Invalid JSON')) {
        errorMessage += 'Malformed JSON file. Please check the file syntax.';
    } else if (error instanceof SyntaxError) {
        errorMessage += 'JSON parsing error. The file contains invalid JSON syntax.';
    } else {
        errorMessage += error.message;
    }
    
    showAlert(errorMessage, 'error');
    
    // Try to load from localStorage
    loadFromLocalStorage();
}

/**
 * Save to localStorage
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem('studentRecords', JSON.stringify(studentsData));
        localStorage.setItem('nextStudentId', nextStudentId);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showAlert('Warning: Unable to save data to local storage.', 'warning');
    }
}

/**
 * Load from localStorage as fallback
 */
function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem('studentRecords');
        if (stored) {
            studentsData = JSON.parse(stored);
            
            const storedId = localStorage.getItem('nextStudentId');
            if (storedId) {
                nextStudentId = parseInt(storedId);
            }
            
            updateCourseFilter();
            updateDisplay();
            showAlert('Loaded data from local storage.', 'info');
        } else {
            updateDisplay();
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showAlert('Error: Unable to load data from local storage.', 'error');
        updateDisplay();
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
