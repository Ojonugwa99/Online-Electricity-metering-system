/* ═══════════════════════════════════════════════════════════════
   PAYGREENS SUPERMARKET — script.js
   Handles: SPA routing, cart, products, modal, search, theme, forms
═══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────
   1. PRODUCT DATA
   Dummy product catalogue with 30 products
────────────────────────────────────────── */
const PRODUCTS = [
  // Fruits
  { id: 1,  name: "Red Apples (1kg)",       category: "Fruits",     price: 2500, oldPrice: 3000, emoji: "🍎", rating: 4.5, reviews: 128, badge: "Sale",  desc: "Crisp, sweet Red Delicious apples sourced from local orchards. High in antioxidants and fibre. Great for snacking or baking." },
  { id: 2,  name: "Ripe Bananas (bunch)",   category: "Fruits",     price: 1200, oldPrice: null, emoji: "🍌", rating: 4.7, reviews: 210, badge: "Hot",   desc: "Naturally ripened bananas packed with potassium and energy. Perfect for smoothies, oatmeal, or as a quick healthy snack." },
  { id: 3,  name: "Juicy Oranges (6 pcs)", category: "Fruits",     price: 1800, oldPrice: 2200, emoji: "🍊", rating: 4.4, reviews: 95,  badge: "Sale",  desc: "Sun-kissed oranges bursting with natural Vitamin C. Enjoy them fresh, juiced, or in your favourite dessert recipes." },
  { id: 4,  name: "Watermelon (whole)",     category: "Fruits",     price: 3500, oldPrice: null, emoji: "🍉", rating: 4.8, reviews: 176, badge: "New",   desc: "Large, seedless watermelons — refreshing, hydrating and perfect for sharing at parties or summer gatherings." },
  { id: 5,  name: "Ripe Mangoes (4 pcs)",  category: "Fruits",     price: 2000, oldPrice: 2500, emoji: "🥭", rating: 4.9, reviews: 302, badge: "Hot",   desc: "Premium Alphonso mangoes with a rich, sweet flavour. A tropical delight that's wonderful fresh or blended into lassi." },
  { id: 6,  name: "Grape Bunch (500g)",     category: "Fruits",     price: 2800, oldPrice: null, emoji: "🍇", rating: 4.3, reviews: 67,  badge: null,    desc: "Plump, seedless green grapes — sweet, crispy, and perfect as a light snack or a beautiful garnish for your cheese board." },

  // Vegetables
  { id: 7,  name: "Fresh Broccoli (500g)", category: "Vegetables", price: 1500, oldPrice: null, emoji: "🥦", rating: 4.6, reviews: 144, badge: "New",   desc: "Farm-fresh broccoli packed with vitamins K and C. Steam it, roast it, or stir-fry — it's a nutritious powerhouse." },
  { id: 8,  name: "Organic Carrots (1kg)", category: "Vegetables", price: 1200, oldPrice: 1500, emoji: "🥕", rating: 4.5, reviews: 88,  badge: "Sale",  desc: "Organically grown carrots with a naturally sweet crunch. Excellent for stews, salads, juices, and healthy snacking." },
  { id: 9,  name: "Ripe Tomatoes (1kg)",   category: "Vegetables", price: 1800, oldPrice: null, emoji: "🍅", rating: 4.4, reviews: 211, badge: null,    desc: "Locally grown, vine-ripened tomatoes full of lycopene. Ideal for stews, sauces, salads, and all your Nigerian soups." },
  { id: 10, name: "Fresh Spinach (250g)",  category: "Vegetables", price: 900,  oldPrice: null, emoji: "🥬", rating: 4.7, reviews: 130, badge: "New",   desc: "Tender baby spinach leaves, harvested fresh daily. Rich in iron and perfect for salads, smoothies, and sautéed sides." },
  { id: 11, name: "Sweet Corn (3 pcs)",    category: "Vegetables", price: 1400, oldPrice: 1800, emoji: "🌽", rating: 4.3, reviews: 75,  badge: "Sale",  desc: "Golden, sweet corn harvested at peak ripeness. Boil, grill, or roast them — a family favourite at any mealtime." },
  { id: 12, name: "Bell Peppers (mix)",    category: "Vegetables", price: 1600, oldPrice: null, emoji: "🫑", rating: 4.5, reviews: 92,  badge: null,    desc: "A colourful mix of red, yellow, and green bell peppers — crisp, vibrant, and great for stir-fries, salads, and stews." },

  // Beverages
  { id: 13, name: "Chivita Orange (1L)",   category: "Beverages",  price: 1200, oldPrice: 1500, emoji: "🧃", rating: 4.6, reviews: 254, badge: "Sale",  desc: "100% natural orange juice with no added preservatives. A refreshing, vitamin-rich drink the whole family will enjoy." },
  { id: 14, name: "Peak Whole Milk (1L)",  category: "Beverages",  price: 1800, oldPrice: null, emoji: "🥛", rating: 4.7, reviews: 189, badge: null,    desc: "Full-cream, rich whole milk fortified with essential vitamins. Perfect for drinking, cooking, or your morning cereal." },
  { id: 15, name: "Eva Water (1.5L)",      category: "Beverages",  price: 400,  oldPrice: null, emoji: "💧", rating: 4.8, reviews: 500, badge: "Hot",   desc: "Premium still water purified through a multi-stage process. Crisp, clean hydration you can trust every single day." },
  { id: 16, name: "Malta Guinness (6pk)",  category: "Beverages",  price: 3000, oldPrice: 3600, emoji: "🍺", rating: 4.5, reviews: 310, badge: "Sale",  desc: "The beloved malt beverage — smooth, energy-rich, and non-alcoholic. Enjoy chilled as a refreshing treat any time." },
  { id: 17, name: "Milo Cocoa (500g tin)", category: "Beverages",  price: 4500, oldPrice: 5200, emoji: "☕", rating: 4.9, reviews: 412, badge: "Hot",   desc: "The classic Milo chocolate malt drink. Packed with vitamins and minerals, it's perfect for all ages — hot or cold." },
  { id: 18, name: "Sprite Can (4pk)",      category: "Beverages",  price: 1600, oldPrice: null, emoji: "🥤", rating: 4.4, reviews: 156, badge: null,    desc: "Crisp and refreshingly lemon-lime carbonated Sprite. Ice cold and fizzy — the perfect companion for a hot afternoon." },

  // Snacks
  { id: 19, name: "Pringles Original",     category: "Snacks",     price: 2200, oldPrice: 2500, emoji: "🍿", rating: 4.7, reviews: 287, badge: "Sale",  desc: "Everyone's favourite stackable chips with a perfectly crunchy bite. Great for parties, movie nights, or any occasion." },
  { id: 20, name: "Gala Sausage Roll",     category: "Snacks",     price: 600,  oldPrice: null, emoji: "🌭", rating: 4.5, reviews: 520, badge: "Hot",   desc: "Nigeria's iconic on-the-go sausage roll — soft, flaky pastry filled with seasoned meat. A timeless classic snack." },
  { id: 21, name: "Digestive Biscuits",    category: "Snacks",     price: 1500, oldPrice: 1800, emoji: "🍪", rating: 4.3, reviews: 104, badge: "Sale",  desc: "Wholesome wheat digestive biscuits with a subtle sweetness. Enjoy them plain, dipped in tea, or topped with cheese." },
  { id: 22, name: "Cadbury Dairy Milk",    category: "Snacks",     price: 1800, oldPrice: null, emoji: "🍫", rating: 4.8, reviews: 398, badge: "New",   desc: "Smooth, creamy Cadbury milk chocolate — a timeless treat. Rich, indulgent, and perfect for sharing (or not!)." },
  { id: 23, name: "Popcorn (Sweet, 100g)", category: "Snacks",     price: 800,  oldPrice: null, emoji: "🍿", rating: 4.2, reviews: 83,  badge: null,    desc: "Light and airy kettle-corn style sweet popcorn. Low in calories and high in fun — your go-to movie night snack." },
  { id: 24, name: "Kini Groundnut (200g)", category: "Snacks",     price: 1000, oldPrice: 1200, emoji: "🥜", rating: 4.6, reviews: 167, badge: "Sale",  desc: "Freshly roasted Nigerian groundnuts seasoned to perfection. A nutritious, protein-packed snack you'll be hooked on." },

  // Household
  { id: 25, name: "Ariel Detergent (1kg)", category: "Household",  price: 3500, oldPrice: 4000, emoji: "🧴", rating: 4.7, reviews: 321, badge: "Sale",  desc: "Powerful Ariel washing powder that removes tough stains in a single wash. Leaves your clothes fresh and bright." },
  { id: 26, name: "Dettol Hand Wash",      category: "Household",  price: 1800, oldPrice: null, emoji: "🧼", rating: 4.8, reviews: 440, badge: "Hot",   desc: "Antibacterial Dettol liquid hand wash that kills 99.9% of germs. Gentle on skin yet powerful against bacteria." },
  { id: 27, name: "Glad Trash Bags (20s)", category: "Household",  price: 2000, oldPrice: 2500, emoji: "🗑️", rating: 4.4, reviews: 98,  badge: "Sale",  desc: "Heavy-duty, leak-proof trash bags with a secure tie. Keeps your home clean and odour-free all week long." },
  { id: 28, name: "Harpic Toilet Cleaner", category: "Household",  price: 1500, oldPrice: null, emoji: "🚿", rating: 4.6, reviews: 214, badge: null,    desc: "Harpic's powerful limescale remover and disinfectant keeps your toilet bowl sparkling clean and hygienically fresh." },
  { id: 29, name: "Kitchen Sponge (3pk)",  category: "Household",  price: 900,  oldPrice: null, emoji: "🧽", rating: 4.3, reviews: 76,  badge: "New",   desc: "Heavy-duty dual-action sponges — soft on one side, abrasive on the other. Tackle grease and grime effortlessly." },
  { id: 30, name: "Febreze Air (300ml)",   category: "Household",  price: 2800, oldPrice: 3200, emoji: "🌸", rating: 4.7, reviews: 183, badge: "Sale",  desc: "Eliminate household odours and leave behind a fresh, long-lasting floral scent. Spray on fabrics, carpets, and air." },
];

/* Featured product IDs to show on the homepage */
const FEATURED_IDS = [1, 5, 9, 13, 17, 19, 25, 28];

/* Promo codes */
const PROMO_CODES = {
  "FRESH10":  { type: "percent", value: 10,   label: "10% off" },
  "WELCOME":  { type: "flat",    value: 1000,  label: "₦1,000 off" },
  "PAYGREENS":{ type: "percent", value: 15,    label: "15% off" },
};

/* ──────────────────────────────────────────
   2. STATE
────────────────────────────────────────── */
let cart            = loadCart();        // Array of {id, qty}
let currentSection  = "home";
let modalProduct    = null;
let modalQty        = 1;
let favourites      = JSON.parse(localStorage.getItem("pg_favs") || "[]");
let appliedPromo    = null;
let darkMode        = localStorage.getItem("pg_theme") === "dark";

/* ──────────────────────────────────────────
   3. INIT
────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  renderFeaturedProducts();
  renderProducts();
  renderCart();
  updateCartBadge();
  initScrollHandlers();
});

/* ──────────────────────────────────────────
   4. SPA ROUTING — show/hide page sections
────────────────────────────────────────── */
function showSection(name) {
  // Hide all sections
  document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
  // Show requested section
  const target = document.getElementById(`section-${name}`);
  if (target) target.classList.add("active");
  currentSection = name;
  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Refresh cart view every time it's shown
  if (name === "cart") renderCart();
}

/* Set active nav link */
function setActive(el) {
  document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
  if (el) el.classList.add("active");
}

/* ──────────────────────────────────────────
   5. NAVIGATION HELPERS
────────────────────────────────────────── */
function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
  document.getElementById("mobileOverlay").classList.toggle("open");
}
function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("mobileOverlay").classList.remove("open");
}
function toggleSearch() {
  document.getElementById("searchOverlay").classList.toggle("open");
  if (document.getElementById("searchOverlay").classList.contains("open")) {
    document.getElementById("globalSearch").focus();
  }
}

/* Global search (from nav search bar) — navigate to products page and filter */
function handleGlobalSearch(val) {
  if (val.trim().length > 0) {
    document.getElementById("productSearch").value = val;
    document.getElementById("categoryFilter").value = "All";
    showSection("products");
    renderProducts();
  }
}

/* Scroll categories section into view */
function scrollToCategories() {
  document.getElementById("categories-section").scrollIntoView({ behavior: "smooth" });
}

/* ──────────────────────────────────────────
   6. THEME TOGGLE (Light / Dark)
────────────────────────────────────────── */
function toggleTheme() {
  darkMode = !darkMode;
  applyTheme();
  localStorage.setItem("pg_theme", darkMode ? "dark" : "light");
}
function applyTheme() {
  document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.className = darkMode ? "fas fa-sun" : "fas fa-moon";
  }
}

/* ──────────────────────────────────────────
   7. PRODUCT RENDERING
────────────────────────────────────────── */

/**
 * Render the featured products section on the homepage.
 * Shows a subset of hand-picked products.
 */
function renderFeaturedProducts() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  const featured = PRODUCTS.filter(p => FEATURED_IDS.includes(p.id));
  grid.innerHTML = featured.map(p => productCardHTML(p)).join("");
}

/**
 * Render the full products listing page.
 * Applies search, category filter, and sort filter.
 */
function renderProducts() {
  const searchVal  = (document.getElementById("productSearch")?.value || "").toLowerCase().trim();
  const catVal     = document.getElementById("categoryFilter")?.value || "All";
  const sortVal    = document.getElementById("sortFilter")?.value || "default";

  // Filter
  let filtered = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchVal) ||
                          p.category.toLowerCase().includes(searchVal) ||
                          p.desc.toLowerCase().includes(searchVal);
    const matchesCat    = catVal === "All" || p.category === catVal;
    return matchesSearch && matchesCat;
  });

  // Sort
  if (sortVal === "price-asc")  filtered.sort((a, b) => a.price - b.price);
  if (sortVal === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sortVal === "name-asc")   filtered.sort((a, b) => a.name.localeCompare(b.name));

  const grid  = document.getElementById("productsGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultsCount");

  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML  = "";
    grid.style.display = "none";
    if (empty) empty.style.display = "block";
    if (count) count.textContent   = "No products found.";
  } else {
    grid.style.display = "grid";
    if (empty) empty.style.display = "none";
    grid.innerHTML = filtered.map(p => productCardHTML(p)).join("");
    if (count) count.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;
  }

  updateFilterTags(catVal, searchVal);
}

/**
 * Generate HTML for a single product card.
 */
function productCardHTML(p) {
  const isFav   = favourites.includes(p.id);
  const inCart  = cart.find(c => c.id === p.id);
  const stars   = ratingStars(p.rating);
  const badge   = p.badge ? `<span class="product-badge ${p.badge.toLowerCase()}">${p.badge}</span>` : "";
  const oldPx   = p.oldPrice ? `<span class="product-price-old">₦${p.oldPrice.toLocaleString()}</span>` : "";

  return `
    <div class="product-card" onclick="openModal(${p.id})">
      ${badge}
      <button class="product-fav ${isFav ? "active" : ""}" onclick="toggleFav(event, ${p.id})">
        <i class="fa${isFav ? "s" : "r"} fa-heart"></i>
      </button>
      <div class="product-img-wrap">${p.emoji}</div>
      <div class="product-info">
        <p class="product-cat">${p.category}</p>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">${stars} <span>(${p.reviews})</span></div>
        <div class="product-price-row">
          <div>
            <span class="product-price">₦${p.price.toLocaleString()}</span>${oldPx}
          </div>
          <button class="add-cart-btn" onclick="addToCart(event, ${p.id})" title="Add to cart">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>`;
}

/** Generate star rating HTML string */
function ratingStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  let html    = "";
  for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
  if (half) html += '<i class="fas fa-star-half-alt"></i>';
  return html;
}

/* Filter by category (called from category cards on homepage) */
function filterByCategory(cat) {
  const sel = document.getElementById("categoryFilter");
  if (sel) sel.value = cat;
  renderProducts();
}

/* Clear all active filters */
function clearFilters() {
  document.getElementById("productSearch").value = "";
  document.getElementById("categoryFilter").value = "All";
  document.getElementById("sortFilter").value = "default";
  renderProducts();
}

/* Show/remove filter tag chips */
function updateFilterTags(cat, search) {
  const tags = document.getElementById("filterTags");
  if (!tags) return;
  let html = "";
  if (cat && cat !== "All") {
    html += `<span class="filter-tag">${cat} <button onclick="clearCategory()">×</button></span>`;
  }
  if (search) {
    html += `<span class="filter-tag">"${search}" <button onclick="clearSearch()">×</button></span>`;
  }
  tags.innerHTML = html;
}
function clearCategory() {
  document.getElementById("categoryFilter").value = "All";
  renderProducts();
}
function clearSearch() {
  document.getElementById("productSearch").value = "";
  renderProducts();
}

/* ──────────────────────────────────────────
   8. FAVOURITES
────────────────────────────────────────── */
function toggleFav(event, id) {
  event.stopPropagation();
  const idx = favourites.indexOf(id);
  if (idx === -1) {
    favourites.push(id);
    showToast("❤️ Added to favourites");
  } else {
    favourites.splice(idx, 1);
    showToast("💔 Removed from favourites");
  }
  localStorage.setItem("pg_favs", JSON.stringify(favourites));
  renderProducts();
  renderFeaturedProducts();
}

/* ──────────────────────────────────────────
   9. CART — Add, Remove, Update Quantity
────────────────────────────────────────── */

/**
 * Add a product to the cart.
 * Stops event propagation so the modal doesn't open.
 */
function addToCart(event, id, qty = 1) {
  if (event) event.stopPropagation();

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }

  saveCart();
  updateCartBadge();

  // Animate badge
  const badge = document.getElementById("cartBadge");
  badge.classList.remove("pop");
  void badge.offsetWidth; // reflow
  badge.classList.add("pop");

  const product = PRODUCTS.find(p => p.id === id);
  showToast(`🛒 ${product.name} added to cart!`);

  if (currentSection === "cart") renderCart();
}

/**
 * Remove item from cart entirely.
 */
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
  showToast("🗑️ Item removed from cart");
}

/**
 * Update quantity of a cart item (+1 or -1).
 */
function updateQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartBadge();
  renderCart();
}

/** Render the full shopping cart view */
function renderCart() {
  const container  = document.getElementById("cartItemsContainer");
  const emptyCart  = document.getElementById("emptyCart");
  const cartLayout = document.getElementById("cartLayout");

  if (!container) return;

  if (cart.length === 0) {
    cartLayout.style.display  = "none";
    emptyCart.style.display   = "block";
    return;
  }

  cartLayout.style.display = "grid";
  emptyCart.style.display  = "none";

  container.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    if (!p) return "";
    const lineTotal = p.price * item.qty;
    return `
      <div class="cart-item">
        <div class="cart-item-emoji">${p.emoji}</div>
        <div class="cart-item-details">
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-cat">${p.category}</p>
          <p class="cart-item-price">₦${p.price.toLocaleString()} each</p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty(${p.id}, -1)">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${p.id}, 1)">+</button>
        </div>
        <div class="cart-item-total">₦${lineTotal.toLocaleString()}</div>
        <button class="remove-btn" onclick="removeFromCart(${p.id})" title="Remove">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>`;
  }).join("");

  updateCartSummary();
}

/** Calculate and display cart summary totals */
function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const deliveryFee = subtotal >= 10000 ? 0 : 500;
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percent") {
      discount = Math.round(subtotal * appliedPromo.value / 100);
    } else {
      discount = Math.min(appliedPromo.value, subtotal);
    }
  }

  const total = subtotal + deliveryFee - discount;

  const el = id => document.getElementById(id);
  if (el("summarySubtotal")) el("summarySubtotal").textContent = `₦${subtotal.toLocaleString()}`;
  if (el("summaryDelivery")) {
    el("summaryDelivery").textContent = deliveryFee === 0 ? "FREE 🎉" : `₦${deliveryFee.toLocaleString()}`;
  }
  if (el("summaryTotal"))    el("summaryTotal").textContent    = `₦${total.toLocaleString()}`;

  const discountRow = el("discountRow");
  if (discountRow) {
    discountRow.style.display = appliedPromo ? "flex" : "none";
    if (el("summaryDiscount")) el("summaryDiscount").textContent = `-₦${discount.toLocaleString()}`;
  }
}

/** Apply promo code */
function applyPromo() {
  const code  = document.getElementById("promoCode")?.value.trim().toUpperCase();
  const msgEl = document.getElementById("promoMsg");
  if (!code) { showPromoMsg("Please enter a promo code.", "err"); return; }

  const promo = PROMO_CODES[code];
  if (promo) {
    appliedPromo = promo;
    showPromoMsg(`✅ Code applied: ${promo.label}`, "ok");
    updateCartSummary();
    showToast(`🎉 Promo code "${code}" applied!`);
  } else {
    appliedPromo = null;
    showPromoMsg("❌ Invalid promo code. Try FRESH10, WELCOME, or PAYGREENS.", "err");
    updateCartSummary();
  }
}
function showPromoMsg(text, type) {
  const el = document.getElementById("promoMsg");
  if (!el) return;
  el.textContent  = text;
  el.className    = `promo-msg ${type}`;
}

/** Simulate checkout */
function checkout() {
  if (cart.length === 0) { showToast("Your cart is empty!", "error"); return; }
  showToast("🎉 Order placed successfully! Thank you for shopping at Paygreens.");
  cart = [];
  appliedPromo = null;
  saveCart();
  updateCartBadge();
  renderCart();
  // Clear promo field
  const promoInput = document.getElementById("promoCode");
  if (promoInput) promoInput.value = "";
  showSection("home");
}

/** Update cart badge number */
function updateCartBadge() {
  const totalQty = cart.reduce((sum, c) => sum + c.qty, 0);
  const badge    = document.getElementById("cartBadge");
  const mobile   = document.getElementById("mobileCartCount");
  if (badge)  badge.textContent  = totalQty;
  if (mobile) mobile.textContent = totalQty;
}

/* ──────────────────────────────────────────
   10. LOCAL STORAGE — Cart Persistence
────────────────────────────────────────── */
function saveCart() {
  localStorage.setItem("pg_cart", JSON.stringify(cart));
}
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("pg_cart") || "[]");
  } catch {
    return [];
  }
}

/* ──────────────────────────────────────────
   11. PRODUCT MODAL
────────────────────────────────────────── */

/** Open product detail modal */
function openModal(id) {
  const p = PRODUCTS.find(pr => pr.id === id);
  if (!p) return;
  modalProduct = p;
  modalQty     = 1;

  // Populate modal fields
  document.getElementById("modalEmoji").textContent    = p.emoji;
  document.getElementById("modalCategory").textContent = p.category;
  document.getElementById("modalName").textContent     = p.name;
  document.getElementById("modalRating").textContent   = ` ${p.rating} (${p.reviews} reviews)`;
  document.getElementById("modalPrice").textContent    = `₦${p.price.toLocaleString()}`;
  document.getElementById("modalDesc").textContent     = p.desc;
  document.getElementById("modalQty").textContent      = modalQty;
  document.getElementById("modalAddBtn").innerHTML     = '<i class="fas fa-cart-plus"></i> Add to Cart';

  // Show overlay and modal
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("productModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

/** Close product modal */
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.getElementById("productModal").classList.remove("open");
  document.body.style.overflow = "";
  modalProduct = null;
}

/** Increment modal quantity */
function modalIncQty() {
  modalQty++;
  document.getElementById("modalQty").textContent = modalQty;
}

/** Decrement modal quantity */
function modalDecQty() {
  if (modalQty > 1) {
    modalQty--;
    document.getElementById("modalQty").textContent = modalQty;
  }
}

/** Add item (with modal qty) to cart from modal */
function modalAddToCart() {
  if (!modalProduct) return;
  addToCart(null, modalProduct.id, modalQty);
  closeModal();
}

/* Close modal on Escape key */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

/* ──────────────────────────────────────────
   12. CONTACT FORM VALIDATION
────────────────────────────────────────── */

/**
 * Validate and submit the contact form.
 * Shows inline error messages and a success state.
 */
function submitContact(event) {
  event.preventDefault();

  const name    = document.getElementById("contactName");
  const email   = document.getElementById("contactEmail");
  const subject = document.getElementById("contactSubject");
  const message = document.getElementById("contactMessage");

  let valid = true;

  // Clear previous errors
  ["nameError","emailError","subjectError","messageError"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  [name, email, subject, message].forEach(el => el?.classList.remove("error"));

  // Validate name
  if (!name.value.trim() || name.value.trim().length < 2) {
    setFieldError(name, "nameError", "Please enter your full name (at least 2 characters).");
    valid = false;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value)) {
    setFieldError(email, "emailError", "Please enter a valid email address.");
    valid = false;
  }

  // Validate subject
  if (!subject.value) {
    setFieldError(subject, "subjectError", "Please select a subject.");
    valid = false;
  }

  // Validate message
  if (!message.value.trim() || message.value.trim().length < 20) {
    setFieldError(message, "messageError", "Message must be at least 20 characters.");
    valid = false;
  }

  if (!valid) return;

  // Simulate form submission (no backend)
  document.getElementById("formSuccess").style.display = "flex";
  document.getElementById("contactForm").querySelectorAll("input, select, textarea").forEach(el => el.value = "");
  showToast("✅ Message sent! We'll reply within 24 hours.");
}

function setFieldError(inputEl, errorId, message) {
  inputEl.classList.add("error");
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;
}

/* ──────────────────────────────────────────
   13. NEWSLETTER
────────────────────────────────────────── */
function subscribeNewsletter() {
  const input = document.getElementById("newsletterEmail");
  const msg   = document.getElementById("newsletterMsg");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!input || !input.value.trim() || !emailRegex.test(input.value)) {
    if (msg) msg.textContent = "⚠️ Please enter a valid email.";
    return;
  }

  if (msg) msg.textContent = "✅ You're subscribed! Welcome aboard.";
  input.value = "";
  showToast("🎉 Newsletter subscription confirmed!");
}

/* ──────────────────────────────────────────
   14. SCROLL HANDLERS
   - Sticky navbar shadow
   - Scroll-to-top button visibility
────────────────────────────────────────── */
function initScrollHandlers() {
  const navbar    = document.getElementById("navbar");
  const scrollBtn = document.getElementById("scrollTop");

  window.addEventListener("scroll", () => {
    const y = window.scrollY;

    // Elevate navbar when scrolled
    if (navbar) {
      navbar.style.boxShadow = y > 10
        ? "0 4px 20px rgba(0,0,0,.10)"
        : "0 1px 4px rgba(0,0,0,.06)";
    }

    // Show scroll-to-top button after 400px
    if (scrollBtn) {
      if (y > 400) {
        scrollBtn.classList.add("visible");
      } else {
        scrollBtn.classList.remove("visible");
      }
    }
  });
}

/* ──────────────────────────────────────────
   15. TOAST NOTIFICATION
────────────────────────────────────────── */
let toastTimer = null;

/**
 * Display a temporary toast notification at the bottom of the screen.
 * @param {string} message - Text to display
 * @param {string} type    - "default" | "error"
 */
function showToast(message, type = "default") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  // Clear any active toast timer
  if (toastTimer) clearTimeout(toastTimer);
  toast.classList.remove("show", "error");

  toast.textContent = message;
  if (type === "error") toast.classList.add("error");

  // Small delay so CSS transition fires
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
  });

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}
