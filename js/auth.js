/* ============================================================
   auth.js – Authentication using Local Storage
   ============================================================ */

// ---------- Validation Helpers ----------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- Register User ----------
function registerUser(name, email, password) {
  const users = Storage.getUsers();

  // Check duplicate email
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists' };
  }

  const newUser = {
    id: generateId('user'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  Storage.setUsers(users);

  return { success: true, user: newUser };
}

// ---------- Login User ----------
function loginUser(email, password) {
  const users = Storage.getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  // Store session
  const session = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    loginAt: new Date().toISOString()
  };
  setData(KEYS.SESSION, session);

  return { success: true, user: user };
}

// ---------- Get Current Logged-in User ----------
function getCurrentUser() {
  return getData(KEYS.SESSION, null);
}

// ---------- Logout ----------
function logoutUser() {
  removeData(KEYS.SESSION);
}

// ---------- Require Auth Guard ----------
function requireAuth(role = null) {
  const session = getCurrentUser();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  if (role && session.role !== role) {
    window.location.href = session.role === 'admin' ? 'admin.html' : 'user.html';
    return null;
  }
  return session;
}