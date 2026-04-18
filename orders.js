/* ================================================
   DORMEDS - Orders Page
   ================================================ */

function renderOrders() {
  const user = store.get('currentUser');
  const allOrders = store.get('orders') || [];
  const orders = user.role === 'admin' ? allOrders : allOrders.filter(o => o.pharmacyId === user.id);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const orderRows = orders.map(o => `
    <tr>
      <td><strong style="color:var(--brand-primary)">${o.id}</strong></td>
      <td>
        <div style="font-weight:var(--fw-semibold)">${o.customerName}</div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${o.customerPhone}</div>
      </td>
      <td>
        ${o.items.map(i => `<div style="font-size:var(--text-xs)">${i.name} × ${i.qty}</div>`).join('')}
      </td>
      <td style="font-weight:var(--fw-semibold)">${formatCurrency(o.total)}</td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
      <td style="font-size:var(--text-xs);color:var(--text-tertiary)">${formatDateTime(o.createdAt)}</td>
      <td>
        <div style="display:flex;gap:var(--space-1)">
          <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.viewOrder('${o.id}')" title="View Details">
            <span class="material-icons-round" style="font-size:16px">visibility</span>
          </button>
          ${o.status === 'pending' ? `
            <button class="btn btn-ghost btn-icon sm" style="color:var(--color-success)" onclick="window.DORMEDS.updateOrderStatus('${o.id}','processing')" title="Accept">
              <span class="material-icons-round" style="font-size:16px">check_circle</span>
            </button>
            <button class="btn btn-ghost btn-icon sm" style="color:var(--color-error)" onclick="window.DORMEDS.updateOrderStatus('${o.id}','cancelled')" title="Reject">
              <span class="material-icons-round" style="font-size:16px">cancel</span>
            </button>
          ` : o.status === 'processing' ? `
            <button class="btn btn-ghost btn-icon sm" style="color:var(--color-success)" onclick="window.DORMEDS.updateOrderStatus('${o.id}','delivered')" title="Mark Delivered">
              <span class="material-icons-round" style="font-size:16px">local_shipping</span>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Orders</h1>
        <p>Manage and track all orders</p>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="tabs" id="order-tabs">
      <div class="tab active" data-filter="all" onclick="window.DORMEDS.filterOrders('all',this)">All (${statusCounts.all})</div>
      <div class="tab" data-filter="pending" onclick="window.DORMEDS.filterOrders('pending',this)">Pending (${statusCounts.pending})</div>
      <div class="tab" data-filter="processing" onclick="window.DORMEDS.filterOrders('processing',this)">Processing (${statusCounts.processing})</div>
      <div class="tab" data-filter="delivered" onclick="window.DORMEDS.filterOrders('delivered',this)">Delivered (${statusCounts.delivered})</div>
      <div class="tab" data-filter="cancelled" onclick="window.DORMEDS.filterOrders('cancelled',this)">Cancelled (${statusCounts.cancelled})</div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody id="orders-tbody">
            ${orderRows || '<tr><td colspan="7"><div class="empty-state"><span class="material-icons-round empty-icon">shopping_bag</span><h3>No orders yet</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/** Update order status */
function updateOrderStatus(orderId, newStatus) {
  const orders = store.get('orders') || [];
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = newStatus;
    if (newStatus === 'delivered') orders[idx].deliveredAt = new Date().toISOString();
    store.set('orders', orders);
    const statusMsg = { processing: 'accepted', delivered: 'marked as delivered', cancelled: 'rejected' };
    showToast(`Order ${orderId} ${statusMsg[newStatus] || newStatus}`, newStatus === 'cancelled' ? 'warning' : 'success');
    window.DORMEDS.renderCurrentPage();
  }
}

/** Filter orders by status */
function filterOrders(status, tabEl) {
  document.querySelectorAll('#order-tabs .tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  const user = store.get('currentUser');
  const allOrders = store.get('orders') || [];
  const orders = user.role === 'admin' ? allOrders : allOrders.filter(o => o.pharmacyId === user.id);

  const rows = document.querySelectorAll('#orders-tbody tr');
  orders.forEach((o, i) => {
    if (!rows[i]) return;
    rows[i].style.display = (status === 'all' || o.status === status) ? '' : 'none';
  });
}

/** View order details */
function viewOrder(orderId) {
  const orders = store.get('orders') || [];
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const itemsHTML = order.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${formatCurrency(i.price)}</td>
      <td style="font-weight:var(--fw-semibold)">${formatCurrency(i.qty * i.price)}</td>
    </tr>
  `).join('');

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>Order ${order.id}</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="grid-2" style="margin-bottom:var(--space-6)">
            <div>
              <span style="font-size:var(--text-xs);color:var(--text-tertiary)">Customer</span>
              <p style="font-weight:var(--fw-semibold)">${order.customerName}</p>
              <p style="font-size:var(--text-sm);color:var(--text-secondary)">${order.customerPhone}</p>
            </div>
            <div>
              <span style="font-size:var(--text-xs);color:var(--text-tertiary)">Status</span>
              <p><span class="status-badge ${order.status}">${order.status}</span></p>
            </div>
            <div>
              <span style="font-size:var(--text-xs);color:var(--text-tertiary)">Order Date</span>
              <p style="font-size:var(--text-sm)">${formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <span style="font-size:var(--text-xs);color:var(--text-tertiary)">Delivered</span>
              <p style="font-size:var(--text-sm)">${order.deliveredAt ? formatDateTime(order.deliveredAt) : '—'}</p>
            </div>
          </div>

          <h4 style="margin-bottom:var(--space-3)">Order Items</h4>
          <div class="table-container" style="margin-bottom:var(--space-4)">
            <table class="data-table">
              <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>${itemsHTML}</tbody>
            </table>
          </div>
          <div style="text-align:right;font-size:var(--text-lg);font-weight:var(--fw-bold)">
            Total: ${formatCurrency(order.total)}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Close</button>
          ${order.status === 'pending' ? `
            <button class="btn btn-success" onclick="document.querySelector('.modal-overlay').remove();window.DORMEDS.updateOrderStatus('${order.id}','processing')">Accept Order</button>
          ` : order.status === 'processing' ? `
            <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();window.DORMEDS.updateOrderStatus('${order.id}','delivered')">Mark Delivered</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
