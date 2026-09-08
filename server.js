// Standalone Node.js Express Backend Authority Server for ARVIX (ES Module)
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database for OTP Requests & Security Tracking
const otpDatabase = [];
const OTP_EXPIRATION_MS = 120 * 1000; // 2 minutes (120 seconds)
const RESEND_COOLDOWN_MS = 30 * 1000;  // 30 seconds
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_RESEND_COUNT = 3;

// Root Status Check
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ARVIX Backend OTP Authority Server',
    time: new Date().toISOString()
  });
});

// Helper: Generate Secure 6-Digit Numeric OTP
function generate6DigitOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. POST /api/otp/request (Login Credentials Submission -> Creates OTP Request & Triggers OTP Service)
app.post('/api/otp/request', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email or Username required' });
  }

  const userId = `USR-${Math.floor(100 + Math.random() * 900)}`;
  const requestId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const sessionId = `SES-${Math.floor(10000 + Math.random() * 90000)}`;

  const generatedOtp = generate6DigitOtp();
  const now = Date.now();
  const expiresAt = now + OTP_EXPIRATION_MS;

  const newRequest = {
    requestId,
    userId,
    sessionId,
    email: email.includes('@') ? email : `${email}@arvix.sec`,
    otp: generatedOtp, // Stored securely on backend only
    status: 'ACTIVE',  // Triggered and active immediately upon valid login credentials
    createdAt: now,
    expiresAt: expiresAt,
    authorizedAt: now,
    verifyAttempts: 0,
    resendCount: 0,
    resendCooldownUntil: now + RESEND_COOLDOWN_MS
  };

  // Invalidate any existing active requests for this user
  otpDatabase.forEach(r => {
    if (r.userId === userId && r.status === 'ACTIVE') {
      r.status = 'INVALIDATED';
    }
  });

  otpDatabase.push(newRequest);

  console.log(`[BACKEND] Login Initiated: Created OTP Request ${requestId} for ${newRequest.email}. OTP: ${generatedOtp}`);

  // Never return the OTP secret to the frontend login call!
  return res.json({
    requestId: newRequest.requestId,
    userId: newRequest.userId,
    sessionId: newRequest.sessionId,
    email: newRequest.email,
    status: newRequest.status,
    expiresAt: newRequest.expiresAt,
    resendCooldownUntil: newRequest.resendCooldownUntil,
    message: 'OTP request created and OTP sent successfully.'
  });
});

// 2. GET /api/otp/pending (Internal Operator Control Station View)
app.get('/api/otp/pending', (req, res) => {
  const pending = otpDatabase.filter(r => r.status === 'PENDING_AUTHORIZATION' || r.status === 'ACTIVE');
  return res.json(pending);
});

// 3. GET /api/otp/status/:requestId (Frontend Status Check - Secure & Sanitized)
app.get('/api/otp/status/:requestId', (req, res) => {
  const reqObj = otpDatabase.find(r => r.requestId === req.params.requestId);
  if (!reqObj) return res.status(404).json({ status: 'NOT_FOUND' });

  const now = Date.now();

  // Expiration check
  if (reqObj.status === 'ACTIVE' && reqObj.expiresAt && now > reqObj.expiresAt) {
    reqObj.status = 'EXPIRED';
  }

  // Never leak OTP secret in public status endpoint
  return res.json({
    requestId: reqObj.requestId,
    userId: reqObj.userId,
    email: reqObj.email,
    status: reqObj.status,
    expiresAt: reqObj.expiresAt,
    remainingSeconds: reqObj.expiresAt ? Math.max(0, Math.floor((reqObj.expiresAt - now) / 1000)) : 0,
    resendCooldownUntil: reqObj.resendCooldownUntil,
    cooldownSeconds: reqObj.resendCooldownUntil ? Math.max(0, Math.floor((reqObj.resendCooldownUntil - now) / 1000)) : 0,
    verifyAttempts: reqObj.verifyAttempts,
    maxAttempts: MAX_VERIFY_ATTEMPTS
  });
});

// 4. POST /api/otp/resend (Resend OTP with Cooldown & Max Attempt Enforcement)
app.post('/api/otp/resend', (req, res) => {
  const { requestId, userId } = req.body;
  const reqObj = otpDatabase.find(r => r.requestId === requestId);

  if (!reqObj) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const now = Date.now();

  // Security Check 1: Session Ownership
  if (userId && reqObj.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized session match' });
  }

  // Security Check 2: Max Resend Attempts
  if (reqObj.resendCount >= MAX_RESEND_COUNT) {
    return res.status(429).json({ error: 'Maximum OTP resend limit reached. Please try logging in again.' });
  }

  // Security Check 3: Cooldown Timer Enforcement
  if (reqObj.resendCooldownUntil && now < reqObj.resendCooldownUntil) {
    const waitSeconds = Math.ceil((reqObj.resendCooldownUntil - now) / 1000);
    return res.status(429).json({ error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` });
  }

  // Generate fresh OTP & update state
  const newOtp = generate6DigitOtp();
  reqObj.otp = newOtp;
  reqObj.status = 'ACTIVE';
  reqObj.expiresAt = now + OTP_EXPIRATION_MS;
  reqObj.resendCount += 1;
  reqObj.resendCooldownUntil = now + RESEND_COOLDOWN_MS;
  reqObj.verifyAttempts = 0; // Reset verify attempt counter for fresh OTP

  console.log(`[BACKEND] Resent OTP for Request ${requestId} (Attempt ${reqObj.resendCount}/${MAX_RESEND_COUNT}). New OTP: ${newOtp}`);

  return res.json({
    requestId: reqObj.requestId,
    userId: reqObj.userId,
    status: 'ACTIVE',
    expiresAt: reqObj.expiresAt,
    resendCooldownUntil: reqObj.resendCooldownUntil,
    resendCount: reqObj.resendCount,
    message: 'New OTP generated and sent successfully.'
  });
});

// 5. POST /api/otp/authorize (Manual Security Operator Override / Control Station)
app.post('/api/otp/authorize', (req, res) => {
  const { requestId } = req.body;
  const reqObj = otpDatabase.find(r => r.requestId === requestId);

  if (!reqObj) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const generatedOtp = generate6DigitOtp();
  const now = Date.now();

  reqObj.otp = generatedOtp;
  reqObj.status = 'ACTIVE';
  reqObj.authorizedAt = now;
  reqObj.expiresAt = now + OTP_EXPIRATION_MS;
  reqObj.verifyAttempts = 0;

  console.log(`[BACKEND] Operator Authorized Request ${requestId} → OTP: ${generatedOtp}`);

  return res.json({
    requestId: reqObj.requestId,
    userId: reqObj.userId,
    email: reqObj.email,
    otp: generatedOtp, // Control station operator receives OTP
    status: 'ACTIVE',
    expiresAt: reqObj.expiresAt
  });
});

// 6. POST /api/otp/deny (Operator Deny)
app.post('/api/otp/deny', (req, res) => {
  const { requestId } = req.body;
  const reqObj = otpDatabase.find(r => r.requestId === requestId);

  if (!reqObj) {
    return res.status(404).json({ error: 'Request not found' });
  }

  reqObj.status = 'DENIED';
  console.log(`[BACKEND] Denied Request ${requestId}`);

  return res.json({ requestId, status: 'DENIED' });
});

// 7. POST /api/otp/verify (Strict Security Verification with Brute-Force Rate Limiting)
app.post('/api/otp/verify', (req, res) => {
  const { requestId, userId, otp } = req.body;
  const reqObj = otpDatabase.find(r => r.requestId === requestId && r.userId === userId);

  if (!reqObj) {
    return res.json({ verified: false, reason: 'REQUEST_NOT_FOUND', message: 'No matching authentication request found.' });
  }

  // Security Check 1: Denied
  if (reqObj.status === 'DENIED') {
    return res.json({ verified: false, reason: 'DENIED', message: 'Your verification request was denied by security operator.' });
  }

  // Security Check 2: Already Used (Single Use Rule)
  if (reqObj.status === 'USED') {
    return res.json({ verified: false, reason: 'OTP_ALREADY_USED', message: 'This verification code has already been used.' });
  }

  // Security Check 3: Invalidated by newer request
  if (reqObj.status === 'INVALIDATED') {
    return res.json({ verified: false, reason: 'OTP_INVALIDATED', message: 'This verification code was invalidated by a newer request.' });
  }

  // Security Check 4: Expiration
  if (reqObj.status === 'EXPIRED' || (reqObj.expiresAt && Date.now() > reqObj.expiresAt)) {
    reqObj.status = 'EXPIRED';
    return res.json({ verified: false, reason: 'OTP_EXPIRED', message: 'Verification code has expired. Please request a new OTP.' });
  }

  // Security Check 5: Max Verification Attempt Limit (Brute Force Protection)
  if (reqObj.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
    reqObj.status = 'LOCKED';
    return res.json({ verified: false, reason: 'MAX_ATTEMPTS_EXCEEDED', message: 'Maximum verification attempts exceeded. Session locked.' });
  }

  if (reqObj.status !== 'ACTIVE') {
    return res.json({ verified: false, reason: 'NOT_ACTIVE', message: 'Verification code is not active.' });
  }

  // Check Code Match
  if (reqObj.otp !== otp) {
    reqObj.verifyAttempts += 1;
    const remainingAttempts = MAX_VERIFY_ATTEMPTS - reqObj.verifyAttempts;

    if (remainingAttempts <= 0) {
      reqObj.status = 'LOCKED';
      return res.json({ verified: false, reason: 'MAX_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Session locked for security.' });
    }

    return res.json({
      verified: false,
      reason: 'INVALID_OTP',
      message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`
    });
  }

  // SUCCESS! Mark as USED (Enforce Single-Use)
  reqObj.status = 'USED';
  console.log(`[BACKEND] SUCCESS: Verified & Used OTP for Request ${requestId} (User: ${reqObj.email})`);

  return res.json({
    verified: true,
    requestId: reqObj.requestId,
    userId: reqObj.userId,
    email: reqObj.email,
    message: 'Authentication successful.'
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  ARVIX STANDALONE BACKEND AUTHORITY SERVER`);
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`==================================================`);
});
