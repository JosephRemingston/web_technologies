// Exercise 2: Contact Form Submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    alert('Contact Form Submitted!\n\nName: ' + name + '\nEmail: ' + email + '\nMessage: ' + message);
    
    this.reset();
});

// Exercise 3: Registration Form Submission
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('regEmail').value;
    const dob = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value;
    const terms = document.getElementById('terms').checked;
    
    if (!terms) {
        alert('Please accept the Terms & Conditions');
        return;
    }
    
    alert('Registration Successful!\n\nFull Name: ' + fullName + '\nEmail: ' + email + '\nDate of Birth: ' + dob + '\nPhone: ' + phone);
    
    this.reset();
});

// Exercise 4: Product Card Buy Button
document.querySelector('.buy-btn').addEventListener('click', function() {
    alert('Product added to cart!\n\nPremium Wireless Headphones - $199.99');
});

console.log('Web Technologies Lab loaded successfully!');
