// Import required modules
const express = require('express');

// Initialize the application
const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Define routes
app.get('/users', (req, res) => {
    res.json({ message: 'Get all users' });
});

app.post('/users', (req, res) => {
    const user = req.body;
    res.json({ message: 'User created', user });
});

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    res.json({ message: `User ${id} updated`, updatedData });
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `User ${id} deleted` });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});