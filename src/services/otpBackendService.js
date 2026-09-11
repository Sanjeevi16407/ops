// ARVIX Shared Backend OTP Service (Cross-Tab LocalStorage & HTTP Server Synchronization)

const BACKEND_URL = 'http://localhost:5000';
const OTP_STORAGE_KEY = 'arvix_shared_otp_db';
const OTP_EXPIRATION_MS = 120 * 1000; // 2 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

function getSharedDb() {
  try {
    const data = localStorage.getItem(OTP_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveSharedDb(db) {
  try {
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(db));
    window.dispatchEvent(new Event('arvix_otp_db_updated'));
  } catch (e) {}
}

function generate6DigitOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. POST /api/otp/request (Submits user login credentials & initiates OTP flow)
export function apiRequestOtp(emailOrUsername) {
  const clean = (emailOrUsername || '').trim().toLowerCase();
  const isGivenEmail = clean.endsWith('@arvix.sec');
  const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(clean);

  if (!isGivenEmail && !isGmail) {
    throw new Error('Email must be a valid @gmail.com address or authorized @arvix.sec identity.');
  }

  const email = clean;
  const db = getSharedDb();

  const userId = `USR-${Math.floor(100 + Math.random() * 900)}`;
  const requestId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const sessionId = `SES-${Math.floor(10000 + Math.random() * 90000)}`;
  const generatedOtp = generate6DigitOtp();
  const now = Date.now();
  const expiresAt = now + OTP_EXPIRATION_MS;
  const cooldownUntil = now + RESEND_COOLDOWN_MS;

  // Invalidate previous active requests for this user
  db.forEach(r => {
    if (r.userId === userId && r.status === 'ACTIVE') {
      r.status = 'INVALIDATED';
    }
  });

  const newRequest = {
    requestId,
    userId,
    sessionId,
    email,
    otp: generatedOtp,
    status: 'ACTIVE', // Instantly active upon valid credential submission
    createdAt: now,
    expiresAt: expiresAt,
    authorizedAt: now,
    verifyAttempts: 0,
    resendCount: 0,
    resendCooldownUntil: cooldownUntil
  };

  db.push(newRequest);
  saveSharedDb(db);

  // Sync with backend server
  try {
    fetch(`${BACKEND_URL}/api/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).catch(() => {});
  } catch (e) {}

  return {
    requestId: newRequest.requestId,
    userId: newRequest.userId,
    sessionId: newRequest.sessionId,
    email: newRequest.email,
    status: newRequest.status,
    otp: newRequest.otp, // Expose OTP for display on login page demo
    expiresAt: newRequest.expiresAt,
    resendCooldownUntil: newRequest.resendCooldownUntil
  };
}

// 2. GET /api/otp/pending (Operator view)
export function apiGetPendingRequests() {
  const db = getSharedDb();
  return db.filter(r => r.status === 'PENDING_AUTHORIZATION' || r.status === 'ACTIVE');
}

// 3. GET /api/otp/status/:requestId (Status check for login page)
export function apiGetRequestStatus(requestId) {
  const db = getSharedDb();
  const reqObj = db.find(r => r.requestId === requestId);
  if (!reqObj) return { status: 'NOT_FOUND' };

  const now = Date.now();
  if (reqObj.status === 'ACTIVE' && reqObj.expiresAt && now > reqObj.expiresAt) {
    reqObj.status = 'EXPIRED';
    saveSharedDb(db);
  }

  return {
    requestId: reqObj.requestId,
    userId: reqObj.userId,
    email: reqObj.email,
    status: reqObj.status,
    otp: reqObj.otp, // Expose OTP for display on login page demo
    expiresAt: reqObj.expiresAt,
    remainingSeconds: reqObj.expiresAt ? Math.max(0, Math.floor((reqObj.expiresAt - now) / 1000)) : 0,
    resendCooldownUntil: reqObj.resendCooldownUntil,
    cooldownSeconds: reqObj.resendCooldownUntil ? Math.max(0, Math.floor((reqObj.resendCooldownUntil - now) / 1000)) : 0,
    verifyAttempts: reqObj.verifyAttempts || 0
  };
}

// 4. POST /api/otp/resend (Resend OTP with Cooldown & Attempt Limit Enforcement)
export function apiResendOtp(requestId, userId) {
  const db = getSharedDb();
  const reqObj = db.find(r => r.requestId === requestId);

  if (!reqObj) {
    return { success: false, error: 'Request not found' };
  }

  const now = Date.now();

  if (reqObj.resendCount >= 3) {
    return { success: false, error: 'Maximum OTP resend limit reached. Please try logging in again.' };
  }

  if (reqObj.resendCooldownUntil && now < reqObj.resendCooldownUntil) {
    const waitSeconds = Math.ceil((reqObj.resendCooldownUntil - now) / 1000);
    return { success: false, error: `Please wait ${waitSeconds}s before requesting a new OTP.` };
  }

  const newOtp = generate6DigitOtp();
  reqObj.otp = newOtp;
  reqObj.status = 'ACTIVE';
  reqObj.expiresAt = now + OTP_EXPIRATION_MS;
  reqObj.resendCount = (reqObj.resendCount || 0) + 1;
  reqObj.resendCooldownUntil = now + RESEND_COOLDOWN_MS;
  reqObj.verifyAttempts = 0;

  saveSharedDb(db);

  try {
    fetch(`${BACKEND_URL}/api/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId })
    }).catch(() => {});
  } catch (e) {}

  return {
    success: true,
    requestId: reqObj.requestId,
    status: 'ACTIVE',
    otp: newOtp, // Expose new OTP for display on login page demo
    expiresAt: reqObj.expiresAt,
    resendCooldownUntil: reqObj.resendCooldownUntil,
    resendCount: reqObj.resendCount,
    message: 'New OTP sent successfully.'
  };
}

// 5. POST /api/otp/authorize (Control Station Override)
export function apiAuthorizeOtp(requestId) {
  const db = getSharedDb();
  const reqObj = db.find(r => r.requestId === requestId);
  if (!reqObj) throw new Error('Request not found');

  const generatedOtp = generate6DigitOtp();
  const now = Date.now();
  const expiresAt = now + OTP_EXPIRATION_MS;

  reqObj.otp = generatedOtp;
  reqObj.status = 'ACTIVE';
  reqObj.authorizedAt = now;
  reqObj.expiresAt = expiresAt;
  reqObj.verifyAttempts = 0;

  saveSharedDb(db);

  try {
    fetch(`${BACKEND_URL}/api/otp/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId })
    }).catch(() => {});
  } catch (e) {}

  return {
    requestId: reqObj.requestId,
    userId: reqObj.userId,
    email: reqObj.email,
    otp: generatedOtp,
    status: 'ACTIVE',
    expiresAt
  };
}

// 6. POST /api/otp/deny
export function apiDenyOtp(requestId) {
  const db = getSharedDb();
  const reqObj = db.find(r => r.requestId === requestId);
  if (reqObj) {
    reqObj.status = 'DENIED';
    saveSharedDb(db);
  }
  return { requestId, status: 'DENIED' };
}

// 7. POST /api/otp/verify (Strict OTP Verification)
export function apiVerifyOtp(requestId, userId, submittedOtp) {
  const db = getSharedDb();
  const reqObj = db.find(r => r.requestId === requestId && r.userId === userId);

  if (!reqObj) {
    return { verified: false, reason: 'REQUEST_NOT_FOUND', message: 'No matching authentication request found.' };
  }

  if (reqObj.status === 'DENIED') {
    return { verified: false, reason: 'DENIED', message: 'Your verification request was denied by security operator.' };
  }

  if (reqObj.status === 'USED') {
    return { verified: false, reason: 'OTP_ALREADY_USED', message: 'This verification code has already been used.' };
  }

  if (reqObj.status === 'INVALIDATED') {
    return { verified: false, reason: 'OTP_INVALIDATED', message: 'This verification code was invalidated by a newer OTP request.' };
  }

  if (reqObj.status === 'EXPIRED' || (reqObj.expiresAt && Date.now() > reqObj.expiresAt)) {
    reqObj.status = 'EXPIRED';
    saveSharedDb(db);
    return { verified: false, reason: 'OTP_EXPIRED', message: 'Verification code has expired. Please request a new OTP.' };
  }

  if ((reqObj.verifyAttempts || 0) >= 5) {
    reqObj.status = 'LOCKED';
    saveSharedDb(db);
    return { verified: false, reason: 'MAX_ATTEMPTS_EXCEEDED', message: 'Maximum verification attempts exceeded. Session locked.' };
  }

  if (reqObj.status !== 'ACTIVE') {
    return { verified: false, reason: 'NOT_ACTIVE', message: 'Verification code is not active.' };
  }

  if (reqObj.otp !== submittedOtp) {
    reqObj.verifyAttempts = (reqObj.verifyAttempts || 0) + 1;
    const remaining = 5 - reqObj.verifyAttempts;
    if (remaining <= 0) {
      reqObj.status = 'LOCKED';
    }
    saveSharedDb(db);

    if (remaining <= 0) {
      return { verified: false, reason: 'MAX_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Session locked for security.' };
    }

    return { verified: false, reason: 'INVALID_OTP', message: `Invalid verification code. ${remaining} attempt(s) remaining.` };
  }

  // Success
  reqObj.status = 'USED';
  saveSharedDb(db);

  return {
    verified: true,
    requestId: reqObj.requestId,
    userId: reqObj.userId,
    email: reqObj.email
  };
}
