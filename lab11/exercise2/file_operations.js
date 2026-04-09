// Import the required file system module
const fs = require('fs');

// Create a new file
fs.writeFile('example.txt', 'This is a new file.', (err) => {
    if (err) {
        console.error('Error creating file:', err);
    } else {
        console.log('File created successfully.');

        // Read the contents of the file
        fs.readFile('example.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
            } else {
                console.log('File contents:', data);

                // Append data to the file
                fs.appendFile('example.txt', '\nAppended text.', (err) => {
                    if (err) {
                        console.error('Error appending to file:', err);
                    } else {
                        console.log('Data appended successfully.');

                        // Delete the file
                        fs.unlink('example.txt', (err) => {
                            if (err) {
                                console.error('Error deleting file:', err);
                            } else {
                                console.log('File deleted successfully.');
                            }
                        });
                    }
                });
            }
        });
    }
});