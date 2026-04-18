/* ================================================
   DORMEDS - Main App Entry (No ES Modules)
   ================================================ */

// Global namespace for inline onclick handlers
window.DORMEDS = window.DORMEDS || {};

// --- Navigation ---
window.DORMEDS.navigate = function(path) { router.navigate(path); };
window.DORMEDS.renderPage = function(path) { router.navigate(path); };

// --- Auth ---
window.DORMEDS.logout = function() {
  store.clear('currentUser');
  router.navigate('/login');
  showToast('Logged out successfully', 'success');
};

// --- Theme ---
window.DORMEDS.toggleTheme = function() {
  var current = store.get('theme') || 'dark';
  var next = current === 'dark' ? 'light' : 'dark';
  store.set('theme', next);
  document.documentElement.setAttribute('data-theme', next);
  showToast('Theme changed to ' + next + ' mode', 'info');
  // Re-render to update icon
  mountCurrentPage();
};

// --- Sidebar ---
window.DORMEDS.toggleSidebar = toggleSidebar;
window.DORMEDS.toggleMobileSidebar = toggleMobileSidebar;

// --- Notifications ---
window.DORMEDS.toggleNotifications = function() {
  var existing = document.getElementById('notification-panel');
  if (existing) { existing.remove(); return; }
  var btn = document.getElementById('notif-btn');
  if (btn) {
    btn.style.position = 'relative';
    btn.insertAdjacentHTML('afterend', renderNotificationPanel());
  }
};

window.DORMEDS.markNotifRead = function(id) {
  var notifs = store.get('notifications') || [];
  var n = notifs.find(function(x) { return x.id === id; });
  if (n) n.read = true;
  store.set('notifications', notifs);
  var panel = document.getElementById('notification-panel');
  if (panel) panel.remove();
};

window.DORMEDS.markAllRead = function() {
  var notifs = store.get('notifications') || [];
  notifs.forEach(function(n) { n.read = true; });
  store.set('notifications', notifs);
  var panel = document.getElementById('notification-panel');
  if (panel) panel.remove();
  showToast('All notifications marked as read', 'info');
};

// --- Export report (placeholder) ---
window.DORMEDS.exportReport = function() {
  showToast('Report exported successfully', 'success');
};

// --- Re-render current page helper ---
window.DORMEDS.renderCurrentPage = function() { mountCurrentPage(); };

// --- Wire up ALL page functions to window.DORMEDS ---
// Login
window.DORMEDS.handleLogin = handleLogin;
window.DORMEDS.switchLoginTab = switchLoginTab;
window.DORMEDS.fillDemo = fillDemo;
window.DORMEDS.togglePasswordVisibility = togglePasswordVisibility;

// Dashboard
if (typeof initDashboardCounters === 'function') window.DORMEDS.initDashboardCounters = initDashboardCounters;

// Orders
window.DORMEDS.updateOrderStatus = updateOrderStatus;
window.DORMEDS.filterOrders = filterOrders;
window.DORMEDS.viewOrder = viewOrder;

// Inventory
window.DORMEDS.showAddDrugModal = showAddDrugModal;
window.DORMEDS.saveDrug = saveDrug;
window.DORMEDS.deleteDrug = deleteDrug;
window.DORMEDS.viewDrug = viewDrug;
window.DORMEDS.editDrug = function(id) { showAddDrugModal(id); };
window.DORMEDS.showBarcodeScanner = showBarcodeScanner;
window.DORMEDS.lookupBarcode = lookupBarcode;
window.DORMEDS.filterInventory = filterInventory;

// Pharmacies
window.DORMEDS.showAddPharmacyModal = showAddPharmacyModal;
window.DORMEDS.savePharmacy = savePharmacy;
window.DORMEDS.viewPharmacy = viewPharmacy;
window.DORMEDS.editPharmacy = editPharmacy;
window.DORMEDS.togglePharmacyStatus = togglePharmacyStatus;

// Documents
window.DORMEDS.showUploadModal = showUploadModal;
window.DORMEDS.handleFileSelect = handleFileSelect;
window.DORMEDS.clearFile = clearFile;
window.DORMEDS.handleUpload = handleUpload;
window.DORMEDS.reviewDocument = reviewDocument;
window.DORMEDS.previewDocument = previewDocument;
window.DORMEDS.filterDocs = filterDocs;

// Billing
window.DORMEDS.viewInvoice = viewInvoice;
window.DORMEDS.downloadInvoice = downloadInvoice;
window.DORMEDS.generateInvoice = generateInvoice;
window.DORMEDS.createInvoice = createInvoice;
window.DORMEDS.filterBilling = filterBilling;

// Returns
window.DORMEDS.processReturn = processReturn;
window.DORMEDS.confirmRejectReturn = confirmRejectReturn;
window.DORMEDS.showReturnForm = showReturnForm;
window.DORMEDS.loadReturnItems = loadReturnItems;
window.DORMEDS.submitReturn = submitReturn;
window.DORMEDS.filterReturns = filterReturns;

// Subscriptions
window.DORMEDS.waiveSubscription = waiveSubscription;
window.DORMEDS.unwaiveSubscription = unwaiveSubscription;
window.DORMEDS.changePharmPlan = changePharmPlan;
window.DORMEDS.applyPlanChange = applyPlanChange;
window.DORMEDS.subscribePlan = subscribePlan;
window.DORMEDS.processPayment = processPayment;

// Support
window.DORMEDS.openTicket = openTicket;
window.DORMEDS.sendMessage = sendMessage;
window.DORMEDS.resolveTicket = resolveTicket;
window.DORMEDS.showNewTicketModal = showNewTicketModal;
window.DORMEDS.createTicket = createTicket;
window.DORMEDS.filterTickets = filterTickets;

// Settings
window.DORMEDS.saveSettings = saveSettings;

// ============ ROUTING SETUP ============

// Page render function map
var PAGE_MAP = {
  '/login':         renderLoginPage,
  '/dashboard':     renderDashboard,
  '/orders':        renderOrders,
  '/inventory':     renderInventory,
  '/pharmacies':    renderPharmacies,
  '/settings':      renderSettings,
  '/support':       renderSupport,
  '/returns':       renderReturns,
  '/documents':     renderDocuments,
  '/billing':       renderBilling,
  '/subscriptions': renderSubscriptions,
};

function mountCurrentPage() {
  var path = router.current() || '/login';
  var renderFn = PAGE_MAP[path];
  if (!renderFn) renderFn = PAGE_MAP['/login'];
  mount(renderFn, path === '/login');
}

function mount(renderFn, isAuthPage) {
  var root = document.getElementById('app-root');
  if (isAuthPage) {
    root.innerHTML = renderFn();
  } else {
    root.innerHTML =
      '<div class="app-layout">' +
        renderSidebar() +
        '<div class="app-main">' +
          renderHeader() +
          '<div class="app-content slide-up">' +
            renderFn() +
          '</div>' +
        '</div>' +
      '</div>';

    // Animate stat counters after render
    setTimeout(function() {
      document.querySelectorAll('.counter-value').forEach(function(el) {
        var target = parseInt(el.dataset.counter);
        if (!isNaN(target)) animateCounter(el, target);
      });
    }, 100);
  }
  window.scrollTo(0, 0);
}

// ============ INIT ============

function initApp() {
  // Apply saved theme
  var theme = store.get('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  // Router guards
  router.beforeEach(function(path) {
    var user = store.get('currentUser');
    if (!user && path !== '/login') {
      router.navigate('/login');
      return false;
    }
    if (user && path === '/login') {
      router.navigate('/dashboard');
      return false;
    }
  });

  // Register all routes
  Object.keys(PAGE_MAP).forEach(function(path) {
    router.on(path, function() {
      mount(PAGE_MAP[path], path === '/login');
    });
  });

  // Start
  router.start();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
