// Synthetic Demo Case BF-2047 (Clearly Tagged SYNTHETIC DEMO DATA)

export const MOCK_DEMO_CASE = {
  id: "BF-2047",
  name: "Unauthorized High-Value Bank Transfer",
  crimeType: "Bank Fraud",
  status: "ACTIVE",
  statusText: "INVESTIGATION IN PROGRESS",
  investigator: "Cyber Crime Unit",
  createdAt: "11 Aug 2026 08:20 AM",
  description: "Reconstruction of unauthorized transaction incident involving ₹2,50,000 debit, unfamiliar login from Chennai, and OTP bypass.",
  isDemo: true
};

export const MOCK_DEMO_EVIDENCE = [
  {
    id: "EVD-101",
    fileName: "login_log.csv",
    fileType: "CSV",
    source: "ISP & Bank Authentication Server",
    uploadTime: "11 Aug 2026 08:25 AM",
    hash: "a4f8d9102b8e7c1f3a5d9e0b1c2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a",
    caseId: "BF-2047",
    size: "14.2 KB",
    recordsCount: 142
  },
  {
    id: "EVD-102",
    fileName: "security_sms.txt",
    fileType: "TXT",
    source: "SMS Gateway Provider Log",
    uploadTime: "11 Aug 2026 08:28 AM",
    hash: "8f2c5e7b9a1d4f6a3c0e2b4d6f8a0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c",
    caseId: "BF-2047",
    size: "8.5 KB",
    recordsCount: 45
  },
  {
    id: "EVD-103",
    fileName: "beneficiary_email.txt",
    fileType: "TXT",
    source: "Email Notification Log",
    uploadTime: "11 Aug 2026 08:30 AM",
    hash: "3b5a7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f1a3b",
    caseId: "BF-2047",
    size: "4.1 KB",
    recordsCount: 12
  },
  {
    id: "EVD-104",
    fileName: "transaction.csv",
    fileType: "CSV",
    source: "Core Banking Core Server",
    uploadTime: "11 Aug 2026 08:35 AM",
    hash: "7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f1a3b5c7d",
    caseId: "BF-2047",
    size: "28.6 KB",
    recordsCount: 310
  },
  {
    id: "EVD-105",
    fileName: "bank_statement.pdf",
    fileType: "PDF",
    source: "Customer Downloaded PDF",
    uploadTime: "11 Aug 2026 08:40 AM",
    hash: "5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f",
    caseId: "BF-2047",
    size: "142.0 KB",
    recordsCount: 1
  },
  {
    id: "EVD-106",
    fileName: "device_log.txt",
    fileType: "TXT",
    source: "Mobile Banking Client Telemetry",
    uploadTime: "11 Aug 2026 08:42 AM",
    hash: "9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b",
    caseId: "BF-2047",
    size: "18.9 KB",
    recordsCount: 88
  }
];

export const MOCK_DEMO_EVENTS = [
  {
    eventId: "EVT-001",
    timestamp: "08:30 AM",
    date: "11 Aug 2026",
    eventType: "UNFAMILIAR DEVICE LOGIN",
    account: "A0019284",
    person: "Target Victim",
    device: "Android 14 (Device-ID: UNK-9921)",
    location: "Chennai, India (IP: 182.72.10.45)",
    amount: null,
    transactionId: null,
    sourceEvidenceId: "EVD-101",
    sourceFileName: "login_log.csv",
    severity: "HIGH",
    status: "Suspicious"
  },
  {
    eventId: "EVT-002",
    timestamp: "08:31 AM",
    date: "11 Aug 2026",
    eventType: "OTP REQUESTED",
    account: "A0019284",
    person: "Target Victim",
    device: "SMS Gateway (Gateway-04)",
    location: "Telecom Circle IN-TN",
    amount: null,
    transactionId: "OTP-88392",
    sourceEvidenceId: "EVD-102",
    sourceFileName: "security_sms.txt",
    severity: "LOW",
    status: "Normal Flow"
  },
  {
    eventId: "EVT-003",
    timestamp: "08:32 AM",
    date: "11 Aug 2026",
    eventType: "OTP VERIFIED",
    account: "A0019284",
    person: "Target Victim",
    device: "Android 14 (Device-ID: UNK-9921)",
    location: "Chennai, India",
    amount: null,
    transactionId: "OTP-88392",
    sourceEvidenceId: "EVD-102",
    sourceFileName: "security_sms.txt",
    severity: "LOW",
    status: "Normal Flow"
  },
  {
    eventId: "EVT-004",
    timestamp: "08:34 AM",
    date: "11 Aug 2026",
    eventType: "NEW BENEFICIARY ADDED",
    account: "A0019284",
    person: "Beneficiary: DEMO-7812",
    device: "Android 14 (Device-ID: UNK-9921)",
    location: "Chennai, India",
    amount: null,
    transactionId: "BEN-7812",
    sourceEvidenceId: "EVD-103",
    sourceFileName: "beneficiary_email.txt",
    severity: "HIGH",
    status: "High Risk"
  },
  {
    eventId: "EVT-005",
    timestamp: "08:36 AM",
    date: "11 Aug 2026",
    eventType: "₹2,50,000 TRANSFERRED",
    account: "A0019284 -> DEMO-7812",
    person: "Mule Account (DEMO-7812)",
    device: "Android 14 (Device-ID: UNK-9921)",
    location: "Chennai, India",
    amount: "₹2,50,000",
    transactionId: "TX1001",
    sourceEvidenceId: "EVD-104",
    sourceFileName: "transaction.csv",
    severity: "CRITICAL",
    status: "High-Value Debit"
  },
  {
    eventId: "EVT-006",
    timestamp: "08:37 AM",
    date: "11 Aug 2026",
    eventType: "PASSWORD CHANGED",
    account: "A0019284",
    person: "Target Victim",
    device: "Android 14 (Device-ID: UNK-9921)",
    location: "Chennai, India",
    amount: null,
    transactionId: "PWD-9912",
    sourceEvidenceId: "EVD-102",
    sourceFileName: "security_sms.txt",
    severity: "HIGH",
    status: "Account Lockout Risk"
  },
  {
    eventId: "EVT-007",
    timestamp: "08:38 AM",
    date: "11 Aug 2026",
    eventType: "BANK DEBIT NOTIFICATION",
    account: "A0019284",
    person: "Target Victim",
    device: "SMS Gateway",
    location: "Telecom Circle IN-TN",
    amount: "₹2,50,000",
    transactionId: "TX1001",
    sourceEvidenceId: "EVD-102",
    sourceFileName: "security_sms.txt",
    severity: "LOW",
    status: "Normal Alert"
  }
];

export const MOCK_DEMO_CONFLICTS = [
  {
    conflictId: "CNF-001",
    type: "Timestamp Inconsistency",
    severity: "HIGH",
    transactionId: "TX1001",
    event: "₹2,50,000 Transfer (TX1001)",
    sourceA: {
      fileName: "transaction.csv",
      evidenceId: "EVD-104",
      timestamp: "10:20 AM",
      amount: "₹2,50,000",
      account: "A0019284"
    },
    sourceB: {
      fileName: "bank_statement.pdf",
      evidenceId: "EVD-105",
      timestamp: "11:45 AM",
      amount: "₹2,50,000",
      account: "A0019284"
    },
    reason: "Source A records core clearing time (10:20 AM), whereas Source B PDF reflects interbank settlement completion timestamp (11:45 AM).",
    status: "NEEDS REVIEW",
    investigatorNote: null,
    reviewedAt: null
  },
  {
    conflictId: "CNF-002",
    type: "Location Discrepancy",
    severity: "MEDIUM",
    transactionId: "TX1001",
    event: "Unfamiliar Login Location",
    sourceA: {
      fileName: "login_log.csv",
      evidenceId: "EVD-101",
      timestamp: "08:30 AM",
      location: "Chennai, India (IP: 182.72.10.45)"
    },
    sourceB: {
      fileName: "device_log.txt",
      evidenceId: "EVD-106",
      timestamp: "08:30 AM",
      location: "Bengaluru, India (IP: 49.207.12.9)"
    },
    reason: "ISP routing tables show cell tower handoff between Karnataka and Tamil Nadu mobile gateways.",
    status: "NEEDS REVIEW",
    investigatorNote: null,
    reviewedAt: null
  }
];

export const MOCK_THREAT_INDICATORS = [
  {
    id: "TH-1",
    title: "Login from unfamiliar device",
    timestamp: "08:30 AM | Chennai",
    severity: "HIGH",
    details: "Device ID UNK-9921 not present in victim's 90-day device registry."
  },
  {
    id: "TH-2",
    title: "New beneficiary added",
    timestamp: "08:34 AM | DEMO-7812",
    severity: "HIGH",
    details: "Mule account added without standard 30-minute cooling period."
  },
  {
    id: "TH-3",
    title: "High value transfer",
    timestamp: "08:36 AM | ₹2,50,000",
    severity: "CRITICAL",
    details: "Max daily transfer limit reached immediately after beneficiary creation."
  },
  {
    id: "TH-4",
    title: "Password changed after transfer",
    timestamp: "08:37 AM",
    severity: "HIGH",
    details: "Creds altered to prevent victim lockout recovery."
  }
];
