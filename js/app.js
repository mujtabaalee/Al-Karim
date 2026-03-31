document.addEventListener('DOMContentLoaded', () => {

    // 1. Persistent Global Cart State
    let cart = [];
    
    // Load existing cart from localStorage
    const savedCart = localStorage.getItem('alkaram_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error("Could not parse cart data.");
        }
    }

    function saveCart() {
        localStorage.setItem('alkaram_cart', JSON.stringify(cart));
    }

    // 2. Render Catalog (Used primarily on catalog.html)
    const catalogGrid = document.getElementById('catalog-grid');
    const catalogTitleElement = document.getElementById('catalog-title');
    
    // Read category from URL (e.g., catalog.html?category=lawn)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    function renderProducts(products) {
        if(!catalogGrid) return; // Only process if grid exists on current page
        catalogGrid.innerHTML = '';
        
        if(products.length === 0){
            catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; font-family:var(--font-heading); font-size:1.5rem;">No items found in this collection.</p>';
            return;
        }

        products.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            let vendorDisplay = product.category;
            if (vendorDisplay === 'new') vendorDisplay = 'New Arrival';
            if (vendorDisplay === 'lawn') vendorDisplay = 'Lawn Collection';
            if (vendorDisplay === 'wedding') vendorDisplay = 'Wedding Collection';
            if (vendorDisplay === 'brands') vendorDisplay = 'Designer Brands';
            if (vendorDisplay === 'sale') vendorDisplay = 'Clearance';

            card.innerHTML = `
                <div class="product-img-wrap" onclick="openQuickView(${product.id})">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
                    <div class="product-actions" onclick="event.stopPropagation()">
                        <button class="btn-add-cart" data-id="${product.id}">ADD TO CART</button>
                    </div>
                </div>
                <div class="product-vendor">${vendorDisplay}</div>
                <h3 class="product-title" onclick="openQuickView(${product.id})">${product.title}</h3>
                <div class="product-price">${product.price}</div>
            `;
            catalogGrid.appendChild(card);
        });

        attachCartListeners();
    }

    // Initialize Catalog Page if applicable
    if (catalogGrid && typeof catalogData !== 'undefined') {
        if (categoryParam && categoryParam !== 'all') {
            const filtered = catalogData.filter(product => product.category === categoryParam);
            renderProducts(filtered);
            
            // Update Page Title natively
            if (catalogTitleElement) {
                if (categoryParam === 'new') catalogTitleElement.textContent = "New Arrivals";
                if (categoryParam === 'lawn') catalogTitleElement.textContent = "Lawn Collection";
                if (categoryParam === 'wedding') catalogTitleElement.textContent = "Wedding Collection";
                if (categoryParam === 'brands') catalogTitleElement.textContent = "Designer Edit";
                if (categoryParam === 'sale') catalogTitleElement.textContent = "Sale";
            }
        } else {
            renderProducts(catalogData); // Render all 
        }
    }

    // Home page featured highlights (show exactly 9 items in 3x3 grid)
    const featuredGrid = document.getElementById('featured-grid');
    if (featuredGrid && typeof catalogData !== 'undefined') {
        const featuredProducts = catalogData.slice(0, 9); // Enforce exactly 9 items
        const originalGrid = catalogGrid;
        
        featuredProducts.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            let vendorDisplay = product.category === 'new' ? 'New Arrival' : product.category;
            
            card.innerHTML = `
                <div class="product-img-wrap" onclick="openQuickView(${product.id})">
                    <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
                    <div class="product-actions" onclick="event.stopPropagation()">
                        <button class="btn-add-cart" data-id="${product.id}">ADD TO CART</button>
                    </div>
                </div>
                <div class="product-vendor">${vendorDisplay}</div>
                <h3 class="product-title" onclick="openQuickView(${product.id})">${product.title}</h3>
                <div class="product-price">${product.price}</div>
            `;
            featuredGrid.appendChild(card);
        });
        attachCartListeners();
    }


    // 3. Add To Cart Logic
    const cartCountEl = document.querySelector('.cart-count');

    function attachCartListeners() {
        const cartBtns = document.querySelectorAll('.btn-add-cart');
        cartBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const productId = parseInt(this.getAttribute('data-id'));
                const product = catalogData.find(p => p.id === productId);
                
                if(product) {
                    cart.push(product);
                    saveCart(); // Persist to storage
                    updateCartUI();
                    openCartSidebar();
                    
                    const originalText = this.textContent;
                    this.textContent = "ADDED ✓";
                    this.style.background = "var(--black)";
                    this.style.color = "var(--white)";
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.background = "";
                        this.style.color = "";
                    }, 1500);
                }
            });
        });
    }

    // 4. Cart Sidebar Management
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartToggle = document.getElementById('cart-toggle');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');

    function openCartSidebar() {
        if(cartSidebar) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    }

    function closeCartSidebar() {
        if(cartSidebar) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }

    if(cartToggle) cartToggle.addEventListener('click', openCartSidebar);
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCartSidebar);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCartSidebar);

    function updateCartUI() {
        if(cartCountEl) {
            cartCountEl.textContent = cart.length;
            if(cart.length > 0) {
                cartCountEl.style.transform = 'scale(1.5)';
                setTimeout(() => { cartCountEl.style.transform = 'scale(1)'; }, 200);
            }
        }

        if(!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; margin-top: 40px; color: var(--text-light); text-transform:uppercase; letter-spacing:1px;">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''));
                total += priceNum;

                const itemHTML = `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4 class="cart-item-title">${item.title}</h4>
                            <div class="cart-item-price">${item.price}</div>
                            <button class="cart-item-remove" data-index="${index}">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
            });

            document.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-index'));
                    cart.splice(idx, 1);
                    saveCart(); // Persist removal
                    updateCartUI();
                });
            });
        }
        if(cartTotalPrice) cartTotalPrice.textContent = 'Rs. ' + total.toLocaleString();
    }

    // Bind Checkout Button Routing
    const checkoutBtns = document.querySelectorAll('.cart-footer .btn-dark');
    checkoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert("Your shopping bag is empty. Please add items before checking out.");
            }
        });
    });

    // 5. Quick View Modal 
    const quickViewOverlay = document.getElementById('quick-view-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    
    window.openQuickView = function(productId) {
        const product = catalogData.find(p => p.id === productId);
        if(!product) return;

        document.getElementById('modal-img').src = product.image;
        document.getElementById('modal-vendor').textContent = product.category === 'new' ? 'New Arrival' : product.category.toUpperCase();
        document.getElementById('modal-title').textContent = product.title;
        document.getElementById('modal-price').textContent = product.price;
        document.getElementById('modal-desc').textContent = product.description;

        const oldBtn = document.getElementById('modal-add-cart');
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);

        newBtn.addEventListener('click', function() {
            cart.push(product);
            saveCart(); // persist
            updateCartUI();
            closeModal();
            openCartSidebar();
        });

        quickViewOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    };

    function closeModal() {
        if(quickViewOverlay) {
            quickViewOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(quickViewOverlay) quickViewOverlay.addEventListener('click', function(e) {
        if(e.target === this) closeModal();
    });

    // Submenu Mobile Toggles
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.style.display = mainNav.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Run Initial Update to catch any localStorage cart items!
    updateCartUI();
});
