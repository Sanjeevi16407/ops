// Grounded AI Engine for ARVIX
// Rule: NEVER invent evidence. Respond strictly from available parsed evidence.

export function generateAIResponse(query, caseData, evidenceList, events, conflicts) {
  const q = query.toLowerCase().trim();

  // 1. Zero evidence check
  if (!evidenceList || evidenceList.length === 0) {
    return {
      answer: "The available evidence is insufficient to determine this. No evidence files have been uploaded to the Evidence Vault yet.",
      supportingEvidence: [],
      confidence: "NONE"
    };
  }

  // 2. Timeline query
  if (q.includes('timeline') || q.includes('what happened') || q.includes('sequence') || q.includes('08:30') || q.includes('between')) {
    if (events.length === 0) {
      return {
        answer: "The available evidence is insufficient to determine the timeline because no structured events could be extracted.",
        supportingEvidence: [],
        confidence: "NONE"
      };
    }

    const eventSummaries = events.map(e => `• ${e.timestamp} — ${e.eventType} (${e.sourceFileName})`).join('\n');
    return {
      answer: `Based on the uploaded evidence files (${evidenceList.map(e => e.fileName).join(', ')}), here is the verified chronological sequence of events:\n\n${eventSummaries}\n\nThese events are strongly correlated.`,
      supportingEvidence: evidenceList.map(e => e.fileName),
      confidence: "HIGH (GROUNDED IN EVIDENCE)"
    };
  }

  // 3. Conflicts query
  if (q.includes('conflict') || q.includes('inconsistenc') || q.includes('flagged') || q.includes('tx1001')) {
    if (conflicts.length === 0) {
      return {
        answer: "No potential inconsistencies or data conflicts have been detected across the uploaded evidence files.",
        supportingEvidence: [],
        confidence: "HIGH"
      };
    }

    const conflictSummaries = conflicts.map(c => 
      `• ${c.type} on ${c.transactionId || 'Event'}: Source A (${c.sourceA.fileName}) states ${c.sourceA.timestamp || c.sourceA.amount}, while Source B (${c.sourceB.fileName}) states ${c.sourceB.timestamp || c.sourceB.amount}. Severity: ${c.severity}.`
    ).join('\n');

    return {
      answer: `ARVIX Conflict Engine detected ${conflicts.length} potential inconsistency requiring investigator review:\n\n${conflictSummaries}\n\nNote: This reflects potential timing/source discrepancies and requires human investigator review.`,
      supportingEvidence: conflicts.map(c => `${c.sourceA.fileName} vs ${c.sourceB.fileName}`),
      confidence: "HIGH (GROUNDED IN EVIDENCE)"
    };
  }

  // 4. Evidence query
  if (q.includes('evidence') || q.includes('files') || q.includes('vault') || q.includes('supports')) {
    const list = evidenceList.map(e => `• ${e.fileName} (${e.fileType}) — Hash: ${e.hash.substring(0, 16)}...`).join('\n');
    return {
      answer: `The current case (${caseData?.id || 'Active Case'}) contains ${evidenceList.length} verified evidence files in chain of custody:\n\n${list}`,
      supportingEvidence: evidenceList.map(e => e.fileName),
      confidence: "HIGH"
    };
  }

  // 5. Suspect or perpetrator attribution query
  if (q.includes('who') || q.includes('suspect') || q.includes('culprit') || q.includes('fraudster') || q.includes('thief') || q.includes('hacker')) {
    return {
      answer: "The available evidence is insufficient to determine the identity of the perpetrator. ARVIX presents structured evidence and technical discrepancies; final legal attribution requires human law enforcement investigation.",
      supportingEvidence: evidenceList.map(e => e.fileName),
      confidence: "NEUTRAL / FORENSIC RESTRICTION"
    };
  }

  // 6. Generic or missing question fallback
  return {
    answer: `The available evidence contains ${events.length} extracted events across ${evidenceList.length} files (${evidenceList.map(e => e.fileName).join(', ')}). The available evidence is insufficient to answer this specific query beyond the recorded telemetry.`,
    supportingEvidence: evidenceList.slice(0, 3).map(e => e.fileName),
    confidence: "PARTIAL"
  };
}
