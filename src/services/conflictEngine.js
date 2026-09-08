// Conflict Detection Engine for ARVIX
// Principle: SAME EVENT + SAME SEMANTIC MEANING + INCOMPATIBLE INFORMATION = POTENTIAL CONFLICT

export function detectConflicts(events) {
  const conflicts = [];
  let conflictCounter = 1;

  // Group events by transaction ID
  const txGroups = {};
  events.forEach(evt => {
    if (evt.transactionId) {
      const key = evt.transactionId.toUpperCase();
      if (!txGroups[key]) txGroups[key] = [];
      txGroups[key].push(evt);
    }
  });

  // Check each transaction group for source inconsistencies
  Object.keys(txGroups).forEach(txId => {
    const group = txGroups[txId];
    if (group.length < 2) return;

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const evA = group[i];
        const evB = group[j];

        // Skip if from the same source file
        if (evA.sourceFileName === evB.sourceFileName) continue;

        // 1. Timestamp conflict check
        if (evA.timestamp && evB.timestamp && evA.timestamp !== evB.timestamp) {
          conflicts.push({
            conflictId: `CNF-${String(conflictCounter++).padStart(3, '0')}`,
            type: "Timestamp Inconsistency",
            severity: "HIGH",
            transactionId: txId,
            event: `Transaction Record (${txId})`,
            sourceA: {
              fileName: evA.sourceFileName,
              evidenceId: evA.sourceEvidenceId,
              timestamp: evA.timestamp,
              amount: evA.amount || "N/A",
              account: evA.account || "N/A"
            },
            sourceB: {
              fileName: evB.sourceFileName,
              evidenceId: evB.sourceEvidenceId,
              timestamp: evB.timestamp,
              amount: evB.amount || "N/A",
              account: evB.account || "N/A"
            },
            reason: `Source A (${evA.sourceFileName}) records ${evA.timestamp}, whereas Source B (${evB.sourceFileName}) records ${evB.timestamp}. Potential clearing/settlement time delay or clock desynchronization.`,
            status: "NEEDS REVIEW",
            investigatorNote: null,
            reviewedAt: null
          });
        }

        // 2. Amount conflict check
        if (evA.amount && evB.amount && evA.amount !== evB.amount) {
          conflicts.push({
            conflictId: `CNF-${String(conflictCounter++).padStart(3, '0')}`,
            type: "Amount Discrepancy",
            severity: "HIGH",
            transactionId: txId,
            event: `Transaction Amount (${txId})`,
            sourceA: {
              fileName: evA.sourceFileName,
              evidenceId: evA.sourceEvidenceId,
              timestamp: evA.timestamp,
              amount: evA.amount
            },
            sourceB: {
              fileName: evB.sourceFileName,
              evidenceId: evB.sourceEvidenceId,
              timestamp: evB.timestamp,
              amount: evB.amount
            },
            reason: `Amount listed in ${evA.sourceFileName} (${evA.amount}) differs from ${evB.sourceFileName} (${evB.amount}). Requires fee structure verification or partial debit investigation.`,
            status: "NEEDS REVIEW",
            investigatorNote: null,
            reviewedAt: null
          });
        }
      }
    }
  });

  return conflicts;
}
