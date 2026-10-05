/* ============================================================
   app.js – Shared utilities: toasts, modals, form helpers
   ============================================================ */

// ---------- Toast Notifications ----------
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Form Error Helpers ----------
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearErrors(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

// ---------- Confirmation Helper ----------
function confirmAction(message) {
  return window.confirm(message);
}

// ---------- Modal Helpers ----------
function openModal(html) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!overlay || !content) return;
  content.innerHTML = html;
  overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') closeModal();
});

// ---------- Escape HTML (XSS safety) ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- Debounce ----------
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}