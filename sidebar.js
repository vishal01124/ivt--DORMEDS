/* ================================================
   DORMEDS - Sidebar Component
   ================================================ */

var ADMIN_NAV = [
  { section: 'Overview', items: [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
  ]},
  { section: 'Management', items: [
    { id: 'pharmacies', icon: 'storefront', label: 'Pharmacies', route: '/pharmacies' },
    { id: 'orders', icon: 'shopping_bag', label: 'All Orders', route: '/orders' },
    { id: 'documents', icon: 'description', label: 'Documents', route: '/documents' },
  ]},
  { section: 'Finance', items: [
    { id: 'subscriptions', icon: 'card_membership', label: 'Subscriptions', route: '/subscriptions' },
    { id: 'billing', icon: 'receipt_long', label: 'Billing', route: '/billing' },
    { id: 'returns', icon: 'assignment_return', label: 'Returns', route: '/returns' },
  ]},
  { section: 'Support', items: [
    { id: 'support', icon: 'support_agent', label: 'Support', route: '/support', badge: '3' },
    { id: 'settings', icon: 'settings', label: 'Settings', route: '/settings' },
  ]},
];

var PHARMACY_NAV = [
  { section: 'Overview', items: [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
  ]},
  { section: 'Operations', items: [
    { id: 'inventory', icon: 'inventory_2', label: 'Inventory', route: '/inventory' },
    { id: 'orders', icon: 'shopping_bag', label: 'Orders', route: '/orders', badge: '2' },
    { id: 'documents', icon: 'description', label: 'Documents', route: '/documents' },
  ]},
  { section: 'Finance', items: [
    { id: 'billing', icon: 'receipt_long', label: 'Billing', route: '/billing' },
    { id: 'subscriptions', icon: 'card_membership', label: 'Subscription', route: '/subscriptions' },
    { id: 'returns', icon: 'assignment_return', label: 'Returns', route: '/returns' },
  ]},
  { section: 'Help', items: [
    { id: 'support', icon: 'support_agent', label: 'Support', route: '/support' },
    { id: 'settings', icon: 'settings', label: 'Settings', route: '/settings' },
  ]},
];

function renderSidebar() {
  var user = store.get('currentUser');
  if (!user) return '';

  var isAdmin = user.role === 'admin';
  var navSections = isAdmin ? ADMIN_NAV : PHARMACY_NAV;
  var collapsed = store.get('sidebarCollapsed');
  var currentRoute = router.current() || '/dashboard';

  var navHTML = '';
  navSections.forEach(function(section) {
    navHTML += '<div class="nav-section"><div class="nav-section-title">' + section.section + '</div>';
    section.items.forEach(function(item) {
      var isActive = currentRoute === item.route;
      navHTML += '<div class="nav-item ' + (isActive ? 'active' : '') + '" onclick="window.DORMEDS.navigate(\'' + item.route + '\')">' +
        '<span class="material-icons-round">' + item.icon + '</span>' +
        '<span class="nav-label">' + item.label + '</span>' +
        (item.badge ? '<span class="badge">' + item.badge + '</span>' : '') +
        '</div>';
    });
    navHTML += '</div>';
  });

  return '<aside class="sidebar ' + (collapsed ? 'collapsed' : '') + '" id="sidebar">' +
    '<div class="sidebar-header">' +
      '<div class="logo-mark"><span class="material-icons-round">local_pharmacy</span></div>' +
      '<div class="logo-text"><h2>DORMEDS</h2><span>' + (isAdmin ? 'Admin Portal' : 'Pharmacy Portal') + '</span></div>' +
    '</div>' +
    '<nav class="sidebar-nav">' + navHTML + '</nav>' +
    '<div class="sidebar-footer">' +
      '<div class="user-info" onclick="window.DORMEDS.navigate(\'/settings\')">' +
        '<div class="user-avatar">' + (user.avatar || user.name.charAt(0)) + '</div>' +
        '<div class="user-details"><div class="user-name">' + user.name + '</div><div class="user-role">' + (isAdmin ? 'Administrator' : 'Pharmacy') + '</div></div>' +
      '</div>' +
    '</div>' +
  '</aside>';
}

function toggleSidebar() {
  var collapsed = !store.get('sidebarCollapsed');
  store.set('sidebarCollapsed', collapsed);
  var sidebar = document.getElementById('sidebar');
  var appMain = document.querySelector('.app-main');
  var header = document.querySelector('.header');
  if (sidebar) sidebar.classList.toggle('collapsed', collapsed);
  if (appMain) appMain.classList.toggle('sidebar-collapsed', collapsed);
  if (header) header.classList.toggle('sidebar-collapsed', collapsed);
}

function toggleMobileSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('mobile-overlay');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('hidden');
  }
}
