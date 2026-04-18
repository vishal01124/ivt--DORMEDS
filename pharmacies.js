/* ================================================
   DORMEDS - Pharmacies Management (Admin)
   ================================================ */

function renderPharmacies() {
  const pharmacies = store.get('pharmacies') || [];
  const activeCount = pharmacies.filter(p => p.status === 'active').length;
  const totalRevenue = pharmacies.reduce((s, p) => s + p.revenue, 0);

  const rows = pharmacies.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--gradient-secondary);display:flex;align-items:center;justify-content:center;color:white;font-weight:var(--fw-bold);font-size:var(--text-sm)">${p.name.charAt(0)}</div>
          <div>
            <div style="font-weight:var(--fw-semibold)">${p.name}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${p.owner}</div>
          </div>
        </div>
      </td>
      <td style="font-size:var(--text-sm)">${p.email}</td>
      <td style="font-size:var(--text-sm)">${p.phone}</td>
      <td><span class="status-badge ${p.subscription}" style="background:var(--brand-primary)22;color:var(--brand-primary)">${p.subscription}</span></td>
      <td style="font-weight:var(--fw-semibold)">${formatCurrency(p.revenue)}</td>
      <td>${p.totalOrders}</td>
      <td><span class="status-badge ${p.status}">${p.status}</span></td>
      <td>
        <div style="display:flex;gap:var(--space-1)">
          <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.viewPharmacy('${p.id}')" title="View"><span class="material-icons-round" style="font-size:16px">visibility</span></button>
          <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.editPharmacy('${p.id}')" title="Edit"><span class="material-icons-round" style="font-size:16px">edit</span></button>
          <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.togglePharmacyStatus('${p.id}')" title="Toggle Status" style="color:${p.status === 'active' ? 'var(--color-error)' : 'var(--color-success)'}"><span class="material-icons-round" style="font-size:16px">${p.status === 'active' ? 'block' : 'check_circle'}</span></button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Pharmacy Management</h1>
        <p>${activeCount} active pharmacies • Total revenue: ${formatCurrency(totalRevenue)}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.showAddPharmacyModal()">
          <span class="material-icons-round" style="font-size:16px">add</span> Add Pharmacy
        </button>
      </div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Pharmacy</th><th>Email</th><th>Phone</th><th>Plan</th><th>Revenue</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

/** View pharmacy detail */
function viewPharmacy(pharmId) {
  const pharmacy = (store.get('pharmacies') || []).find(p => p.id === pharmId);
  if (!pharmacy) return;

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>${pharmacy.name}</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <div class="grid-2">
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Owner</span><p style="font-weight:var(--fw-semibold)">${pharmacy.owner}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Email</span><p style="font-weight:var(--fw-semibold)">${pharmacy.email}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Phone</span><p style="font-weight:var(--fw-semibold)">${pharmacy.phone}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">License</span><p style="font-weight:var(--fw-semibold)">${pharmacy.license}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Address</span><p style="font-weight:var(--fw-semibold)">${pharmacy.address}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Status</span><p><span class="status-badge ${pharmacy.status}">${pharmacy.status}</span></p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Total Orders</span><p style="font-weight:var(--fw-semibold)">${pharmacy.totalOrders}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Revenue</span><p style="font-weight:var(--fw-bold);color:var(--color-success)">${formatCurrency(pharmacy.revenue)}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Subscription</span><p style="font-weight:var(--fw-semibold);text-transform:capitalize">${pharmacy.subscription}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Joined</span><p>${formatDate(pharmacy.joinedAt)}</p></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    </div>
  `;
}

/** Add pharmacy modal */
function showAddPharmacyModal(pharmId = null) {
  const pharmacy = pharmId ? (store.get('pharmacies') || []).find(p => p.id === pharmId) : null;
  const isEdit = !!pharmacy;

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal" style="max-width:600px">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <form id="pharmacy-form" onsubmit="window.DORMEDS.savePharmacy(event,'${pharmId || ''}')">
            <div class="grid-2">
              <div class="form-group">
                <label>Pharmacy Name *</label>
                <input type="text" class="form-input" id="pharm-name" value="${pharmacy?.name || ''}" required placeholder="e.g., MedPlus Pharmacy" />
              </div>
              <div class="form-group">
                <label>Owner Name *</label>
                <input type="text" class="form-input" id="pharm-owner" value="${pharmacy?.owner || ''}" required placeholder="e.g., Anil Kumar" />
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" class="form-input" id="pharm-email" value="${pharmacy?.email || ''}" required placeholder="pharmacy@example.com" />
              </div>
              <div class="form-group">
                <label>Phone *</label>
                <input type="tel" class="form-input" id="pharm-phone" value="${pharmacy?.phone || ''}" required placeholder="+91 9876543210" />
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>License Number</label>
                <input type="text" class="form-input" id="pharm-license" value="${pharmacy?.license || ''}" placeholder="PH-2024-XXXX" />
              </div>
              <div class="form-group">
                <label>Subscription Plan</label>
                <select class="form-input" id="pharm-plan">
                  <option value="basic" ${pharmacy?.subscription === 'basic' ? 'selected' : ''}>Basic</option>
                  <option value="pro" ${pharmacy?.subscription === 'pro' ? 'selected' : ''}>Pro</option>
                  <option value="premium" ${pharmacy?.subscription === 'premium' ? 'selected' : ''}>Premium</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" class="form-input" id="pharm-address" value="${pharmacy?.address || ''}" placeholder="Full address" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="document.getElementById('pharmacy-form').requestSubmit()">
            ${isEdit ? 'Update Pharmacy' : 'Add Pharmacy'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Save pharmacy */
function savePharmacy(e, pharmId) {
  e.preventDefault();
  const pharmacies = store.get('pharmacies') || [];
  const data = {
    name: document.getElementById('pharm-name').value,
    owner: document.getElementById('pharm-owner').value,
    email: document.getElementById('pharm-email').value,
    phone: document.getElementById('pharm-phone').value,
    license: document.getElementById('pharm-license').value,
    subscription: document.getElementById('pharm-plan').value,
    address: document.getElementById('pharm-address').value,
  };

  if (pharmId) {
    const idx = pharmacies.findIndex(p => p.id === pharmId);
    if (idx >= 0) { pharmacies[idx] = { ...pharmacies[idx], ...data }; }
  } else {
    pharmacies.push({
      ...data, id: store.generateId('pharm'),
      status: 'active', joinedAt: new Date().toISOString().split('T')[0],
      totalOrders: 0, revenue: 0,
    });
  }

  store.set('pharmacies', pharmacies);
  showToast(pharmId ? 'Pharmacy updated' : 'Pharmacy added successfully', 'success');
  document.querySelector('.modal-overlay')?.remove();
  window.DORMEDS.renderPage('/pharmacies');
}

/** Toggle pharmacy active/inactive */
function togglePharmacyStatus(pharmId) {
  const pharmacies = store.get('pharmacies') || [];
  const idx = pharmacies.findIndex(p => p.id === pharmId);
  if (idx >= 0) {
    pharmacies[idx].status = pharmacies[idx].status === 'active' ? 'inactive' : 'active';
    store.set('pharmacies', pharmacies);
    showToast(`Pharmacy ${pharmacies[idx].status === 'active' ? 'activated' : 'deactivated'}`, pharmacies[idx].status === 'active' ? 'success' : 'warning');
    window.DORMEDS.renderPage('/pharmacies');
  }
}

function editPharmacy(pharmId) {
  showAddPharmacyModal(pharmId);
}
