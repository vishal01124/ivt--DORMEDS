/* ================================================
   DORMEDS - Dashboard Page (Admin + Pharmacy)
   ================================================ */

function renderDashboard() {
  const user = store.get('currentUser');
  if (!user) return '';
  return user.role === 'admin' ? renderAdminDashboard() : renderPharmacyDashboard();
}

function renderAdminDashboard() {
  const pharmacies = store.get('pharmacies') || [];
  const orders = store.get('orders') || [];
  const invoices = store.get('invoices') || [];
  const tickets = store.get('tickets') || [];

  const totalRevenue = pharmacies.reduce((s, p) => s + p.revenue, 0);
  const totalOrders = pharmacies.reduce((s, p) => s + p.totalOrders, 0);
  const activePharmacies = pharmacies.filter(p => p.status === 'active').length;
  const openTickets = tickets.filter(t => t.status === 'open').length;

  const revenueData = store.get('revenueData');

  const orderStatusData = [
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#00B894' },
    { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: '#FDCB6E' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#74B9FF' },
    { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#FF6B6B' },
  ];

  const recentOrders = orders.slice(0, 5).map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customerName}</td>
      <td>${o.items.length} item${o.items.length > 1 ? 's' : ''}</td>
      <td>${formatCurrency(o.total)}</td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
    </tr>
  `).join('');

  const topPharmacies = pharmacies.sort((a, b) => b.revenue - a.revenue).slice(0, 4).map((p, i) => `
    <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;${i < 3 ? 'border-bottom:1px solid var(--border-secondary)' : ''}">
      <div class="user-avatar" style="background:${['var(--gradient-primary)', 'var(--gradient-secondary)', 'var(--gradient-accent)', 'linear-gradient(135deg,#FDCB6E,#E17055)'][i]}">${p.name.charAt(0)}</div>
      <div style="flex:1">
        <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold)">${p.name}</div>
        <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${p.totalOrders} orders</div>
      </div>
      <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--color-success)">${formatCurrency(p.revenue)}</div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's your platform overview.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.DORMEDS.navigate('/pharmacies')">
          <span class="material-icons-round" style="font-size:16px">add</span> Add Pharmacy
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.exportReport()">
          <span class="material-icons-round" style="font-size:16px">download</span> Export Report
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card animate-fade-in-up stagger-1">
        <div class="stat-icon purple"><span class="material-icons-round">payments</span></div>
        <div class="stat-info">
          <h3 data-counter="${totalRevenue}" class="counter-value">0</h3>
          <p>Total Revenue</p>
          <div class="stat-change positive">
            <span class="material-icons-round" style="font-size:14px">trending_up</span> +18.2%
          </div>
        </div>
      </div>
      <div class="stat-card animate-fade-in-up stagger-2">
        <div class="stat-icon teal"><span class="material-icons-round">shopping_cart</span></div>
        <div class="stat-info">
          <h3 data-counter="${totalOrders}" class="counter-value">0</h3>
          <p>Total Orders</p>
          <div class="stat-change positive">
            <span class="material-icons-round" style="font-size:14px">trending_up</span> +12.5%
          </div>
        </div>
      </div>
      <div class="stat-card animate-fade-in-up stagger-3">
        <div class="stat-icon pink"><span class="material-icons-round">storefront</span></div>
        <div class="stat-info">
          <h3 data-counter="${activePharmacies}" class="counter-value">0</h3>
          <p>Active Pharmacies</p>
          <div class="stat-change positive">
            <span class="material-icons-round" style="font-size:14px">trending_up</span> +3
          </div>
        </div>
      </div>
      <div class="stat-card animate-fade-in-up stagger-4">
        <div class="stat-icon orange"><span class="material-icons-round">support_agent</span></div>
        <div class="stat-info">
          <h3 data-counter="${openTickets}" class="counter-value">0</h3>
          <p>Open Tickets</p>
          <div class="stat-change negative">
            <span class="material-icons-round" style="font-size:14px">trending_down</span> -2
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid-2" style="margin-bottom:var(--space-8)">
      <div class="card animate-fade-in-up stagger-3">
        <div class="card-header">
          <h3 class="card-title">Revenue Overview</h3>
          <select class="filter-select" style="min-width:auto">
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>
        <div class="chart-area">
          ${createBarChart(revenueData.monthly, revenueData.labels, 'var(--gradient-primary)')}
        </div>
      </div>

      <div class="card animate-fade-in-up stagger-4">
        <div class="card-header">
          <h3 class="card-title">Order Status</h3>
        </div>
        <div style="padding:var(--space-4)">
          ${createDonutChart(orderStatusData)}
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid-2">
      <div class="card animate-fade-in-up stagger-5">
        <div class="card-header">
          <h3 class="card-title">Recent Orders</h3>
          <button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.navigate('/orders')">View All</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>${recentOrders}</tbody>
          </table>
        </div>
      </div>

      <div class="card animate-fade-in-up stagger-6">
        <div class="card-header">
          <h3 class="card-title">Top Pharmacies</h3>
          <button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.navigate('/pharmacies')">View All</button>
        </div>
        ${topPharmacies}
      </div>
    </div>
  `;
}

function renderPharmacyDashboard() {
  const user = store.get('currentUser');
  const drugs = (store.get('drugs') || []).filter(d => d.pharmacyId === user.id);
  const orders = (store.get('orders') || []).filter(o => o.pharmacyId === user.id);
  const returns = (store.get('returns') || []).filter(r => r.pharmacyId === user.id);

  const totalStock = drugs.reduce((s, d) => s + d.stock, 0);
  const lowStock = drugs.filter(d => d.stock <= d.minStock).length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const todayRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const pendingReturns = returns.filter(r => r.status === 'pending').length;

  // Expiry alerts
  const expiryAlerts = drugs.filter(d => {
    const diff = (new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 90;
  }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const expiryAlertsHTML = expiryAlerts.length > 0 ? expiryAlerts.map(d => {
    const diff = Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    const cls = diff <= 0 ? 'danger' : 'warning';
    const msg = diff <= 0 ? 'EXPIRED' : `Expires in ${diff} days`;
    return `<div class="expiry-alert ${cls}">
      <span class="material-icons-round" style="font-size:18px">${diff <= 0 ? 'error' : 'warning'}</span>
      <div style="flex:1"><strong>${d.name}</strong> — ${msg} (Batch: ${d.batchNo})</div>
      <span style="font-size:var(--text-xs)">${d.expiryDate}</span>
    </div>`;
  }).join('') : '<p style="color:var(--text-tertiary);text-align:center;padding:var(--space-4)">No expiry alerts</p>';

  const recentOrders = orders.slice(0, 5).map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customerName}</td>
      <td>${formatCurrency(o.total)}</td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
      <td>
        ${o.status === 'pending' ? `
          <button class="btn btn-success btn-sm" onclick="window.DORMEDS.updateOrderStatus('${o.id}','processing')" style="padding:4px 10px;font-size:11px">Accept</button>
          <button class="btn btn-danger btn-sm" onclick="window.DORMEDS.updateOrderStatus('${o.id}','cancelled')" style="padding:4px 10px;font-size:11px">Reject</button>
        ` : o.status === 'processing' ? `
          <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.updateOrderStatus('${o.id}','delivered')" style="padding:4px 10px;font-size:11px">Deliver</button>
        ` : '—'}
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Pharmacy Dashboard</h1>
        <p>Welcome back, ${user.name}! Here's your store overview.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.navigate('/inventory')">
          <span class="material-icons-round" style="font-size:16px">add</span> Add Medicine
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card animate-fade-in-up stagger-1">
        <div class="stat-icon purple"><span class="material-icons-round">payments</span></div>
        <div class="stat-info">
          <h3 data-counter="${todayRevenue}" class="counter-value">0</h3>
          <p>Total Revenue</p>
          <div class="stat-change positive">
            <span class="material-icons-round" style="font-size:14px">trending_up</span> +8.4%
          </div>
        </div>
      </div>
      <div class="stat-card animate-fade-in-up stagger-2">
        <div class="stat-icon teal"><span class="material-icons-round">inventory_2</span></div>
        <div class="stat-info">
          <h3 data-counter="${totalStock}" class="counter-value">0</h3>
          <p>Items in Stock</p>
          ${lowStock > 0 ? `<div class="stat-change negative"><span class="material-icons-round" style="font-size:14px">warning</span> ${lowStock} low stock</div>` : ''}
        </div>
      </div>
      <div class="stat-card animate-fade-in-up stagger-3">
        <div class="stat-icon pink"><span class="material-icons-round">pending_actions</span></div>
        <div class="stat-info">
          <h3 data-counter="${pendingOrders}" class="counter-value">0</h3>
          <p>Pending Orders</p>
        </div>
      </div>
      <div class="stat-card animate-fade-in-up stagger-4">
        <div class="stat-icon orange"><span class="material-icons-round">assignment_return</span></div>
        <div class="stat-info">
          <h3 data-counter="${pendingReturns}" class="counter-value">0</h3>
          <p>Pending Returns</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card animate-fade-in-up" style="margin-bottom:var(--space-8)">
      <div class="card-header"><h3 class="card-title">Quick Actions</h3></div>
      <div class="quick-actions">
        <div class="quick-action-btn" onclick="window.DORMEDS.navigate('/inventory')">
          <span class="material-icons-round">add_circle</span><span>Add Medicine</span>
        </div>
        <div class="quick-action-btn" onclick="window.DORMEDS.navigate('/orders')">
          <span class="material-icons-round">shopping_bag</span><span>View Orders</span>
        </div>
        <div class="quick-action-btn" onclick="window.DORMEDS.navigate('/documents')">
          <span class="material-icons-round">upload_file</span><span>Upload Rx</span>
        </div>
        <div class="quick-action-btn" onclick="window.DORMEDS.navigate('/billing')">
          <span class="material-icons-round">receipt</span><span>Invoices</span>
        </div>
        <div class="quick-action-btn" onclick="window.DORMEDS.navigate('/support')">
          <span class="material-icons-round">help_center</span><span>Get Support</span>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Expiry Alerts -->
      <div class="card animate-fade-in-up stagger-5">
        <div class="card-header">
          <h3 class="card-title">⚠️ Expiry Alerts</h3>
          <button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.navigate('/inventory')">View Inventory</button>
        </div>
        ${expiryAlertsHTML}
      </div>

      <!-- Recent Orders -->
      <div class="card animate-fade-in-up stagger-6">
        <div class="card-header">
          <h3 class="card-title">Recent Orders</h3>
          <button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.navigate('/orders')">View All</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${recentOrders || '<tr><td colspan="5" style="text-align:center;color:var(--text-tertiary)">No recent orders</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/** Initialize counter animations after render */
function initDashboardCounters() {
  setTimeout(() => {
    document.querySelectorAll('.counter-value').forEach(el => {
      const target = parseInt(el.dataset.counter);
      if (!isNaN(target)) animateCounter(el, target);
    });
  }, 100);
}
