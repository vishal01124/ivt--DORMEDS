/* ================================================
   DORMEDS - State Management (localStorage-backed)
   ================================================ */

// Default data seeded on first load
var DEFAULT_STATE = {
  currentUser: null,
  theme: 'dark',
  sidebarCollapsed: false,

  users: [
    { id: 'admin-1', email: 'admin@dormeds.com', password: 'admin123', name: 'Dr. Rahul Verma', role: 'admin', avatar: 'RV', createdAt: '2025-01-15' },
    { id: 'pharm-1', email: 'pharmacy@dormeds.com', password: 'pharm123', name: 'MedPlus Pharmacy', role: 'pharmacy', avatar: 'MP', phone: '+91 9876543210', license: 'PH-2024-0891', address: '42 MG Road, Bengaluru, Karnataka 560001', subscription: 'pro', createdAt: '2025-03-10' },
    { id: 'pharm-2', email: 'apollo@dormeds.com', password: 'apollo123', name: 'Apollo Pharmacy', role: 'pharmacy', avatar: 'AP', phone: '+91 8765432190', license: 'PH-2024-1245', address: '15 Brigade Road, Bengaluru, Karnataka 560025', subscription: 'premium', createdAt: '2025-02-20' },
    { id: 'pharm-3', email: 'wellness@dormeds.com', password: 'well123', name: 'Wellness Forever', role: 'pharmacy', avatar: 'WF', phone: '+91 7654321098', license: 'PH-2024-0567', address: '8 Park Street, Mumbai, Maharashtra 400001', subscription: 'basic', createdAt: '2025-04-01' },
  ],

  pharmacies: [
    { id: 'pharm-1', name: 'MedPlus Pharmacy', owner: 'Anil Kumar', email: 'pharmacy@dormeds.com', phone: '+91 9876543210', license: 'PH-2024-0891', address: '42 MG Road, Bengaluru', status: 'active', subscription: 'pro', joinedAt: '2025-03-10', totalOrders: 342, revenue: 485000 },
    { id: 'pharm-2', name: 'Apollo Pharmacy', owner: 'Priya Sharma', email: 'apollo@dormeds.com', phone: '+91 8765432190', license: 'PH-2024-1245', address: '15 Brigade Road, Bengaluru', status: 'active', subscription: 'premium', joinedAt: '2025-02-20', totalOrders: 567, revenue: 892000 },
    { id: 'pharm-3', name: 'Wellness Forever', owner: 'Rakesh Gupta', email: 'wellness@dormeds.com', phone: '+91 7654321098', license: 'PH-2024-0567', address: '8 Park Street, Mumbai', status: 'active', subscription: 'basic', joinedAt: '2025-04-01', totalOrders: 128, revenue: 156000 },
    { id: 'pharm-4', name: 'NetMeds Store', owner: 'Vikram Singh', email: 'netmeds@dormeds.com', phone: '+91 6543210987', license: 'PH-2024-0234', address: '22 Nehru Place, Delhi', status: 'inactive', subscription: 'basic', joinedAt: '2025-05-15', totalOrders: 45, revenue: 52000 },
  ],

  drugs: [
    { id: 'drug-1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'Cipla Ltd.', batchNo: 'B2025-0451', barcode: '8901234567890', price: 25, mrp: 35, stock: 450, minStock: 50, unit: 'Strip (10 tabs)', expiryDate: '2026-08-15', pharmacyId: 'pharm-1', addedAt: '2025-06-01' },
    { id: 'drug-2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'Sun Pharma', batchNo: 'B2025-0782', barcode: '8901234567891', price: 85, mrp: 120, stock: 200, minStock: 30, unit: 'Strip (10 caps)', expiryDate: '2026-03-20', pharmacyId: 'pharm-1', addedAt: '2025-06-05' },
    { id: 'drug-3', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', manufacturer: 'Dr. Reddys', batchNo: 'B2025-1123', barcode: '8901234567892', price: 45, mrp: 65, stock: 320, minStock: 40, unit: 'Strip (10 caps)', expiryDate: '2027-01-10', pharmacyId: 'pharm-1', addedAt: '2025-06-10' },
    { id: 'drug-4', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'USV Ltd.', batchNo: 'B2025-0934', barcode: '8901234567893', price: 30, mrp: 45, stock: 180, minStock: 60, unit: 'Strip (10 tabs)', expiryDate: '2026-11-25', pharmacyId: 'pharm-1', addedAt: '2025-06-12' },
    { id: 'drug-5', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', manufacturer: 'Pfizer', batchNo: 'B2025-0567', barcode: '8901234567894', price: 55, mrp: 75, stock: 15, minStock: 25, unit: 'Strip (10 tabs)', expiryDate: '2026-05-01', pharmacyId: 'pharm-1', addedAt: '2025-06-15' },
    { id: 'drug-6', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', manufacturer: 'Cipla Ltd.', batchNo: 'B2025-1456', barcode: '8901234567895', price: 20, mrp: 30, stock: 500, minStock: 50, unit: 'Strip (10 tabs)', expiryDate: '2027-06-30', pharmacyId: 'pharm-1', addedAt: '2025-07-01' },
    { id: 'drug-7', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Zydus', batchNo: 'B2025-0678', barcode: '8901234567896', price: 95, mrp: 140, stock: 8, minStock: 20, unit: 'Strip (3 tabs)', expiryDate: '2026-04-18', pharmacyId: 'pharm-1', addedAt: '2025-07-05' },
    { id: 'drug-8', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Antacid', manufacturer: 'Alkem', batchNo: 'B2025-0890', barcode: '8901234567897', price: 60, mrp: 85, stock: 275, minStock: 35, unit: 'Strip (10 tabs)', expiryDate: '2027-03-15', pharmacyId: 'pharm-1', addedAt: '2025-07-10' },
  ],

  orders: [
    { id: 'ORD-2025-001', customerName: 'Priya Mehta', customerPhone: '+91 9988776655', items: [{ drugId: 'drug-1', name: 'Paracetamol 500mg', qty: 3, price: 25 }, { drugId: 'drug-3', name: 'Omeprazole 20mg', qty: 2, price: 45 }], total: 165, status: 'delivered', pharmacyId: 'pharm-1', prescriptionRequired: false, createdAt: '2025-08-01T10:30:00', deliveredAt: '2025-08-01T14:00:00' },
    { id: 'ORD-2025-002', customerName: 'Amit Patel', customerPhone: '+91 8877665544', items: [{ drugId: 'drug-2', name: 'Amoxicillin 250mg', qty: 2, price: 85 }, { drugId: 'drug-6', name: 'Cetirizine 10mg', qty: 1, price: 20 }], total: 190, status: 'processing', pharmacyId: 'pharm-1', prescriptionRequired: true, prescriptionId: 'doc-2', createdAt: '2025-08-10T09:15:00', deliveredAt: null },
    { id: 'ORD-2025-003', customerName: 'Sneha Reddy', customerPhone: '+91 7766554433', items: [{ drugId: 'drug-4', name: 'Metformin 500mg', qty: 5, price: 30 }], total: 150, status: 'pending', pharmacyId: 'pharm-1', prescriptionRequired: true, prescriptionId: 'doc-3', createdAt: '2025-08-12T16:45:00', deliveredAt: null },
    { id: 'ORD-2025-004', customerName: 'Rajesh Kumar', customerPhone: '+91 6655443322', items: [{ drugId: 'drug-5', name: 'Amlodipine 5mg', qty: 2, price: 55 }, { drugId: 'drug-8', name: 'Pantoprazole 40mg', qty: 1, price: 60 }], total: 170, status: 'delivered', pharmacyId: 'pharm-1', prescriptionRequired: true, prescriptionId: 'doc-1', createdAt: '2025-08-05T11:20:00', deliveredAt: '2025-08-05T16:30:00' },
    { id: 'ORD-2025-005', customerName: 'Kavitha Nair', customerPhone: '+91 5544332211', items: [{ drugId: 'drug-7', name: 'Azithromycin 500mg', qty: 1, price: 95 }], total: 95, status: 'cancelled', pharmacyId: 'pharm-1', prescriptionRequired: true, prescriptionId: null, createdAt: '2025-08-08T13:00:00', deliveredAt: null },
    { id: 'ORD-2025-006', customerName: 'Deepak Joshi', customerPhone: '+91 4433221100', items: [{ drugId: 'drug-1', name: 'Paracetamol 500mg', qty: 2, price: 25 }, { drugId: 'drug-6', name: 'Cetirizine 10mg', qty: 3, price: 20 }], total: 110, status: 'delivered', pharmacyId: 'pharm-1', prescriptionRequired: false, createdAt: '2025-07-28T08:30:00', deliveredAt: '2025-07-28T12:00:00' },
  ],

  documents: [
    { id: 'doc-1', patientName: 'Rajesh Kumar', doctorName: 'Dr. Anjali Singh', fileName: 'prescription_rajesh.pdf', fileType: 'pdf', fileSize: '245 KB', status: 'approved', pharmacyId: 'pharm-1', uploadedAt: '2025-08-04T09:00:00', reviewedAt: '2025-08-04T10:30:00', notes: 'Valid prescription for Amlodipine and Pantoprazole' },
    { id: 'doc-2', patientName: 'Amit Patel', doctorName: 'Dr. Vikram Rao', fileName: 'rx_amit_patel.jpg', fileType: 'image', fileSize: '1.2 MB', status: 'approved', pharmacyId: 'pharm-1', uploadedAt: '2025-08-09T14:00:00', reviewedAt: '2025-08-09T15:00:00', notes: 'Amoxicillin course approved' },
    { id: 'doc-3', patientName: 'Sneha Reddy', doctorName: 'Dr. Mehta', fileName: 'sneha_prescription.pdf', fileType: 'pdf', fileSize: '312 KB', status: 'pending', pharmacyId: 'pharm-1', uploadedAt: '2025-08-12T16:00:00', reviewedAt: null, notes: '' },
    { id: 'doc-4', patientName: 'Ramesh Iyer', doctorName: 'Dr. Priya Das', fileName: 'rx_ramesh.jpg', fileType: 'image', fileSize: '890 KB', status: 'rejected', pharmacyId: 'pharm-1', uploadedAt: '2025-08-11T11:00:00', reviewedAt: '2025-08-11T12:30:00', notes: 'Prescription expired. Please upload a recent one.' },
  ],

  subscriptions: {
    plans: [
      { id: 'basic', name: 'Basic', price: 999, features: ['Up to 500 medicines', 'Basic analytics', 'Email support', 'Single user', 'Standard reports'], color: '#74B9FF' },
      { id: 'pro', name: 'Pro', price: 1999, features: ['Up to 5000 medicines', 'Advanced analytics', 'Priority support', 'Up to 5 users', 'Barcode scanner', 'Expiry alerts', 'Custom reports'], color: '#6C5CE7', popular: true },
      { id: 'premium', name: 'Premium', price: 4999, features: ['Unlimited medicines', 'AI-powered analytics', '24/7 dedicated support', 'Unlimited users', 'Barcode scanner', 'Expiry alerts', 'Custom reports', 'API access', 'White-label option'], color: '#FD79A8' },
    ],
    pharmacySubscriptions: [
      { pharmacyId: 'pharm-1', planId: 'pro', status: 'active', startDate: '2025-03-10', nextBilling: '2025-09-10', amount: 1999, waived: false },
      { pharmacyId: 'pharm-2', planId: 'premium', status: 'active', startDate: '2025-02-20', nextBilling: '2025-09-20', amount: 4999, waived: false },
      { pharmacyId: 'pharm-3', planId: 'basic', status: 'active', startDate: '2025-04-01', nextBilling: '2025-10-01', amount: 999, waived: false },
    ]
  },

  returns: [
    { id: 'RET-001', orderId: 'ORD-2025-001', customerName: 'Priya Mehta', items: [{ name: 'Paracetamol 500mg', qty: 1, price: 25 }], reason: 'Damaged packaging', status: 'approved', refundAmount: 25, pharmacyId: 'pharm-1', requestedAt: '2025-08-02T10:00:00', processedAt: '2025-08-03T09:00:00' },
    { id: 'RET-002', orderId: 'ORD-2025-004', customerName: 'Rajesh Kumar', items: [{ name: 'Pantoprazole 40mg', qty: 1, price: 60 }], reason: 'Wrong medicine delivered', status: 'pending', refundAmount: 60, pharmacyId: 'pharm-1', requestedAt: '2025-08-06T14:00:00', processedAt: null },
    { id: 'RET-003', orderId: 'ORD-2025-006', customerName: 'Deepak Joshi', items: [{ name: 'Cetirizine 10mg', qty: 2, price: 20 }], reason: 'Allergic reaction', status: 'rejected', refundAmount: 0, pharmacyId: 'pharm-1', requestedAt: '2025-07-29T09:00:00', processedAt: '2025-07-30T11:00:00', rejectionNote: 'Product was consumed. Returns not applicable for used medicines.' },
  ],

  tickets: [
    { id: 'TKT-001', subject: 'Unable to add new medicine', category: 'Technical', priority: 'high', status: 'open', pharmacyId: 'pharm-1', createdAt: '2025-08-10T10:00:00', messages: [
      { sender: 'pharmacy', text: 'I am unable to add new medicines to my inventory. The save button does not respond after I fill in all the details.', time: '2025-08-10T10:00:00' },
      { sender: 'admin', text: 'Thank you for reporting this. Could you please try clearing your browser cache and trying again? This issue has been noted and our team is looking into it.', time: '2025-08-10T11:30:00' },
      { sender: 'pharmacy', text: 'I tried clearing the cache but the issue persists. Here is a screenshot of the error.', time: '2025-08-10T14:00:00' },
    ]},
    { id: 'TKT-002', subject: 'Subscription payment failed', category: 'Billing', priority: 'medium', status: 'resolved', pharmacyId: 'pharm-1', createdAt: '2025-08-05T09:00:00', messages: [
      { sender: 'pharmacy', text: 'My subscription payment for this month was declined. I have sufficient balance in my account.', time: '2025-08-05T09:00:00' },
      { sender: 'admin', text: 'We have checked and it appears there was a gateway timeout. We have processed the payment manually. You should see the confirmation shortly.', time: '2025-08-05T10:45:00' },
      { sender: 'pharmacy', text: 'Received! Thank you for the quick resolution.', time: '2025-08-05T11:00:00' },
    ]},
    { id: 'TKT-003', subject: 'Need help with barcode scanner setup', category: 'General', priority: 'low', status: 'open', pharmacyId: 'pharm-2', createdAt: '2025-08-12T16:00:00', messages: [
      { sender: 'pharmacy', text: 'How do I set up the barcode scanner with DORMEDS? I purchased a USB barcode scanner and need guidance on integration.', time: '2025-08-12T16:00:00' },
    ]},
  ],

  invoices: [
    { id: 'INV-2025-001', orderId: 'ORD-2025-001', customerName: 'Priya Mehta', customerAddress: '24 Koramangala, Bengaluru', items: [{ name: 'Paracetamol 500mg', qty: 3, price: 25, total: 75 }, { name: 'Omeprazole 20mg', qty: 2, price: 45, total: 90 }], subtotal: 165, tax: 29.70, discount: 0, total: 194.70, status: 'paid', pharmacyId: 'pharm-1', createdAt: '2025-08-01T14:00:00', paidAt: '2025-08-01T14:00:00' },
    { id: 'INV-2025-002', orderId: 'ORD-2025-002', customerName: 'Amit Patel', customerAddress: '10 Indiranagar, Bengaluru', items: [{ name: 'Amoxicillin 250mg', qty: 2, price: 85, total: 170 }, { name: 'Cetirizine 10mg', qty: 1, price: 20, total: 20 }], subtotal: 190, tax: 34.20, discount: 10, total: 214.20, status: 'pending', pharmacyId: 'pharm-1', createdAt: '2025-08-10T09:15:00', paidAt: null },
    { id: 'INV-2025-003', orderId: 'ORD-2025-004', customerName: 'Rajesh Kumar', customerAddress: '55 Whitefield, Bengaluru', items: [{ name: 'Amlodipine 5mg', qty: 2, price: 55, total: 110 }, { name: 'Pantoprazole 40mg', qty: 1, price: 60, total: 60 }], subtotal: 170, tax: 30.60, discount: 0, total: 200.60, status: 'paid', pharmacyId: 'pharm-1', createdAt: '2025-08-05T16:30:00', paidAt: '2025-08-05T16:30:00' },
    { id: 'INV-2025-004', orderId: 'ORD-2025-006', customerName: 'Deepak Joshi', customerAddress: '33 Jayanagar, Bengaluru', items: [{ name: 'Paracetamol 500mg', qty: 2, price: 25, total: 50 }, { name: 'Cetirizine 10mg', qty: 3, price: 20, total: 60 }], subtotal: 110, tax: 19.80, discount: 5, total: 124.80, status: 'paid', pharmacyId: 'pharm-1', createdAt: '2025-07-28T12:00:00', paidAt: '2025-07-28T12:00:00' },
  ],

  revenueData: {
    monthly: [42000, 55000, 48000, 62000, 71000, 58000, 85000, 92000, 78000, 95000, 88000, 110000],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },

  notifications: [
    { id: 'notif-1', title: 'Low Stock Alert', message: 'Amlodipine 5mg is below minimum stock level', type: 'warning', read: false, createdAt: '2025-08-12T10:00:00' },
    { id: 'notif-2', title: 'New Order Received', message: 'Order ORD-2025-003 from Sneha Reddy', type: 'info', read: false, createdAt: '2025-08-12T16:45:00' },
    { id: 'notif-3', title: 'Expiry Alert', message: 'Azithromycin 500mg expires on 2026-04-18', type: 'error', read: false, createdAt: '2025-08-11T09:00:00' },
    { id: 'notif-4', title: 'Subscription Renewed', message: 'Pro plan subscription renewed successfully', type: 'success', read: true, createdAt: '2025-08-10T08:00:00' },
    { id: 'notif-5', title: 'Return Approved', message: 'Return RET-001 has been approved and refund initiated', type: 'success', read: true, createdAt: '2025-08-03T09:00:00' },
  ]
};

var Store = (function() {
  function Store() {
    this._state = null;
    this._listeners = {};
    this._init();
  }

  Store.prototype._init = function() {
    var saved = localStorage.getItem('dormeds_state');
    if (saved) {
      try {
        this._state = JSON.parse(saved);
        for (var key in DEFAULT_STATE) {
          if (!(key in this._state)) {
            this._state[key] = DEFAULT_STATE[key];
          }
        }
      } catch (e) {
        this._state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    } else {
      this._state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    this._persist();
  };

  Store.prototype._persist = function() {
    try { localStorage.setItem('dormeds_state', JSON.stringify(this._state)); } catch(e) {}
  };

  Store.prototype.get = function(key) { return this._state[key]; };

  Store.prototype.set = function(key, value) {
    this._state[key] = value;
    this._persist();
    this._notify(key, value);
  };

  Store.prototype.update = function(key, partial) {
    var current = this._state[key];
    if (typeof current === 'object' && !Array.isArray(current)) {
      this._state[key] = Object.assign({}, current, partial);
    } else {
      this._state[key] = partial;
    }
    this._persist();
    this._notify(key, this._state[key]);
  };

  Store.prototype.on = function(key, callback) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(callback);
  };

  Store.prototype._notify = function(key, value) {
    if (this._listeners[key]) {
      this._listeners[key].forEach(function(cb) { cb(value); });
    }
  };

  Store.prototype.reset = function() {
    this._state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this._persist();
  };

  Store.prototype.generateId = function(prefix) {
    prefix = prefix || 'id';
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  };

  Store.prototype.clear = function(key) {
    if (key) {
      this._state[key] = null;
    } else {
      this._state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    this._persist();
  };

  return Store;
})();

// Global singleton
var store = new Store();
