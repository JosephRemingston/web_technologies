const userForm = document.getElementById('userForm');
const message = document.getElementById('message');
const userTableBody = document.getElementById('userTableBody');
const clearAllBtn = document.getElementById('clearAllBtn');

// Load and display users on page load
displayUsers();

// Handle form submission
userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('password').value;
    
    // Validations
    if (!name || !email || !mobile || !password) {
        showMessage('All fields are mandatory', 'error');
        return;
    }
    
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        showMessage('Mobile number must be 10 digits', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be minimum 6 characters', 'error');
        return;
    }
    
    // Check for duplicate email
    const users = getUsers();
    if (users.find(user => user.email === email)) {
        showMessage('Email already registered', 'error');
        return;
    }
    
    // Create user object
    const user = { name, email, mobile, password };
    users.push(user);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('User registered successfully', 'success');
    userForm.reset();
    displayUsers();
});

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Display users in table
function displayUsers() {
    const users = getUsers();
    userTableBody.innerHTML = '';
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.mobile}</td>
            <td><button onclick="deleteUser(${index})">Delete</button></td>
        `;
        userTableBody.appendChild(row);
    });
}

// Delete a user
function deleteUser(index) {
    const users = getUsers();
    users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users));
    displayUsers();
    showMessage('User deleted successfully', 'success');
}

// Clear all users
clearAllBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete all users?')) {
        localStorage.removeItem('users');
        displayUsers();
        showMessage('All users cleared', 'success');
    }
});

// Show message
function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}
