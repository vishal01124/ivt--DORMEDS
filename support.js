/* ================================================
   DORMEDS - Support / Tickets Page
   ================================================ */

function renderSupport() {
  const user = store.get('currentUser');
  const allTickets = store.get('tickets') || [];
  const tickets = user.role === 'admin' ? allTickets : allTickets.filter(t => t.pharmacyId === user.id);

  const openCount = tickets.filter(t => t.status === 'open').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  const ticketList = tickets.map(t => {
    const priorityColors = { high: '#FF6B6B', medium: '#FDCB6E', low: '#74B9FF' };
    const lastMsg = t.messages[t.messages.length - 1];
    return `
    <div class="ticket-card" onclick="window.DORMEDS.openTicket('${t.id}')">
      <div class="ticket-header">
        <span class="ticket-id">${t.id}</span>
        <div style="display:flex;align-items:center;gap:var(--space-2)">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${priorityColors[t.priority]}"></span>
          <span class="status-badge ${t.status === 'open' ? 'pending' : 'completed'}">${t.status}</span>
        </div>
      </div>
      <div class="ticket-subject">${t.subject}</div>
      <div class="ticket-preview">${lastMsg?.text || ''}</div>
      <div class="ticket-footer">
        <span>${t.category} • ${t.priority} priority</span>
        <span>${timeAgo(t.createdAt)}</span>
      </div>
    </div>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Support Center</h1>
        <p>${openCount} open tickets • ${resolvedCount} resolved</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.DORMEDS.showNewTicketModal()">
          <span class="material-icons-round" style="font-size:16px">add</span> New Ticket
        </button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:380px 1fr;gap:var(--space-6);min-height:600px" id="support-layout">
      <!-- Ticket List -->
      <div>
        <div class="filters-bar" style="margin-bottom:var(--space-4)">
          <div class="search-wrapper" style="flex:1">
            <span class="material-icons-round">search</span>
            <input type="text" class="search-input" placeholder="Search tickets..." style="width:100%;min-width:0" />
          </div>
        </div>
        <div class="tabs" style="margin-bottom:var(--space-4)">
          <div class="tab active" onclick="window.DORMEDS.filterTickets('all',this)">All</div>
          <div class="tab" onclick="window.DORMEDS.filterTickets('open',this)">Open</div>
          <div class="tab" onclick="window.DORMEDS.filterTickets('resolved',this)">Resolved</div>
        </div>
        <div id="ticket-list">
          ${ticketList || '<div class="empty-state"><span class="material-icons-round empty-icon">support_agent</span><h3>No tickets</h3><p>Create a new ticket to get help</p></div>'}
        </div>
      </div>

      <!-- Chat Area -->
      <div class="card" id="chat-area" style="display:flex;flex-direction:column;padding:0;overflow:hidden">
        <div style="padding:var(--space-5);border-bottom:1px solid var(--border-secondary);display:flex;align-items:center;justify-content:space-between" id="chat-header">
          <div>
            <h3 style="font-size:var(--text-base);font-weight:var(--fw-semibold)">Select a ticket</h3>
            <p style="font-size:var(--text-xs);color:var(--text-tertiary)">Choose a ticket from the left to view conversation</p>
          </div>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="empty-state" style="padding:var(--space-10)">
            <span class="material-icons-round" style="font-size:48px;color:var(--text-tertiary);opacity:0.3">forum</span>
            <p style="color:var(--text-tertiary);margin-top:var(--space-3)">Select a ticket to view messages</p>
          </div>
        </div>
        <div class="chat-input-area" id="chat-input-area" style="display:none">
          <input type="text" placeholder="Type your message..." id="chat-input" onkeydown="if(event.key==='Enter')window.DORMEDS.sendMessage()" />
          <button class="btn btn-primary btn-icon" onclick="window.DORMEDS.sendMessage()">
            <span class="material-icons-round" style="font-size:20px">send</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Open ticket and show chat */
function openTicket(ticketId) {
  const tickets = store.get('tickets') || [];
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  const user = store.get('currentUser');
  const priorityColors = { high: '#FF6B6B', medium: '#FDCB6E', low: '#74B9FF' };

  // Highlight active ticket
  document.querySelectorAll('.ticket-card').forEach(card => card.style.borderColor = '');
  const allCards = document.querySelectorAll('.ticket-card');
  const idx = (store.get('tickets') || []).findIndex(t => t.id === ticketId);
  if (user.role !== 'admin') {
    const myTickets = tickets.filter(t => t.pharmacyId === user.id);
    const myIdx = myTickets.findIndex(t => t.id === ticketId);
    if (allCards[myIdx]) allCards[myIdx].style.borderColor = 'var(--brand-primary)';
  } else {
    if (allCards[idx]) allCards[idx].style.borderColor = 'var(--brand-primary)';
  }

  // Update header
  document.getElementById('chat-header').innerHTML = `
    <div>
      <h3 style="font-size:var(--text-base);font-weight:var(--fw-semibold)">${ticket.subject}</h3>
      <p style="font-size:var(--text-xs);color:var(--text-tertiary)">${ticket.id} • ${ticket.category} • <span style="color:${priorityColors[ticket.priority]}">${ticket.priority} priority</span></p>
    </div>
    <div style="display:flex;gap:var(--space-2)">
      ${ticket.status === 'open' ? `<button class="btn btn-success btn-sm" onclick="window.DORMEDS.resolveTicket('${ticket.id}')">
        <span class="material-icons-round" style="font-size:14px">check</span> Resolve
      </button>` : '<span class="status-badge completed">Resolved</span>'}
    </div>
  `;

  // Render messages
  const messagesHTML = ticket.messages.map(msg => {
    const isSelf = (user.role === 'admin' && msg.sender === 'admin') || (user.role === 'pharmacy' && msg.sender === 'pharmacy');
    return `
      <div class="chat-bubble ${isSelf ? 'sent' : 'received'}">
        <div style="font-size:10px;font-weight:var(--fw-semibold);margin-bottom:4px;opacity:0.8">${msg.sender === 'admin' ? '🛡️ Admin' : '🏪 Pharmacy'}</div>
        ${msg.text}
        <div class="chat-time">${formatDateTime(msg.time)}</div>
      </div>
    `;
  }).join('');

  document.getElementById('chat-messages').innerHTML = messagesHTML;
  document.getElementById('chat-input-area').style.display = '';
  document.getElementById('chat-input-area').dataset.ticketId = ticketId;

  // Scroll to bottom
  const chatBox = document.getElementById('chat-messages');
  chatBox.scrollTop = chatBox.scrollHeight;
}

/** Send message */
function sendMessage() {
  const input = document.getElementById('chat-input');
  const ticketId = document.getElementById('chat-input-area').dataset.ticketId;
  const text = input.value.trim();
  if (!text || !ticketId) return;

  const user = store.get('currentUser');
  const tickets = store.get('tickets') || [];
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  ticket.messages.push({
    sender: user.role,
    text: text,
    time: new Date().toISOString(),
  });

  store.set('tickets', tickets);
  input.value = '';

  // Re-render chat
  openTicket(ticketId);
}

/** Resolve ticket */
function resolveTicket(ticketId) {
  const tickets = store.get('tickets') || [];
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.status = 'resolved';
    store.set('tickets', tickets);
    showToast('Ticket resolved!', 'success');
    window.DORMEDS.renderPage('/support');
  }
}

/** New ticket modal */
function showNewTicketModal() {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal">
        <div class="modal-header">
          <h2>New Support Ticket</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <form id="ticket-form" onsubmit="window.DORMEDS.createTicket(event)">
            <div class="form-group">
              <label>Subject *</label>
              <input type="text" class="form-input" id="ticket-subject" required placeholder="Brief description of your issue" />
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Category *</label>
                <select class="form-input" id="ticket-category" required>
                  <option value="">Select</option>
                  <option>Technical</option>
                  <option>Billing</option>
                  <option>General</option>
                  <option>Feature Request</option>
                  <option>Bug Report</option>
                </select>
              </div>
              <div class="form-group">
                <label>Priority *</label>
                <select class="form-input" id="ticket-priority" required>
                  <option value="">Select</option>
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Description *</label>
              <textarea class="form-input" id="ticket-desc" rows="4" required placeholder="Describe your issue in detail..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="document.getElementById('ticket-form').requestSubmit()">
            <span class="material-icons-round" style="font-size:16px">send</span> Submit Ticket
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Create ticket */
function createTicket(e) {
  e.preventDefault();
  const user = store.get('currentUser');
  const tickets = store.get('tickets') || [];

  const subject = document.getElementById('ticket-subject').value.trim();
  const category = document.getElementById('ticket-category').value;
  const priority = document.getElementById('ticket-priority').value;
  const desc = document.getElementById('ticket-desc').value.trim();

  tickets.push({
    id: 'TKT-' + String(tickets.length + 1).padStart(3, '0'),
    subject, category, priority,
    status: 'open',
    pharmacyId: user.role === 'pharmacy' ? user.id : 'pharm-1',
    createdAt: new Date().toISOString(),
    messages: [{ sender: user.role, text: desc, time: new Date().toISOString() }],
  });

  store.set('tickets', tickets);
  showToast('Support ticket created!', 'success');
  document.querySelector('.modal-overlay')?.remove();
  window.DORMEDS.renderPage('/support');
}

/** Filter tickets */
function filterTickets(status, tabEl) {
  document.querySelectorAll('#support-layout .tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  const cards = document.querySelectorAll('.ticket-card');
  const user = store.get('currentUser');
  const tickets = (store.get('tickets') || []).filter(t => user.role === 'admin' || t.pharmacyId === user.id);

  tickets.forEach((t, i) => {
    if (cards[i]) cards[i].style.display = (status === 'all' || t.status === status) ? '' : 'none';
  });
}
