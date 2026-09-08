import Papa from 'papaparse';

// Calculate SHA-256 checksum for any uploaded file using Web Crypto API
export async function calculateSHA256(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error("SHA256 calculation failed", err);
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Empty fallback hash
  }
}

// Parse evidence files and extract structured events
export async function parseEvidenceFile(file, evidenceId, caseId) {
  const text = await file.text();
  const fileType = file.name.split('.').pop().toUpperCase();
  const extractedEvents = [];

  if (fileType === 'CSV') {
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    parsed.data.forEach((row, idx) => {
      // Find matching keys flexibly
      const keys = Object.keys(row);
      const getKey = (name) => keys.find(k => k.toLowerCase().includes(name.toLowerCase()));

      const timestamp = row[getKey('time')] || row[getKey('date')] || row[getKey('timestamp')] || 'Unknown Time';
      const eventType = row[getKey('event')] || row[getKey('type')] || row[getKey('action')] || 'Log Record';
      const account = row[getKey('account')] || row[getKey('user')] || row[getKey('acc')] || null;
      const amount = row[getKey('amount')] || row[getKey('val')] || null;
      const transactionId = row[getKey('tx')] || row[getKey('transaction')] || row[getKey('id')] || null;
      const device = row[getKey('device')] || row[getKey('ip')] || row[getKey('ua')] || null;
      const location = row[getKey('location')] || row[getKey('city')] || row[getKey('ip')] || null;
      const person = row[getKey('person')] || row[getKey('name')] || row[getKey('beneficiary')] || null;

      extractedEvents.push({
        eventId: `EVT-${evidenceId.split('-')[1] || '00'}-${idx + 1}`,
        timestamp: timestamp,
        date: new Date().toLocaleDateString(),
        eventType: eventType.toUpperCase(),
        account: account,
        person: person,
        device: device,
        location: location,
        amount: amount,
        transactionId: transactionId,
        sourceEvidenceId: evidenceId,
        sourceFileName: file.name,
        severity: amount || eventType.toLowerCase().includes('fail') || eventType.toLowerCase().includes('unauthorized') ? 'HIGH' : 'LOW',
        status: 'Extracted'
      });
    });
  } else {
    // TXT / Log / Text PDF extraction using Regex pattern matching
    const lines = text.split('\n');
    lines.forEach((line, idx) => {
      if (!line.trim()) return;

      // Extract timestamps like 08:30 AM, 2026-08-11 08:30, 10:20:45
      const timeMatch = line.match(/\b(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\b/i);
      const txMatch = line.match(/\b(TX\d+|OTP-\d+|BEN-\d+|PWD-\d+)\b/i);
      const amountMatch = line.match(/(?:₹|\$|USD|INR)\s*[\d,]+(?:\.\d{2})?/i);
      const ipMatch = line.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
      const accMatch = line.match(/\b(A\d{6,10}|DEMO-\d{4})\b/i);

      if (timeMatch || txMatch || amountMatch) {
        extractedEvents.push({
          eventId: `EVT-${evidenceId.split('-')[1] || '00'}-${idx + 1}`,
          timestamp: timeMatch ? timeMatch[1] : 'Log Event',
          date: new Date().toLocaleDateString(),
          eventType: line.substring(0, 45).trim().toUpperCase(),
          account: accMatch ? accMatch[1] : null,
          person: null,
          device: ipMatch ? `IP: ${ipMatch[0]}` : null,
          location: ipMatch ? `Network Gateway (${ipMatch[0]})` : null,
          amount: amountMatch ? amountMatch[0] : null,
          transactionId: txMatch ? txMatch[1] : null,
          sourceEvidenceId: evidenceId,
          sourceFileName: file.name,
          severity: amountMatch ? 'HIGH' : 'LOW',
          status: 'Extracted'
        });
      }
    });
  }

  return extractedEvents;
}
