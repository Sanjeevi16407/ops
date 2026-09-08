import React from 'react';
import MetricCards from '../dashboard/MetricCards';
import SceneReconstruction from '../dashboard/SceneReconstruction';
import InteractiveTimeline from '../dashboard/InteractiveTimeline';
import EvidenceNarrativePanel from '../dashboard/EvidenceNarrativePanel';
import AIAssistantPanel from '../dashboard/AIAssistantPanel';
import ThreatIndicators from '../dashboard/ThreatIndicators';
import EmptyState from '../common/EmptyState';
import { useInvestigation } from '../../store/InvestigationContext';

export default function DashboardView() {
  const { evidenceList } = useInvestigation();

  return (
    <div className="space-y-4 animate-fade-in font-mono-cyber">
      {/* Top 5 Metric Cards */}
      <MetricCards />

      {evidenceList.length === 0 ? (
        <EmptyState />
      ) : (
        /* Main Command Center Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left / Center 2 Columns: Visual Scene + AI Evidence Narrative + Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <SceneReconstruction />
            <EvidenceNarrativePanel />
            <InteractiveTimeline />
          </div>

          {/* Right Column: AI Assistant + Threat & Risk Indicators */}
          <div className="space-y-4">
            <AIAssistantPanel />
            <ThreatIndicators />
          </div>
        </div>
      )}
    </div>
  );
}
