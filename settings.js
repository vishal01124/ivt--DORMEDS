/* ================================================
   DORMEDS - Settings Page
   ================================================ */

function renderSettings() {
  const user = store.get('currentUser');
  
  if (user.role === 'admin') {
    return renderAdminSettings();
  } else {
    return renderPharmacySettings(user);
  }
}

function renderAdminSettings() {
  return `
    <div class="page-header">
      <div>
        <h1>System Settings</h1>
        <p>Manage platform configurations and global preferences</p>
      </div>
      <div>
        <button class="btn btn-primary" onclick="window.DORMEDS.saveSettings()">Save Changes</button>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 style="margin-bottom:var(--space-4)">Business Details</h3>
        <div class="form-group">
          <label>Platform Name</label>
          <input type="text" class="form-input" value="DORMEDS" id="st-platform-name" />
        </div>
        <div class="form-group">
          <label>Support Email</label>
          <input type="email" class="form-input" value="support@dormeds.com" id="st-support-email" />
        </div>
        <div class="form-group">
          <label>Contact Phone</label>
          <input type="text" class="form-input" value="+1 (800) 123-4567" id="st-support-phone" />
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea class="form-input" rows="3" id="st-address">123 MedTech Valley, San Francisco, CA 94101</textarea>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom:var(--space-4)">Delivery & Operations</h3>
        <div class="form-group">
          <label>Default Delivery Fee (₹)</label>
          <input type="number" class="form-input" value="50" id="st-delivery-fee" />
        </div>
        <div class="form-group">
          <label>Free Delivery Threshold (₹)</label>
          <input type="number" class="form-input" value="500" id="st-free-delivery" />
        </div>
        <div class="form-group">
          <label>Agent Commission (%)</label>
          <input type="number" class="form-input" value="10" id="st-commission" />
        </div>
        
        <h3 style="margin-bottom:var(--space-4);margin-top:var(--space-6)">Notifications</h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-2)">
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
            <input type="checkbox" checked id="st-email-notif" /> Send Email Notifications
          </label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
            <input type="checkbox" checked id="st-sms-notif" /> Send SMS Notifications
          </label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
            <input type="checkbox" checked id="st-push-notif" /> Enable Push Notifications
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderPharmacySettings(user) {
  const pharmacies = store.get('pharmacies') || [];
  const pharmacy = pharmacies.find(p => p.id === user.id) || { name: 'My Pharmacy', email: 'contact@mypharmacy.com', phone: '1234567890' };
  
  return `
    <div class="page-header">
      <div>
        <h1>Pharmacy Settings</h1>
        <p>Manage your profile and preferences</p>
      </div>
      <div>
        <button class="btn btn-primary" onclick="window.DORMEDS.saveSettings()">Save Profile</button>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 style="margin-bottom:var(--space-4)">Profile Information</h3>
        <div class="form-group">
          <label>Pharmacy Name</label>
          <input type="text" class="form-input" value="${pharmacy.name}" id="st-pharm-name" />
        </div>
        <div class="form-group">
          <label>Contact Email</label>
          <input type="email" class="form-input" value="${pharmacy.email}" id="st-pharm-email" />
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="text" class="form-input" value="${pharmacy.phone}" id="st-pharm-phone" />
        </div>
        <div class="form-group">
          <label>Operating Hours</label>
          <input type="text" class="form-input" value="09:00 AM - 09:00 PM" id="st-pharm-hours" />
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom:var(--space-4)">Preferences & Notifications</h3>
        
        <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-6)">
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
            <input type="checkbox" checked id="st-alert-order" /> New Order Alerts
          </label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
            <input type="checkbox" checked id="st-alert-stock" /> Low Stock Alerts
          </label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer">
            <input type="checkbox" id="st-alert-daily" /> Daily Summary Emails
          </label>
        </div>

        <h3 style="margin-bottom:var(--space-4)">Change Password</h3>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" class="form-input" placeholder="Enter current password" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" class="form-input" placeholder="Enter new password" />
        </div>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Password reset link sent to your email', 'info')">Reset Password via Email</button>
      </div>
    </div>
  `;
}

function saveSettings() {
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  
  btn.innerHTML = '<span class="material-icons-round" style="font-size:16px;animation:spin 1s linear infinite">sync</span> Saving...';
  btn.disabled = true;

  // Simulate network request
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    showToast('Settings saved successfully', 'success');
  }, 1000);
}