import React from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import MobileDrawer from './components/layout/MobileDrawer';
import MobileBottomNav from './components/layout/MobileBottomNav';
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
    <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 overflow-y-auto min-h-[calc(100vh-61px-37px)] cyber-forensics-bg relative z-10 w-full max-w-full">
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
    <div className="min-h-screen w-full bg-[#02070b] text-[#f8fafc] flex flex-col font-mono-cyber relative overflow-hidden">
      {/* Translucent Cyber Circuit Background Layer (Exclusive to After-Login Website, NOT Login Page) */}
      {!isAuthOrStandalone && (
        <>
          <div className="website-bg-wallpaper" />
          <div className="website-bg-vignette" />
        </>
      )}

      {/* Global Ambient Fluid Liquid Orbs for Refraction across all pages */}
      <div className="ambient-liquid-teal -top-24 -left-20" />
      <div className="ambient-liquid-cyan -bottom-28 -right-20" />
      <div className="ambient-liquid-indigo top-1/3 right-1/4 opacity-50" />

      {/* Dynamic Scanline Light Beam */}
      <div className="scanline-beam" />

      {!isAuthOrStandalone && <Header />}
      <div className="flex flex-1 w-full justify-center items-stretch relative z-10">
        {!isAuthOrStandalone && <Sidebar />}
        <MainContent />
      </div>
      {!isAuthOrStandalone && <Footer />}

      {/* Mobile-Exclusive Navigation Drawer & Floating Bottom Tab Bar */}
      {!isAuthOrStandalone && (
        <>
          <MobileDrawer />
          <MobileBottomNav />
        </>
      )}
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
