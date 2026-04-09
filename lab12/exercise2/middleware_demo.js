// Import required modules
const express = require('express');

// Initialize the application
const app = express();

// Middleware to log request details
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware chaining example
app.use((req, res, next) => {
    console.log('Middleware 1 executed');
    next();
});

app.use((req, res, next) => {
    console.log('Middleware 2 executed');
    next();
});

// Route with specific middleware
app.get('/test', (req, res, next) => {
    console.log('Route-specific middleware executed');
    next();
}, (req, res) => {
    res.send('Middleware demonstration complete');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});