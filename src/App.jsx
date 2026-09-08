import React from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import AuthView from './components/views/AuthView';
import DemoOtpConsoleView from './components/views/DemoOtpConsoleView';
import OtpControlStationView from './components/views/OtpControlStationView';
import DashboardView from './components/views/DashboardView';
import CaseManagerView from './components/views/CaseManagerView';
import EvidenceVaultView from './components/views/EvidenceVaultView';
import TimelineView from './components/views/TimelineView';
import VisualGraphView from './components/views/VisualGraphView';
import ConflictsView from './components/views/ConflictsView';
import CompareEvidenceView from './components/views/CompareEvidenceView';
import AIAssistantView from './components/views/AIAssistantView';
import ReportView from './components/views/ReportView';
import { InvestigationProvider, useInvestigation } from './store/InvestigationContext';

function MainContent() {
  const { activeTab } = useInvestigation();

  if (activeTab === 'login') return <AuthView />;
  if (activeTab === 'demo_otp') return <DemoOtpConsoleView />;
  if (activeTab === 'otp_control') return <OtpControlStationView />;

  return (
    <main className="flex-1 p-6 overflow-y-auto min-h-[calc(100vh-61px-37px)] bg-[#02070b] cyber-forensics-bg">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'cases' && <CaseManagerView />}
      {activeTab === 'evidence' && <EvidenceVaultView />}
      {activeTab === 'timeline' && <TimelineView />}
      {activeTab === 'graph' && <VisualGraphView />}
      {activeTab === 'conflicts' && <ConflictsView />}
      {activeTab === 'compare' && <CompareEvidenceView />}
      {activeTab === 'ai_assistant' && <AIAssistantView />}
      {activeTab === 'report' && <ReportView />}
    </main>
  );
}

function AppLayout() {
  const { activeTab } = useInvestigation();
  const isAuthOrStandalone = activeTab === 'login' || activeTab === 'demo_otp' || activeTab === 'otp_control';

  return (
    <div className="min-h-screen bg-[#02070b] text-[#e2e8f0] flex flex-col font-mono-cyber scanline-overlay">
      {!isAuthOrStandalone && <Header />}
      <div className="flex flex-1">
        {!isAuthOrStandalone && <Sidebar />}
        <MainContent />
      </div>
      {!isAuthOrStandalone && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <InvestigationProvider>
      <AppLayout />
    </InvestigationProvider>
  );
}
