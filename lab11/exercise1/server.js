// Import the required http module
const http = require('http');

// Create a server using the createServer method
const server = http.createServer((req, res) => {
    // Set response headers
    res.setHeader('Content-Type', 'text/plain');

    // Handle incoming requests and send a response
    if (req.url === '/') {
        res.write('Welcome to the Node.js server!');
    } else {
        res.write('Hello from Node.js!');
    }
    res.end();
});

// Define the port to listen on
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});