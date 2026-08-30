import { createContext, useContext, useState } from "react";
import React from "react";

export const LANGS = { en: "English", hi: "हिन्दी", te: "తెలుగు" };

const DICT = {
  en: {
    tagline: "Dignified work, fairly matched.",
    home: "Home",
    dashboard: "Dashboard",
    bookService: "Book a Service",
    wallet: "Wallet",
    myJobs: "My Jobs",
    profile: "Profile",
    availability: "Availability",
    earnings: "Earnings",
    welfareWallet: "Welfare Wallet",
    trustScore: "Trust Score",
    notifications: "Notifications",
    messages: "Messages",
    demandRadar: "AI Demand Radar",
    opportunityBalance: "Opportunity Balance",
    impactLedger: "Impact Ledger",
    verification: "Verification Center",
    disputes: "Complaints & Disputes",
    training: "Training & Upskilling",
    institutional: "Institutional Booking",
    federation: "Federation Dashboard",
    insights: "Federation Insights",
    switchRole: "Switch role",
    customer: "Customer",
    worker: "Worker",
    coopAdmin: "Cooperative Admin",
    fedAdmin: "Federation Admin",
    sampleData: "Sample Data",
    listening: "Listening…",
    tapToSpeak: "Tap to speak",
  },
  hi: {
    tagline: "सम्मानजनक काम, निष्पक्ष रूप से जुड़ा हुआ।",
    home: "होम",
    dashboard: "डैशबोर्ड",
    bookService: "सेवा बुक करें",
    wallet: "वॉलेट",
    myJobs: "मेरे काम",
    profile: "प्रोफ़ाइल",
    availability: "उपलब्धता",
    earnings: "कमाई",
    welfareWallet: "कल्याण वॉलेट",
    trustScore: "विश्वास स्कोर",
    notifications: "सूचनाएं",
    messages: "संदेश",
    demandRadar: "एआई डिमांड रडार",
    opportunityBalance: "अवसर संतुलन",
    impactLedger: "प्रभाव लेजर",
    verification: "सत्यापन केंद्र",
    disputes: "शिकायतें और विवाद",
    training: "प्रशिक्षण और कौशल",
    institutional: "संस्थागत बुकिंग",
    federation: "फेडरेशन डैशबोर्ड",
    insights: "फेडरेशन जानकारियां",
    switchRole: "भूमिका बदलें",
    customer: "ग्राहक",
    worker: "कामगार",
    coopAdmin: "सहकारी प्रशासक",
    fedAdmin: "फेडरेशन प्रशासक",
    sampleData: "नमूना डेटा",
    listening: "सुन रहा है…",
    tapToSpeak: "बोलने के लिए टैप करें",
  },
  te: {
    tagline: "గౌరవప్రదమైన పని, న్యాయంగా జతచేయబడింది.",
    home: "హోమ్",
    dashboard: "డాష్‌బోర్డ్",
    bookService: "సేవను బుక్ చేయండి",
    wallet: "వాలెట్",
    myJobs: "నా పనులు",
    profile: "ప్రొఫైల్",
    availability: "అందుబాటు",
    earnings: "సంపాదన",
    welfareWallet: "సంక్షేమ వాలెట్",
    trustScore: "నమ్మక స్కోరు",
    notifications: "నోటిఫికేషన్లు",
    messages: "సందేశాలు",
    demandRadar: "AI డిమాండ్ రాడార్",
    opportunityBalance: "అవకాశ సమతుల్యత",
    impactLedger: "ఇంపాక్ట్ లెడ్జర్",
    verification: "వెరిఫికేషన్ కేంద్రం",
    disputes: "ఫిర్యాదులు & వివాదాలు",
    training: "శిక్షణ & నైపుణ్యాభివృద్ధి",
    institutional: "సంస్థాగత బుకింగ్",
    federation: "ఫెడరేషన్ డాష్‌బోర్డ్",
    insights: "ఫెడరేషన్ అంతర్దృష్టులు",
    switchRole: "పాత్రను మార్చండి",
    customer: "వినియోగదారు",
    worker: "కార్మికుడు",
    coopAdmin: "సహకార నిర్వాహకుడు",
    fedAdmin: "ఫెడరేషన్ నిర్వాహకుడు",
    sampleData: "నమూనా డేటా",
    listening: "వింటోంది…",
    tapToSpeak: "మాట్లాడటానికి నొక్కండి",
  },
};

// Canned voice phrases per screen — a genuinely functional implementation of the mic UI,
// fed by a small phrase set instead of real speech recognition.
export const VOICE_PHRASES = {
  hi: [
    "कल मैं उपलब्ध नहीं हूं",
    "आज दोपहर 2 बजे के बाद बुक करें",
    "पाइप से पानी लीक हो रहा है",
    "मुझे इलेक्ट्रीशियन चाहिए",
  ],
  en: [
    "I am not available tomorrow",
    "Book for after 2 PM today",
    "Water is leaking from the pipe",
    "I need an electrician",
  ],
  te: [
    "నేను రేపు అందుబాటులో లేను",
    "ఈరోజు మధ్యాహ్నం 2 తర్వాత బుక్ చేయండి",
    "పైపు నుండి నీరు లీక్ అవుతోంది",
    "నాకు ఎలక్ట్రీషియన్ కావాలి",
  ],
};

const LangCtx = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const t = (key) => DICT[lang]?.[key] ?? DICT.en[key] ?? key;
  return React.createElement(LangCtx.Provider, { value: { lang, setLang, t } }, children);
}

export function useLang() {
  return useContext(LangCtx);
}
