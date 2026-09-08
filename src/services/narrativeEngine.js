// Evidence Narrative Engine for ARVIX
// Converts parsed events, correlated entities, and detected conflicts into a structured, evidence-backed narrative.

export function generateEvidenceNarrative(caseData, evidenceList, events, conflicts) {
  // Empty state check
  if (!evidenceList || evidenceList.length === 0 || !events || events.length === 0) {
    return {
      isAvailable: false,
      summary: "Evidence narrative unavailable. Upload evidence to begin reconstruction.",
      sections: []
    };
  }

  // 1. Direct Evidence items
  const directEvidence = events.map(evt => ({
    type: "DIRECT EVIDENCE",
    text: `Event '${evt.eventType}' recorded at ${evt.timestamp} ${evt.date ? `on ${evt.date}` : ''} in source file ${evt.sourceFileName}.`,
    source: evt.sourceFileName,
    evidenceId: evt.sourceEvidenceId
  }));

  // 2. Correlated findings
  const correlated = [];
  if (events.length >= 2) {
    const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const firstEvt = sorted[0];
    const lastEvt = sorted[sorted.length - 1];
    correlated.push({
      type: "CORRELATED",
      text: `Events span from ${firstEvt.timestamp} (${firstEvt.eventType}) to ${lastEvt.timestamp} (${lastEvt.eventType}), indicating a sequential temporal chain across ${evidenceList.length} evidence sources.`,
      sources: evidenceList.map(e => e.fileName)
    });
  }

  // 3. Potential Inconsistencies
  const inconsistencies = conflicts.map(c => ({
    type: "POTENTIAL INCONSISTENCY",
    text: `${c.type} on ${c.event}: Source A (${c.sourceA.fileName}) states '${c.sourceA.timestamp || c.sourceA.amount}', whereas Source B (${c.sourceB.fileName}) states '${c.sourceB.timestamp || c.sourceB.amount}'.`,
    severity: c.severity,
    sources: [c.sourceA.fileName, c.sourceB.fileName]
  }));

  // 4. Unknown / Insufficient Evidence Items
  const unknowns = [
    {
      type: "UNKNOWN",
      text: "The available evidence does NOT establish the physical identity of the human operator behind the device or account."
    },
    {
      type: "UNKNOWN",
      text: "The available evidence does NOT establish whether authorization credentials were voluntarily shared, coerced, or stolen via malware."
    }
  ];

  // Build full structured narrative text
  const narrativeText = `Based on ${evidenceList.length} verified evidence files (${evidenceList.map(e => e.fileName).join(', ')}), ARVIX reconstructed a chronological incident sequence containing ${events.length} extracted events.

At ${events[0]?.timestamp || 'the initial log timestamp'}, an event ('${events[0]?.eventType}') was recorded in ${events[0]?.sourceFileName}. This was followed by subsequent activity culminating in ${events.find(e => e.amount)?.eventType || 'target account modifications'}.

CRITICAL ANALYSIS: These events appear temporally and contextually correlated based on available telemetry. However, the evidence does not establish who operated the physical device or whether legal authorization was granted.`;

  return {
    isAvailable: true,
    summary: narrativeText,
    directEvidence,
    correlated,
    inconsistencies,
    unknowns,
    recommendedSteps: [
      "Verify core banking database clearing logs vs statement PDF settlement timestamps.",
      "Request ISP IP routing tables for regional cell tower gateway handoffs.",
      "Subpoena device MAC address logs from SMS gateway provider.",
      "Obtain victim affidavit regarding beneficiary creation authorization."
    ]
  };
}
