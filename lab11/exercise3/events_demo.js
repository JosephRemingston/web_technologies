// Import the required events module
const EventEmitter = require('events');

// Create an instance of EventEmitter
const eventEmitter = new EventEmitter();

// Register an event listener for a custom event
eventEmitter.on('greet', (name) => {
    console.log(`Hello, ${name}!`);
});

// Register another listener for the same event
eventEmitter.on('greet', (name) => {
    console.log(`How are you, ${name}?`);
});

// Trigger the custom event
console.log('Triggering the greet event...');
eventEmitter.emit('greet', 'Alice');

// Demonstrate asynchronous behavior
setTimeout(() => {
    eventEmitter.emit('greet', 'Bob');
}, 1000);