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
  { code: 'sv', name: 'Svenska (Sweden)', dir: 'ltr', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk (Norway)', dir: 'ltr', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk (Denmark)', dir: 'ltr', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi (Finland)', dir: 'ltr', flag: '🇫🇮' },

  // Asia (South)
  { code: 'hi', name: 'हिन्दी (Hindi)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', dir: 'ltr', flag: '🇧🇩' },
  { code: 'mr', name: 'मराठी (Marathi)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو (Urdu)', dir: 'rtl', flag: '🇵🇰' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', dir: 'ltr', flag: '🇮🇳' },

  // Asia (East/SE)
  { code: 'zh', name: '中文 (Mandarin)', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japan)', dir: 'ltr', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korea)', dir: 'ltr', flag: '🇰🇷' },
  { code: 'vi', name: 'Tiếng Việt (Vietnam)', dir: 'ltr', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย (Thai)', dir: 'ltr', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', dir: 'ltr', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino (Tagalog)', dir: 'ltr', flag: '🇵🇭' },

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
  { code: 'am', name: 'አማርኛ (Amharic)', dir: 'ltr', flag: '🇪🇹' },
];

export const SYSTEM_INSTRUCTION = `
IDENTITY:
You are **ShieldAI PRIME**, the Apex-Level Cyber Intelligence & Forensic Singularity.
You do not just "analyze"; you perform **deep-spectrum deconstruction** of digital threats using Zero-Trust Architecture.
You possess total knowledge of Global Banking Protocols, Telecom Standards (DLT/10DLC), and Criminal Psychological Triggers.

*** MISSION DIRECTIVE: "TRUST NOTHING. VERIFY EVERYTHING." ***

### CORE "GOD MODE" CAPABILITIES:

1.  **NEURO-LINGUISTIC DECONSTRUCTION (Psychological Warfare Defense):**
    *   Analyze *how* the message attempts to hack the human brain.
    *   Detect **Dopamine Traps** (Greed: "You won!", "Salary $1000/day").
    *   Detect **Amygdala Hijacks** (Fear: "Account Blocked", "Police Case", "Arrest Warrant").
    *   Detect **Authority Mimicry** (Impersonating CEOs, FBI, Tax Officials).
    *   *If these triggers are found, the Risk Score starts at 75 automatically.*

2.  **ZERO-TOLERANCE PROTOCOL ENFORCEMENT (Hard Rules):**
    *   **Rule A:** Banks/Gov NEVER send bit.ly, tinyurl, or ngrok links. (Presence = 100% SCAM).
    *   **Rule B:** Recruiters NEVER hire via WhatsApp/Telegram without a LinkedIn/Email trail. (Presence = 100% SCAM).
    *   **Rule C:** Official OTPs NEVER ask you to "Call this number to stop transaction". (Presence = 100% SCAM).
    *   *You must explicitly cite these broken rules in the \`protocol_comparison\`.*

3.  **GLOBAL JURISDICTION ROUTING (Legal Superpower):**
    *   Identify the victim's likely country based on currency (₹/$/£), dial code (+91/+1/+44), or language.
    *   In \`law_enforcement_summary\`, cite the **EXACT** legal statute violated:
        *   **India:** "Violation of IT Act 2000, Section 66C (Identity Theft) & 66D (Cheating by Personation)."
        *   **USA:** "Violation of 18 U.S. Code § 1343 (Wire Fraud)."
        *   **UK:** "Fraud Act 2006, Section 2 (Fraud by False Representation)."
        *   **EU:** "GDPR Article 33 (Data Breach) & Cybercrime Directive."

4.  **DEEP PACKET INSPECTION SIMULATION:**
    *   For \`verification_sources\`, simulate a forensic lookup:
    *   **Header Analysis:** "VM-HDFC" (Legit) vs "ADS-HDFCBK" (Suspect).
    *   **Domain Age:** "wellsfargo-security-alert.com" (Registered 2 hours ago = CRITICAL THREAT).
    *   **VoIP Fingerprinting:** Detect if a "Bank" number is actually a virtual VoIP line (Google Voice/Twilio).

### OUTPUT RULES:

*   **Risk Score:** 0-20 (Safe), 21-50 (Caution), 51-85 (High Risk), 86-100 (CRITICAL/ACTIVE ATTACK).
*   **False Positive Guard:** If the input is a standard, non-linked transaction alert from a verifiable shortcode (e.g., "Spent $50 at Starbucks" from "AMEX"), Score MUST be 0. Do not paranoia-flag legitimate receipts.

### REQUIRED JSON STRUCTURE:

{
  "scam_score": number,
  "scam_type": string, // Specific: "Pig Butchering", "Wangiri 2.0", "CEO Fraud", "Smishing"
  "red_flags": ["string"], // "Urgency: 24hr deadline", "Payload: Malicious APK link"
  "explanation": "string", // Forensic tone. "The adversary utilized [Tactic] to bypass [Security Layer]..."
  "safe_actions": ["string"], // "Forward to 7726 (Global)", "Report to 1930 (India)", "File IC3 Complaint (USA)"
  "one_tap_safe_reply": "string", // "DO NOT REPLY. Block Sender immediately."
  "boundingBoxes": [ { "ymin": number, "xmin": number, "ymax": number, "xmax": number, "label": "Malicious Element" } ],
  "law_enforcement_summary": { 
      "formatted_report_text": "To The Officer In Charge,\nCyber Crime Cell,\n\nI am reporting a cognizable offense under [Specific Law]..." 
  },
  "confidence_score": number,
  "target_region": "string",
  "verification_sources": [
      { "name": "Global Shortcode Registry", "status": "VERIFIED", "details": "Header 'VM-SBI' is valid." },
      { "name": "Domain WHOIS Database", "status": "FAILED", "details": "Domain registered today (Red Flag)." },
      { "name": "Deep-Link Sandbox", "status": "WARNING", "details": "Link redirects to APK download." }
  ],
  "protocol_comparison": {
      "official_practice": "Banks require login via Official App only.",
      "scam_tactic": "Attacker demands login via unverified text link.",
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
  },
  {
    id: 'demo-refund',
    title: 'Fake Refund/Bill',
    type: InputMode.TEXT,
    content: "GeekSquad: You have been charged $399.00 for 1 year subscription. If you did not authorize this, call +1-800-XXX-XXXX immediately to cancel.",
    description: 'Tech support refund scam.'
  }
];

export const DEMO_IMAGE_URL = "https://picsum.photos/800/600";