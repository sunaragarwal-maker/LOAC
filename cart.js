(function () {
  'use strict';

  const SELLER = '919830167714';
  const KEY = 'loac-cart';
  let cart = [];

  // ── State ────────────────────────────────────
  function load() {
    try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { cart = []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
  }
  function count() { return cart.reduce((s, i) => s + i.qty, 0); }
  function total() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function fmt(n) { return '₹' + n.toLocaleString('en-IN'); }

  function addToCart(name, price, category) {
    const ex = cart.find(i => i.name === name);
    if (ex) ex.qty++;
    else cart.push({ name, price: +price, category: category || '', qty: 1 });
    save(); render(); badge(); flash(name);
  }

  function removeByIdx(idx) {
    cart.splice(idx, 1);
    save(); render(); badge();
  }

  function changeQtyByIdx(idx, delta) {
    if (!cart[idx]) return;
    cart[idx].qty = Math.max(0, cart[idx].qty + delta);
    if (cart[idx].qty === 0) { removeByIdx(idx); return; }
    save(); render(); badge();
  }

  function clearCart() {
    cart = [];
    save(); render(); badge();
  }

  // ── WhatsApp order ───────────────────────────
  function orderOnWhatsApp() {
    if (!cart.length) return;
    let msg = "Hi! I'd like to order the following from Life on a Canvas:\n\n";
    cart.forEach(i => {
      msg += `• ${i.name} × ${i.qty}  —  ${fmt(i.price * i.qty)}\n`;
    });
    msg += `\n*Total: ${fmt(total())}*`;
    msg += "\n\nPlease confirm availability and share payment details. Thank you!";
    window.open(`https://wa.me/${SELLER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  }

  // ── Flash feedback on button ─────────────────
  function flash(name) {
    openDrawer();
    document.querySelectorAll(`[data-add-to-cart][data-name="${name}"]`).forEach(btn => {
      btn.textContent = '✓ Added!';
      btn.classList.add('btn-added');
      setTimeout(() => {
        btn.textContent = '+ Add to cart';
        btn.classList.remove('btn-added');
      }, 1300);
    });
  }

  // ── Drawer open/close ────────────────────────
  let open = false;
  function openDrawer() {
    open = true;
    document.getElementById('loac-drawer').classList.add('open');
    document.getElementById('loac-overlay').classList.add('open');
  }
  function closeDrawer() {
    open = false;
    document.getElementById('loac-drawer').classList.remove('open');
    document.getElementById('loac-overlay').classList.remove('open');
  }

  // ── Render drawer contents ───────────────────
  function render() {
    const body = document.getElementById('loac-cart-body');
    const foot = document.getElementById('loac-cart-foot');
    if (!body || !foot) return;

    if (!cart.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛍️</div>
          <p class="cart-empty-title">Your cart is empty</p>
          <p class="cart-empty-sub">Browse the <a href="products.html">products page</a> and tap <strong>+ Add to cart</strong> on anything you like.</p>
        </div>`;
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-unit">${fmt(item.price)} each</div>
        </div>
        <div class="cart-item-right">
          <div class="cart-item-subtotal">${fmt(item.price * item.qty)}</div>
          <div class="cart-controls">
            <button class="qty-btn" onclick="window.__loac.changeQtyByIdx(${idx},-1)" aria-label="Decrease">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="window.__loac.changeQtyByIdx(${idx},1)" aria-label="Increase">+</button>
            <button class="cart-remove" onclick="window.__loac.removeByIdx(${idx})" aria-label="Remove item">✕</button>
          </div>
        </div>
      </div>`).join('');

    foot.innerHTML = `
      <div class="cart-total-row">
        <span>Total (${count()} item${count() !== 1 ? 's' : ''})</span>
        <strong>${fmt(total())}</strong>
      </div>
      <button class="btn btn-wa cart-wa-btn" onclick="window.__loac.orderOnWhatsApp()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.94l6.304-1.653A11.944 11.944 0 0012.004 24C18.629 24 24 18.627 24 12S18.629 0 12.004 0zm0 21.818a9.814 9.814 0 01-4.999-1.37l-.36-.213-3.721.975.994-3.62-.235-.373a9.79 9.79 0 01-1.5-5.217c0-5.418 4.411-9.818 9.821-9.818 5.413 0 9.818 4.4 9.818 9.818 0 5.415-4.405 9.818-9.818 9.818z"/></svg>
        Order all on WhatsApp
      </button>
      <button class="cart-clear-btn" onclick="window.__loac.clearCart()">Clear cart</button>`;
  }

  // ── Update navbar badge ──────────────────────
  function badge() {
    const el = document.getElementById('loac-badge');
    if (!el) return;
    const n = count();
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  }

  // ── Inject HTML into page ────────────────────
  function inject() {
    // Cart button in navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      const btn = document.createElement('button');
      btn.className = 'cart-nav-btn';
      btn.setAttribute('aria-label', 'Open cart');
      btn.onclick = () => open ? closeDrawer() : openDrawer();
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span id="loac-badge" style="display:none;">0</span>`;
      navbar.appendChild(btn);
    }

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'loac-overlay';
    overlay.className = 'cart-overlay';
    overlay.onclick = closeDrawer;
    document.body.appendChild(overlay);

    // Drawer
    const drawer = document.createElement('div');
    drawer.id = 'loac-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <h3>Your cart</h3>
        <button class="cart-close-btn" onclick="window.__loac.closeDrawer()" aria-label="Close">✕</button>
      </div>
      <div class="cart-body" id="loac-cart-body"></div>
      <div class="cart-foot" id="loac-cart-foot"></div>`;
    document.body.appendChild(drawer);

    render();
    badge();
  }

  // ── Wire product buttons ─────────────────────
  function wire() {
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.name, btn.dataset.price, btn.dataset.category);
      });
    });
  }

  // ── Init ─────────────────────────────────────
  load();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { inject(); wire(); });
  } else {
    inject(); wire();
  }

  // Expose API for inline onclick handlers in dynamically rendered cart HTML
  window.__loac = { addToCart, removeByIdx, changeQtyByIdx, clearCart, orderOnWhatsApp, openDrawer, closeDrawer };

})();
