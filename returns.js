/* ================================================
   DORMEDS - Returns Page
   ================================================ */

function renderReturns() {
  const user = store.get('currentUser');
  const allReturns = store.get('returns') || [];
  const returns = user.role === 'admin' ? allReturns : allReturns.filter(r => r.pharmacyId === user.id);

  const statusCounts = {
    all: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
  };

  const returnCards = returns.map(r => `
    <div class="card" style="padding:var(--space-5)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
        <div>
          <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${r.id}</div>
          <div style="font-weight:var(--fw-semibold)">${r.customerName}</div>
        </div>
        <span class="status-badge ${r.status}">${r.status}</span>
      </div>

      <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3)">
        <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-1)">Order: ${r.orderId}</div>
        ${r.items.map(i => `<div style="font-size:var(--text-sm)">${i.name} × ${i.qty} — ${formatCurrency(i.price * i.qty)}</div>`).join('')}
      </div>

      <div class="grid-2" style="gap:var(--space-2);margin-bottom:var(--space-3)">
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase">Reason</div>
          <div style="font-size:var(--text-sm);font-weight:var(--fw-medium)">${r.reason}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase">Refund Amount</div>
          <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--color-success)">${r.status === 'rejected' ? '₹0' : formatCurrency(r.refundAmount)}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase">Requested</div>
          <div style="font-size:var(--text-xs)">${formatDateTime(r.requestedAt)}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase">Processed</div>
          <div style="font-size:var(--text-xs)">${r.processedAt ? formatDateTime(r.processedAt) : '—'}</div>
        </div>
      </div>

      ${r.rejectionNote ? `<div style="font-size:var(--text-xs);color:var(--color-error);padding:var(--space-2) var(--space-3);background:rgba(255,107,107,0.08);border-radius:var(--radius-sm);margin-bottom:var(--space-3)">
        <strong>Rejection Note:</strong> ${r.rejectionNote}
      </div>` : ''}

      <!-- Status Timeline -->
      <div class="timeline" style="margin:var(--space-4) 0">
        <div class="timeline-item completed">
          <div class="timeline-dot"></div>
          <h4>Return Requested</h4>
          <p>${formatDateTime(r.requestedAt)}</p>
        </div>
        <div class="timeline-item ${r.status !== 'pending' ? 'completed' : 'active'}">
          <div class="timeline-dot"></div>
          <h4>Under Review</h4>
          <p>${r.status === 'pending' ? 'Currently being reviewed' : 'Review completed'}</p>
        </div>
        <div class="timeline-item ${r.status === 'approved' ? 'completed' : r.status === 'rejected' ? 'completed' : ''}">
          <div class="timeline-dot"></div>
          <h4>${r.status === 'rejected' ? 'Rejected' : r.status === 'approved' ? 'Approved & Refunded' : 'Resolution'}</h4>
          <p>${r.processedAt ? formatDateTime(r.processedAt) : 'Pending'}</p>
        </div>
      </div>

      ${r.status === 'pending' ? `
        <div style="display:flex;gap:var(--space-2);justify-content:flex-end">
          <button class="btn btn-success btn-sm" onclick="window.DORMEDS.processReturn('${r.id}','approved')">
            <span class="material-icons-round" style="font-size:14px">check</span> Approve & Refund
          </button>
          <button class="btn btn-danger btn-sm" onclick="window.DORMEDS.processReturn('${r.id}','rejected')">
            <span class="material-icons-round" style="font-size:14px">close</span> Reject
          </button>
        </div>
      ` : ''}
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Returns Management</h1>
        <p>Track and process return requests</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.showReturnForm()">
          <span class="material-icons-round" style="font-size:16px">add</span> New Return Request
        </button>
      </div>
    </div>

    <div class="tabs" id="return-tabs">
      <div class="tab active" onclick="window.DORMEDS.filterReturns('all',this)">All (${statusCounts.all})</div>
      <div class="tab" onclick="window.DORMEDS.filterReturns('pending',this)">Pending (${statusCounts.pending})</div>
      <div class="tab" onclick="window.DORMEDS.filterReturns('approved',this)">Approved (${statusCounts.approved})</div>
      <div class="tab" onclick="window.DORMEDS.filterReturns('rejected',this)">Rejected (${statusCounts.rejected})</div>
    </div>

    <div class="grid-2" id="returns-grid">
      ${returnCards || `<div class="empty-state" style="grid-column:1/-1"><span class="material-icons-round empty-icon">assignment_return</span><h3>No return requests</h3><p>All returns will appear here</p></div>`}
    </div>
  `;
}

/** Process return (approve/reject) */
function processReturn(returnId, status) {
  if (status === 'rejected') {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal" style="max-width:440px">
          <div class="modal-header">
            <h2>Reject Return</h2>
            <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Rejection Reason *</label>
              <textarea class="form-input" id="reject-reason" rows="3" placeholder="Explain why this return is being rejected..." required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-danger" onclick="window.DORMEDS.confirmRejectReturn('${returnId}')">Reject Return</button>
          </div>
        </div>
      </div>`;
    return;
  }

  const returns = store.get('returns') || [];
  const idx = returns.findIndex(r => r.id === returnId);
  if (idx >= 0) {
    returns[idx].status = 'approved';
    returns[idx].processedAt = new Date().toISOString();
    store.set('returns', returns);
    showToast('Return approved and refund initiated', 'success');
    window.DORMEDS.renderPage('/returns');
  }
}

/** Confirm rejection with reason */
function confirmRejectReturn(returnId) {
  const reason = document.getElementById('reject-reason')?.value?.trim();
  if (!reason) { showToast('Please provide a rejection reason', 'warning'); return; }

  const returns = store.get('returns') || [];
  const idx = returns.findIndex(r => r.id === returnId);
  if (idx >= 0) {
    returns[idx].status = 'rejected';
    returns[idx].processedAt = new Date().toISOString();
    returns[idx].rejectionNote = reason;
    returns[idx].refundAmount = 0;
    store.set('returns', returns);
    showToast('Return rejected', 'info');
    document.querySelector('.modal-overlay')?.remove();
    window.DORMEDS.renderPage('/returns');
  }
}

/** Show new return request form */
function showReturnForm() {
  const user = store.get('currentUser');
  const orders = (store.get('orders') || []).filter(o => (user.role === 'admin' || o.pharmacyId === user.id) && o.status === 'delivered');

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>New Return Request</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <form id="return-form" onsubmit="window.DORMEDS.submitReturn(event)">
            <div class="form-group">
              <label>Select Order *</label>
              <select class="form-input" id="return-order" required onchange="window.DORMEDS.loadReturnItems()">
                <option value="">Choose a delivered order</option>
                ${orders.map(o => `<option value="${o.id}">${o.id} — ${o.customerName} (${formatCurrency(o.total)})</option>`).join('')}
              </select>
            </div>
            <div id="return-items-area" style="display:none">
              <div class="form-group">
                <label>Items to Return</label>
                <div id="return-items-list"></div>
              </div>
            </div>
            <div class="form-group">
              <label>Reason for Return *</label>
              <select class="form-input" id="return-reason" required>
                <option value="">Select reason</option>
                <option>Damaged packaging</option>
                <option>Wrong medicine delivered</option>
                <option>Expired medicine received</option>
                <option>Allergic reaction</option>
                <option>Quality issue</option>
                <option>Not as described</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Additional Details</label>
              <textarea class="form-input" id="return-details" rows="3" placeholder="Provide more details about the return..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="document.getElementById('return-form').requestSubmit()">Submit Request</button>
        </div>
      </div>
    </div>
  `;
}

/** Load items for selected order */
function loadReturnItems() {
  const orderId = document.getElementById('return-order').value;
  const orders = store.get('orders') || [];
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('return-items-area').style.display = '';
  document.getElementById('return-items-list').innerHTML = order.items.map((item, i) => `
    <label class="checkbox-label" style="padding:var(--space-2) 0;border-bottom:1px solid var(--border-secondary)">
      <input type="checkbox" name="return-item" value="${i}" checked />
      ${item.name} × ${item.qty} — ${formatCurrency(item.price * item.qty)}
    </label>
  `).join('');
}

/** Submit return request */
function submitReturn(e) {
  e.preventDefault();
  const orderId = document.getElementById('return-order').value;
  const reason = document.getElementById('return-reason').value;
  const orders = store.get('orders') || [];
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const checkedItems = document.querySelectorAll('input[name="return-item"]:checked');
  const items = Array.from(checkedItems).map(cb => order.items[parseInt(cb.value)]);
  const refundAmount = items.reduce((s, i) => s + (i.price * i.qty), 0);

  const returns = store.get('returns') || [];
  returns.push({
    id: 'RET-' + String(returns.length + 1).padStart(3, '0'),
    orderId, customerName: order.customerName,
    items, reason, status: 'pending', refundAmount,
    pharmacyId: order.pharmacyId,
    requestedAt: new Date().toISOString(), processedAt: null,
  });

  store.set('returns', returns);
  showToast('Return request submitted successfully', 'success');
  document.querySelector('.modal-overlay')?.remove();
  window.DORMEDS.renderPage('/returns');
}

/** Filter returns */
function filterReturns(status, tabEl) {
  document.querySelectorAll('#return-tabs .tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  const cards = document.querySelectorAll('#returns-grid .card');
  const user = store.get('currentUser');
  const returns = (store.get('returns') || []).filter(r => user.role === 'admin' || r.pharmacyId === user.id);

  returns.forEach((r, i) => {
    if (cards[i]) cards[i].style.display = (status === 'all' || r.status === status) ? '' : 'none';
  });
}
