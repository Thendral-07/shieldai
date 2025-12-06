
import { InputMode, DemoScenario, LanguageOption } from './types';

export const LANGUAGES: LanguageOption[] = [
  // Americas
  { code: 'en', name: 'English (Global)', dir: 'ltr', flag: '🇺🇸' },
  { code: 'es', name: 'Español (LatAm/ES)', dir: 'ltr', flag: '🇪🇸' },
  { code: 'pt', name: 'Português (BR/PT)', dir: 'ltr', flag: '🇧🇷' },
  { code: 'fr', name: 'Français (CA/FR)', dir: 'ltr', flag: '🇫🇷' },
  
  // Europe
  { code: 'de', name: 'Deutsch (Germany)', dir: 'ltr', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano (Italy)', dir: 'ltr', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands (Dutch)', dir: 'ltr', flag: '🇳🇱' },
  { code: 'ru', name: 'Русский (Russia)', dir: 'ltr', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська (Ukraine)', dir: 'ltr', flag: '🇺🇦' },
  { code: 'pl', name: 'Polski (Poland)', dir: 'ltr', flag: '🇵🇱' },

  // Asia (South)
  { code: 'hi', name: 'हिन्दी (Hindi)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', dir: 'ltr', flag: '🇧🇩' },
  { code: 'mr', name: 'मराठी (Marathi)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو (Urdu)', dir: 'rtl', flag: '🇵🇰' },

  // Asia (East/SE)
  { code: 'zh', name: '中文 (Mandarin)', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japan)', dir: 'ltr', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korea)', dir: 'ltr', flag: '🇰🇷' },
  { code: 'vi', name: 'Tiếng Việt (Vietnam)', dir: 'ltr', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย (Thai)', dir: 'ltr', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', dir: 'ltr', flag: '🇲🇾' },

  // Middle East
  { code: 'ar', name: 'العربية (Arabic)', dir: 'rtl', flag: '🇦🇪' },
  { code: 'tr', name: 'Türkçe (Turkey)', dir: 'ltr', flag: '🇹🇷' },
  { code: 'fa', name: 'فارسی (Persian)', dir: 'rtl', flag: '🇮🇷' },
  { code: 'he', name: 'עברית (Hebrew)', dir: 'rtl', flag: '🇮🇱' },

  // Africa
  { code: 'sw', name: 'Kiswahili (East Africa)', dir: 'ltr', flag: '🇰🇪' },
  { code: 'ha', name: 'Hausa (West Africa)', dir: 'ltr', flag: '🇳🇬' },
  { code: 'yo', name: 'Yorùbá (Nigeria)', dir: 'ltr', flag: '🇳🇬' },
  { code: 'zu', name: 'isiZulu (South Africa)', dir: 'ltr', flag: '🇿🇦' },
];

export const SYSTEM_INSTRUCTION = `
You are ShieldAI, the world's most advanced, multimodal, reinforcement-learning enhanced scam defense engine powered by Gemini 3 Pro. You act as a **Forensic Digital Analyst**.

**GLOBAL DIRECTIVES:**
1.  **LANGUAGE & REGION ADAPTATION:** You will receive a "Target Language". You MUST generate ALL outputs in that language.
2.  **REGION-SPECIFIC LAWS:** Based on the input text/phone code (e.g., +91 for India, +1 for USA), identify the user's country.
    - In "safe_actions", recommend the OFFICIAL cybercrime portal for that country (e.g., cybercrime.gov.in for India, ic3.gov for USA).
3.  **USE GOOGLE SEARCH:** Verify URLs, phone numbers, and scam scripts against live databases.
4.  **DEEP SCAN & VERIFICATION:**
    - Generate "verification_sources": Simulate checks against global databases (Sender ID Registry, Domain Age, Telecom Whitelist).
    - Generate "protocol_comparison": Compare the scam message's behavior against the OFFICIAL standard protocol of the claimed entity (e.g., "Bank never asks for OTP" vs "Message asks for OTP").
5.  **FORMAL COMPLAINT LETTER:** The "law_enforcement_summary" MUST be a professionally written **Formal Complaint Letter**.
6.  **VERIFY LEGITIMACY (CRITICAL):**
    - IF the input is from a VERIFIED SENDER AND the content is a standard transactional alert, MARK AS SAFE (Score 0).

**OUTPUT FORMAT:**
Return a valid JSON object.
{
  "scam_score": number, // 0-100
  "scam_type": string, 
  "red_flags": string[], 
  "explanation": string, 
  "safe_actions": string[], 
  "one_tap_safe_reply": string, 
  "boundingBoxes": [ { "ymin": number, "xmin": number, "ymax": number, "xmax": number, "label": string } ],
  "law_enforcement_summary": { "formatted_report_text": "..." },
  "confidence_score": number, 
  "learning_metric": string, 
  "detected_language": string, 
  "target_region": string,
  "verification_sources": [
      { "name": "Sender ID Registry", "status": "FAILED", "details": "Unregistered Sender ID" },
      { "name": "Domain Reputation", "status": "WARNING", "details": "Created < 24h ago" }
  ],
  "protocol_comparison": {
      "official_practice": "Official banks never send links for KYC via SMS.",
      "scam_tactic": "This message demands immediate KYC update via a shortlink.",
      "risk_level": "CRITICAL"
  }
}
`;

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-text',
    title: 'Bank SMS Phishing',
    type: InputMode.TEXT,
    content: "URGENT: Your Wells Fargo account is temporarily locked due to suspicious activity. Click here http://bit.ly/secure-verify-now to verify identity or account will be CLOSED in 24 hours.",
    description: 'Classic urgency + threat pattern.'
  },
  {
    id: 'demo-job',
    title: 'WhatsApp Job Scam',
    type: InputMode.TEXT,
    content: "Hello! We reviewed your profile and want to offer you a Part-Time job. Earn $500-$1000 daily working from home. No experience needed. Contact WhatsApp +123456789 to claim now!",
    description: 'High-reward, low-effort job trap.'
  }
];

export const DEMO_IMAGE_URL = "https://picsum.photos/800/600";
