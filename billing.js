/* ================================================
   DORMEDS - Billing & Invoices Page
   ================================================ */

function renderBilling() {
  const user = store.get('currentUser');
  const allInvoices = store.get('invoices') || [];
  const invoices = user.role === 'admin' ? allInvoices : allInvoices.filter(inv => inv.pharmacyId === user.id);

  const totalBilled = invoices.reduce((s, inv) => s + inv.total, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const totalPaid = paidInvoices.reduce((s, inv) => s + inv.total, 0);
  const totalPending = pendingInvoices.reduce((s, inv) => s + inv.total, 0);

  const invoiceRows = invoices.map(inv => `
    <tr>
      <td><strong style="color:var(--brand-primary)">${inv.id}</strong></td>
      <td>${inv.orderId}</td>
      <td style="font-weight:var(--fw-medium)">${inv.customerName}</td>
      <td>${inv.items.length} item${inv.items.length > 1 ? 's' : ''}</td>
      <td style="font-weight:var(--fw-semibold)">${formatCurrency(inv.total)}</td>
      <td><span class="status-badge ${inv.status === 'paid' ? 'completed' : 'pending'}">${inv.status}</span></td>
      <td style="font-size:var(--text-xs);color:var(--text-tertiary)">${formatDate(inv.createdAt)}</td>
      <td>
        <div style="display:flex;gap:var(--space-1)">
          <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.viewInvoice('${inv.id}')" title="View Invoice">
            <span class="material-icons-round" style="font-size:16px">visibility</span>
          </button>
          <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.downloadInvoice('${inv.id}')" title="Download PDF">
            <span class="material-icons-round" style="font-size:16px">download</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Billing & Invoices</h1>
        <p>Manage invoices and track payments</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.generateInvoice()">
          <span class="material-icons-round" style="font-size:16px">receipt</span> Generate Invoice
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="margin-bottom:var(--space-8)">
      <div class="stat-card">
        <div class="stat-icon purple"><span class="material-icons-round">receipt_long</span></div>
        <div class="stat-info">
          <h3>${formatCurrency(totalBilled)}</h3>
          <p>Total Billed</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal"><span class="material-icons-round">check_circle</span></div>
        <div class="stat-info">
          <h3>${formatCurrency(totalPaid)}</h3>
          <p>Paid (${paidInvoices.length})</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><span class="material-icons-round">schedule</span></div>
        <div class="stat-info">
          <h3>${formatCurrency(totalPending)}</h3>
          <p>Pending (${pendingInvoices.length})</p>
        </div>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">All Invoices</h3>
        <div class="filters-bar" style="margin:0;gap:var(--space-2)">
          <select class="filter-select" id="billing-filter" onchange="window.DORMEDS.filterBilling(this.value)">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Invoice ID</th><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody id="billing-tbody">
            ${invoiceRows || '<tr><td colspan="8"><div class="empty-state"><span class="material-icons-round empty-icon">receipt_long</span><h3>No invoices</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/** View invoice detail (preview) */
function viewInvoice(invoiceId) {
  const invoices = store.get('invoices') || [];
  const inv = invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  const pharmacies = store.get('pharmacies') || [];
  const pharmacy = pharmacies.find(p => p.id === inv.pharmacyId) || { name: 'DORMEDS Pharmacy', address: 'Bengaluru, India' };

  const itemsHTML = inv.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:right">${formatCurrency(item.price)}</td>
      <td style="text-align:right;font-weight:var(--fw-semibold)">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal" style="max-width:720px">
        <div class="modal-header">
          <h2>Invoice Preview</h2>
          <div style="display:flex;gap:var(--space-2)">
            <button class="btn btn-secondary btn-sm" onclick="window.DORMEDS.downloadInvoice('${inv.id}')">
              <span class="material-icons-round" style="font-size:14px">download</span> Download
            </button>
            <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()">
              <span class="material-icons-round">close</span>
            </button>
          </div>
        </div>
        <div class="modal-body" style="padding:0">
          <div class="invoice-preview">
            <div class="invoice-header">
              <div class="invoice-brand">
                <h2>DORMEDS</h2>
                <p>Medicine Delivery & Pharmacy Management</p>
              </div>
              <div class="invoice-meta">
                <h3>INVOICE</h3>
                <p><strong>${inv.id}</strong></p>
                <p>Date: ${formatDate(inv.createdAt)}</p>
                <p>Status: <span style="color:${inv.status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)'};font-weight:var(--fw-semibold)">${inv.status.toUpperCase()}</span></p>
              </div>
            </div>

            <div class="invoice-parties">
              <div class="invoice-party">
                <h4>From</h4>
                <p class="party-name">${pharmacy.name}</p>
                <p>${pharmacy.address}</p>
                <p>GSTIN: 29ABCDE1234F1Z5</p>
              </div>
              <div class="invoice-party">
                <h4>Bill To</h4>
                <p class="party-name">${inv.customerName}</p>
                <p>${inv.customerAddress || 'Bengaluru, Karnataka'}</p>
              </div>
            </div>

            <div class="invoice-items">
              <table>
                <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
                <tbody>${itemsHTML}</tbody>
              </table>
            </div>

            <div class="invoice-totals">
              <table>
                <tr><td>Subtotal</td><td>${formatCurrency(inv.subtotal)}</td></tr>
                <tr><td>GST (18%)</td><td>${formatCurrency(inv.tax)}</td></tr>
                ${inv.discount > 0 ? `<tr><td>Discount</td><td style="color:var(--color-success)">-${formatCurrency(inv.discount)}</td></tr>` : ''}
                <tr class="total-row"><td>Total</td><td>${formatCurrency(inv.total)}</td></tr>
              </table>
            </div>

            <div class="invoice-footer">
              <p>Thank you for your business! This is a computer-generated invoice.</p>
              <p>DORMEDS — Medicine Delivery & Pharmacy Management System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Download invoice as simulated PDF */
function downloadInvoice(invoiceId) {
  showToast(`Invoice ${invoiceId} downloaded successfully`, 'success');
}

/** Generate invoice from order */
function generateInvoice() {
  const user = store.get('currentUser');
  const orders = (store.get('orders') || []).filter(o =>
    (user.role === 'admin' || o.pharmacyId === user.id) &&
    o.status === 'delivered'
  );

  const invoices = store.get('invoices') || [];
  const invoicedOrderIds = invoices.map(i => i.orderId);
  const uninvoicedOrders = orders.filter(o => !invoicedOrderIds.includes(o.id));

  if (uninvoicedOrders.length === 0) {
    showToast('All delivered orders already have invoices', 'info');
    return;
  }

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal" style="max-width:500px">
        <div class="modal-header">
          <h2>Generate Invoice</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Select Order</label>
            <select class="form-input" id="invoice-order">
              ${uninvoicedOrders.map(o => `<option value="${o.id}">${o.id} — ${o.customerName} (${formatCurrency(o.total)})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Customer Address</label>
            <input type="text" class="form-input" id="invoice-address" placeholder="Enter billing address" value="Bengaluru, Karnataka" />
          </div>
          <div class="form-group">
            <label>Discount (₹)</label>
            <input type="number" class="form-input" id="invoice-discount" value="0" min="0" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="window.DORMEDS.createInvoice()">
            <span class="material-icons-round" style="font-size:16px">receipt</span> Generate
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Create invoice */
function createInvoice() {
  const orderId = document.getElementById('invoice-order').value;
  const address = document.getElementById('invoice-address').value;
  const discount = parseFloat(document.getElementById('invoice-discount').value) || 0;

  const orders = store.get('orders') || [];
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const invoices = store.get('invoices') || [];
  const subtotal = order.total;
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const total = parseFloat((subtotal + tax - discount).toFixed(2));

  invoices.push({
    id: 'INV-2025-' + String(invoices.length + 1).padStart(3, '0'),
    orderId: order.id,
    customerName: order.customerName,
    customerAddress: address,
    items: order.items.map(i => ({ name: i.name, qty: i.qty, price: i.price, total: i.qty * i.price })),
    subtotal, tax, discount, total,
    status: 'paid',
    pharmacyId: order.pharmacyId,
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  });

  store.set('invoices', invoices);
  showToast('Invoice generated successfully!', 'success');
  document.querySelector('.modal-overlay')?.remove();
  window.DORMEDS.renderPage('/billing');
}

/** Filter billing table */
function filterBilling(status) {
  const rows = document.querySelectorAll('#billing-tbody tr');
  const invoices = store.get('invoices') || [];

  invoices.forEach((inv, i) => {
    if (rows[i]) rows[i].style.display = (status === 'all' || inv.status === status) ? '' : 'none';
  });
}
