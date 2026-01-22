// Products Array with name, price, category, and quantity
const products = [
    { id: 1, name: "Laptop", price: 45000, category: "Electronics" },
    { id: 2, name: "Smartphone", price: 25000, category: "Electronics" },
    { id: 3, name: "T-Shirt", price: 500, category: "Clothing" },
    { id: 4, name: "Jeans", price: 1200, category: "Clothing" },
    { id: 5, name: "Headphones", price: 2500, category: "Electronics" },
    { id: 6, name: "Jacket", price: 2000, category: "Clothing" }
];

// Shopping Cart Array
let cart = [];

// Active Coupons Array
let activeCoupons = [];

// Valid coupon codes with their discounts
const validCoupons = {
    'SAVE10': { discount: 0.10, description: '10% off' },
    'SAVE20': { discount: 0.20, description: '20% off' }
};

// Initialize the app
function init() {
    displayProducts();
    updateCart();
}

// Display products in grid
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <span class="product-category">${product.category}</span>
            <h3>${product.name}</h3>
            <div class="product-price">₹${product.price.toFixed(2)}</div>
            <button class="add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            quantity: 1
        });
    }
    
    updateCart();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCart();
    }
}

// Calculate discounts based on rules
function calculateDiscounts() {
    let discounts = {
        bulk: 0,
        category: 0,
        coupon: 0
    };
    
    let subtotal = 0;
    
    // Calculate subtotal and apply item-specific discounts
    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;
        
        // Bulk discount: 10% off if buying 5+ of same product
        if (item.quantity >= 5) {
            discounts.bulk += itemSubtotal * 0.10;
        }
        
        // Category-based discounts
        if (item.category === 'Electronics') {
            discounts.category += itemSubtotal * 0.15; // 15% off electronics
        } else if (item.category === 'Clothing') {
            discounts.category += itemSubtotal * 0.20; // 20% off clothing
        }
    });
    
    // Coupon discount (applies to subtotal after other discounts)
    activeCoupons.forEach(coupon => {
        discounts.coupon += subtotal * coupon.discount;
    });
    
    return { discounts, subtotal };
}

// Update cart display
function updateCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartSummaryDiv = document.getElementById('cartSummary');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // If cart is empty
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        cartSummaryDiv.innerHTML = '';
        checkoutBtn.disabled = true;
        return;
    }
    
    // Display cart items
    cartItemsDiv.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-header">
                <span class="item-name">${item.name}</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
            <div class="item-details">
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <span class="item-total">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
        cartItemsDiv.appendChild(cartItem);
    });
    
    // Calculate totals and discounts
    const { discounts, subtotal } = calculateDiscounts();
    
    const totalDiscount = Object.values(discounts).reduce((sum, val) => sum + val, 0);
    const finalTotal = Math.max(0, subtotal - totalDiscount);
    
    // Display summary
    let summaryHTML = `
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
        </div>
    `;
    
    // Show individual discounts if applicable
    if (discounts.bulk > 0) {
        summaryHTML += `
            <div class="summary-row discount">
                <span>Bulk Discount (5+ items):</span>
                <span>-₹${discounts.bulk.toFixed(2)}</span>
            </div>
        `;
    }
    
    if (discounts.category > 0) {
        summaryHTML += `
            <div class="summary-row discount">
                <span>Category Discount:</span>
                <span>-₹${discounts.category.toFixed(2)}</span>
            </div>
        `;
    }
    
    if (discounts.coupon > 0) {
        summaryHTML += `
            <div class="summary-row discount">
                <span>Coupon Discount:</span>
                <span>-₹${discounts.coupon.toFixed(2)}</span>
            </div>
        `;
    }
    
    summaryHTML += `
        <div class="summary-row total">
            <span>Total:</span>
            <span>₹${finalTotal.toFixed(2)}</span>
        </div>
    `;
    
    cartSummaryDiv.innerHTML = summaryHTML;
    checkoutBtn.disabled = false;
}

// Apply coupon code
function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    const couponMessage = document.getElementById('couponMessage');
    const couponCode = couponInput.value.trim().toUpperCase();
    
    // Validate coupon code is not empty
    if (!couponCode) {
        showCouponMessage('Please enter a coupon code', 'error');
        return;
    }
    
    // Check if coupon code exists
    if (!validCoupons.hasOwnProperty(couponCode)) {
        showCouponMessage('Invalid coupon code', 'error');
        return;
    }
    
    // Check if coupon already applied
    if (activeCoupons.some(c => c.code === couponCode)) {
        showCouponMessage('Coupon already applied', 'error');
        return;
    }
    
    // Validate that only one percentage-based coupon can be applied
    if (activeCoupons.length > 0) {
        showCouponMessage('Only one coupon allowed', 'error');
        return;
    }
    
    // Apply the coupon
    const coupon = validCoupons[couponCode];
    activeCoupons.push({
        code: couponCode,
        discount: coupon.discount,
        description: coupon.description
    });
    
    showCouponMessage(`✓ ${couponCode} applied: ${coupon.description}`, 'success');
    couponInput.value = '';
    
    displayActiveCoupons();
    updateCart();
}

// Show coupon message
function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('couponMessage');
    couponMessage.textContent = message;
    couponMessage.className = `coupon-message ${type}`;
    
    setTimeout(() => {
        couponMessage.textContent = '';
        couponMessage.className = 'coupon-message';
    }, 3000);
}

// Display active coupons
function displayActiveCoupons() {
    const activeCouponsDiv = document.getElementById('activeCoupons');
    
    if (activeCoupons.length === 0) {
        activeCouponsDiv.innerHTML = '';
        return;
    }
    
    activeCouponsDiv.innerHTML = '<div style="font-size: 12px; margin-bottom: 5px; font-weight: bold;">Active Coupons:</div>';
    
    activeCoupons.forEach(coupon => {
        const couponElement = document.createElement('div');
        couponElement.className = 'active-coupon';
        couponElement.innerHTML = `
            <span>${coupon.code} - ${coupon.description}</span>
            <button class="remove-coupon" onclick="removeCoupon('${coupon.code}')">×</button>
        `;
        activeCouponsDiv.appendChild(couponElement);
    });
}

// Remove coupon
function removeCoupon(couponCode) {
    activeCoupons = activeCoupons.filter(c => c.code !== couponCode);
    displayActiveCoupons();
    updateCart();
}

// Checkout function
function checkout() {
    if (cart.length === 0) return;
    
    const { discounts, subtotal } = calculateDiscounts();
    const totalDiscount = Object.values(discounts).reduce((sum, val) => sum + val, 0);
    const finalTotal = Math.max(0, subtotal - totalDiscount);
    
    // Display checkout summary
    alert(`
🛒 Checkout Summary
━━━━━━━━━━━━━━━━━━━━
Items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}
Subtotal: ₹${subtotal.toFixed(2)}
Total Discounts: -₹${totalDiscount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━
Final Total: ₹${finalTotal.toFixed(2)}

Thank you for your purchase!
    `);
    
    // Clear cart
    cart = [];
    activeCoupons = [];
    displayActiveCoupons();
    updateCart();
}

// Allow Enter key to apply coupon
document.addEventListener('DOMContentLoaded', function() {
    const couponInput = document.getElementById('couponInput');
    couponInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });
});

// Initialize on page load
init();
