/* ================================================
   DORMEDS - Utility Functions
   ================================================ */

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function timeAgo(dateStr) {
  var now = new Date();
  var date = new Date(dateStr);
  var seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return formatDate(dateStr);
}

function isExpiringSoon(dateStr) {
  var expiry = new Date(dateStr);
  var now = new Date();
  var diff = (expiry - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'expired';
  if (diff <= 30) return 'critical';
  if (diff <= 90) return 'warning';
  return 'ok';
}

function generateBarcode(code) {
  var bars = [];
  for (var i = 0; i < code.length; i++) {
    var charCode = code.charCodeAt(i);
    bars.push(charCode % 2 === 0 ? 2 : 1);
    bars.push(charCode % 3 === 0 ? 3 : 1);
  }
  var html = '<div class="barcode-display">';
  bars.forEach(function(w) {
    html += '<div class="bar" style="width:' + w + 'px"></div><div style="width:1px"></div>';
  });
  html += '</div>';
  html += '<div style="text-align:center;font-size:12px;font-family:monospace;color:var(--text-secondary)">' + code + '</div>';
  return html;
}

function debounce(fn, delay) {
  delay = delay || 300;
  var timer;
  return function() {
    var args = arguments;
    var ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
}

function animateCounter(element, target, duration) {
  duration = duration || 800;
  var startTime = performance.now();
  function update(currentTime) {
    var elapsed = currentTime - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(target * eased);
    element.textContent = current.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function createDonutChart(data, size) {
  size = size || 180;
  var total = data.reduce(function(s, d) { return s + d.value; }, 0);
  var radius = 60;
  var circumference = 2 * Math.PI * radius;
  var offset = 0;
  var circles = '';
  data.forEach(function(d) {
    var pct = d.value / total;
    var dashArray = pct * circumference;
    var dashOffset = -offset * circumference;
    circles += '<circle cx="90" cy="90" r="' + radius + '" fill="none" stroke="' + d.color + '" stroke-width="20" stroke-dasharray="' + dashArray + ' ' + (circumference - dashArray) + '" stroke-dashoffset="' + dashOffset + '" style="transition: stroke-dasharray 0.6s ease" />';
    offset += pct;
  });
  var legend = data.map(function(d) {
    return '<div class="donut-legend-item"><div class="dot" style="background:' + d.color + '"></div>' + d.label + ': ' + d.value + '</div>';
  }).join('');
  return '<div class="donut-chart" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 180 180">' + circles + '</svg><div class="donut-center"><h3>' + total + '</h3><p>Total</p></div></div><div class="donut-legend">' + legend + '</div>';
}

function createBarChart(values, labels, colors) {
  var max = Math.max.apply(null, values);
  return values.map(function(v, i) {
    var height = (v / max) * 230;
    var color = Array.isArray(colors) ? colors[i % colors.length] : colors;
    return '<div class="chart-bar" style="height:' + height + 'px;background:' + color + '"><div class="chart-tooltip">' + labels[i] + ': ' + formatCurrency(v) + '</div></div>';
  }).join('');
}
