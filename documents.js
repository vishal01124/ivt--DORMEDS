/* ================================================
   DORMEDS - Documents / Prescriptions Page
   ================================================ */

function renderDocuments() {
  const user = store.get('currentUser');
  const allDocs = store.get('documents') || [];
  const docs = user.role === 'admin' ? allDocs : allDocs.filter(d => d.pharmacyId === user.id);

  const statusCounts = {
    all: docs.length,
    pending: docs.filter(d => d.status === 'pending').length,
    approved: docs.filter(d => d.status === 'approved').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  };

  const docCards = docs.map(d => {
    const iconMap = { pdf: 'picture_as_pdf', image: 'image' };
    const colorMap = { pdf: '#FF6B6B', image: '#74B9FF' };
    return `
    <div class="card" style="padding:var(--space-5)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4)">
        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <div style="width:44px;height:44px;border-radius:var(--radius-md);background:${colorMap[d.fileType]}22;display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round" style="color:${colorMap[d.fileType]};font-size:22px">${iconMap[d.fileType] || 'description'}</span>
          </div>
          <div>
            <div style="font-weight:var(--fw-semibold)">${d.fileName}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">${d.fileSize} • ${d.fileType.toUpperCase()}</div>
          </div>
        </div>
        <span class="status-badge ${d.status}">${d.status}</span>
      </div>

      <div class="grid-2" style="gap:var(--space-2);margin-bottom:var(--space-4)">
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Patient</div>
          <div style="font-size:var(--text-sm);font-weight:var(--fw-medium)">${d.patientName}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Doctor</div>
          <div style="font-size:var(--text-sm);font-weight:var(--fw-medium)">${d.doctorName}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Uploaded</div>
          <div style="font-size:var(--text-sm)">${formatDateTime(d.uploadedAt)}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px">Reviewed</div>
          <div style="font-size:var(--text-sm)">${d.reviewedAt ? formatDateTime(d.reviewedAt) : '—'}</div>
        </div>
      </div>

      ${d.notes ? `<div style="font-size:var(--text-xs);color:var(--text-secondary);padding:var(--space-2) var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-sm);margin-bottom:var(--space-3)">
        <strong>Notes:</strong> ${d.notes}
      </div>` : ''}

      <div style="display:flex;gap:var(--space-2);justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.previewDocument('${d.id}')">
          <span class="material-icons-round" style="font-size:14px">visibility</span> Preview
        </button>
        ${d.status === 'pending' && user.role === 'admin' ? `
          <button class="btn btn-success btn-sm" onclick="window.DORMEDS.reviewDocument('${d.id}','approved')">
            <span class="material-icons-round" style="font-size:14px">check</span> Approve
          </button>
          <button class="btn btn-danger btn-sm" onclick="window.DORMEDS.reviewDocument('${d.id}','rejected')">
            <span class="material-icons-round" style="font-size:14px">close</span> Reject
          </button>
        ` : ''}
      </div>
    </div>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Documents & Prescriptions</h1>
        <p>Upload and manage prescription documents</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.showUploadModal()">
          <span class="material-icons-round" style="font-size:16px">upload_file</span> Upload Prescription
        </button>
      </div>
    </div>

    <div class="tabs" id="doc-tabs">
      <div class="tab active" onclick="window.DORMEDS.filterDocs('all',this)">All (${statusCounts.all})</div>
      <div class="tab" onclick="window.DORMEDS.filterDocs('pending',this)">Pending (${statusCounts.pending})</div>
      <div class="tab" onclick="window.DORMEDS.filterDocs('approved',this)">Approved (${statusCounts.approved})</div>
      <div class="tab" onclick="window.DORMEDS.filterDocs('rejected',this)">Rejected (${statusCounts.rejected})</div>
    </div>

    <div class="grid-2" id="docs-grid">
      ${docCards || `<div class="empty-state" style="grid-column:1/-1"><span class="material-icons-round empty-icon">description</span><h3>No documents</h3><p>Upload a prescription to get started</p></div>`}
    </div>
  `;
}

/** Upload prescription modal */
function showUploadModal() {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>Upload Prescription</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form id="upload-form" onsubmit="window.DORMEDS.handleUpload(event)">
            <div class="file-upload-zone" id="upload-zone" onclick="document.getElementById('file-input').click()">
              <span class="material-icons-round upload-icon">cloud_upload</span>
              <h3>Drop prescription here or click to browse</h3>
              <p>Supports: JPG, PNG, PDF (Max 10MB)</p>
              <input type="file" id="file-input" accept="image/*,.pdf" style="display:none" onchange="window.DORMEDS.handleFileSelect(this)" />
            </div>
            <div id="file-preview" style="display:none;margin-top:var(--space-4)">
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md)">
                <span class="material-icons-round" style="color:var(--color-success)">check_circle</span>
                <div style="flex:1">
                  <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold)" id="selected-file-name">—</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary)" id="selected-file-size">—</div>
                </div>
                <button type="button" class="btn btn-ghost btn-icon sm" onclick="window.DORMEDS.clearFile()">
                  <span class="material-icons-round" style="font-size:16px">close</span>
                </button>
              </div>
            </div>

            <div class="grid-2" style="margin-top:var(--space-5)">
              <div class="form-group">
                <label>Patient Name *</label>
                <input type="text" class="form-input" id="doc-patient" required placeholder="Enter patient name" />
              </div>
              <div class="form-group">
                <label>Doctor Name *</label>
                <input type="text" class="form-input" id="doc-doctor" required placeholder="Enter prescribing doctor" />
              </div>
            </div>
            <div class="form-group">
              <label>Notes (optional)</label>
              <textarea class="form-input" id="doc-notes" rows="3" placeholder="Any additional notes..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="document.getElementById('upload-form').requestSubmit()">
            <span class="material-icons-round" style="font-size:16px">upload</span> Upload
          </button>
        </div>
      </div>
    </div>
  `;

  // Drag & drop
  const zone = document.getElementById('upload-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFileSelect({ files: e.dataTransfer.files });
  });
}

/** Handle file selection */
function handleFileSelect(input) {
  const file = input.files?.[0];
  if (!file) return;

  document.getElementById('selected-file-name').textContent = file.name;
  document.getElementById('selected-file-size').textContent = (file.size / 1024).toFixed(1) + ' KB';
  document.getElementById('file-preview').style.display = 'block';
  document.getElementById('upload-zone').style.display = 'none';
}

/** Clear selected file */
function clearFile() {
  document.getElementById('file-input').value = '';
  document.getElementById('file-preview').style.display = 'none';
  document.getElementById('upload-zone').style.display = '';
}

/** Handle upload submission */
function handleUpload(e) {
  e.preventDefault();
  const patient = document.getElementById('doc-patient').value.trim();
  const doctor = document.getElementById('doc-doctor').value.trim();
  const notes = document.getElementById('doc-notes').value.trim();
  const fileName = document.getElementById('selected-file-name').textContent;

  if (fileName === '—') {
    showToast('Please select a file to upload', 'warning');
    return;
  }

  const user = store.get('currentUser');
  const docs = store.get('documents') || [];
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);

  docs.push({
    id: store.generateId('doc'),
    patientName: patient,
    doctorName: doctor,
    fileName: fileName,
    fileType: isImage ? 'image' : 'pdf',
    fileSize: document.getElementById('selected-file-size').textContent,
    status: 'pending',
    pharmacyId: user.role === 'pharmacy' ? user.id : 'pharm-1',
    uploadedAt: new Date().toISOString(),
    reviewedAt: null,
    notes: notes,
  });

  store.set('documents', docs);
  showToast('Prescription uploaded successfully! Pending review.', 'success');
  document.querySelector('.modal-overlay')?.remove();
  window.DORMEDS.renderPage('/documents');
}

/** Review a document (admin) */
function reviewDocument(docId, status) {
  const docs = store.get('documents') || [];
  const idx = docs.findIndex(d => d.id === docId);
  if (idx >= 0) {
    docs[idx].status = status;
    docs[idx].reviewedAt = new Date().toISOString();
    if (status === 'rejected' && !docs[idx].notes) {
      docs[idx].notes = 'Document could not be verified. Please upload a clearer copy.';
    }
    store.set('documents', docs);
    showToast(`Document ${status}`, status === 'approved' ? 'success' : 'warning');
    window.DORMEDS.renderPage('/documents');
  }
}

/** Preview document */
function previewDocument(docId) {
  const doc = (store.get('documents') || []).find(d => d.id === docId);
  if (!doc) return;

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>Document Preview</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body" style="text-align:center">
          <div style="background:var(--bg-tertiary);border-radius:var(--radius-lg);padding:var(--space-10);margin-bottom:var(--space-4)">
            <span class="material-icons-round" style="font-size:80px;color:${doc.fileType === 'pdf' ? '#FF6B6B' : '#74B9FF'}">${doc.fileType === 'pdf' ? 'picture_as_pdf' : 'image'}</span>
            <h3 style="margin-top:var(--space-3)">${doc.fileName}</h3>
            <p style="font-size:var(--text-sm);color:var(--text-tertiary)">${doc.fileSize}</p>
          </div>
          <div class="grid-2" style="text-align:left">
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Patient</span><p style="font-weight:var(--fw-semibold)">${doc.patientName}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Doctor</span><p style="font-weight:var(--fw-semibold)">${doc.doctorName}</p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Status</span><p><span class="status-badge ${doc.status}">${doc.status}</span></p></div>
            <div><span style="font-size:var(--text-xs);color:var(--text-tertiary)">Uploaded</span><p style="font-size:var(--text-sm)">${formatDateTime(doc.uploadedAt)}</p></div>
          </div>
          ${doc.notes ? `<div style="text-align:left;margin-top:var(--space-4);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-sm)">
            <strong style="font-size:var(--text-xs)">Notes:</strong><p style="font-size:var(--text-sm);color:var(--text-secondary)">${doc.notes}</p>
          </div>` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    </div>
  `;
}

/** Filter documents by status */
function filterDocs(status, tabEl) {
  document.querySelectorAll('#doc-tabs .tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  const cards = document.querySelectorAll('#docs-grid .card');
  const user = store.get('currentUser');
  const docs = (store.get('documents') || []).filter(d => user.role === 'admin' || d.pharmacyId === user.id);

  docs.forEach((d, i) => {
    if (cards[i]) cards[i].style.display = (status === 'all' || d.status === status) ? '' : 'none';
  });
}
