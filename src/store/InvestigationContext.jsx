import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_DEMO_CASE, MOCK_DEMO_EVIDENCE, MOCK_DEMO_EVENTS, MOCK_DEMO_CONFLICTS, MOCK_THREAT_INDICATORS } from '../services/mockDemoData';
import { calculateSHA256, parseEvidenceFile } from '../services/evidenceParser';
import { detectConflicts } from '../services/conflictEngine';
import { generateAIResponse } from '../services/aiEngine';
import { getActiveUser, logoutUser, getUserCases, saveUserCase, deleteUserCase } from '../services/storageService';
import { 
  apiRequestOtp, apiGetPendingRequests, apiGetRequestStatus, 
  apiAuthorizeOtp, apiDenyOtp, apiVerifyOtp, apiResendOtp 
} from '../services/otpBackendService';

const InvestigationContext = createContext();

export function InvestigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const path = window.location.pathname;
      if (search.includes('view=control') || path.includes('control') || search.includes('otp')) {
        return 'otp_control';
      }
    }
    return 'login';
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [activeAuthRequest, setActiveAuthRequest] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Case Data
  const [currentCase, setCurrentCase] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [events, setEvents] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [threatIndicators, setThreatIndicators] = useState([]);
  const [isDemoDataLoaded, setIsDemoDataLoaded] = useState(false);
  const [selectedConflictForCompare, setSelectedConflictForCompare] = useState(null);
  const [userCases, setUserCases] = useState([]);

  useEffect(() => {
    const user = getActiveUser();
    if (user) {
      setCurrentUser(user);
      const cases = getUserCases(user.id);
      setUserCases(cases);
    }
  }, []);

  // 1. Login Page: Request OTP from Backend
  const requestOtpFromBackend = (emailOrUsername) => {
    const req = apiRequestOtp(emailOrUsername);
    setActiveAuthRequest(req);
    return req;
  };

  // 2. Login Page: Poll/Check status of request
  const checkOtpRequestStatus = (requestId) => {
    return apiGetRequestStatus(requestId);
  };

  // 3. Login Page: Resend OTP
  const resendOtpInBackend = (requestId, userId) => {
    return apiResendOtp(requestId, userId);
  };

  // 4. Control Station: Authorize request
  const authorizeOtpInBackend = (requestId) => {
    return apiAuthorizeOtp(requestId);
  };

  // 5. Control Station: Deny request
  const denyOtpInBackend = (requestId) => {
    return apiDenyOtp(requestId);
  };

  // 6. Login Page: Verify OTP with Backend
  const verifyOtpWithBackend = (requestId, userId, submittedOtp) => {
    const res = apiVerifyOtp(requestId, userId, submittedOtp);
    if (res.verified) {
      const user = {
        id: res.userId,
        username: res.email.split('@')[0],
        email: res.email
      };
      localStorage.setItem('arvix_active_user', JSON.stringify(user));
      setCurrentUser(user);
      setUserCases(getUserCases(user.id));
      setActiveTab('dashboard');
    }
    return res;
  };

  // Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    resetToEmptyState();
    setActiveTab('login');
  };

  // Load Synthetic Demo Case BF-2047
  const loadDemoCase = () => {
    setCurrentCase(MOCK_DEMO_CASE);
    setEvidenceList(MOCK_DEMO_EVIDENCE);
    setEvents(MOCK_DEMO_EVENTS);
    setConflicts(MOCK_DEMO_CONFLICTS);
    setThreatIndicators(MOCK_THREAT_INDICATORS);
    setIsDemoDataLoaded(true);
    if (currentUser) {
      saveUserCase(currentUser.id, MOCK_DEMO_CASE);
      setUserCases(getUserCases(currentUser.id));
    }
  };

  // Reset to Clean Empty State
  const resetToEmptyState = () => {
    setCurrentCase(null);
    setEvidenceList([]);
    setEvents([]);
    setConflicts([]);
    setThreatIndicators([]);
    setIsDemoDataLoaded(false);
    setSelectedConflictForCompare(null);
  };

  // Open existing case continuation
  const openSavedCase = (caseObj) => {
    setCurrentCase(caseObj);
    setEvidenceList(caseObj.evidenceMetadata || []);
    setEvents(caseObj.extractedEvents || []);
    setConflicts(caseObj.detectedConflicts || []);
    setThreatIndicators(caseObj.threatIndicators || []);
    setIsDemoDataLoaded(caseObj.isDemo || false);
    setActiveTab('dashboard');
  };

  // Delete user case permanently
  const handleDeleteCase = (caseId) => {
    if (!currentUser) return;
    const updated = deleteUserCase(currentUser.id, caseId);
    setUserCases(updated);
    if (currentCase?.id === caseId) {
      resetToEmptyState();
    }
  };

  // File Upload parser
  const uploadEvidenceFiles = async (files) => {
    let activeCase = currentCase;
    if (!activeCase) {
      activeCase = {
        id: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
        name: "Active Investigation Case",
        crimeType: "Cybercrime",
        status: "ACTIVE",
        statusText: "INVESTIGATION IN PROGRESS",
        investigator: currentUser?.username || "Lead Digital Investigator",
        createdAt: new Date().toLocaleString(),
        description: "User uploaded evidence files for forensic processing.",
        isDemo: false
      };
      setCurrentCase(activeCase);
    }

    const newEvidenceItems = [];
    let newExtractedEvents = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const evdId = `EVD-${Math.floor(100 + Math.random() * 900)}`;
      const sha256 = await calculateSHA256(file);

      const evdItem = {
        id: evdId,
        fileName: file.name,
        fileType: file.name.split('.').pop().toUpperCase(),
        source: "User Uploaded File",
        uploadTime: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
        hash: sha256,
        caseId: activeCase.id,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        recordsCount: 0
      };

      newEvidenceItems.push(evdItem);
      const parsed = await parseEvidenceFile(file, evdId, activeCase.id);
      evdItem.recordsCount = parsed.length;
      newExtractedEvents = [...newExtractedEvents, ...parsed];
    }

    const updatedEvidence = [...evidenceList, ...newEvidenceItems];
    const updatedEvents = [...events, ...newExtractedEvents];
    const detectedConflicts = detectConflicts(updatedEvents);

    setEvidenceList(updatedEvidence);
    setEvents(updatedEvents);
    setConflicts(detectedConflicts);

    if (currentUser) {
      const fullCaseObj = {
        ...activeCase,
        evidenceMetadata: updatedEvidence,
        extractedEvents: updatedEvents,
        detectedConflicts: detectedConflicts,
        evidenceCount: updatedEvidence.length
      };
      saveUserCase(currentUser.id, fullCaseObj);
      setUserCases(getUserCases(currentUser.id));
    }
  };

  // AI Assistant Chat Action
  const [chatMessages, setChatMessages] = useState([
    {
      id: "msg-0",
      sender: "ARVIX",
      text: "ARVIX Core v2.1 Online. Upload evidence files to begin automated forensics extraction.",
      timestamp: "SYSTEM READY",
      evidenceRef: []
    }
  ]);

  const sendAIMessage = (promptText) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "INVESTIGATOR",
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const response = generateAIResponse(promptText, currentCase, evidenceList, events, conflicts);
      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "ARVIX",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidenceRef: response.supportingEvidence,
        confidence: response.confidence
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <InvestigationContext.Provider value={{
      activeTab,
      setActiveTab: (tab) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
      },
      mobileMenuOpen,
      setMobileMenuOpen,
      currentUser,
      activeAuthRequest,
      setActiveAuthRequest,
      requestOtpFromBackend,
      checkOtpRequestStatus,
      resendOtpInBackend,
      authorizeOtpInBackend,
      denyOtpInBackend,
      verifyOtpWithBackend,
      handleLogout,
      currentCase,
      setCurrentCase,
      evidenceList,
      events,
      conflicts,
      threatIndicators,
      isDemoDataLoaded,
      loadDemoCase,
      resetToEmptyState,
      uploadEvidenceFiles,
      selectedConflictForCompare,
      setSelectedConflictForCompare,
      chatMessages,
      sendAIMessage,
      userCases,
      openSavedCase,
      handleDeleteCase
    }}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  return useContext(InvestigationContext);
}
