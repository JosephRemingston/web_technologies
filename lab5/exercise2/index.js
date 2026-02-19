// Library Book Tracker - XML DOM Manipulation
// Stores books data parsed from XML and manages CRUD operations

let booksData = [];
let filteredBooks = [];
let nextBookId = 9; // Start from 9 as we have 8 initial books
let xmlDoc = null; // Store the XML document for DOM manipulation

// DOM Elements
const bookForm = document.getElementById('bookForm');
const bookTableBody = document.getElementById('bookTableBody');
const notification = document.getElementById('notification');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const bookTableContainer = document.getElementById('bookTableContainer');
const refreshBtn = document.getElementById('refreshBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');

// Statistics elements
const totalBooksEl = document.getElementById('totalBooks');
const availableBooksEl = document.getElementById('availableBooks');
const checkedOutBooksEl = document.getElementById('checkedOutBooks');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBooksFromXML();
    
    // Event Listeners
    bookForm.addEventListener('submit', handleFormSubmit);
    refreshBtn.addEventListener('click', loadBooksFromXML);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', applyFilters);
    filterStatus.addEventListener('change', applyFilters);
});

/**
 * Load books from XML file using AJAX GET request
 */
function loadBooksFromXML() {
    showLoading(true);
    showNotification('Loading library books...', 'info');
    
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    // Store the XML document for DOM manipulation
                    xmlDoc = xhr.responseXML;
                    parseXMLData(xmlDoc);
                    showNotification('Books loaded successfully!', 'success');
                } catch (error) {
                    handleXMLError(error);
                }
            } else if (xhr.status === 0) {
                showNotification('Error: Unable to load books.xml. Please run on a web server.', 'error');
                loadFromLocalStorage();
            } else {
                showNotification(`Error loading XML file. Status: ${xhr.status}`, 'error');
                loadFromLocalStorage();
            }
            showLoading(false);
        }
    };
    
    xhr.onerror = function() {
        showNotification('Network error while loading books.xml', 'error');
        loadFromLocalStorage();
        showLoading(false);
    };
    
    xhr.open('GET', 'books.xml?t=' + new Date().getTime(), true); // Cache busting
    xhr.send();
}

/**
 * Parse XML data using XML DOM methods
 */
function parseXMLData(doc) {
    if (!doc) {
        throw new Error('Invalid or malformed XML document');
    }
    
    // Validate XML structure
    const library = doc.getElementsByTagName('library');
    if (library.length === 0) {
        throw new Error('Missing <library> root element');
    }
    
    // Clear existing data
    booksData = [];
    
    // Get all book nodes using getElementsByTagName
    const books = doc.getElementsByTagName('book');
    
    if (books.length === 0) {
        showNotification('No books found in the library.', 'warning');
        updateDisplay();
        return;
    }
    
    // Parse each book using XML DOM methods
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        try {
            // Get book ID from attribute
            const id = book.getAttribute('id');
            if (!id) {
                console.warn(`Book at index ${i} missing ID attribute, skipping...`);
                continue;
            }
            
            // Get book data using getElementsByTagName
            const titleNodes = book.getElementsByTagName('title');
            const authorNodes = book.getElementsByTagName('author');
            const statusNodes = book.getElementsByTagName('status');
            
            // Validate required fields
            if (!titleNodes.length || !authorNodes.length || !statusNodes.length) {
                console.warn(`Book ${id} has missing fields, skipping...`);
                continue;
            }
            
            // Extract text content using DOM properties
            const bookObj = {
                id: parseInt(id),
                title: getTextContent(titleNodes[0]),
                author: getTextContent(authorNodes[0]),
                status: getTextContent(statusNodes[0])
            };
            
            // Validate data
            if (!validateBookData(bookObj)) {
                console.warn(`Book ${id} has invalid data, skipping...`);
                continue;
            }
            
            booksData.push(bookObj);
            
            // Update next ID
            if (bookObj.id >= nextBookId) {
                nextBookId = bookObj.id + 1;
            }
        } catch (error) {
            console.error(`Error parsing book at index ${i}:`, error);
        }
    }
    
    // Save to localStorage as backup
    saveToLocalStorage();
    
    // Update display
    updateDisplay();
}

/**
 * Get text content from XML node (cross-browser compatible)
 */
function getTextContent(node) {
    return node.textContent || node.text || node.innerText || '';
}

/**
 * Validate book data before adding to collection
 */
function validateBookData(book) {
    if (!book.title || book.title.trim() === '') {
        return false;
    }
    if (!book.author || book.author.trim() === '') {
        return false;
    }
    if (!book.status || book.status.trim() === '') {
        return false;
    }
    return true;
}

/**
 * Handle form submission - Add or Update book
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const status = document.getElementById('bookStatus').value;
    
    // Validation
    if (!title) {
        showNotification('Please enter a book title.', 'error');
        return;
    }
    
    if (!author) {
        showNotification('Please enter an author name.', 'error');
        return;
    }
    
    if (!status) {
        showNotification('Please select availability status.', 'error');
        return;
    }
    
    const bookData = { title, author, status };
    
    if (id) {
        // Update existing book
        updateBookInXMLDOM(parseInt(id), bookData);
    } else {
        // Add new book
        addBookToXMLDOM(bookData);
    }
}

/**
 * ADD - Add new book node to XML DOM
 */
function addBookToXMLDOM(bookData) {
    const newBook = {
        id: nextBookId++,
        title: bookData.title,
        author: bookData.author,
        status: bookData.status
    };
    
    // Add to data array
    booksData.push(newBook);
    
    // Create XML node if xmlDoc exists (DOM manipulation)
    if (xmlDoc) {
        try {
            const library = xmlDoc.getElementsByTagName('library')[0];
            
            // Create new <book> element
            const bookNode = xmlDoc.createElement('book');
            bookNode.setAttribute('id', newBook.id);
            
            // Create child elements
            const titleNode = xmlDoc.createElement('title');
            titleNode.textContent = newBook.title;
            
            const authorNode = xmlDoc.createElement('author');
            authorNode.textContent = newBook.author;
            
            const statusNode = xmlDoc.createElement('status');
            statusNode.textContent = newBook.status;
            
            // Append children to book node
            bookNode.appendChild(titleNode);
            bookNode.appendChild(authorNode);
            bookNode.appendChild(statusNode);
            
            // Append book to library
            library.appendChild(bookNode);
            
            console.log('Book node added to XML DOM:', newBook.title);
        } catch (error) {
            console.error('Error adding node to XML DOM:', error);
        }
    }
    
    // Save and update display
    saveToLocalStorage();
    updateDisplay();
    
    showNotification(`Book "${newBook.title}" added successfully!`, 'success');
    resetForm();
}

/**
 * UPDATE - Modify existing book node in XML DOM
 */
function updateBookInXMLDOM(id, bookData) {
    const index = booksData.findIndex(book => book.id === id);
    
    if (index === -1) {
        showNotification('Book not found!', 'error');
        return;
    }
    
    // Update in data array
    booksData[index] = {
        id: id,
        title: bookData.title,
        author: bookData.author,
        status: bookData.status
    };
    
    // Update XML DOM node
    if (xmlDoc) {
        try {
            const books = xmlDoc.getElementsByTagName('book');
            
            // Find the book node with matching ID
            for (let i = 0; i < books.length; i++) {
                if (parseInt(books[i].getAttribute('id')) === id) {
                    const bookNode = books[i];
                    
                    // Update title
                    const titleNodes = bookNode.getElementsByTagName('title');
                    if (titleNodes.length > 0) {
                        titleNodes[0].textContent = bookData.title;
                    }
                    
                    // Update author
                    const authorNodes = bookNode.getElementsByTagName('author');
                    if (authorNodes.length > 0) {
                        authorNodes[0].textContent = bookData.author;
                    }
                    
                    // Update status
                    const statusNodes = bookNode.getElementsByTagName('status');
                    if (statusNodes.length > 0) {
                        statusNodes[0].textContent = bookData.status;
                    }
                    
                    console.log('Book node updated in XML DOM:', bookData.title);
                    break;
                }
            }
        } catch (error) {
            console.error('Error updating XML DOM node:', error);
        }
    }
    
    // Save and update display
    saveToLocalStorage();
    updateDisplay();
    
    showNotification(`Book "${bookData.title}" updated successfully!`, 'success');
    resetForm();
}

/**
 * DELETE - Remove book node from XML DOM
 */
function deleteBookFromXMLDOM(id) {
    const book = booksData.find(b => b.id === id);
    
    if (!book) {
        showNotification('Book not found!', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete "${book.title}" by ${book.author}?`)) {
        return;
    }
    
    // Remove from data array
    booksData = booksData.filter(b => b.id !== id);
    
    // Remove from XML DOM
    if (xmlDoc) {
        try {
            const books = xmlDoc.getElementsByTagName('book');
            
            // Find and remove the book node
            for (let i = 0; i < books.length; i++) {
                if (parseInt(books[i].getAttribute('id')) === id) {
                    const bookNode = books[i];
                    const library = xmlDoc.getElementsByTagName('library')[0];
                    library.removeChild(bookNode);
                    console.log('Book node removed from XML DOM:', book.title);
                    break;
                }
            }
        } catch (error) {
            console.error('Error removing node from XML DOM:', error);
        }
    }
    
    // Save and update display
    saveToLocalStorage();
    updateDisplay();
    
    showNotification(`Book "${book.title}" deleted successfully!`, 'success');
}

/**
 * Toggle book availability status (Quick action)
 */
function toggleBookStatus(id) {
    const book = booksData.find(b => b.id === id);
    
    if (!book) {
        showNotification('Book not found!', 'error');
        return;
    }
    
    // Toggle between Available and Checked Out
    const newStatus = book.status === 'Available' ? 'Checked Out' : 'Available';
    
    updateBookInXMLDOM(id, {
        title: book.title,
        author: book.author,
        status: newStatus
    });
    
    showNotification(`Book status changed to "${newStatus}"`, 'success');
}

/**
 * Load book data into form for editing
 */
function editBook(id) {
    const book = booksData.find(b => b.id === id);
    
    if (!book) {
        showNotification('Book not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookStatus').value = book.status;
    
    // Update UI
    formTitle.textContent = 'Edit Book';
    submitBtn.innerHTML = '<span class="btn-icon">💾</span> Update Book';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset form to initial state
 */
function resetForm() {
    bookForm.reset();
    document.getElementById('bookId').value = '';
    formTitle.textContent = 'Add New Book';
    submitBtn.innerHTML = '<span class="btn-icon">➕</span> Add Book';
    cancelBtn.style.display = 'none';
}

/**
 * Apply search and filter
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    
    filteredBooks = booksData.filter(book => {
        const matchesSearch = 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || book.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayBooks();
}

/**
 * Update entire display (statistics + table)
 */
function updateDisplay() {
    updateStatistics();
    applyFilters();
}

/**
 * Update statistics dashboard
 */
function updateStatistics() {
    const total = booksData.length;
    const available = booksData.filter(b => b.status === 'Available').length;
    const checkedOut = booksData.filter(b => b.status === 'Checked Out').length;
    
    totalBooksEl.textContent = total;
    availableBooksEl.textContent = available;
    checkedOutBooksEl.textContent = checkedOut;
}

/**
 * Display books in table
 */
function displayBooks() {
    bookTableBody.innerHTML = '';
    
    const booksToDisplay = filteredBooks.length > 0 || searchInput.value || filterStatus.value 
        ? filteredBooks 
        : booksData;
    
    if (booksToDisplay.length === 0) {
        emptyState.style.display = 'block';
        bookTableContainer.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    bookTableContainer.style.display = 'block';
    
    booksToDisplay.forEach(book => {
        const row = createBookRow(book);
        bookTableBody.appendChild(row);
    });
}

/**
 * Create table row for a book
 */
function createBookRow(book) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', book.id);
    
    const statusClass = book.status.toLowerCase().replace(/\s+/g, '-');
    
    row.innerHTML = `
        <td class="book-id">${book.id}</td>
        <td class="book-title">${escapeHtml(book.title)}</td>
        <td class="book-author">${escapeHtml(book.author)}</td>
        <td>
            <span class="status-badge status-${statusClass}">
                ${escapeHtml(book.status)}
            </span>
        </td>
        <td class="actions">
            <button class="btn-action btn-toggle" onclick="toggleBookStatus(${book.id})" title="Toggle Status">
                ${book.status === 'Available' ? '📤' : '📥'}
            </button>
            <button class="btn-action btn-edit" onclick="editBook(${book.id})" title="Edit">
                ✏️
            </button>
            <button class="btn-action btn-delete" onclick="deleteBookFromXMLDOM(${book.id})" title="Delete">
                🗑️
            </button>
        </td>
    `;
    
    return row;
}

/**
 * Show notification message
 */
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification notification-${type} show`;
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
}

/**
 * Handle XML parsing errors
 */
function handleXMLError(error) {
    console.error('XML Parsing Error:', error);
    showNotification(`XML Error: ${error.message}`, 'error');
    loadFromLocalStorage();
}

/**
 * Save to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('libraryBooks', JSON.stringify(booksData));
    localStorage.setItem('nextBookId', nextBookId);
}

/**
 * Load from localStorage
 */
function loadFromLocalStorage() {
    const stored = localStorage.getItem('libraryBooks');
    if (stored) {
        booksData = JSON.parse(stored);
        const storedId = localStorage.getItem('nextBookId');
        if (storedId) {
            nextBookId = parseInt(storedId);
        }
        updateDisplay();
        showNotification('Loaded data from local storage.', 'info');
    } else {
        updateDisplay();
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
