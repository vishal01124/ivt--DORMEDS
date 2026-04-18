/* ================================================
   DORMEDS - Login Page
   ================================================ */

function renderLoginPage() {
  return `
    <div class="login-page">
      <div class="login-container">
        <div class="login-card">
          <div class="login-logo">
            <div class="logo-icon">
              <span class="material-icons-round">local_pharmacy</span>
            </div>
            <h1>DORMEDS</h1>
            <p>Medicine Delivery & Pharmacy Management</p>
          </div>

          <div class="login-tabs">
            <button class="login-tab active" data-role="admin" onclick="window.DORMEDS.switchLoginTab('admin')">
              Admin Login
            </button>
            <button class="login-tab" data-role="pharmacy" onclick="window.DORMEDS.switchLoginTab('pharmacy')">
              Pharmacy Login
            </button>
          </div>

          <form id="login-form" onsubmit="window.DORMEDS.handleLogin(event)">
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <div class="input-with-icon">
                <span class="material-icons-round">email</span>
                <input type="email" id="login-email" class="form-input" placeholder="Enter your email" value="admin@dormeds.com" required />
              </div>
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <div class="input-with-icon">
                <span class="material-icons-round">lock</span>
                <input type="password" id="login-password" class="form-input" placeholder="Enter your password" value="admin123" required />
                <span class="material-icons-round toggle-password" onclick="window.DORMEDS.togglePasswordVisibility()">visibility_off</span>
              </div>
            </div>

            <div class="form-row">
              <label class="checkbox-label">
                <input type="checkbox" checked /> Remember me
              </label>
              <a href="#" class="form-link">Forgot password?</a>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="login-btn">
              <span class="material-icons-round">login</span>
              Sign In
            </button>
          </form>

          <div style="margin-top:var(--space-6);padding-top:var(--space-6);border-top:1px solid var(--border-secondary)">
            <p style="text-align:center;font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-3)">Demo Credentials</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">
              <button class="btn btn-secondary btn-sm" onclick="window.DORMEDS.fillDemo('admin')">
                <span class="material-icons-round" style="font-size:14px">admin_panel_settings</span>
                Admin Demo
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.DORMEDS.fillDemo('pharmacy')">
                <span class="material-icons-round" style="font-size:14px">storefront</span>
                Pharmacy Demo
              </button>
            </div>
          </div>
        </div>

        <p style="text-align:center;margin-top:var(--space-4);font-size:var(--text-xs);color:var(--text-tertiary)">
          © 2025 DORMEDS. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/** Switch between admin/pharmacy login tabs */
function switchLoginTab(role) {
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.role === role);
  });
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (role === 'admin') {
    emailInput.value = 'admin@dormeds.com';
    passInput.value = 'admin123';
  } else {
    emailInput.value = 'pharmacy@dormeds.com';
    passInput.value = 'pharm123';
  }
}

/** Fill demo credentials */
function fillDemo(role) {
  switchLoginTab(role);
}

/** Toggle password visibility */
function togglePasswordVisibility() {
  const input = document.getElementById('login-password');
  const icon = document.querySelector('.toggle-password');
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = 'visibility';
  } else {
    input.type = 'password';
    icon.textContent = 'visibility_off';
  }
}

/** Handle login form submission */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    showToast('Please enter email and password', 'warning');
    return;
  }

  // Show loading state
  btn.innerHTML = '<span class="loader-pill" style="width:20px;height:20px;border-width:2px;margin:0"></span> Signing in...';
  btn.disabled = true;

  // Simulate network delay
  setTimeout(() => {
    const users = store.get('users');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Set current user (without password)
      const { password: _, ...safeUser } = user;
      store.set('currentUser', safeUser);
      showToast(`Welcome back, ${user.name}!`, 'success');
      router.navigate('/dashboard');
    } else {
      showToast('Invalid email or password. Please try again.', 'error');
      btn.innerHTML = '<span class="material-icons-round">login</span> Sign In';
      btn.disabled = false;
    }
  }, 800);
}
