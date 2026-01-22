// Validation Rules Configuration based on Role
const validationRules = {
    student: {
        passwordMinLength: 8,
        requireSpecialChar: false,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        allowedEmailDomains: ['student.edu', 'university.edu', 'edu'],
        ageRequired: true,
        minAge: 16,
        maxAge: 100,
        skillsRequired: false
    },
    teacher: {
        passwordMinLength: 10,
        requireSpecialChar: true,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        allowedEmailDomains: ['teacher.edu', 'university.edu', 'edu', 'school.org'],
        ageRequired: true,
        minAge: 22,
        maxAge: 100,
        skillsRequired: true
    },
    admin: {
        passwordMinLength: 12,
        requireSpecialChar: true,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        allowedEmailDomains: [], // Any domain allowed
        ageRequired: false,
        minAge: 25,
        maxAge: 100,
        skillsRequired: false
    }
};

// Get form elements
const form = document.getElementById('registrationForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const roleSelect = document.getElementById('role');
const ageInput = document.getElementById('age');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const skillsInput = document.getElementById('skills');
const submitBtn = document.getElementById('submitBtn');

// Get error message elements
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const roleError = document.getElementById('role-error');
const ageError = document.getElementById('age-error');
const passwordError = document.getElementById('password-error');
const confirmPasswordError = document.getElementById('confirmPassword-error');
const skillsError = document.getElementById('skills-error');

// Get additional elements
const roleInfo = document.getElementById('role-info');
const emailHint = document.getElementById('email-hint');
const ageGroup = document.getElementById('age-group');
const skillsGroup = document.getElementById('skills-group');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');
const successMessage = document.getElementById('success-message');

// Password requirement elements
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqLowercase = document.getElementById('req-lowercase');
const reqNumber = document.getElementById('req-number');
const reqSpecial = document.getElementById('req-special');

// Validation state
let validationState = {
    name: false,
    email: false,
    role: false,
    age: true, // Default true since age might not be required
    password: false,
    confirmPassword: false,
    skills: true // Default true since skills might not be required
};

// Current role
let currentRole = '';

// Event Listeners
roleSelect.addEventListener('change', handleRoleChange);
nameInput.addEventListener('input', validateName);
nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('input', validateEmail);
emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('input', validatePassword);
passwordInput.addEventListener('blur', validatePassword);
confirmPasswordInput.addEventListener('input', validateConfirmPassword);
confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
ageInput.addEventListener('input', validateAge);
ageInput.addEventListener('blur', validateAge);
skillsInput.addEventListener('input', validateSkills);
skillsInput.addEventListener('blur', validateSkills);

form.addEventListener('submit', handleSubmit);

// Handle Role Change - Dynamic form adjustments
function handleRoleChange(e) {
    const role = e.target.value;
    currentRole = role;
    
    if (!role) {
        setError(roleSelect, roleError, 'Please select a role');
        validationState.role = false;
        hideRoleSpecificFields();
        updateSubmitButton();
        return;
    }
    
    clearError(roleSelect, roleError);
    validationState.role = true;
    
    // Show role information
    showRoleInfo(role);
    
    // Show/hide fields based on role
    showRoleSpecificFields(role);
    
    // Update password requirements display
    updatePasswordRequirements(role);
    
    // Update email hint
    updateEmailHint(role);
    
    // Re-validate existing inputs with new rules
    if (emailInput.value) validateEmail();
    if (passwordInput.value) validatePassword();
    if (ageInput.value) validateAge();
    if (skillsInput.value) validateSkills();
    
    updateSubmitButton();
}

// Show role-specific information
function showRoleInfo(role) {
    const rules = validationRules[role];
    let infoText = '';
    
    if (role === 'student') {
        infoText = `<strong>Student Requirements:</strong><br>
                    • Password: At least ${rules.passwordMinLength} characters<br>
                    • Email must be from educational domain<br>
                    • Age: ${rules.minAge}+`;
    } else if (role === 'teacher') {
        infoText = `<strong>Teacher Requirements:</strong><br>
                    • Password: At least ${rules.passwordMinLength} characters with special character<br>
                    • Email from educational domain required<br>
                    • Age: ${rules.minAge}+<br>
                    • Skills/Specialization required`;
    } else if (role === 'admin') {
        infoText = `<strong>Admin Requirements:</strong><br>
                    • Password: At least ${rules.passwordMinLength} characters with special character<br>
                    • Strong security requirements<br>
                    • Any email domain accepted`;
    }
    
    roleInfo.innerHTML = infoText;
    roleInfo.className = 'role-info ' + role;
}

// Show/hide fields based on role
function showRoleSpecificFields(role) {
    const rules = validationRules[role];
    
    // Age field
    if (rules.ageRequired) {
        ageGroup.style.display = 'block';
        validationState.age = false;
        ageInput.value = '';
    } else {
        ageGroup.style.display = 'none';
        validationState.age = true;
        clearError(ageInput, ageError);
    }
    
    // Skills field
    if (rules.skillsRequired) {
        skillsGroup.style.display = 'block';
        validationState.skills = false;
        skillsInput.value = '';
    } else {
        skillsGroup.style.display = 'none';
        validationState.skills = true;
        clearError(skillsInput, skillsError);
    }
}

// Hide all role-specific fields
function hideRoleSpecificFields() {
    ageGroup.style.display = 'none';
    skillsGroup.style.display = 'none';
    roleInfo.style.display = 'none';
    emailHint.textContent = '';
    validationState.age = true;
    validationState.skills = true;
}

// Update password requirements display
function updatePasswordRequirements(role) {
    const rules = validationRules[role];
    
    reqLength.textContent = `At least ${rules.passwordMinLength} characters`;
    
    if (rules.requireSpecialChar) {
        reqSpecial.style.display = 'list-item';
    } else {
        reqSpecial.style.display = 'none';
    }
}

// Update email hint based on role
function updateEmailHint(role) {
    const rules = validationRules[role];
    
    if (rules.allowedEmailDomains.length > 0) {
        emailHint.textContent = `Accepted domains: ${rules.allowedEmailDomains.join(', ')}`;
    } else {
        emailHint.textContent = 'Any email domain accepted';
    }
}

// Validate Name
function validateName() {
    const name = nameInput.value.trim();
    
    if (!name) {
        setError(nameInput, nameError, 'Name is required');
        validationState.name = false;
        updateSubmitButton();
        return false;
    }
    
    if (name.length < 2) {
        setError(nameInput, nameError, 'Name must be at least 2 characters');
        validationState.name = false;
        updateSubmitButton();
        return false;
    }
    
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        setError(nameInput, nameError, 'Name should only contain letters and spaces');
        validationState.name = false;
        updateSubmitButton();
        return false;
    }
    
    clearError(nameInput, nameError);
    validationState.name = true;
    updateSubmitButton();
    return true;
}

// Validate Email with domain checking
function validateEmail() {
    const email = emailInput.value.trim();
    
    if (!email) {
        setError(emailInput, emailError, 'Email is required');
        validationState.email = false;
        updateSubmitButton();
        return false;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError(emailInput, emailError, 'Please enter a valid email address');
        validationState.email = false;
        updateSubmitButton();
        return false;
    }
    
    // Domain validation based on role
    if (currentRole && validationRules[currentRole]) {
        const rules = validationRules[currentRole];
        
        if (rules.allowedEmailDomains.length > 0) {
            const domain = email.split('@')[1];
            const isValidDomain = rules.allowedEmailDomains.some(allowedDomain => 
                domain.endsWith(allowedDomain)
            );
            
            if (!isValidDomain) {
                setError(emailInput, emailError, 
                    `Email must be from: ${rules.allowedEmailDomains.join(', ')}`);
                validationState.email = false;
                updateSubmitButton();
                return false;
            }
        }
    }
    
    clearError(emailInput, emailError);
    validationState.email = true;
    updateSubmitButton();
    return true;
}

// Validate Password with strength checking
function validatePassword() {
    const password = passwordInput.value;
    
    if (!password) {
        setError(passwordInput, passwordError, 'Password is required');
        validationState.password = false;
        resetPasswordStrength();
        updateSubmitButton();
        return false;
    }
    
    // Get rules for current role
    const rules = currentRole ? validationRules[currentRole] : validationRules.student;
    
    let errors = [];
    let metRequirements = 0;
    let totalRequirements = 4; // Base requirements
    
    // Check length
    if (password.length >= rules.passwordMinLength) {
        reqLength.classList.add('met');
        metRequirements++;
    } else {
        reqLength.classList.remove('met');
        errors.push(`At least ${rules.passwordMinLength} characters required`);
    }
    
    // Check uppercase
    if (rules.requireUppercase) {
        if (/[A-Z]/.test(password)) {
            reqUppercase.classList.add('met');
            metRequirements++;
        } else {
            reqUppercase.classList.remove('met');
            errors.push('At least one uppercase letter required');
        }
    }
    
    // Check lowercase
    if (rules.requireLowercase) {
        if (/[a-z]/.test(password)) {
            reqLowercase.classList.add('met');
            metRequirements++;
        } else {
            reqLowercase.classList.remove('met');
            errors.push('At least one lowercase letter required');
        }
    }
    
    // Check number
    if (rules.requireNumber) {
        if (/[0-9]/.test(password)) {
            reqNumber.classList.add('met');
            metRequirements++;
        } else {
            reqNumber.classList.remove('met');
            errors.push('At least one number required');
        }
    }
    
    // Check special character (if required)
    if (rules.requireSpecialChar) {
        totalRequirements++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            reqSpecial.classList.add('met');
            metRequirements++;
        } else {
            reqSpecial.classList.remove('met');
            errors.push('At least one special character required');
        }
    }
    
    // Update password strength indicator
    updatePasswordStrength(metRequirements, totalRequirements);
    
    // Show errors if any
    if (errors.length > 0) {
        setError(passwordInput, passwordError, errors[0]);
        validationState.password = false;
        updateSubmitButton();
        return false;
    }
    
    clearError(passwordInput, passwordError);
    validationState.password = true;
    
    // Re-validate confirm password if it has a value
    if (confirmPasswordInput.value) {
        validateConfirmPassword();
    }
    
    updateSubmitButton();
    return true;
}

// Update password strength indicator
function updatePasswordStrength(met, total) {
    const percentage = (met / total) * 100;
    
    strengthFill.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    
    if (percentage < 50) {
        strengthFill.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak';
    } else if (percentage < 100) {
        strengthFill.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Medium';
    } else {
        strengthFill.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Strong';
    }
}

// Reset password strength indicator
function resetPasswordStrength() {
    strengthFill.className = 'strength-fill';
    strengthText.textContent = '';
    strengthText.className = 'strength-text';
    reqLength.classList.remove('met');
    reqUppercase.classList.remove('met');
    reqLowercase.classList.remove('met');
    reqNumber.classList.remove('met');
    reqSpecial.classList.remove('met');
}

// Validate Confirm Password
function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
        setError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
        validationState.confirmPassword = false;
        updateSubmitButton();
        return false;
    }
    
    if (password !== confirmPassword) {
        setError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
        validationState.confirmPassword = false;
        updateSubmitButton();
        return false;
    }
    
    clearError(confirmPasswordInput, confirmPasswordError);
    validationState.confirmPassword = true;
    updateSubmitButton();
    return true;
}

// Validate Age
function validateAge() {
    // Only validate if age is required for the current role
    if (!currentRole || !validationRules[currentRole].ageRequired) {
        validationState.age = true;
        updateSubmitButton();
        return true;
    }
    
    const age = ageInput.value;
    const rules = validationRules[currentRole];
    
    if (!age) {
        setError(ageInput, ageError, 'Age is required for this role');
        validationState.age = false;
        updateSubmitButton();
        return false;
    }
    
    const ageNum = parseInt(age);
    
    if (isNaN(ageNum) || ageNum < rules.minAge || ageNum > rules.maxAge) {
        setError(ageInput, ageError, 
            `Age must be between ${rules.minAge} and ${rules.maxAge}`);
        validationState.age = false;
        updateSubmitButton();
        return false;
    }
    
    clearError(ageInput, ageError);
    validationState.age = true;
    updateSubmitButton();
    return true;
}

// Validate Skills
function validateSkills() {
    // Only validate if skills are required for the current role
    if (!currentRole || !validationRules[currentRole].skillsRequired) {
        validationState.skills = true;
        updateSubmitButton();
        return true;
    }
    
    const skills = skillsInput.value.trim();
    
    if (!skills) {
        setError(skillsInput, skillsError, 'Skills/Specialization is required for this role');
        validationState.skills = false;
        updateSubmitButton();
        return false;
    }
    
    if (skills.length < 10) {
        setError(skillsInput, skillsError, 'Please provide at least 10 characters');
        validationState.skills = false;
        updateSubmitButton();
        return false;
    }
    
    clearError(skillsInput, skillsError);
    validationState.skills = true;
    updateSubmitButton();
    return true;
}

// Set error state
function setError(input, errorElement, message) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    errorElement.textContent = message;
}

// Clear error state
function clearError(input, errorElement) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    errorElement.textContent = '';
}

// Update submit button state
function updateSubmitButton() {
    const allValid = Object.values(validationState).every(state => state === true);
    submitBtn.disabled = !allValid;
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    // Final validation check
    const nameValid = validateName();
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    const confirmPasswordValid = validateConfirmPassword();
    const ageValid = validateAge();
    const skillsValid = validateSkills();
    
    if (!currentRole) {
        setError(roleSelect, roleError, 'Please select a role');
        return;
    }
    
    if (nameValid && emailValid && passwordValid && confirmPasswordValid && 
        ageValid && skillsValid && currentRole) {
        
        // Show success message
        successMessage.style.display = 'block';
        
        // Log the form data (in real app, this would be sent to server)
        console.log('Registration successful!', {
            name: nameInput.value,
            email: emailInput.value,
            role: roleSelect.value,
            age: ageInput.value || 'N/A',
            skills: skillsInput.value || 'N/A'
        });
        
        // Reset form after 2 seconds
        setTimeout(() => {
            form.reset();
            successMessage.style.display = 'none';
            hideRoleSpecificFields();
            resetPasswordStrength();
            
            // Reset validation state
            validationState = {
                name: false,
                email: false,
                role: false,
                age: true,
                password: false,
                confirmPassword: false,
                skills: true
            };
            
            // Remove all valid/invalid classes
            document.querySelectorAll('.valid, .invalid').forEach(el => {
                el.classList.remove('valid', 'invalid');
            });
            
            currentRole = '';
            updateSubmitButton();
        }, 2000);
    }
}
