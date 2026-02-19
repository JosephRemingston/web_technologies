// Global variables
let allProducts = [];
let currentCategory = 'all';
let searchTimeout = null;
const DEBOUNCE_DELAY = 500; // 500ms delay for debouncing

// Get DOM elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const searchStatus = document.getElementById('searchStatus');
const productsContainer = document.getElementById('productsContainer');
const noResults = document.getElementById('noResults');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');
const resultsCount = document.getElementById('resultsCount');
const countElement = document.getElementById('count');
const categoryFilters = document.getElementById('categoryFilters');

// Event listeners
searchInput.addEventListener('input', handleSearchInput);
clearBtn.addEventListener('click', clearSearch);
retryBtn.addEventListener('click', loadProducts);

// Add event listeners to category filter buttons
categoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update current category
        currentCategory = e.target.dataset.category;
        
        // Re-run search with new filter
        const searchQuery = searchInput.value.trim();
        performSearch(searchQuery);
    }
});

// Load products on page load
window.addEventListener('load', loadProducts);

// Handle search input with debouncing
function handleSearchInput() {
    const query = searchInput.value.trim();
    
    // Show/hide clear button
    if (query) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Show typing indicator
    if (query) {
        searchStatus.textContent = 'Typing...';
        searchStatus.style.color = '#999';
    } else {
        searchStatus.textContent = '';
    }
    
    // Set new timeout for debouncing
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, DEBOUNCE_DELAY);
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    searchStatus.textContent = '';
    displayWelcomeMessage();
    resultsCount.classList.add('hidden');
}

// Load products from JSON file using AJAX
function loadProducts() {
    showLoading();
    hideError();
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'products.json', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        hideLoading();
        
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                // Parse JSON response
                const data = JSON.parse(xhr.responseText);
                
                // Validate JSON structure
                if (!data || !data.products || !Array.isArray(data.products)) {
                    throw new Error('Invalid JSON structure. Expected { products: [...] }');
                }
                
                allProducts = data.products;
                searchStatus.textContent = `${allProducts.length} products loaded`;
                searchStatus.style.color = '#28a745';
                
                // If there's a search query, perform search
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query);
                } else {
                    displayWelcomeMessage();
                }
                
                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    if (searchInput.value.trim() === '') {
                        searchStatus.textContent = '';
                    }
                }, 3000);
            } catch (error) {
                showError('JSON Parsing Error: ' + error.message);
                console.error('Parse Error:', error);
            }
        } else {
            showError('Error loading products. HTTP Status: ' + xhr.status);
        }
    };
    
    xhr.onerror = function() {
        hideLoading();
        showError('Network error occurred. Please check your connection and try again.');
        console.error('XHR Error');
    };
    
    xhr.send();
}

// Perform search on products
function performSearch(query) {
    if (allProducts.length === 0) {
        loadProducts();
        return;
    }
    
    showLoading();
    
    // Simulate AJAX delay for realistic effect
    setTimeout(() => {
        let results = [...allProducts];
        
        // Filter by category first
        if (currentCategory !== 'all') {
            results = results.filter(product => 
                product.category.toLowerCase() === currentCategory.toLowerCase()
            );
        }
        
        // Filter by search query
        if (query) {
            const searchLower = query.toLowerCase();
            results = results.filter(product => {
                // Search in name, category, and price
                const nameMatch = product.name.toLowerCase().includes(searchLower);
                const categoryMatch = product.category.toLowerCase().includes(searchLower);
                const priceMatch = product.price.toString().includes(searchLower);
                
                return nameMatch || categoryMatch || priceMatch;
            });
            
            searchStatus.textContent = `Searching for "${query}"...`;
            searchStatus.style.color = '#667eea';
        } else {
            searchStatus.textContent = '';
        }
        
        hideLoading();
        displayResults(results, query);
    }, 300); // 300ms simulated delay
}

// Display search results
function displayResults(products, query) {
    // Hide all containers first
    hideWelcomeMessage();
    hideNoResults();
    hideError();
    
    if (products.length === 0) {
        // Show no results message
        showNoResults();
        resultsCount.classList.add('hidden');
        
        if (query) {
            searchStatus.textContent = 'No results found';
            searchStatus.style.color = '#dc3545';
        }
    } else {
        // Show results count
        resultsCount.classList.remove('hidden');
        countElement.textContent = products.length;
        
        // Clear container and display products
        productsContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = createProductCard(product, query);
            productsContainer.appendChild(productCard);
        });
        
        // Update search status
        if (query) {
            searchStatus.textContent = `Found ${products.length} result(s)`;
            searchStatus.style.color = '#28a745';
        } else {
            searchStatus.textContent = `Showing ${products.length} product(s)`;
            searchStatus.style.color = '#667eea';
        }
    }
}

// Create product card element
function createProductCard(product, searchQuery = '') {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Highlight search terms in product name
    let productName = escapeHtml(product.name);
    if (searchQuery) {
        const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi');
        productName = productName.replace(regex, '<mark>$1</mark>');
    }
    
    card.innerHTML = `
        <div class="product-header">
            <h3 class="product-name">${productName}</h3>
            <span class="category-badge">${escapeHtml(product.category)}</span>
        </div>
        <div class="product-body">
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-id">ID: ${product.id}</div>
        </div>
        <div class="product-footer">
            <button class="btn btn-cart" onclick="addToCart(${product.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Add to Cart
            </button>
            <button class="btn btn-details" onclick="viewDetails(${product.id})">View Details</button>
        </div>
    `;
    
    return card;
}

// Mock function for add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        alert(`Added "${product.name}" to cart!\nPrice: $${product.price.toFixed(2)}`);
    }
}

// Mock function for view details
function viewDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        alert(`Product Details:\n\nName: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price.toFixed(2)}\nID: ${product.id}`);
    }
}

// Show loading indicator
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

// Hide loading indicator
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    productsContainer.innerHTML = '';
    hideWelcomeMessage();
    hideNoResults();
    resultsCount.classList.add('hidden');
    searchStatus.textContent = 'Error occurred';
    searchStatus.style.color = '#dc3545';
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show no results message
function showNoResults() {
    noResults.classList.remove('hidden');
    productsContainer.innerHTML = '';
}

// Hide no results message
function hideNoResults() {
    noResults.classList.add('hidden');
}

// Display welcome message
function displayWelcomeMessage() {
    productsContainer.innerHTML = `
        <div class="welcome-message">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h2>Start searching for products</h2>
            <p>Type in the search box above to find products by name, category, or price range</p>
        </div>
    `;
    hideNoResults();
    hideError();
    resultsCount.classList.add('hidden');
}

// Hide welcome message
function hideWelcomeMessage() {
    const welcomeMsg = productsContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        productsContainer.innerHTML = '';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Escape regex special characters
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
