(function () {
  'use strict';

  const SELLER = '919830167714';
  const KEY = 'loac-cart';
  let cart = [];

  // ── Persistence ──────────────────────────────
  function load() {
    try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { cart = []; }
    if (!Array.isArray(cart)) cart = [];
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
  }

  // ── Helpers ───────────────────────────────────
  function fmt(n) { return '₹' + n.toLocaleString('en-IN'); }
  function itemCount() { return cart.reduce((s, i) => s + i.qty, 0); }
  function total() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

  // ── Cart operations ───────────────────────────
  function addToCart(name, price, category) {
    const ex = cart.find(i => i.name === name);
    if (ex) { ex.qty++; }
    else { cart.push({ name, price: +price, category: category || '', qty: 1, personalNote: '' }); }
    save(); render(); updateBadge(); updateFloatingPill(); openDrawer();
  }

  function removeByIdx(idx) {
    cart.splice(idx, 1);
    save(); render(); updateBadge(); updateFloatingPill();
  }

  function changeQtyByIdx(idx, delta) {
    if (!cart[idx]) return;
    cart[idx].qty = Math.max(0, cart[idx].qty + delta);
    if (cart[idx].qty === 0) { cart.splice(idx, 1); }
    save(); render(); updateBadge(); updateFloatingPill();
  }

  function clearCart() {
    cart = [];
    save(); render(); updateBadge(); updateFloatingPill();
  }

  // setNote does NOT call render() — keeps the input field stable while typing
  function setNote(idx, val) {
    if (cart[idx]) { cart[idx].personalNote = val; save(); }
  }

  // ── WhatsApp order ────────────────────────────
  function orderOnWhatsApp() {
    if (!cart.length) return;
    let msg = "Hi! I'd like to order the following from Life on a Canvas:\n\n";
    cart.forEach(i => {
      msg += `• ${i.name} × ${i.qty}  —  ${fmt(i.price * i.qty)}\n`;
      if (i.personalNote && i.personalNote.trim()) {
        msg += `  ✏️ ${i.personalNote.trim()}\n`;
      }
    });
    msg += `\n*Total: ${fmt(total())}*`;
    msg += "\n(Shipping charges are extra, based on delivery location — will be confirmed separately)";
    msg += "\n\nPlease confirm availability and share payment details. Thank you!";
    window.open(`https://wa.me/${SELLER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  }

  // ── Button animation ──────────────────────────
  function animateBtn(btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.classList.add('btn-added');
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('btn-added');
      btn.disabled = false;
    }, 1400);
  }

  // ── Drawer open / close ───────────────────────
  function openDrawer() {
    const overlay = document.getElementById('loac-overlay');
    const drawer  = document.getElementById('loac-drawer');
    if (overlay) overlay.classList.add('open');
    if (drawer)  drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const overlay = document.getElementById('loac-overlay');
    const drawer  = document.getElementById('loac-drawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer)  drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Render cart drawer ────────────────────────
  function render() {
    const body = document.getElementById('loac-body');
    const foot = document.getElementById('loac-foot');
    if (!body) return;

    if (!cart.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛍️</div>
          <div class="cart-empty-title">Your cart is empty</div>
          <p class="cart-empty-sub">Browse our <a href="products.html">handmade collection</a> and add something special.</p>
        </div>`;
      if (foot) foot.style.display = 'none';
      return;
    }

    if (foot) foot.style.display = '';

    body.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-top">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-unit">${fmt(item.price)} each</div>
          </div>
          <div class="cart-item-right">
            <div class="cart-item-subtotal">${fmt(item.price * item.qty)}</div>
            <div class="cart-controls">
              <button class="qty-btn" onclick="window.__loac.changeQtyByIdx(${idx},-1)" aria-label="Remove one">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="window.__loac.changeQtyByIdx(${idx},1)" aria-label="Add one">+</button>
            </div>
            <button class="cart-remove" onclick="window.__loac.removeByIdx(${idx})">Remove</button>
          </div>
        </div>
        <input
          type="text"
          class="personal-input"
          placeholder="✏️ Personalise: name, colour, design..."
          value="${(item.personalNote || '').replace(/"/g, '&quot;')}"
          oninput="window.__loac.setNote(${idx}, this.value)"
          aria-label="Personalisation note"
        >
      </div>`).join('');

    const totalEl = document.getElementById('loac-total');
    if (totalEl) totalEl.textContent = fmt(total());
  }

  // ── Navbar badge ──────────────────────────────
  function updateBadge() {
    const el = document.getElementById('loac-badge');
    if (!el) return;
    const n = itemCount();
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  }

  // ── Floating cart pill ────────────────────────
  function updateFloatingPill() {
    const pill = document.getElementById('loac-float-pill');
    if (!pill) return;
    const n = itemCount();
    if (n > 0) {
      pill.classList.add('visible');
      const label = pill.querySelector('.pill-label');
      const price = pill.querySelector('.pill-price');
      if (label) label.textContent = `View cart (${n})`;
      if (price) price.textContent = fmt(total());
    } else {
      pill.classList.remove('visible');
    }
  }

  // ── Inject HTML into the page ─────────────────
  function inject() {
    // Cart button in navbar
    if (!document.getElementById('loac-nav-btn')) {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        const btn = document.createElement('button');
        btn.id = 'loac-nav-btn';
        btn.className = 'cart-nav-btn';
        btn.setAttribute('aria-label', 'Open cart');
        btn.onclick = openDrawer;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          <span>Cart</span>
          <span id="loac-badge" style="display:none;" aria-live="polite"></span>`;
        navbar.appendChild(btn);
      }
    }

    // Overlay
    if (!document.getElementById('loac-overlay')) {
      const el = document.createElement('div');
      el.id = 'loac-overlay';
      el.className = 'cart-overlay';
      el.onclick = closeDrawer;
      document.body.appendChild(el);
    }

    // Cart drawer
    if (!document.getElementById('loac-drawer')) {
      const el = document.createElement('div');
      el.id = 'loac-drawer';
      el.className = 'cart-drawer';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', 'Shopping cart');
      el.innerHTML = `
        <div class="cart-drawer-header">
          <h3>Your cart</h3>
          <button class="cart-close-btn" onclick="window.__loac.closeDrawer()" aria-label="Close">✕</button>
        </div>
        <div class="cart-body" id="loac-body"></div>
        <div class="cart-foot" id="loac-foot" style="display:none;">
          <div class="cart-total-row">
            <span>Total</span>
            <strong id="loac-total">₹0</strong>
          </div>
          <button class="btn btn-wa cart-wa-btn" onclick="window.__loac.orderOnWhatsApp()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.94l6.304-1.653A11.944 11.944 0 0012.004 24C18.629 24 24 18.627 24 12S18.629 0 12.004 0zm0 21.818a9.814 9.814 0 01-4.999-1.37l-.36-.213-3.721.975.994-3.62-.235-.373a9.79 9.79 0 01-1.5-5.217c0-5.418 4.411-9.818 9.821-9.818 5.413 0 9.818 4.4 9.818 9.818 0 5.415-4.405 9.818-9.818 9.818z"/></svg>
            Order all on WhatsApp
          </button>
          <button class="cart-clear-btn" onclick="if(confirm('Clear all items?'))window.__loac.clearCart()">Clear cart</button>
        </div>`;
      document.body.appendChild(el);
    }

    // Floating WhatsApp button
    if (!document.getElementById('loac-wa-float')) {
      const el = document.createElement('a');
      el.id = 'loac-wa-float';
      el.className = 'wa-float';
      el.href = `https://wa.me/${SELLER}?text=${encodeURIComponent("Hi! I'd like to order from Life on a Canvas.")}`;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.setAttribute('aria-label', 'Chat on WhatsApp');
      el.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.94l6.304-1.653A11.944 11.944 0 0012.004 24C18.629 24 24 18.627 24 12S18.629 0 12.004 0zm0 21.818a9.814 9.814 0 01-4.999-1.37l-.36-.213-3.721.975.994-3.62-.235-.373a9.79 9.79 0 01-1.5-5.217c0-5.418 4.411-9.818 9.821-9.818 5.413 0 9.818 4.4 9.818 9.818 0 5.415-4.405 9.818-9.818 9.818z"/></svg>`;
      document.body.appendChild(el);
    }

    // Floating cart pill
    if (!document.getElementById('loac-float-pill')) {
      const el = document.createElement('button');
      el.id = 'loac-float-pill';
      el.className = 'cart-float-pill';
      el.setAttribute('aria-label', 'View cart');
      el.innerHTML = `🛍️ <span class="pill-label">View cart</span><span class="cart-float-price pill-price"></span>`;
      el.onclick = openDrawer;
      document.body.appendChild(el);
    }

    render();
    updateBadge();
    updateFloatingPill();
  }

  // ── Event delegation for [data-add-to-cart] ───
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    const name = btn.dataset.name;
    const price = btn.dataset.price;
    const category = btn.dataset.category || '';
    if (!name || !price) return;
    addToCart(name, price, category);
    animateBtn(btn);
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', { item_name: name, value: +price });
    }
  });

  // ── Scroll animations ─────────────────────────
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-up').forEach(el => el.classList.add('in-view'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  }

  // ── Public API ────────────────────────────────
  window.__loac = {
    addToCart,
    removeByIdx,
    changeQtyByIdx,
    clearCart,
    setNote,
    orderOnWhatsApp,
    openDrawer,
    closeDrawer
  };

  // ── Init ──────────────────────────────────────
  load();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { inject(); initScrollAnimations(); });
  } else {
    inject(); initScrollAnimations();
  }

})();
