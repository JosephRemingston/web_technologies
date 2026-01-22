// Current stage tracker
let currentStage = 1;
const totalStages = 4;

// Temporary data storage for form values
let formData = {
    // Stage 1
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    
    // Stage 2
    email: '',
    confirmEmail: '',
    phone: '',
    address: '',
    
    // Stage 3
    accountType: '',
    interests: [],
    newsletter: false,
    terms: false
};

// Validation state for each stage
let stageValidation = {
    1: false,
    2: false,
    3: false,
    4: true  // Review stage is always valid
};

// Initialize the form
function initForm() {
    updateNavigation();
    updateProgress();
    attachEventListeners();
}

// Attach event listeners to all form fields
function attachEventListeners() {
    // Stage 1
    document.getElementById('firstName').addEventListener('input', () => validateField('firstName'));
    document.getElementById('firstName').addEventListener('blur', () => validateField('firstName'));
    
    document.getElementById('lastName').addEventListener('input', () => validateField('lastName'));
    document.getElementById('lastName').addEventListener('blur', () => validateField('lastName'));
    
    document.getElementById('dob').addEventListener('input', () => validateField('dob'));
    document.getElementById('dob').addEventListener('blur', () => validateField('dob'));
    
    document.getElementById('gender').addEventListener('change', () => validateField('gender'));
    
    // Stage 2
    document.getElementById('email').addEventListener('input', () => validateField('email'));
    document.getElementById('email').addEventListener('blur', () => validateField('email'));
    
    document.getElementById('confirmEmail').addEventListener('input', () => validateField('confirmEmail'));
    document.getElementById('confirmEmail').addEventListener('blur', () => validateField('confirmEmail'));
    
    document.getElementById('phone').addEventListener('input', () => validateField('phone'));
    document.getElementById('phone').addEventListener('blur', () => validateField('phone'));
    
    document.getElementById('address').addEventListener('input', () => validateField('address'));
    document.getElementById('address').addEventListener('blur', () => validateField('address'));
    
    // Stage 3
    document.querySelectorAll('input[name="accountType"]').forEach(radio => {
        radio.addEventListener('change', () => validateField('accountType'));
    });
    
    document.querySelectorAll('input[name="interests"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => validateField('interests'));
    });
    
    document.getElementById('terms').addEventListener('change', () => validateField('terms'));
    
    // Form submission
    document.getElementById('multiStageForm').addEventListener('submit', handleSubmit);
}

// Validate individual field
function validateField(fieldName) {
    let isValid = true;
    let errorMsg = '';
    const errorElement = document.getElementById(`error-${fieldName}`);
    
    switch(fieldName) {
        case 'firstName':
        case 'lastName':
            const nameValue = document.getElementById(fieldName).value.trim();
            if (!nameValue) {
                isValid = false;
                errorMsg = 'This field is required';
            } else if (nameValue.length < 2) {
                isValid = false;
                errorMsg = 'Minimum 2 characters required';
            } else if (!/^[a-zA-Z\s]+$/.test(nameValue)) {
                isValid = false;
                errorMsg = 'Only letters and spaces allowed';
            }
            updateFieldUI(fieldName, isValid, errorMsg);
            break;
            
        case 'dob':
            const dobValue = document.getElementById('dob').value.trim();
            if (!dobValue) {
                isValid = false;
                errorMsg = 'Date of birth is required';
            } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dobValue)) {
                isValid = false;
                errorMsg = 'Invalid format. Use DD/MM/YYYY';
            } else {
                const age = calculateAge(dobValue);
                if (age === null) {
                    isValid = false;
                    errorMsg = 'Invalid date';
                } else if (age < 18) {
                    isValid = false;
                    errorMsg = 'You must be at least 18 years old';
                }
            }
            updateFieldUI('dob', isValid, errorMsg);
            break;
            
        case 'gender':
            const genderValue = document.getElementById('gender').value;
            if (!genderValue) {
                isValid = false;
                errorMsg = 'Please select a gender';
            }
            updateFieldUI('gender', isValid, errorMsg);
            break;
            
        case 'email':
            const emailValue = document.getElementById('email').value.trim();
            if (!emailValue) {
                isValid = false;
                errorMsg = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                isValid = false;
                errorMsg = 'Invalid email format';
            }
            updateFieldUI('email', isValid, errorMsg);
            // Re-validate confirm email if it has a value
            if (document.getElementById('confirmEmail').value) {
                validateField('confirmEmail');
            }
            break;
            
        case 'confirmEmail':
            const confirmEmailValue = document.getElementById('confirmEmail').value.trim();
            const originalEmail = document.getElementById('email').value.trim();
            if (!confirmEmailValue) {
                isValid = false;
                errorMsg = 'Please confirm your email';
            } else if (confirmEmailValue !== originalEmail) {
                isValid = false;
                errorMsg = 'Emails do not match';
            }
            updateFieldUI('confirmEmail', isValid, errorMsg);
            break;
            
        case 'phone':
            const phoneValue = document.getElementById('phone').value.trim();
            if (!phoneValue) {
                isValid = false;
                errorMsg = 'Phone number is required';
            } else if (!/^\d{10}$/.test(phoneValue)) {
                isValid = false;
                errorMsg = 'Phone number must be exactly 10 digits';
            }
            updateFieldUI('phone', isValid, errorMsg);
            break;
            
        case 'address':
            const addressValue = document.getElementById('address').value.trim();
            if (!addressValue) {
                isValid = false;
                errorMsg = 'Address is required';
            } else if (addressValue.length < 20) {
                isValid = false;
                errorMsg = 'Address must be at least 20 characters';
            }
            updateFieldUI('address', isValid, errorMsg);
            break;
            
        case 'accountType':
            const accountType = document.querySelector('input[name="accountType"]:checked');
            if (!accountType) {
                isValid = false;
                errorMsg = 'Please select an account type';
            }
            if (errorElement) {
                errorElement.textContent = errorMsg;
            }
            break;
            
        case 'interests':
            const checkedInterests = document.querySelectorAll('input[name="interests"]:checked');
            if (checkedInterests.length < 2) {
                isValid = false;
                errorMsg = 'Please select at least 2 interests';
            }
            if (errorElement) {
                errorElement.textContent = errorMsg;
            }
            break;
            
        case 'terms':
            const termsChecked = document.getElementById('terms').checked;
            if (!termsChecked) {
                isValid = false;
                errorMsg = 'You must agree to the terms and conditions';
            }
            if (errorElement) {
                errorElement.textContent = errorMsg;
            }
            break;
    }
    
    // Update stage validation after each field validation
    validateCurrentStage();
    
    return isValid;
}

// Update field UI based on validation
function updateFieldUI(fieldName, isValid, errorMsg) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`error-${fieldName}`);
    
    if (field) {
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
        }
    }
    
    if (errorElement) {
        errorElement.textContent = errorMsg;
    }
}

// Calculate age from date of birth
function calculateAge(dobString) {
    const parts = dobString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    
    const dob = new Date(year, month, day);
    if (dob.getDate() !== day || dob.getMonth() !== month || dob.getFullYear() !== year) {
        return null; // Invalid date
    }
    
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    return age;
}

// Validate current stage
function validateCurrentStage() {
    let isValid = true;
    
    switch(currentStage) {
        case 1:
            isValid = validateStage1();
            break;
        case 2:
            isValid = validateStage2();
            break;
        case 3:
            isValid = validateStage3();
            break;
        case 4:
            isValid = true; // Review stage is always valid
            break;
    }
    
    stageValidation[currentStage] = isValid;
    updateNavigation();
    
    return isValid;
}

// Validate Stage 1
function validateStage1() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const gender = document.getElementById('gender').value;
    
    const isFirstNameValid = firstName.length >= 2 && /^[a-zA-Z\s]+$/.test(firstName);
    const isLastNameValid = lastName.length >= 2 && /^[a-zA-Z\s]+$/.test(lastName);
    const isDobValid = /^\d{2}\/\d{2}\/\d{4}$/.test(dob) && calculateAge(dob) >= 18;
    const isGenderValid = gender !== '';
    
    return isFirstNameValid && isLastNameValid && isDobValid && isGenderValid;
}

// Validate Stage 2
function validateStage2() {
    const email = document.getElementById('email').value.trim();
    const confirmEmail = document.getElementById('confirmEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isConfirmEmailValid = confirmEmail === email;
    const isPhoneValid = /^\d{10}$/.test(phone);
    const isAddressValid = address.length >= 20;
    
    return isEmailValid && isConfirmEmailValid && isPhoneValid && isAddressValid;
}

// Validate Stage 3
function validateStage3() {
    const accountType = document.querySelector('input[name="accountType"]:checked');
    const interests = document.querySelectorAll('input[name="interests"]:checked');
    const terms = document.getElementById('terms').checked;
    
    return accountType !== null && interests.length >= 2 && terms;
}

// Navigate to next stage
function nextStage() {
    // Validate current stage before proceeding
    if (!validateCurrentStage()) {
        alert('Please fill in all required fields correctly before proceeding.');
        return;
    }
    
    // Save current stage data
    saveStageData(currentStage);
    
    if (currentStage < totalStages) {
        // Hide current stage
        document.getElementById(`stage${currentStage}`).classList.remove('active');
        
        // Move to next stage
        currentStage++;
        
        // Show next stage
        document.getElementById(`stage${currentStage}`).classList.add('active');
        
        // If moving to review stage, populate summary
        if (currentStage === 4) {
            populateSummary();
        }
        
        // Update UI
        updateProgress();
        updateNavigation();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Navigate to previous stage
function previousStage() {
    if (currentStage > 1) {
        // Hide current stage
        document.getElementById(`stage${currentStage}`).classList.remove('active');
        
        // Move to previous stage
        currentStage--;
        
        // Show previous stage
        document.getElementById(`stage${currentStage}`).classList.add('active');
        
        // Update UI
        updateProgress();
        updateNavigation();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Save stage data to temporary storage
function saveStageData(stage) {
    switch(stage) {
        case 1:
            formData.firstName = document.getElementById('firstName').value.trim();
            formData.lastName = document.getElementById('lastName').value.trim();
            formData.dob = document.getElementById('dob').value.trim();
            formData.gender = document.getElementById('gender').value;
            break;
            
        case 2:
            formData.email = document.getElementById('email').value.trim();
            formData.confirmEmail = document.getElementById('confirmEmail').value.trim();
            formData.phone = document.getElementById('phone').value.trim();
            formData.address = document.getElementById('address').value.trim();
            break;
            
        case 3:
            const accountType = document.querySelector('input[name="accountType"]:checked');
            formData.accountType = accountType ? accountType.value : '';
            
            const interests = document.querySelectorAll('input[name="interests"]:checked');
            formData.interests = Array.from(interests).map(i => i.value);
            
            formData.newsletter = document.getElementById('newsletter').checked;
            formData.terms = document.getElementById('terms').checked;
            break;
    }
}

// Populate summary on review stage
function populateSummary() {
    // Personal Information
    document.getElementById('summary-name').textContent = `${formData.firstName} ${formData.lastName}`;
    document.getElementById('summary-dob').textContent = formData.dob;
    document.getElementById('summary-gender').textContent = formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1);
    
    // Contact Details
    document.getElementById('summary-email').textContent = formData.email;
    document.getElementById('summary-phone').textContent = formData.phone;
    document.getElementById('summary-address').textContent = formData.address;
    
    // Preferences
    const accountTypeMap = {
        'basic': 'Basic (Free)',
        'premium': 'Premium (₹999/month)',
        'enterprise': 'Enterprise (₹4999/month)'
    };
    document.getElementById('summary-accountType').textContent = accountTypeMap[formData.accountType] || formData.accountType;
    document.getElementById('summary-interests').textContent = formData.interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
    document.getElementById('summary-newsletter').textContent = formData.newsletter ? 'Yes' : 'No';
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Previous button
    if (currentStage === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
    }
    
    // Next/Submit buttons
    if (currentStage === totalStages) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
        
        // Enable/disable next button based on validation
        nextBtn.disabled = !stageValidation[currentStage];
    }
}

// Update progress indicator
function updateProgress() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressFill = document.getElementById('progressFill');
    
    // Update step circles
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStage) {
            step.classList.add('completed');
        } else if (stepNumber === currentStage) {
            step.classList.add('active');
        }
    });
    
    // Update progress bar
    const progressPercentage = ((currentStage - 1) / (totalStages - 1)) * 100;
    progressFill.style.width = progressPercentage + '%';
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    
    // Final validation check
    if (!stageValidation[1] || !stageValidation[2] || !stageValidation[3]) {
        alert('Please complete all stages correctly before submitting.');
        return;
    }
    
    // Save final stage data
    saveStageData(currentStage);
    
    // Log form data (in real app, would send to server)
    console.log('Form Submitted:', formData);
    
    // Show success message
    document.getElementById('multiStageForm').style.display = 'none';
    document.getElementById('successMessage').classList.add('show');
    
    // Reset after 5 seconds
    setTimeout(() => {
        location.reload();
    }, 5000);
}

// Initialize on page load
initForm();
