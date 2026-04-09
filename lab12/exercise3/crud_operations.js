// Import required modules
const express = require('express');
const mongoose = require('mongoose');

// Initialize the application
const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

// Define a schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

// Create a model
const User = mongoose.model('User', userSchema);

// Insert data
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: 'User created', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve data
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update data
app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'User updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete data
app.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});