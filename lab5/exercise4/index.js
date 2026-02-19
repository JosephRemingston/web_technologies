// Product Inventory System - Using Fetch API and JSON
// Features: CRUD operations, search by category, conditional formatting, inventory value calculation

let inventoryData = [];
let filteredInventory = [];
let nextProductId = 16; // Start from 16 as we have 15 initial products

// Configuration
const LOW_STOCK_THRESHOLD = 5;
const OUT_OF_STOCK = 0;

// DOM Elements
const productForm = document.getElementById('productForm');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const alertNotification = document.getElementById('alertNotification');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const tableContainer = document.getElementById('tableContainer');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const reloadBtn = document.getElementById('reloadBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const stockFilter = document.getElementById('stockFilter');

// Statistics elements
const totalProductsEl = document.getElementById('totalProducts');
const totalValueEl = document.getElementById('totalValue');
const lowStockCountEl = document.getElementById('lowStockCount');
const outOfStockCountEl = document.getElementById('outOfStockCount');
const totalCategoriesEl = document.getElementById('totalCategories');
const footerTotalValueEl = document.getElementById('footerTotalValue');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadInventoryFromJSON();
    
    // Event Listeners
    productForm.addEventListener('submit', handleFormSubmit);
    clearBtn.addEventListener('click', clearForm);
    cancelEditBtn.addEventListener('click', cancelEdit);
    reloadBtn.addEventListener('click', loadInventoryFromJSON);
    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    stockFilter.addEventListener('change', applyFilters);
});

/**
 * Load inventory from JSON file using Fetch API
 */
async function loadInventoryFromJSON() {
    showLoading(true);
    showAlert('Loading inventory data...', 'info');
    
    try {
        // Use Fetch API to load JSON data
        const response = await fetch('inventory.json?t=' + new Date().getTime());
        
        // Check response status
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Validate JSON structure
        if (!data || !data.products || !Array.isArray(data.products)) {
            throw new Error('Invalid JSON structure: missing or invalid "products" array');
        }
        
        // Process inventory data with validation
        processInventoryData(data.products);
        
        showAlert('Inventory loaded successfully!', 'success');
        
    } catch (error) {
        handleJSONError(error);
    } finally {
        showLoading(false);
    }
}

/**
 * Process and validate inventory data
 */
function processInventoryData(products) {
    // Clear existing data
    inventoryData = [];
    
    if (products.length === 0) {
        showAlert('No products found in inventory.', 'warning');
        updateDisplay();
        return;
    }
    
    let validCount = 0;
    let invalidCount = 0;
    
    // Validate and process each product
    products.forEach((product, index) => {
        try {
            // Validate product data
            const validationResult = validateProductData(product);
            
            if (!validationResult.valid) {
                console.warn(`Product at index ${index} validation failed:`, validationResult.errors);
                invalidCount++;
                return;
            }
            
            // Add valid product to inventory
            inventoryData.push({
                id: parseInt(product.id),
                name: String(product.name).trim(),
                category: String(product.category).trim(),
                price: parseFloat(product.price),
                stock: parseInt(product.stock)
            });
            
            validCount++;
            
            // Update next ID
            if (product.id >= nextProductId) {
                nextProductId = product.id + 1;
            }
            
        } catch (error) {
            console.error(`Error processing product at index ${index}:`, error);
            invalidCount++;
        }
    });
    
    // Show validation summary
    if (invalidCount > 0) {
        showAlert(`Loaded ${validCount} products. ${invalidCount} products had invalid data and were skipped.`, 'warning');
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update category filter
    updateCategoryFilter();
    
    // Update display
    updateDisplay();
}

/**
 * Validate product data with comprehensive checks
 */
function validateProductData(product) {
    const errors = [];
    
    // Validate ID
    if (!product.id || parseInt(product.id) <= 0) {
        errors.push('Invalid or missing ID');
    }
    
    // Validate name
    if (!product.name || String(product.name).trim().length < 3) {
        errors.push('Name must be at least 3 characters');
    }
    
    // Validate category
    if (!product.category || String(product.category).trim().length === 0) {
        errors.push('Category is required');
    }
    
    // Validate price
    const price = parseFloat(product.price);
    if (isNaN(price) || price < 0) {
        errors.push('Price must be a positive number');
    }
    
    // Validate stock
    const stock = parseInt(product.stock);
    if (isNaN(stock) || stock < 0) {
        errors.push('Stock must be a non-negative integer');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Handle form submission (Add or Edit product)
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    
    // Additional validation
    if (name.length < 3) {
        showAlert('Product name must be at least 3 characters.', 'error');
        return;
    }
    
    if (!category) {
        showAlert('Please select a category.', 'error');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        showAlert('Price must be greater than 0.', 'error');
        return;
    }
    
    if (isNaN(stock) || stock < 0) {
        showAlert('Stock must be a non-negative number.', 'error');
        return;
    }
    
    const productData = { name, category, price, stock };
    
    if (id) {
        // Update existing product
        updateProduct(parseInt(id), productData);
    } else {
        // Add new product
        addProduct(productData);
    }
}

/**
 * ADD - Add new product
 */
function addProduct(productData) {
    const newProduct = {
        id: nextProductId++,
        name: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock
    };
    
    // Add to inventory
    inventoryData.push(newProduct);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update category filter
    updateCategoryFilter();
    
    // Update display
    updateDisplay();
    
    // Show success message
    showAlert(`Product "${newProduct.name}" added successfully!`, 'success');
    
    // Clear form
    clearForm();
}

/**
 * EDIT - Update product price/stock or any field
 */
function updateProduct(id, productData) {
    const index = inventoryData.findIndex(product => product.id === id);
    
    if (index === -1) {
        showAlert('Product not found!', 'error');
        return;
    }
    
    // Update product data
    inventoryData[index] = {
        id: id,
        name: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock
    };
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update category filter
    updateCategoryFilter();
    
    // Update display
    updateDisplay();
    
    // Show success message
    showAlert(`Product "${productData.name}" updated successfully!`, 'success');
    
    // Clear form
    clearForm();
}

/**
 * DELETE - Remove product from inventory
 */
function deleteProduct(id) {
    const product = inventoryData.find(p => p.id === id);
    
    if (!product) {
        showAlert('Product not found!', 'error');
        return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
        return;
    }
    
    // Remove from inventory
    inventoryData = inventoryData.filter(p => p.id !== id);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update category filter
    updateCategoryFilter();
    
    // Update display
    updateDisplay();
    
    // Show success message
    showAlert(`Product "${product.name}" deleted successfully!`, 'success');
}

/**
 * Load product data into form for editing
 */
function editProduct(id) {
    const product = inventoryData.find(p => p.id === id);
    
    if (!product) {
        showAlert('Product not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price.toFixed(2);
    document.getElementById('productStock').value = product.stock;
    
    // Update UI
    formTitle.textContent = 'Edit Product';
    submitBtn.innerHTML = '<span class="icon">💾</span> Update Product';
    cancelEditBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Clear form
 */
function clearForm() {
    productForm.reset();
    document.getElementById('productId').value = '';
    formTitle.textContent = 'Add New Product';
    submitBtn.innerHTML = '<span class="icon">➕</span> Add Product';
    cancelEditBtn.style.display = 'none';
}

/**
 * Cancel edit
 */
function cancelEdit() {
    clearForm();
    showAlert('Edit cancelled.', 'info');
}

/**
 * Apply search and filters
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStockLevel = stockFilter.value;
    
    filteredInventory = inventoryData.filter(product => {
        // Search filter (by name)
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        
        // Stock level filter
        let matchesStockLevel = true;
        if (selectedStockLevel === 'in-stock') {
            matchesStockLevel = product.stock > LOW_STOCK_THRESHOLD;
        } else if (selectedStockLevel === 'low-stock') {
            matchesStockLevel = product.stock > OUT_OF_STOCK && product.stock <= LOW_STOCK_THRESHOLD;
        } else if (selectedStockLevel === 'out-of-stock') {
            matchesStockLevel = product.stock === OUT_OF_STOCK;
        }
        
        return matchesSearch && matchesCategory && matchesStockLevel;
    });
    
    displayInventory();
}

/**
 * Update entire display
 */
function updateDisplay() {
    updateStatistics();
    applyFilters();
}

/**
 * Update statistics dashboard
 */
function updateStatistics() {
    const total = inventoryData.length;
    
    // Calculate total inventory value
    const totalValue = inventoryData.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    // Count low stock items (stock <= 5 but > 0)
    const lowStock = inventoryData.filter(p => p.stock > OUT_OF_STOCK && p.stock <= LOW_STOCK_THRESHOLD).length;
    
    // Count out of stock items (stock = 0)
    const outOfStock = inventoryData.filter(p => p.stock === OUT_OF_STOCK).length;
    
    // Count unique categories
    const categories = new Set(inventoryData.map(p => p.category)).size;
    
    // Update UI
    totalProductsEl.textContent = total;
    totalValueEl.textContent = formatCurrency(totalValue);
    lowStockCountEl.textContent = lowStock;
    outOfStockCountEl.textContent = outOfStock;
    totalCategoriesEl.textContent = categories;
}

/**
 * Update category filter dropdown
 */
function updateCategoryFilter() {
    const uniqueCategories = [...new Set(inventoryData.map(p => p.category))].sort();
    
    // Store current selection
    const currentSelection = categoryFilter.value;
    
    // Clear and rebuild options
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection if still valid
    if (uniqueCategories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    }
}

/**
 * Display inventory in table
 */
function displayInventory() {
    inventoryTableBody.innerHTML = '';
    
    const productsToDisplay = filteredInventory.length > 0 || searchInput.value || categoryFilter.value || stockFilter.value
        ? filteredInventory
        : inventoryData;
    
    if (productsToDisplay.length === 0) {
        emptyState.style.display = 'block';
        tableContainer.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';
    
    // Calculate total value of displayed products
    let displayedTotalValue = 0;
    
    productsToDisplay.forEach(product => {
        const row = createProductRow(product);
        inventoryTableBody.appendChild(row);
        displayedTotalValue += (product.price * product.stock);
    });
    
    // Update footer total
    footerTotalValueEl.textContent = formatCurrency(displayedTotalValue);
}

/**
 * Create table row for product with conditional formatting
 */
function createProductRow(product) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', product.id);
    
    // Calculate product value
    const productValue = product.price * product.stock;
    
    // Determine stock status for conditional formatting
    const stockStatus = getStockStatus(product.stock);
    
    // Apply row class based on stock level
    row.className = stockStatus.rowClass;
    
    row.innerHTML = `
        <td class="product-id">${product.id}</td>
        <td class="product-name">${escapeHtml(product.name)}</td>
        <td class="product-category">
            <span class="category-badge">${escapeHtml(product.category)}</span>
        </td>
        <td class="product-price">${formatCurrency(product.price)}</td>
        <td class="product-stock">
            <span class="stock-badge ${stockStatus.badgeClass}">
                ${product.stock}
            </span>
        </td>
        <td class="product-value">${formatCurrency(productValue)}</td>
        <td class="product-status">
            <span class="status-badge ${stockStatus.statusClass}">
                ${stockStatus.statusText}
            </span>
        </td>
        <td class="actions">
            <button class="btn-action btn-edit" onclick="editProduct(${product.id})" title="Edit">
                ✏️
            </button>
            <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                🗑️
            </button>
        </td>
    `;
    
    return row;
}

/**
 * Get stock status with conditional formatting classes
 */
function getStockStatus(stock) {
    if (stock === OUT_OF_STOCK) {
        return {
            statusText: 'Out of Stock',
            statusClass: 'status-out',
            badgeClass: 'stock-out',
            rowClass: 'row-out-of-stock'
        };
    } else if (stock <= LOW_STOCK_THRESHOLD) {
        return {
            statusText: 'Low Stock',
            statusClass: 'status-low',
            badgeClass: 'stock-low',
            rowClass: 'row-low-stock'
        };
    } else {
        return {
            statusText: 'In Stock',
            statusClass: 'status-ok',
            badgeClass: 'stock-ok',
            rowClass: ''
        };
    }
}

/**
 * Format number as currency
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Show alert notification
 */
function showAlert(message, type) {
    alertNotification.textContent = message;
    alertNotification.className = `alert-notification alert-${type} show`;
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        alertNotification.classList.remove('show');
    }, 4000);
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
}

/**
 * Handle JSON errors
 */
function handleJSONError(error) {
    console.error('JSON Error:', error);
    
    let errorMessage = 'Error loading inventory: ';
    
    if (error.message.includes('HTTP error')) {
        errorMessage += 'Unable to load inventory.json. Make sure you\'re running on a web server.';
    } else if (error.message.includes('Invalid JSON')) {
        errorMessage += 'The JSON file structure is invalid.';
    } else if (error instanceof SyntaxError) {
        errorMessage += 'JSON parsing error. The file contains invalid syntax.';
    } else {
        errorMessage += error.message;
    }
    
    showAlert(errorMessage, 'error');
    
    // Try to load from localStorage
    loadFromLocalStorage();
}

/**
 * Save to localStorage
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
        localStorage.setItem('nextProductId', nextProductId);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showAlert('Warning: Unable to save changes to local storage.', 'warning');
    }
}

/**
 * Load from localStorage as fallback
 */
function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem('inventoryData');
        if (stored) {
            inventoryData = JSON.parse(stored);
            
            const storedId = localStorage.getItem('nextProductId');
            if (storedId) {
                nextProductId = parseInt(storedId);
            }
            
            updateCategoryFilter();
            updateDisplay();
            showAlert('Loaded data from local storage.', 'info');
        } else {
            updateDisplay();
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showAlert('Error: Unable to load data from local storage.', 'error');
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
