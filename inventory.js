/* ================================================
   DORMEDS - Inventory Management Page
   ================================================ */

function renderInventory() {
  const user = store.get('currentUser');
  const allDrugs = store.get('drugs') || [];
  const drugs = user.role === 'admin' ? allDrugs : allDrugs.filter(d => d.pharmacyId === user.id);

  const totalItems = drugs.length;
  const lowStockItems = drugs.filter(d => d.stock <= d.minStock);
  const categories = [...new Set(drugs.map(d => d.category))];

  const categoryOptions = categories.map(c => `<option value="${c}">${c}</option>`).join('');

  const drugRows = drugs.map(d => {
    const expStatus = isExpiringSoon(d.expiryDate);
    const stockClass = d.stock <= d.minStock ? 'color:var(--color-error);font-weight:var(--fw-bold)' : '';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <div style="width:36px;height:36px;background:var(--gradient-primary);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center">
              <span class="material-icons-round" style="color:white;font-size:18px">medication</span>
            </div>
            <div>
              <div style="font-weight:var(--fw-semibold)">${d.name}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${d.genericName}</div>
            </div>
          </div>
        </td>
        <td>${d.category}</td>
        <td>${d.batchNo}</td>
        <td style="${stockClass}">${d.stock} ${d.stock <= d.minStock ? '⚠️' : ''}</td>
        <td>${formatCurrency(d.price)}</td>
        <td>
          <span class="status-badge ${expStatus === 'expired' ? 'expired' : expStatus === 'critical' ? 'rejected' : expStatus === 'warning' ? 'pending' : 'active'}">
            ${expStatus === 'expired' ? 'Expired' : formatDate(d.expiryDate)}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:var(--space-1)">
            <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.viewDrug('${d.id}')" title="View"><span class="material-icons-round" style="font-size:16px">visibility</span></button>
            <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.editDrug('${d.id}')" title="Edit"><span class="material-icons-round" style="font-size:16px">edit</span></button>
            <button class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.deleteDrug('${d.id}')" title="Delete" style="color:var(--color-error)"><span class="material-icons-round" style="font-size:16px">delete</span></button>
          </div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Inventory Management</h1>
        <p>${totalItems} medicines in stock${lowStockItems.length > 0 ? ` • <span style="color:var(--color-error)">${lowStockItems.length} low stock alerts</span>` : ''}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.DORMEDS.showBarcodeScanner()">
          <span class="material-icons-round" style="font-size:16px">qr_code_scanner</span> Scan Barcode
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.showAddDrugModal()">
          <span class="material-icons-round" style="font-size:16px">add</span> Add Medicine
        </button>
      </div>
    </div>

    ${lowStockItems.length > 0 ? `
      <div style="background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-3)">
        <span class="material-icons-round" style="color:var(--color-error)">warning</span>
        <div style="flex:1">
          <strong style="color:var(--color-error)">Low Stock Alert!</strong>
          <span style="color:var(--text-secondary);font-size:var(--text-sm)"> — ${lowStockItems.map(d => d.name).join(', ')} need restocking</span>
        </div>
      </div>
    ` : ''}

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <span class="material-icons-round">search</span>
        <input type="text" class="search-input" placeholder="Search medicines..." id="inventory-search" oninput="window.DORMEDS.filterInventory()" />
      </div>
      <select class="filter-select" id="category-filter" onchange="window.DORMEDS.filterInventory()">
        <option value="">All Categories</option>
        ${categoryOptions}
      </select>
      <select class="filter-select" id="stock-filter" onchange="window.DORMEDS.filterInventory()">
        <option value="">All Stock</option>
        <option value="low">Low Stock</option>
        <option value="ok">In Stock</option>
        <option value="expiring">Expiring Soon</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-container">
        <table class="data-table" id="inventory-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Category</th>
              <th>Batch No</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="inventory-tbody">
            ${drugRows || '<tr><td colspan="7"><div class="empty-state"><span class="material-icons-round empty-icon">inventory_2</span><h3>No medicines found</h3><p>Add your first medicine to get started</p></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/** Show add/edit drug modal */
function showAddDrugModal(drugId = null) {
  const drug = drugId ? (store.get('drugs') || []).find(d => d.id === drugId) : null;
  const isEdit = !!drug;

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal" style="max-width:640px">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form id="drug-form" onsubmit="window.DORMEDS.saveDrug(event, '${drugId || ''}')">
            <div class="grid-2">
              <div class="form-group">
                <label>Medicine Name *</label>
                <input type="text" class="form-input" id="drug-name" value="${drug?.name || ''}" required placeholder="e.g., Paracetamol 500mg" />
              </div>
              <div class="form-group">
                <label>Generic Name</label>
                <input type="text" class="form-input" id="drug-generic" value="${drug?.genericName || ''}" placeholder="e.g., Acetaminophen" />
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Category *</label>
                <select class="form-input" id="drug-category" required>
                  <option value="">Select category</option>
                  <option ${drug?.category === 'Analgesic' ? 'selected' : ''}>Analgesic</option>
                  <option ${drug?.category === 'Antibiotic' ? 'selected' : ''}>Antibiotic</option>
                  <option ${drug?.category === 'Antacid' ? 'selected' : ''}>Antacid</option>
                  <option ${drug?.category === 'Antidiabetic' ? 'selected' : ''}>Antidiabetic</option>
                  <option ${drug?.category === 'Antihypertensive' ? 'selected' : ''}>Antihypertensive</option>
                  <option ${drug?.category === 'Antihistamine' ? 'selected' : ''}>Antihistamine</option>
                  <option ${drug?.category === 'Antipyretic' ? 'selected' : ''}>Antipyretic</option>
                  <option ${drug?.category === 'Vitamin' ? 'selected' : ''}>Vitamin</option>
                  <option ${drug?.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Manufacturer</label>
                <input type="text" class="form-input" id="drug-manufacturer" value="${drug?.manufacturer || ''}" placeholder="e.g., Cipla Ltd." />
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Batch Number *</label>
                <input type="text" class="form-input" id="drug-batch" value="${drug?.batchNo || ''}" required placeholder="e.g., B2025-0451" />
              </div>
              <div class="form-group">
                <label>Barcode</label>
                <input type="text" class="form-input" id="drug-barcode" value="${drug?.barcode || ''}" placeholder="Scan or enter barcode" />
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Purchase Price (₹) *</label>
                <input type="number" class="form-input" id="drug-price" value="${drug?.price || ''}" required min="0" step="0.01" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>MRP (₹) *</label>
                <input type="number" class="form-input" id="drug-mrp" value="${drug?.mrp || ''}" required min="0" step="0.01" placeholder="0.00" />
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Stock Quantity *</label>
                <input type="number" class="form-input" id="drug-stock" value="${drug?.stock || ''}" required min="0" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Minimum Stock Level</label>
                <input type="number" class="form-input" id="drug-minstock" value="${drug?.minStock || '20'}" min="0" placeholder="20" />
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Unit</label>
                <input type="text" class="form-input" id="drug-unit" value="${drug?.unit || ''}" placeholder="e.g., Strip (10 tabs)" />
              </div>
              <div class="form-group">
                <label>Expiry Date *</label>
                <input type="date" class="form-input" id="drug-expiry" value="${drug?.expiryDate || ''}" required />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="document.getElementById('drug-form').requestSubmit()">
            <span class="material-icons-round" style="font-size:16px">${isEdit ? 'save' : 'add'}</span>
            ${isEdit ? 'Update Medicine' : 'Add Medicine'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Save drug (add or edit) */
function saveDrug(e, drugId) {
  e.preventDefault();
  const user = store.get('currentUser');
  const drugs = store.get('drugs') || [];

  const drugData = {
    name: document.getElementById('drug-name').value,
    genericName: document.getElementById('drug-generic').value,
    category: document.getElementById('drug-category').value,
    manufacturer: document.getElementById('drug-manufacturer').value,
    batchNo: document.getElementById('drug-batch').value,
    barcode: document.getElementById('drug-barcode').value,
    price: parseFloat(document.getElementById('drug-price').value),
    mrp: parseFloat(document.getElementById('drug-mrp').value),
    stock: parseInt(document.getElementById('drug-stock').value),
    minStock: parseInt(document.getElementById('drug-minstock').value) || 20,
    unit: document.getElementById('drug-unit').value,
    expiryDate: document.getElementById('drug-expiry').value,
  };

  if (drugId) {
    // Edit existing
    const idx = drugs.findIndex(d => d.id === drugId);
    if (idx >= 0) {
      drugs[idx] = { ...drugs[idx], ...drugData };
      store.set('drugs', drugs);
      showToast('Medicine updated successfully', 'success');
    }
  } else {
    // Add new
    drugs.push({
      ...drugData,
      id: store.generateId('drug'),
      pharmacyId: user.id,
      addedAt: new Date().toISOString(),
    });
    store.set('drugs', drugs);
    showToast('Medicine added successfully', 'success');
  }

  document.querySelector('.modal-overlay')?.remove();
  window.DORMEDS.renderPage('/inventory');
}

/** Delete drug */
function deleteDrug(drugId) {
  if (!confirm('Are you sure you want to delete this medicine?')) return;
  const drugs = (store.get('drugs') || []).filter(d => d.id !== drugId);
  store.set('drugs', drugs);
  showToast('Medicine deleted', 'info');
  window.DORMEDS.renderPage('/inventory');
}

/** View drug detail modal */
function viewDrug(drugId) {
  const drug = (store.get('drugs') || []).find(d => d.id === drugId);
  if (!drug) return;

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>${drug.name}</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          ${drug.barcode ? generateBarcode(drug.barcode) : ''}
          <div class="grid-2" style="margin-top:var(--space-4)">
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Generic Name</span><p style="font-weight:var(--fw-semibold)">${drug.genericName || '—'}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Category</span><p style="font-weight:var(--fw-semibold)">${drug.category}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Manufacturer</span><p style="font-weight:var(--fw-semibold)">${drug.manufacturer || '—'}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Batch No</span><p style="font-weight:var(--fw-semibold)">${drug.batchNo}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Purchase Price</span><p style="font-weight:var(--fw-semibold)">${formatCurrency(drug.price)}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">MRP</span><p style="font-weight:var(--fw-semibold)">${formatCurrency(drug.mrp)}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Stock</span><p style="font-weight:var(--fw-semibold);${drug.stock <= drug.minStock ? 'color:var(--color-error)' : ''}">${drug.stock} units</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Min Stock</span><p style="font-weight:var(--fw-semibold)">${drug.minStock} units</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Unit</span><p style="font-weight:var(--fw-semibold)">${drug.unit || '—'}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Expiry Date</span><p style="font-weight:var(--fw-semibold)">${formatDate(drug.expiryDate)}</p></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Close</button>
          <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();window.DORMEDS.editDrug('${drug.id}')">
            <span class="material-icons-round" style="font-size:16px">edit</span> Edit
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Barcode scanner modal */
function showBarcodeScanner() {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>Barcode Scanner</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body" style="text-align:center">
          <div style="background:var(--bg-tertiary);border-radius:var(--radius-lg);padding:var(--space-10);margin-bottom:var(--space-6)">
            <span class="material-icons-round" style="font-size:64px;color:var(--brand-primary);margin-bottom:var(--space-4);display:block">qr_code_scanner</span>
            <p style="color:var(--text-secondary);margin-bottom:var(--space-4)">Position the barcode in front of your camera or enter manually below</p>
            <div style="width:200px;height:4px;background:var(--brand-primary);margin:0 auto;border-radius:2px;animation:pulse 1.5s infinite"></div>
          </div>
          <div class="form-group" style="text-align:left">
            <label>Enter Barcode Manually</label>
            <div style="display:flex;gap:var(--space-2)">
              <input type="text" class="form-input" id="barcode-input" placeholder="e.g., 8901234567890" />
              <button class="btn btn-primary" onclick="window.DORMEDS.lookupBarcode()">
                <span class="material-icons-round" style="font-size:16px">search</span> Find
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Look up drug by barcode */
function lookupBarcode() {
  const barcode = document.getElementById('barcode-input')?.value?.trim();
  if (!barcode) { showToast('Please enter a barcode', 'warning'); return; }

  const drugs = store.get('drugs') || [];
  const drug = drugs.find(d => d.barcode === barcode);

  if (drug) {
    document.querySelector('.modal-overlay')?.remove();
    viewDrug(drug.id);
    showToast(`Found: ${drug.name}`, 'success');
  } else {
    showToast('No medicine found with that barcode. You can add it as new.', 'info');
    document.querySelector('.modal-overlay')?.remove();
    showAddDrugModal();
    setTimeout(() => {
      const barcodeInput = document.getElementById('drug-barcode');
      if (barcodeInput) barcodeInput.value = barcode;
    }, 100);
  }
}

/** Filter inventory table */
function filterInventory() {
  const search = (document.getElementById('inventory-search')?.value || '').toLowerCase();
  const category = document.getElementById('category-filter')?.value || '';
  const stockFilter = document.getElementById('stock-filter')?.value || '';

  const rows = document.querySelectorAll('#inventory-tbody tr');
  const user = store.get('currentUser');
  const drugs = (store.get('drugs') || []).filter(d => user.role === 'admin' || d.pharmacyId === user.id);

  drugs.forEach((d, i) => {
    if (!rows[i]) return;
    let show = true;
    if (search && !d.name.toLowerCase().includes(search) && !d.genericName.toLowerCase().includes(search) && !d.batchNo.toLowerCase().includes(search)) show = false;
    if (category && d.category !== category) show = false;
    if (stockFilter === 'low' && d.stock > d.minStock) show = false;
    if (stockFilter === 'ok' && d.stock <= d.minStock) show = false;
    if (stockFilter === 'expiring' && isExpiringSoon(d.expiryDate) === 'ok') show = false;
    rows[i].style.display = show ? '' : 'none';
  });
}
