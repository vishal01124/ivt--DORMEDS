/* ================================================
   DORMEDS - Subscriptions Page
   ================================================ */

function renderSubscriptions() {
  const user = store.get('currentUser');
  return user.role === 'admin' ? renderAdminSubscriptions() : renderPharmacySubscriptions();
}

function renderAdminSubscriptions() {
  const subs = store.get('subscriptions');
  const plans = subs.plans;
  const pharmSubs = subs.pharmacySubscriptions;
  const pharmacies = store.get('pharmacies') || [];

  const totalRevenue = pharmSubs.reduce((s, ps) => s + (ps.waived ? 0 : ps.amount), 0);

  const subRows = pharmSubs.map(ps => {
    const pharmacy = pharmacies.find(p => p.id === ps.pharmacyId);
    const plan = plans.find(p => p.id === ps.planId);
    return `
      <tr>
        <td style="font-weight:var(--fw-semibold)">${pharmacy?.name || ps.pharmacyId}</td>
        <td>
          <span style="display:inline-flex;align-items:center;gap:var(--space-1);padding:2px 10px;border-radius:var(--radius-full);background:${plan?.color}22;color:${plan?.color};font-size:var(--text-xs);font-weight:var(--fw-bold)">
            ${plan?.name || ps.planId}
          </span>
        </td>
        <td>${ps.waived ? '<span style="color:var(--color-success);font-weight:var(--fw-semibold)">Waived</span>' : formatCurrency(ps.amount)}</td>
        <td><span class="status-badge ${ps.status}">${ps.status}</span></td>
        <td style="font-size:var(--text-xs)">${formatDate(ps.nextBilling)}</td>
        <td>
          <div style="display:flex;gap:var(--space-1)">
            ${!ps.waived ? `<button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.waiveSubscription('${ps.pharmacyId}')" style="font-size:11px;color:var(--color-success)">Waive</button>` : `<button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.unwaiveSubscription('${ps.pharmacyId}')" style="font-size:11px">Restore</button>`}
            <button class="btn btn-ghost btn-sm" onclick="window.DORMEDS.changePharmPlan('${ps.pharmacyId}')" style="font-size:11px">Change Plan</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h1>Subscription Management</h1>
        <p>Manage pharmacy subscriptions and plans</p>
      </div>
    </div>

    <div class="stats-grid" style="margin-bottom:var(--space-8)">
      <div class="stat-card">
        <div class="stat-icon purple"><span class="material-icons-round">payments</span></div>
        <div class="stat-info">
          <h3>${formatCurrency(totalRevenue)}</h3>
          <p>Monthly Revenue</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal"><span class="material-icons-round">group</span></div>
        <div class="stat-info">
          <h3>${pharmSubs.length}</h3>
          <p>Active Subscriptions</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pink"><span class="material-icons-round">redeem</span></div>
        <div class="stat-info">
          <h3>${pharmSubs.filter(s => s.waived).length}</h3>
          <p>Waived Plans</p>
        </div>
      </div>
    </div>

    <!-- Plans -->
    <h2 style="font-size:var(--text-xl);font-weight:var(--fw-bold);margin-bottom:var(--space-5)">Available Plans</h2>
    <div class="grid-3" style="margin-bottom:var(--space-8)">
      ${plans.map(plan => `
        <div class="plan-card ${plan.popular ? 'popular' : ''}">
          <div class="plan-name" style="color:${plan.color}">${plan.name}</div>
          <div class="plan-price">${formatCurrency(plan.price)}<span>/month</span></div>
          <ul class="plan-features">
            ${plan.features.map(f => `<li><span class="material-icons-round">check_circle</span>${f}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <!-- Subscriptions Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pharmacy Subscriptions</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Pharmacy</th><th>Plan</th><th>Amount</th><th>Status</th><th>Next Billing</th><th>Actions</th></tr></thead>
          <tbody>${subRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPharmacySubscriptions() {
  const user = store.get('currentUser');
  const subs = store.get('subscriptions');
  const plans = subs.plans;
  const mySub = subs.pharmacySubscriptions.find(s => s.pharmacyId === user.id);
  const currentPlan = plans.find(p => p.id === mySub?.planId);

  return `
    <div class="page-header">
      <div>
        <h1>My Subscription</h1>
        <p>Manage your subscription plan</p>
      </div>
    </div>

    ${mySub ? `
      <div class="card" style="margin-bottom:var(--space-8);border-left:4px solid ${currentPlan?.color || 'var(--brand-primary)'}">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-4)">
          <div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px">Current Plan</div>
            <div style="font-size:var(--text-2xl);font-weight:var(--fw-bold);color:${currentPlan?.color}">${currentPlan?.name || 'Unknown'}</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:var(--space-1)">
              ${mySub.waived ? '<span style="color:var(--color-success);font-weight:var(--fw-semibold)">✓ Subscription waived by admin</span>' : `${formatCurrency(mySub.amount)}/month`}
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:var(--text-xs);color:var(--text-tertiary)">Next Billing</div>
            <div style="font-size:var(--text-base);font-weight:var(--fw-semibold)">${formatDate(mySub.nextBilling)}</div>
            <span class="status-badge ${mySub.status}" style="margin-top:var(--space-2)">${mySub.status}</span>
          </div>
        </div>
      </div>
    ` : ''}

    <h2 style="font-size:var(--text-xl);font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Choose a Plan</h2>
    <p style="color:var(--text-secondary);margin-bottom:var(--space-6)">Upgrade or change your plan anytime</p>

    <div class="grid-3">
      ${plans.map(plan => {
        const isCurrent = mySub?.planId === plan.id;
        return `
        <div class="plan-card ${plan.popular ? 'popular' : ''}" style="${isCurrent ? 'border-color:var(--color-success);box-shadow:0 0 0 1px var(--color-success)' : ''}">
          ${isCurrent ? '<div style="position:absolute;top:12px;left:12px;background:var(--color-success);color:white;font-size:10px;font-weight:var(--fw-bold);padding:2px 8px;border-radius:var(--radius-full)">CURRENT</div>' : ''}
          <div class="plan-name" style="color:${plan.color}">${plan.name}</div>
          <div class="plan-price">${formatCurrency(plan.price)}<span>/month</span></div>
          <ul class="plan-features">
            ${plan.features.map(f => `<li><span class="material-icons-round">check_circle</span>${f}</li>`).join('')}
          </ul>
          <button class="btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} btn-full" ${isCurrent ? 'disabled' : ''} onclick="window.DORMEDS.subscribePlan('${plan.id}')">
            ${isCurrent ? 'Current Plan' : 'Subscribe Now'}
          </button>
        </div>`;
      }).join('')}
    </div>
  `;
}

/** Waive subscription (admin) */
function waiveSubscription(pharmacyId) {
  const subs = store.get('subscriptions');
  const idx = subs.pharmacySubscriptions.findIndex(s => s.pharmacyId === pharmacyId);
  if (idx >= 0) {
    subs.pharmacySubscriptions[idx].waived = true;
    store.set('subscriptions', subs);
    showToast('Subscription waived successfully', 'success');
    window.DORMEDS.renderPage('/subscriptions');
  }
}

/** Restore waived subscription */
function unwaiveSubscription(pharmacyId) {
  const subs = store.get('subscriptions');
  const idx = subs.pharmacySubscriptions.findIndex(s => s.pharmacyId === pharmacyId);
  if (idx >= 0) {
    subs.pharmacySubscriptions[idx].waived = false;
    store.set('subscriptions', subs);
    showToast('Subscription restored', 'info');
    window.DORMEDS.renderPage('/subscriptions');
  }
}

/** Change pharmacy plan (admin) */
function changePharmPlan(pharmacyId) {
  const subs = store.get('subscriptions');
  const ps = subs.pharmacySubscriptions.find(s => s.pharmacyId === pharmacyId);
  const plans = subs.plans;

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h2>Change Plan</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Select Plan</label>
            <select class="form-input" id="new-plan-select">
              ${plans.map(p => `<option value="${p.id}" ${ps?.planId === p.id ? 'selected' : ''}>${p.name} — ${formatCurrency(p.price)}/mo</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="window.DORMEDS.applyPlanChange('${pharmacyId}')">Apply</button>
        </div>
      </div>
    </div>
  `;
}

/** Apply plan change */
function applyPlanChange(pharmacyId) {
  const newPlanId = document.getElementById('new-plan-select').value;
  const subs = store.get('subscriptions');
  const idx = subs.pharmacySubscriptions.findIndex(s => s.pharmacyId === pharmacyId);
  const plan = subs.plans.find(p => p.id === newPlanId);
  if (idx >= 0 && plan) {
    subs.pharmacySubscriptions[idx].planId = newPlanId;
    subs.pharmacySubscriptions[idx].amount = plan.price;
    store.set('subscriptions', subs);
    showToast(`Plan changed to ${plan.name}`, 'success');
    document.querySelector('.modal-overlay')?.remove();
    window.DORMEDS.renderPage('/subscriptions');
  }
}

/** Subscribe to a plan (pharmacy) */
function subscribePlan(planId) {
  const user = store.get('currentUser');
  const subs = store.get('subscriptions');
  const plan = subs.plans.find(p => p.id === planId);

  // Payment simulation
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
      <div class="modal" style="max-width:440px">
        <div class="modal-header">
          <h2>Confirm Subscription</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.querySelector('.modal-overlay').remove()"><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body" style="text-align:center">
          <div style="width:60px;height:60px;background:${plan.color}22;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
            <span class="material-icons-round" style="font-size:28px;color:${plan.color}">card_membership</span>
          </div>
          <h3 style="margin-bottom:var(--space-2)">Subscribe to ${plan.name}</h3>
          <div style="font-size:var(--text-3xl);font-weight:var(--fw-extrabold);margin-bottom:var(--space-2)">${formatCurrency(plan.price)}<span style="font-size:var(--text-sm);font-weight:var(--fw-regular);color:var(--text-secondary)">/month</span></div>
          <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-6)">You will be charged monthly. Cancel anytime.</p>

          <div style="text-align:left;background:var(--bg-tertiary);padding:var(--space-4);border-radius:var(--radius-md)">
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:var(--space-2)"><span>Plan</span><span>${plan.name}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:var(--space-2)"><span>Price</span><span>${formatCurrency(plan.price)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:var(--space-2)"><span>GST (18%)</span><span>${formatCurrency(plan.price * 0.18)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-base);font-weight:var(--fw-bold);padding-top:var(--space-2);border-top:1px solid var(--border-secondary)"><span>Total</span><span>${formatCurrency(plan.price * 1.18)}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" id="pay-btn" onclick="window.DORMEDS.processPayment('${planId}')">
            <span class="material-icons-round" style="font-size:16px">payment</span> Pay ${formatCurrency(plan.price * 1.18)}
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Process payment simulation */
function processPayment(planId) {
  const btn = document.getElementById('pay-btn');
  btn.innerHTML = '<span class="loader-pill" style="width:18px;height:18px;border-width:2px;margin:0"></span> Processing...';
  btn.disabled = true;

  setTimeout(() => {
    const user = store.get('currentUser');
    const subs = store.get('subscriptions');
    const plan = subs.plans.find(p => p.id === planId);
    const idx = subs.pharmacySubscriptions.findIndex(s => s.pharmacyId === user.id);

    if (idx >= 0) {
      subs.pharmacySubscriptions[idx].planId = planId;
      subs.pharmacySubscriptions[idx].amount = plan.price;
      subs.pharmacySubscriptions[idx].status = 'active';
    } else {
      subs.pharmacySubscriptions.push({
        pharmacyId: user.id, planId, status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        nextBilling: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        amount: plan.price, waived: false,
      });
    }

    store.set('subscriptions', subs);
    showToast(`Subscribed to ${plan.name} plan successfully!`, 'success');
    document.querySelector('.modal-overlay')?.remove();
    window.DORMEDS.renderPage('/subscriptions');
  }, 1500);
}
