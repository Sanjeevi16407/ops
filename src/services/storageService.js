// Persistent Storage Service for ARVIX Auth & User Case History

const USERS_KEY = 'arvix_users';
const ACTIVE_USER_KEY = 'arvix_active_user';
const CASES_KEY_PREFIX = 'arvix_cases_';

// Initialize default users if empty
export function getStoredUsers() {
  const data = localStorage.getItem(USERS_KEY);
  if (data) return JSON.parse(data);
  const defaultUsers = [
    { id: 'usr-1', username: 'investigator', email: 'investigator@arvix.sec', password: 'password123' }
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

// Authenticate user
export function authenticateUser(emailOrUsername, password) {
  const users = getStoredUsers();
  const found = users.find(
    u => (u.email.toLowerCase() === emailOrUsername.toLowerCase() || u.username.toLowerCase() === emailOrUsername.toLowerCase()) && u.password === password
  );
  if (found) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(found));
    return found;
  }
  return null;
}

// Register user
export function registerUser(username, email, password) {
  const users = getStoredUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An investigator account with this email already exists.');
  }
  const newUser = { id: `usr-${Date.now()}`, username, email, password };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUser));
  return newUser;
}

// Get active session user
export function getActiveUser() {
  const data = localStorage.getItem(ACTIVE_USER_KEY);
  return data ? JSON.parse(data) : null;
}

// Sign out
export function logoutUser() {
  localStorage.removeItem(ACTIVE_USER_KEY);
}

// Get saved cases for specific user
export function getUserCases(userId) {
  if (!userId) return [];
  const data = localStorage.getItem(`${CASES_KEY_PREFIX}${userId}`);
  return data ? JSON.parse(data) : [];
}

// Save or update case for specific user
export function saveUserCase(userId, caseData) {
  if (!userId || !caseData) return;
  const cases = getUserCases(userId);
  const idx = cases.findIndex(c => c.id === caseData.id);
  const updatedCaseData = { ...caseData, updatedAt: new Date().toLocaleString() };

  if (idx >= 0) {
    cases[idx] = updatedCaseData;
  } else {
    cases.unshift(updatedCaseData);
  }
  localStorage.setItem(`${CASES_KEY_PREFIX}${userId}`, JSON.stringify(cases));
  return cases;
}

// Delete case for specific user
export function deleteUserCase(userId, caseId) {
  if (!userId || !caseId) return [];
  let cases = getUserCases(userId);
  cases = cases.filter(c => c.id !== caseId);
  localStorage.setItem(`${CASES_KEY_PREFIX}${userId}`, JSON.stringify(cases));
  return cases;
}
