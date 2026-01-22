// Survey Questions Structure
const surveyQuestions = [
    {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        required: true,
        validation: {
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z\s]+$/,
            errorMessage: 'Name should only contain letters and spaces'
        }
    },
    {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        validation: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: 'Please enter a valid email address'
        }
    },
    {
        id: 'age',
        type: 'radio',
        label: 'Age Group',
        required: true,
        options: ['Under 18', '18-25', '26-35', '36-50', 'Above 50']
    },
    {
        id: 'experience',
        type: 'radio',
        label: 'Programming Experience',
        required: true,
        options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    {
        id: 'interests',
        type: 'checkbox',
        label: 'Areas of Interest',
        required: true,
        hint: 'Select at least 2 options',
        options: ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Cloud Computing', 'DevOps'],
        validation: {
            minSelections: 2,
            maxSelections: 4,
            errorMessage: 'Please select between 2 and 4 options'
        }
    },
    {
        id: 'skills',
        type: 'checkbox',
        label: 'Programming Languages Known',
        required: true,
        hint: 'Select at least 1',
        options: ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
        validation: {
            minSelections: 1,
            errorMessage: 'Please select at least 1 programming language'
        }
    },
    {
        id: 'feedback',
        type: 'textarea',
        label: 'Additional Feedback',
        required: false,
        hint: 'Maximum 200 characters',
        validation: {
            maxLength: 200
        }
    },
    {
        id: 'goals',
        type: 'textarea',
        label: 'Your Learning Goals',
        required: true,
        hint: 'Minimum 20 characters, maximum 150 characters',
        validation: {
            minLength: 20,
            maxLength: 150,
            errorMessage: 'Please provide between 20 and 150 characters'
        }
    }
];

// Track validation state for each question
let validationState = {};

// Initialize survey
function initSurvey() {
    const surveyContainer = document.getElementById('surveyQuestions');
    surveyContainer.innerHTML = '';
    
    surveyQuestions.forEach(question => {
        validationState[question.id] = question.required ? false : true;
        const questionElement = createQuestionElement(question);
        surveyContainer.appendChild(questionElement);
    });
    
    updateProgress();
}

// Create question element based on type
function createQuestionElement(question) {
    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.id = `question-${question.id}`;
    
    // Question label
    const label = document.createElement('label');
    label.className = 'question-label';
    label.innerHTML = `${question.label} ${question.required ? '<span class="required">*</span>' : ''}`;
    questionBlock.appendChild(label);
    
    // Hint text
    if (question.hint) {
        const hint = document.createElement('span');
        hint.className = 'question-hint';
        hint.textContent = question.hint;
        questionBlock.appendChild(hint);
    }
    
    // Create input based on type
    const inputContainer = document.createElement('div');
    
    switch (question.type) {
        case 'text':
        case 'email':
            inputContainer.appendChild(createTextInput(question));
            break;
        case 'textarea':
            inputContainer.appendChild(createTextarea(question));
            break;
        case 'radio':
            inputContainer.appendChild(createRadioGroup(question));
            break;
        case 'checkbox':
            inputContainer.appendChild(createCheckboxGroup(question));
            break;
    }
    
    questionBlock.appendChild(inputContainer);
    
    // Validation message
    const validationMsg = document.createElement('div');
    validationMsg.className = 'validation-message';
    validationMsg.id = `error-${question.id}`;
    questionBlock.appendChild(validationMsg);
    
    return questionBlock;
}

// Create text input
function createTextInput(question) {
    const input = document.createElement('input');
    input.type = question.type;
    input.id = question.id;
    input.name = question.id;
    if (question.required) input.required = true;
    
    // Add event listeners
    input.addEventListener('input', () => validateQuestion(question));
    input.addEventListener('blur', () => validateQuestion(question));
    
    return input;
}

// Create textarea
function createTextarea(question) {
    const container = document.createElement('div');
    
    const textarea = document.createElement('textarea');
    textarea.id = question.id;
    textarea.name = question.id;
    if (question.required) textarea.required = true;
    
    // Add event listeners
    textarea.addEventListener('input', () => {
        validateQuestion(question);
        updateCharCounter(question);
    });
    textarea.addEventListener('blur', () => validateQuestion(question));
    
    container.appendChild(textarea);
    
    // Character counter
    if (question.validation && question.validation.maxLength) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.id = `counter-${question.id}`;
        counter.textContent = `0 / ${question.validation.maxLength}`;
        container.appendChild(counter);
    }
    
    return container;
}

// Create radio group
function createRadioGroup(question) {
    const group = document.createElement('div');
    group.className = 'radio-group';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'radio-option';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `${question.id}-${index}`;
        input.name = question.id;
        input.value = option;
        
        input.addEventListener('change', () => validateQuestion(question));
        
        const label = document.createElement('label');
        label.htmlFor = `${question.id}-${index}`;
        label.textContent = option;
        
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        group.appendChild(optionDiv);
    });
    
    return group;
}

// Create checkbox group
function createCheckboxGroup(question) {
    const group = document.createElement('div');
    group.className = 'checkbox-group';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'checkbox-option';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `${question.id}-${index}`;
        input.name = question.id;
        input.value = option;
        
        input.addEventListener('change', () => validateQuestion(question));
        
        const label = document.createElement('label');
        label.htmlFor = `${question.id}-${index}`;
        label.textContent = option;
        
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        group.appendChild(optionDiv);
    });
    
    return group;
}

// Update character counter
function updateCharCounter(question) {
    if (!question.validation || !question.validation.maxLength) return;
    
    const textarea = document.getElementById(question.id);
    const counter = document.getElementById(`counter-${question.id}`);
    if (!textarea || !counter) return;
    
    const length = textarea.value.length;
    const maxLength = question.validation.maxLength;
    
    counter.textContent = `${length} / ${maxLength}`;
    
    // Update counter color based on length
    counter.className = 'char-counter';
    if (length > maxLength) {
        counter.classList.add('error');
    } else if (length > maxLength * 0.8) {
        counter.classList.add('warning');
    }
}

// Validate question
function validateQuestion(question) {
    const errorElement = document.getElementById(`error-${question.id}`);
    const questionBlock = document.getElementById(`question-${question.id}`);
    let isValid = true;
    let errorMessage = '';
    
    if (question.type === 'text' || question.type === 'email') {
        isValid = validateTextInput(question);
        errorMessage = getTextInputError(question);
    } else if (question.type === 'textarea') {
        isValid = validateTextarea(question);
        errorMessage = getTextareaError(question);
    } else if (question.type === 'radio') {
        isValid = validateRadio(question);
        errorMessage = isValid ? '' : 'Please select an option';
    } else if (question.type === 'checkbox') {
        isValid = validateCheckbox(question);
        errorMessage = getCheckboxError(question);
    }
    
    // Update UI based on validation
    const input = document.getElementById(question.id);
    
    if (isValid) {
        if (input) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        }
        questionBlock.classList.remove('invalid');
        questionBlock.classList.add('valid');
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    } else {
        if (input) {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
        questionBlock.classList.remove('valid');
        questionBlock.classList.add('invalid');
        errorElement.classList.add('show');
        errorElement.textContent = errorMessage;
    }
    
    validationState[question.id] = isValid;
    updateProgress();
    
    return isValid;
}

// Validate text input
function validateTextInput(question) {
    const input = document.getElementById(question.id);
    if (!input) return false;
    
    const value = input.value.trim();
    
    // Check required
    if (question.required && !value) {
        return false;
    }
    
    // If not required and empty, it's valid
    if (!question.required && !value) {
        return true;
    }
    
    // Check validation rules
    if (question.validation) {
        const v = question.validation;
        
        // Min length
        if (v.minLength && value.length < v.minLength) {
            return false;
        }
        
        // Max length
        if (v.maxLength && value.length > v.maxLength) {
            return false;
        }
        
        // Pattern
        if (v.pattern && !v.pattern.test(value)) {
            return false;
        }
    }
    
    return true;
}

// Get text input error message
function getTextInputError(question) {
    const input = document.getElementById(question.id);
    if (!input) return '';
    
    const value = input.value.trim();
    
    if (question.required && !value) {
        return 'This field is required';
    }
    
    if (!value) return '';
    
    if (question.validation) {
        const v = question.validation;
        
        if (v.minLength && value.length < v.minLength) {
            return `Minimum ${v.minLength} characters required`;
        }
        
        if (v.maxLength && value.length > v.maxLength) {
            return `Maximum ${v.maxLength} characters allowed`;
        }
        
        if (v.pattern && !v.pattern.test(value)) {
            return v.errorMessage || 'Invalid format';
        }
    }
    
    return '';
}

// Validate textarea
function validateTextarea(question) {
    const textarea = document.getElementById(question.id);
    if (!textarea) return false;
    
    const value = textarea.value.trim();
    
    if (question.required && !value) {
        return false;
    }
    
    if (!question.required && !value) {
        return true;
    }
    
    if (question.validation) {
        const v = question.validation;
        
        if (v.minLength && value.length < v.minLength) {
            return false;
        }
        
        if (v.maxLength && value.length > v.maxLength) {
            return false;
        }
    }
    
    return true;
}

// Get textarea error message
function getTextareaError(question) {
    const textarea = document.getElementById(question.id);
    if (!textarea) return '';
    
    const value = textarea.value.trim();
    
    if (question.required && !value) {
        return 'This field is required';
    }
    
    if (!value) return '';
    
    if (question.validation) {
        const v = question.validation;
        
        if (v.minLength && value.length < v.minLength) {
            return `Minimum ${v.minLength} characters required`;
        }
        
        if (v.maxLength && value.length > v.maxLength) {
            return `Maximum ${v.maxLength} characters allowed`;
        }
        
        if (v.errorMessage) {
            return v.errorMessage;
        }
    }
    
    return '';
}

// Validate radio
function validateRadio(question) {
    const radios = document.querySelectorAll(`input[name="${question.id}"]`);
    
    if (!question.required) return true;
    
    for (let radio of radios) {
        if (radio.checked) return true;
    }
    
    return false;
}

// Validate checkbox
function validateCheckbox(question) {
    const checkboxes = document.querySelectorAll(`input[name="${question.id}"]:checked`);
    const count = checkboxes.length;
    
    if (question.required && count === 0) {
        return false;
    }
    
    if (question.validation) {
        const v = question.validation;
        
        if (v.minSelections && count < v.minSelections) {
            return false;
        }
        
        if (v.maxSelections && count > v.maxSelections) {
            return false;
        }
    }
    
    return true;
}

// Get checkbox error message
function getCheckboxError(question) {
    const checkboxes = document.querySelectorAll(`input[name="${question.id}"]:checked`);
    const count = checkboxes.length;
    
    if (question.required && count === 0) {
        return 'Please select at least one option';
    }
    
    if (question.validation) {
        const v = question.validation;
        
        if (v.minSelections && count < v.minSelections) {
            return `Please select at least ${v.minSelections} option${v.minSelections > 1 ? 's' : ''}`;
        }
        
        if (v.maxSelections && count > v.maxSelections) {
            return `Please select maximum ${v.maxSelections} option${v.maxSelections > 1 ? 's' : ''}`;
        }
        
        if (v.errorMessage) {
            return v.errorMessage;
        }
    }
    
    return '';
}

// Update progress bar
function updateProgress() {
    const totalQuestions = surveyQuestions.length;
    const validQuestions = Object.values(validationState).filter(v => v === true).length;
    const percentage = (validQuestions / totalQuestions) * 100;
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percentage + '%';
}

// Handle form submission
document.getElementById('surveyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all questions
    let allValid = true;
    surveyQuestions.forEach(question => {
        if (!validateQuestion(question)) {
            allValid = false;
        }
    });
    
    if (!allValid) {
        alert('Please fill in all required fields correctly.');
        
        // Scroll to first invalid question
        const firstInvalid = document.querySelector('.question-block.invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Collect form data
    const formData = {};
    surveyQuestions.forEach(question => {
        if (question.type === 'checkbox') {
            const checkboxes = document.querySelectorAll(`input[name="${question.id}"]:checked`);
            formData[question.id] = Array.from(checkboxes).map(cb => cb.value);
        } else if (question.type === 'radio') {
            const radio = document.querySelector(`input[name="${question.id}"]:checked`);
            formData[question.id] = radio ? radio.value : '';
        } else {
            const input = document.getElementById(question.id);
            formData[question.id] = input ? input.value : '';
        }
    });
    
    // Log form data (in real app, would send to server)
    console.log('Survey Response:', formData);
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');
    
    // Hide form
    this.style.display = 'none';
    
    // Reset after 3 seconds
    setTimeout(() => {
        this.reset();
        this.style.display = 'block';
        successMessage.classList.remove('show');
        
        // Reset validation state
        surveyQuestions.forEach(question => {
            validationState[question.id] = question.required ? false : true;
            const questionBlock = document.getElementById(`question-${question.id}`);
            questionBlock.classList.remove('valid', 'invalid');
            
            const input = document.getElementById(question.id);
            if (input) {
                input.classList.remove('valid', 'invalid');
            }
            
            const errorElement = document.getElementById(`error-${question.id}`);
            errorElement.classList.remove('show');
        });
        
        updateProgress();
    }, 3000);
});

// Initialize on page load
initSurvey();
