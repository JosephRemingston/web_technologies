// Global variable to store XML document
let xmlDoc = null;
let nextBookId = 6; // Counter for new book IDs

// Get DOM elements
const loadBooksBtn = document.getElementById('loadBooksBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const addBookForm = document.getElementById('addBookForm');
const booksTableBody = document.getElementById('booksTableBody');
const booksTableContainer = document.getElementById('booksTableContainer');
const messageDiv = document.getElementById('message');
const statisticsDiv = document.getElementById('statistics');

// Event listeners
loadBooksBtn.addEventListener('click', loadBooksFromXML);
addBookForm.addEventListener('submit', handleAddBook);

// Load books from XML file using XMLHttpRequest
function loadBooksFromXML() {
    showLoading();
    hideMessage();

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'books.xml', true);
    xhr.overrideMimeType('text/xml');

    xhr.onload = function() {
        hideLoading();

        if (xhr.status === 200 || xhr.status === 0) {
            try {
                xmlDoc = xhr.responseXML;
                
                if (!xmlDoc || !xmlDoc.documentElement) {
                    throw new Error('Invalid XML document');
                }

                // Find the highest existing book ID
                const books = xmlDoc.getElementsByTagName('book');
                let maxId = 0;
                for (let i = 0; i < books.length; i++) {
                    const id = parseInt(books[i].getAttribute('id'));
                    if (id > maxId) maxId = id;
                }
                nextBookId = maxId + 1;

                displayBooks();
                updateStatistics();
                showMessage('Books loaded successfully!', 'success');
                
                // Show table and statistics
                booksTableContainer.classList.remove('hidden');
                statisticsDiv.classList.remove('hidden');
            } catch (error) {
                showMessage('Error parsing XML data: ' + error.message, 'error');
                console.error('Parse Error:', error);
            }
        } else {
            showMessage('Error loading XML file. Status: ' + xhr.status, 'error');
        }
    };

    xhr.onerror = function() {
        hideLoading();
        showMessage('Network error occurred while loading XML file.', 'error');
        console.error('XHR Error');
    };

    xhr.send();
}

// Display books in table using XML DOM methods
function displayBooks() {
    // Clear existing table rows
    booksTableBody.innerHTML = '';

    // Get all book elements from XML
    const books = xmlDoc.getElementsByTagName('book');

    // Iterate through books and create table rows
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        // Get book data using XML DOM methods
        const id = book.getAttribute('id');
        const title = book.getElementsByTagName('title')[0].textContent;
        const author = book.getElementsByTagName('author')[0].textContent;
        const status = book.getElementsByTagName('status')[0].textContent;

        // Create table row
        const row = createBookRow(id, title, author, status);
        booksTableBody.appendChild(row);
    }
}

// Create a table row for a book
function createBookRow(id, title, author, status) {
    const row = document.createElement('tr');
    
    const statusClass = status === 'available' ? 'status-available' : 'status-borrowed';
    
    row.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(title)}</td>
        <td>${escapeHtml(author)}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>
            <button class="btn btn-small btn-warning" onclick="toggleBookStatus(${id})">
                ${status === 'available' ? 'Mark Borrowed' : 'Mark Available'}
            </button>
            <button class="btn btn-small btn-danger" onclick="deleteBook(${id})">Delete</button>
        </td>
    `;
    
    return row;
}

// Handle add book form submission
function handleAddBook(e) {
    e.preventDefault();

    if (!xmlDoc) {
        showMessage('Please load books first!', 'error');
        return;
    }

    // Get form values
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const status = document.getElementById('bookStatus').value;

    // Validate inputs
    if (!title || !author) {
        showMessage('Please fill in all fields!', 'error');
        return;
    }

    // Add book using XML DOM methods
    addNewBook(title, author, status);

    // Reset form
    addBookForm.reset();
}

// Add new book to XML document using DOM methods
function addNewBook(title, author, status) {
    try {
        // Create new book element
        const newBook = xmlDoc.createElement('book');
        newBook.setAttribute('id', nextBookId.toString());

        // Create title element
        const titleElement = xmlDoc.createElement('title');
        titleElement.textContent = title;
        newBook.appendChild(titleElement);

        // Create author element
        const authorElement = xmlDoc.createElement('author');
        authorElement.textContent = author;
        newBook.appendChild(authorElement);

        // Create status element
        const statusElement = xmlDoc.createElement('status');
        statusElement.textContent = status;
        newBook.appendChild(statusElement);

        // Append new book to library root
        const library = xmlDoc.documentElement;
        library.appendChild(newBook);

        // Increment ID counter
        nextBookId++;

        // Refresh display
        displayBooks();
        updateStatistics();
        showMessage(`Book "${title}" added successfully!`, 'success');
    } catch (error) {
        showMessage('Error adding book: ' + error.message, 'error');
        console.error('Add Book Error:', error);
    }
}

// Toggle book availability status
function toggleBookStatus(bookId) {
    if (!xmlDoc) {
        showMessage('Please load books first!', 'error');
        return;
    }

    try {
        // Find the book by ID
        const books = xmlDoc.getElementsByTagName('book');
        let bookToUpdate = null;

        for (let i = 0; i < books.length; i++) {
            if (books[i].getAttribute('id') === bookId.toString()) {
                bookToUpdate = books[i];
                break;
            }
        }

        if (!bookToUpdate) {
            showMessage('Book not found!', 'error');
            return;
        }

        // Get current status and toggle it
        const statusElement = bookToUpdate.getElementsByTagName('status')[0];
        const currentStatus = statusElement.textContent;
        const newStatus = currentStatus === 'available' ? 'borrowed' : 'available';

        // Update status using DOM method
        statusElement.textContent = newStatus;

        // Get book title for message
        const title = bookToUpdate.getElementsByTagName('title')[0].textContent;

        // Refresh display
        displayBooks();
        updateStatistics();
        showMessage(`"${title}" marked as ${newStatus}!`, 'success');
    } catch (error) {
        showMessage('Error updating book status: ' + error.message, 'error');
        console.error('Update Status Error:', error);
    }
}

// Delete a book from XML document
function deleteBook(bookId) {
    if (!xmlDoc) {
        showMessage('Please load books first!', 'error');
        return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        // Find the book by ID
        const books = xmlDoc.getElementsByTagName('book');
        let bookToDelete = null;

        for (let i = 0; i < books.length; i++) {
            if (books[i].getAttribute('id') === bookId.toString()) {
                bookToDelete = books[i];
                break;
            }
        }

        if (!bookToDelete) {
            showMessage('Book not found!', 'error');
            return;
        }

        // Get book title for message
        const title = bookToDelete.getElementsByTagName('title')[0].textContent;

        // Remove book node from parent
        const library = xmlDoc.documentElement;
        library.removeChild(bookToDelete);

        // Refresh display
        displayBooks();
        updateStatistics();
        showMessage(`"${title}" deleted successfully!`, 'success');
    } catch (error) {
        showMessage('Error deleting book: ' + error.message, 'error');
        console.error('Delete Book Error:', error);
    }
}

// Update statistics display
function updateStatistics() {
    if (!xmlDoc) return;

    const books = xmlDoc.getElementsByTagName('book');
    let totalBooks = books.length;
    let availableCount = 0;
    let borrowedCount = 0;

    for (let i = 0; i < books.length; i++) {
        const status = books[i].getElementsByTagName('status')[0].textContent;
        if (status === 'available') {
            availableCount++;
        } else if (status === 'borrowed') {
            borrowedCount++;
        }
    }

    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('availableBooks').textContent = availableCount;
    document.getElementById('borrowedBooks').textContent = borrowedCount;
}

// Show loading indicator
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    loadBooksBtn.disabled = true;
}

// Hide loading indicator
function hideLoading() {
    loadingIndicator.classList.add('hidden');
    loadBooksBtn.disabled = false;
}

// Show message
function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');

    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }
}

// Hide message
function hideMessage() {
    messageDiv.classList.add('hidden');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
