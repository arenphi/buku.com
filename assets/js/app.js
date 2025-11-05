/* Main JS for interactions across pages */
function showModal(id) {
    const b = document.querySelector('.modal-backdrop');
    if (!b) return;
    b.style.display = 'flex';
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'block';
        // If it's the cart modal, default behavior can be set by other logic
    }
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        btn.classList.toggle('active', onclick.includes(tabName));
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName + '-tab');
    });
}

function hideModal() { const b = document.querySelector('.modal-backdrop'); if (b) b.style.display = 'none'; }

/* Login logic */
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Combine built-in demo users with stored users
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allUsers = (dataPengguna || []).concat(storedUsers);
    const user = allUsers.find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        // Save minimal session info
        localStorage.setItem('user', JSON.stringify({ email: user.email, nama: user.nama }));
        window.location.href = "dashboard.html";
    } else {
        alert("email/password yang anda masukkan salah");
    }
}

/* Registration */
function registerUser(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = (document.getElementById('reg-name') || {}).value || '';
    const email = (document.getElementById('reg-email') || {}).value || '';
    const password = (document.getElementById('reg-password') || {}).value || '';
    if (!name.trim() || !email.trim() || !password) { alert('Lengkapi Nama, Email, dan Password.'); return; }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allEmails = new Set((dataPengguna || []).map(u => u.email.toLowerCase()).concat(storedUsers.map(u => u.email.toLowerCase())));
    if (allEmails.has(email.toLowerCase())) { alert('Email sudah terdaftar. Silakan login atau gunakan email lain.'); return; }

    const newUser = { id: Date.now(), nama: name.trim(), email: email.trim(), password };
    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));

    // Auto-login after registration
    localStorage.setItem('user', JSON.stringify({ email: newUser.email, nama: newUser.nama }));
    // Close modal and redirect to dashboard
    hideModal();
    window.location.href = 'dashboard.html';
}

/* Greeting for dashboard */
function setGreeting(targetId) {
    const d = new Date();
    const h = d.getHours();
    let txt = "Selamat pagi";
    if (h >= 11 && h < 15) txt = "Selamat siang";
    else if (h >= 15 && h < 18) txt = "Selamat sore";
    else if (h >= 18) txt = "Selamat malam";

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = userData.nama || userData.email || 'Tamu';

    const el = document.getElementById(targetId);
    if (el) el.textContent = `${txt}, ${userName}`;
}

/* Dashboard Summary */
function renderDashboardSummary() {
    const totalStokEl = document.getElementById('total-stok');
    const totalBukuUnikEl = document.getElementById('total-buku-unik');
    const totalTransaksiEl = document.getElementById('total-transaksi');

    if (totalStokEl) {
        const totalStok = dataKatalogBuku.reduce((sum, item) => sum + item.stok, 0);
        totalStokEl.textContent = totalStok.toLocaleString();
    }
    if (totalBukuUnikEl) {
        totalBukuUnikEl.textContent = dataKatalogBuku.length;
    }
    if (totalTransaksiEl) {
        totalTransaksiEl.textContent = sampleOrders.length;
    }
}


/* Stok / Katalog rendering and add row */
function renderKatalog() {
    const tbody = document.getElementById('katalog-body');
    if (!tbody) return;
    tbody.innerHTML = "";

    // Compute rows per page dynamically so the katalog always fits the viewport
    const headerEl = document.querySelector('.header');
    const headerHeight = headerEl ? headerEl.offsetHeight : 84;

    // Make katalog container exactly fit remaining viewport space (prevents document scrollbar)
    const katalogContainer = document.getElementById('katalog-container');
    if (!katalogContainer) return;
    katalogContainer.style.height = (window.innerHeight - headerHeight - 24) + 'px'; // 24px buffer for margins/padding

    // Measure thead and a sample row to calculate rows that fit without overflow
    const thead = katalogContainer.querySelector('thead');
    const theadHeight = thead ? thead.offsetHeight : 56;

    // Temporarily append a hidden sample row to measure accurate row height (works with current table styling)
    let sampleRowHeight = 48; // fallback (smaller — we compacted styles for stok page)
    try {
        const sample = document.createElement('tr');
        sample.style.visibility = 'hidden';
        sample.innerHTML = '<td>001</td><td><img style="width:60px;height:80px;object-fit:cover"></td><td>Judul contoh</td><td>Edisi</td><td>1</td><td>Rp 0</td>';
        tbody.appendChild(sample);
        sampleRowHeight = sample.offsetHeight || sampleRowHeight;
        sample.remove();
    } catch (e) {
        // ignore measurement errors and use fallback
    }

    const paginationEl = document.getElementById('katalog-pagination');
    const paginationHeight = paginationEl ? paginationEl.offsetHeight : 60;

    const available = Math.max(100, katalogContainer.clientHeight - theadHeight - paginationHeight - 12);
    const rowsPerPage = Math.max(1, Math.floor(available / sampleRowHeight));

    // pagination state
    if (typeof window._katalogPage === 'undefined') window._katalogPage = 1;
    const page = window._katalogPage;
    const totalItems = dataKatalogBuku.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const slice = dataKatalogBuku.slice(start, end);

    slice.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.kodeBarang}</td>
                    <td><img src="${item.cover}" alt="${item.namaBarang}" style="width:48px;height:68px;object-fit:cover;border-radius:4px"></td>
                    <td>${item.namaBarang}</td>
                    <td>${item.edisi}</td>
                    <td>${item.stok}</td>
                    <td>Rp ${item.harga.toLocaleString()}</td>`;
        tbody.appendChild(tr);
    });

    // render pagination controls
    const pagContainer = document.getElementById('katalog-pagination');
    if (pagContainer) {
        pagContainer.innerHTML = '';
        const prev = document.createElement('button');
        prev.textContent = 'Prev';
        prev.disabled = page <= 1;
        prev.onclick = () => {
            window._katalogPage = Math.max(1, page - 1);
            renderKatalog();
        };
        const next = document.createElement('button');
        next.textContent = 'Next';
        next.disabled = page >= totalPages;
        next.onclick = () => {
            window._katalogPage = Math.min(totalPages, page + 1);
            renderKatalog();
        };
        const info = document.createElement('span');
        info.style.margin = '0 8px';
        info.textContent = `Halaman ${page} / ${totalPages}`;
        pagContainer.appendChild(prev);
        pagContainer.appendChild(info);
        pagContainer.appendChild(next);
    }
}

function addStok(e) {
    e.preventDefault();
    const namaBarang = document.getElementById('new-judul').value.trim();
    const edisi = document.getElementById('new-edisi').value.trim();
    const stok = parseInt(document.getElementById('new-stok').value) || 0;
    const harga = parseInt(document.getElementById('new-harga').value) || 0;
    // Jika tidak ada cover, gunakan placeholder
    const cover = document.getElementById('new-cover').value.trim() || 'assets/img/default.jpg';

    if (!namaBarang || !edisi || stok <= 0 || harga <= 0) { alert("Pastikan Judul, Edisi, Stok (>0) dan Harga (>0) terisi!"); return; }

    // Buat kode barang baru (simulasi)
    const newId = dataKatalogBuku.length ? Math.max(...dataKatalogBuku.map(x => parseInt(x.kodeBarang.replace(/\D/g, '')))) + 1 : 1;
    const kodeBarang = 'BOOK' + String(newId).padStart(4, '0');

    dataKatalogBuku.push({ kodeBarang, namaBarang, edisi, stok, harga, cover, jenisBarang: 'Baru' });
    renderKatalog();
    e.target.reset();
}

/* Checkout: simple cart handling */
function renderKatalogForCheckout() {
    const list = document.getElementById('checkout-katalog');
    if (!list) return;
    list.innerHTML = '';

    // Calculate optimal grid layout to avoid scrollbars
    const containerWidth = list.offsetWidth || Math.max(800, window.innerWidth - 260);
    const cardWidth = 300; // wider cards for better readability
    const cardGap = 24; // increased gap between cards
    const cols = Math.max(1, Math.floor((containerWidth + cardGap) / (cardWidth + cardGap)));

    const headerEl = document.querySelector('.header');
    const headerHeight = headerEl ? headerEl.offsetHeight : 80;
    const paginationEl = document.getElementById('checkout-pagination');
    const paginationHeight = paginationEl ? paginationEl.offsetHeight : 60;

    // Ensure the list container fills the remaining viewport (prevents document scrollbar)
    list.style.boxSizing = 'border-box';
    list.style.height = (window.innerHeight - headerHeight - 48) + 'px'; // 48px buffer for paddings

    // Calculate rows based on actual container height so we don't overflow the page
    const containerInnerHeight = list.clientHeight;
    const cardHeight = 180; // target card height (px)
    const rows = Math.max(1, Math.floor((containerInnerHeight - paginationHeight) / (cardHeight + cardGap)));
    const itemsPerPage = cols * rows;

    if (typeof window._checkoutPage === 'undefined') window._checkoutPage = 1;
    const page = window._checkoutPage;
    const totalItems = dataKatalogBuku.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const start = (page - 1) * itemsPerPage;
    const slice = dataKatalogBuku.slice(start, start + itemsPerPage);

    // build grid with improved styling
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    grid.style.gap = '32px';
    grid.style.padding = '32px';
    grid.style.maxWidth = '1600px';
    grid.style.margin = '0 auto';

    slice.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card product-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'stretch';
        card.style.justifyContent = 'space-between';
        card.style.height = '200px';
        card.style.padding = '20px';
        card.style.background = '#fff';
        card.style.border = '1px solid var(--border)';
        card.style.borderRadius = '12px';
        card.style.transition = 'all 0.3s ease';
        card.style.cursor = 'pointer';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';

        // Create a hover effect handler using function to maintain correct 'this' binding
        function applyHoverEffect(hoverCard) {
            hoverCard.style.transform = 'translateY(-2px)';
            hoverCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }

        function removeHoverEffect(hoverCard) {
            hoverCard.style.transform = '';
            hoverCard.style.boxShadow = '';
        }

        card.onmouseover = function() { applyHoverEffect(this); };
        card.onmouseout = function() { removeHoverEffect(this); };

        card.innerHTML = `
                <div style="display:flex;gap:20px;align-items:start;width:100%;height:100%">
                    <div style="position:relative">
                        <img src="${item.cover}" alt="${item.namaBarang}" 
                            style="width:100px;height:150px;object-fit:cover;border-radius:10px;
                            box-shadow:0 4px 8px rgba(0,0,0,0.1);transition:transform 0.3s">
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;height:150px">
                        <div>
                            <strong style="display:block;font-size:1.2em;margin-bottom:6px;color:var(--text);
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.namaBarang}</strong>
                            <div class="small" style="color:var(--text-light);margin-bottom:8px;
                                font-size:0.95em">${item.edisi}</div>
                            <div class="small" style="color:var(--text-light);display:inline-block;
                                background:var(--border);padding:4px 8px;border-radius:4px;
                                font-size:0.9em">Stok: ${item.stok}</div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;
                            padding-top:12px;border-top:1px solid var(--border)">
                            <div style="font-weight:600;color:var(--primary);font-size:1.2em">
                                Rp ${item.harga.toLocaleString()}
                            </div>
                            <button onclick="addToCart('${item.kodeBarang}')" class="primary small"
                                style="padding:6px 12px;border-radius:6px">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
                                    stroke-linejoin="round" style="margin-right:4px">
                                    <path d="M3 3h2l.5 3h14l-2 8H7L4 3"></path>
                                    <circle cx="8" cy="19" r="2"></circle>
                                    <circle cx="17" cy="19" r="2"></circle>
                                </svg>
                                Tambah
                            </button>
                        </div>
                    </div>
                </div>`;
        grid.appendChild(card);
    });

    list.appendChild(grid);

    // pagination controls
    const pag = document.getElementById('checkout-pagination');
    if (pag) {
        pag.innerHTML = '';
        const prev = document.createElement('button');
        prev.textContent = 'Prev';
        prev.disabled = page <= 1;
        prev.onclick = () => {
            window._checkoutPage = Math.max(1, page - 1);
            renderKatalogForCheckout();
        };
        const next = document.createElement('button');
        next.textContent = 'Next';
        next.disabled = page >= totalPages;
        next.onclick = () => {
            window._checkoutPage = Math.min(totalPages, page + 1);
            renderKatalogForCheckout();
        };
        const info = document.createElement('span');
        info.style.margin = '0 8px';
        info.textContent = `Halaman ${page} / ${totalPages}`;
        pag.appendChild(prev);
        pag.appendChild(info);
        pag.appendChild(next);
    }
}

function getCart() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
}

function saveCart(c) {
    localStorage.setItem('cart', JSON.stringify(c));
    renderCart();
}

function addToCart(kodeBarang) {
    const book = dataKatalogBuku.find(b => b.kodeBarang === kodeBarang);
    if (!book) return;
    if (book.stok <= 0) { alert("Stok buku habis!"); return; }

    const cart = getCart();
    const found = cart.find(c => c.kodeBarang === kodeBarang);
    if (found) {
        if (found.qty >= book.stok) { alert(`Maksimal stok yang bisa dipesan adalah ${book.stok}!`); return; }
        found.qty += 1;
    } else {
        cart.push({ kodeBarang: book.kodeBarang, judul: book.namaBarang, harga: book.harga, qty: 1, stokMax: book.stok });
    }
    saveCart(cart);
    alert(`"${book.namaBarang}" ditambahkan ke keranjang.`);
}

function renderCart() {
    const tbody = document.getElementById('cart-body');
    const tbodyModal = document.getElementById('cart-body-modal');
    const cart = getCart();

    // Render into both main page cart and modal cart if present
    if (tbody) tbody.innerHTML = "";
    if (tbodyModal) tbodyModal.innerHTML = "";

    let subtotal = 0;

    if (cart.length === 0) {
        const emptyRow = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#666">
            Keranjang masih kosong
        </td></tr>`;
        if (tbody) tbody.innerHTML = emptyRow;
        if (tbodyModal) tbodyModal.innerHTML = emptyRow;
    } else {
        cart.forEach(item => {
            const tr = document.createElement('tr');
            const total = item.harga * item.qty;
            subtotal += total;

            tr.innerHTML = `
                <td style="max-width:200px">${item.judul}</td>
                <td class="qty-column" style="text-align:center">${item.qty}</td>
                <td class="price-column" style="text-align:right">Rp ${item.harga.toLocaleString('id-ID')}</td>
                <td class="price-column" style="text-align:right">Rp ${total.toLocaleString('id-ID')}</td>
                <td class="action-column">
                    <button onclick="removeFromCart('${item.kodeBarang}')" class="danger small" title="Hapus dari keranjang">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>`;

            if (tbody) tbody.appendChild(tr.cloneNode(true));
            if (tbodyModal) tbodyModal.appendChild(tr);
        });
    }

    // Update subtotals
    const subtotalEl = document.getElementById('cart-subtotal');
    const subtotalModalEl = document.getElementById('cart-subtotal-modal');
    const formattedSubtotal = `Rp ${subtotal.toLocaleString('id-ID')}`;
    if (subtotalEl) subtotalEl.textContent = formattedSubtotal;
    if (subtotalModalEl) subtotalModalEl.textContent = formattedSubtotal;

    // update cart badge if present
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = cart.reduce((s, i) => s + (i.qty || 0), 0);
}

function removeFromCart(kodeBarang) {
    const cart = getCart();
    const item = cart.find(c => c.kodeBarang === kodeBarang);
    if (!item) return;

    if (confirm(`Hapus "${item.judul}" dari keranjang?`)) {
        const updatedCart = cart.filter(c => c.kodeBarang !== kodeBarang);
        saveCart(updatedCart);
        renderCart(); // Refresh the cart display
    }
}

/* Navigation: mark current page link as active */
function setActiveNav() {
    const currentFile = (location.pathname.split('/').pop() || '').toLowerCase();
    document.querySelectorAll('.main-nav .nav-item').forEach(a => {
        const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
        if (href && href === currentFile) a.classList.add('active');
        else a.classList.remove('active');
    });
}

/* Tracking */
function cariDO(e) {
    e.preventDefault();
    const inputEl = document.getElementById('do-number');
    const formEl = document.getElementById('tracking-form');
    const no = inputEl.value.trim();
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const hasil = orders.find(s => s.do.toLowerCase() === no.toLowerCase());
    const out = document.getElementById('tracking-result');
    if (!out) return;

    // Clear the input and hide the form
    inputEl.value = '';
    formEl.style.display = 'none';

    if (!hasil) {
        out.innerHTML = `
            <div class="card small">Nomor DO tidak ditemukan</div>
            <div style="text-align:center;margin-top:16px">
                <a href="tracking.html" class="button secondary">Cari Lagi</a>
            </div>`;
        return;
    }

    // Hitung progress bar width
    let progressWidth = 40;
    if (hasil.status === 'Dikirim') progressWidth = 70;
    else if (hasil.status === 'Diterima') progressWidth = 100;

    out.innerHTML = `<div class="card">
    <h3>Nomor DO: ${hasil.do}</h3>
    <div class="small">Penerima: <strong>${hasil.nama}</strong></div>
    <div class="small">Ekspedisi: ${hasil.ekspedisi} • Tanggal: ${hasil.tgl} • Paket: ${hasil.paket}</div>
    <div style="margin-top:12px">
      <div class="small" style="font-weight: 500;">Status Saat Ini: <strong>${hasil.status}</strong></div>
      <div class="progress" style="margin-top:6px"><span style="width:${progressWidth}%;"></span></div>
    </div>
    <div style="margin-top:12px"><strong>Total Pesanan:</strong> Rp ${hasil.total.toLocaleString()}</div>
    <div style="margin-top:12px"><strong>Alamat Pengiriman:</strong><br>${hasil.alamat}</div>
    <div style="margin-top:12px"><strong>Metode Pembayaran:</strong> ${hasil.pembayaran}</div>
    <div style="text-align:center;margin-top:24px;border-top:1px solid var(--border);padding-top:16px">
      <a href="tracking.html" class="button secondary">Cek Nomor DO Lain</a>
    </div>
  </div>`;
}

/* Process Checkout and Generate Order */
function processCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }

    const nama = document.getElementById('order-name').value.trim();
    const alamat = document.querySelector('#order-form textarea').value.trim();
    const pembayaran = document.querySelector('#order-form select').value;

    if (!nama || !alamat) {
        alert('Mohon lengkapi nama dan alamat pengiriman!');
        return;
    }

    // Generate DO number (format: DOyyyymmddXXX)
    const date = new Date();
    const dateStr = date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');

    // Get existing orders or initialize
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    // Find the last order number for today to increment
    const todaysOrders = orders.filter(o => o.do.includes(dateStr));
    const sequence = (todaysOrders.length + 1).toString().padStart(3, '0');
    const doNumber = `DO${dateStr}${sequence}`;

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);

    // Create new order
    const newOrder = {
        do: doNumber,
        nama: nama,
        alamat: alamat,
        status: 'Dalam pengiriman',
        ekspedisi: 'JNE',
        tgl: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        paket: 'Reguler',
        total: total,
        items: cart,
        pembayaran: pembayaran
    };

    // Save order
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    localStorage.setItem('cart', '[]');

    // Show confirmation with tracking number
    alert(`Pesanan berhasil diproses!\nNomor tracking: ${doNumber}\nSilakan cek status pengiriman di menu Tracking.`);

    // Redirect to history page
    window.location.href = 'history.html';
}

/* History */
function renderHistory() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;
    tbody.innerHTML = "";

    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px">Belum ada riwayat pesanan</td></tr>';
        return;
    }

    orders.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.do}</td>
            <td>${item.nama}</td>
            <td>${item.tgl}</td>
            <td><span class="status-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span></td>
            <td>Rp ${item.total.toLocaleString()}</td>`;
        tbody.appendChild(tr);
    });
}


/* init loader per halaman */
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing cart data to prevent default items
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', '[]');
    }

    // attach login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    // attach register handler if register modal exists
    const regBtn = document.getElementById('btn-register');
    if (regBtn) regBtn.addEventListener('click', registerUser);
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Halaman Dashboard
    if (document.getElementById('greeting')) {
        setGreeting('greeting');
        renderDashboardSummary();
    }

    // Halaman Stok
    const katalogForm = document.getElementById('stok-form');
    if (katalogForm) katalogForm.addEventListener('submit', addStok);
    if (document.getElementById('katalog-body')) renderKatalog();

    // Halaman Dashboard: render carousel if present
    if (document.getElementById('carousel-track')) renderCarousel();
    // Halaman Checkout
    if (document.getElementById('checkout-katalog')) renderKatalogForCheckout();
    if (document.getElementById('cart-body')) renderCart();

    // Halaman Tracking
    const searchDO = document.getElementById('tracking-form');
    if (searchDO) searchDO.addEventListener('submit', cariDO);

    // Add event listener for checkout form
    const checkoutBtn = document.querySelector('#order-form button');
    if (checkoutBtn) {
        checkoutBtn.onclick = processCheckout;
    }

    // Halaman History
    if (document.getElementById('history-body')) renderHistory();

    // Login page specific class update for styling
    if (document.title.includes('Login')) {
        const containerEl = document.querySelector('.container');
        if (containerEl) containerEl.classList.remove('container');
        if (containerEl) containerEl.classList.add('container-login');
        const cardEl = document.querySelector('.card');
        if (cardEl && cardEl.parentElement.classList.contains('container-login')) {
            cardEl.classList.add('card-login');
        }
        const headerEl = document.querySelector('.header');
        if (headerEl) headerEl.style.display = 'none'; // Sembunyikan header di halaman login
    }

    // Set active nav item for current page
    setActiveNav();

    // Make header logo clickable and navigate to dashboard
    document.querySelectorAll('.logo').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => { window.location.href = 'dashboard.html'; });
    });

    // If user logged in, prefill checkout name and adjust UI
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.nama) {
        const orderName = document.getElementById('order-name');
        if (orderName) {
            orderName.value = currentUser.nama;
            orderName.setAttribute('readonly', 'readonly');
        }
    }

    // Re-render katalog/checkout on resize (debounced)
    let _resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(() => {
            if (document.getElementById('katalog-body')) renderKatalog();
            if (document.getElementById('checkout-katalog')) renderKatalogForCheckout();
        }, 180);
    });

});

/* Carousel rendering and controls */
function renderCarousel() {
    const track = document.getElementById('carousel-track');
    const indicators = document.getElementById('carousel-indicators');
    if (!track || !indicators) return;

    // Create slides from dataKatalogBuku
    track.innerHTML = '';
    indicators.innerHTML = '';
    dataKatalogBuku.forEach((item, idx) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<img src="${item.cover}" alt="${escapeHtml(item.namaBarang)}">`;
        track.appendChild(slide);

        const dot = document.createElement('button');
        dot.addEventListener('click', () => goToSlide(idx));
        indicators.appendChild(dot);
    });

    const slides = Array.from(track.children);
    let current = 0;
    let slideWidth = slides[0] ? slides[0].getBoundingClientRect().width : 0;
    let autoTimer = null;

    function update() {
        // support multi-slide viewport: compute transform by current * slideWidth
        const offset = current * slideWidth;
        track.style.transform = `translateX(-${offset}px)`;
        Array.from(indicators.children).forEach((b, i) => b.classList.toggle('active', i === current));
    }

    function goToSlide(i) {
        current = Math.max(0, Math.min(i, slides.length - 1));
        update();
    }

    function next() {
        current = (current + 1) % slides.length;
        update();
    }

    function prev() {
        current = (current - 1 + slides.length) % slides.length;
        update();
    }

    // Attach controls
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Autoplay
    function startAuto() {
        stopAuto();
        autoTimer = setInterval(next, 3000);
    }

    function stopAuto() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // Recompute sizes on resize
    window.addEventListener('resize', () => {
        slideWidth = slides[0] ? slides[0].getBoundingClientRect().width : 0;
        update();
    });

    // initial setup
    slideWidth = slides[0] ? slides[0].getBoundingClientRect().width : 0;
    goToSlide(0);
    startAuto();
}

function escapeHtml(str) {
    return (str + '').replace(/[&<>\"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" })[s]);
}