/* ================================================
   DORMEDS - Toast Notification System
   ================================================ */

var TOAST_ICONS = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
var TOAST_TITLES = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 4000;
  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="material-icons-round toast-icon">' + TOAST_ICONS[type] + '</span>' +
    '<div class="toast-content"><div class="toast-title">' + TOAST_TITLES[type] + '</div><div class="toast-message">' + message + '</div></div>' +
    '<span class="material-icons-round toast-close" onclick="this.closest(\'.toast\').remove()">close</span>';

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(function() {
      toast.classList.add('removing');
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
  }
}
